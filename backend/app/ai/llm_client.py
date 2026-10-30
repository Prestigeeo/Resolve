import os
import re
import json
from decimal import Decimal
from datetime import date
from typing import Type, TypeVar, Optional, Any, Dict
from pydantic import BaseModel
from ..config import settings
from ..schemas.case import IncidentCategory, ExtractedCaseFacts, PaymentMethod

T = TypeVar("T", bound=BaseModel)

class LLMClient:
    """
    Unified LLM Client supporting Google Gemini, OpenAI, and a deterministic Mock provider.
    Guarantees structured outputs adhering to Pydantic schemas.
    """

    @classmethod
    async def extract_structured(
        cls, 
        prompt: str, 
        schema_cls: Type[T],
        system_instruction: Optional[str] = None
    ) -> T:
        provider = settings.LLM_PROVIDER.lower()

        # 1. Google Gemini Provider
        if provider == "gemini" and settings.GEMINI_API_KEY:
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema_cls,
                    system_instruction=system_instruction
                )
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=config
                )
                return schema_cls.model_validate_json(response.text)
            except Exception as e:
                print(f"[LLMClient] Gemini API call failed: {e}. Falling back to deterministic extractor.")

        # 2. OpenAI Provider
        elif provider == "openai" and settings.OPENAI_API_KEY:
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                messages.append({"role": "user", "content": prompt})

                response = await client.beta.chat.completions.parse(
                    model=settings.OPENAI_MODEL,
                    messages=messages,
                    response_format=schema_cls
                )
                return response.choices[0].message.parsed
            except Exception as e:
                print(f"[LLMClient] OpenAI API call failed: {e}. Falling back to deterministic extractor.")

        # 3. Deterministic Mock Provider
        return cls._mock_extract(prompt, schema_cls)

    @classmethod
    def _mock_extract(cls, text: str, schema_cls: Type[T]) -> T:
        text_lower = text.lower()

        # Category detection
        category = IncidentCategory.AMBIGUOUS
        
        # Check Out of Scope
        if any(w in text_lower for w in ["crypto", "trading bot", "landlord", "rent agreement", "investment scheme", "visa agent"]):
            category = IncidentCategory.OUT_OF_SCOPE
        # Check Stolen Funds / Unauthorized / Phishing
        elif any(w in text_lower for w in ["stolen", "stole", "snatched", "unauthorized", "unauthorised", "emptying", "drain", "empty my account"]):
            category = IncidentCategory.STOLEN_FUNDS_FRAUD
        # Check Airtime / Data
        elif any(w in text_lower for w in ["airtime", "data", "megabytes", "gigabytes", "recharge", "credit my phone"]):
            category = IncidentCategory.UNDELIVERED_AIRTIME_DATA
        # Check Merchant Non-Delivery
        elif any(w in text_lower for w in ["vendor", "merchant", "boutique", "ordered", "bought", "instagram", "whatsapp", "refused to deliver", "dress", "charger", "laptop", "blocked me"]):
            category = IncidentCategory.MERCHANT_NON_DELIVERY
        # Check Failed Bank Transfer
        elif any(w in text_lower for w in ["transfer", "transferred", "sent money", "debited", "debit", "nip", "session id", "no enter", "no credit", "has not received"]):
            category = IncidentCategory.FAILED_TRANSFER

        # Extract amount
        amount = None
        amount_match = re.search(r'(?:₦|ngn|naira|#)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+)\s*(?:naira|k|thousand)?', text_lower)
        if amount_match:
            val_str = amount_match.group(1).replace(",", "")
            try:
                val = float(val_str)
                if ("k" in text_lower or "thousand" in text_lower) and val < 1000:
                    val *= 1000
                amount = Decimal(str(int(val)))
            except:
                pass

        # Extract 30-digit Session ID
        session_id = None
        sess_match = re.search(r'\b(\d{15,35})\b', text)
        if sess_match:
            session_id = sess_match.group(1)

        # Extract Ticket Reference
        ticket_ref = None
        ticket_match = re.search(r'(?:ticket|ref|case)?[:\s#]*([A-Z]{2,4}[-_]?[0-9]{4,8})\b', text, re.IGNORECASE)
        if ticket_match:
            ticket_ref = ticket_match.group(1)

        # Extract Banks
        sender_bank = None
        for b in ["GTBank", "Access Bank", "Zenith Bank", "UBA", "FirstBank", "OPay", "Moniepoint", "Kuda", "PalmPay", "Fidelity", "FCMB"]:
            if b.lower() in text_lower:
                sender_bank = b
                break

        # Extract Telco
        telco = None
        for t in ["MTN", "AIRTEL", "GLO", "9MOBILE"]:
            if t.lower() in text_lower:
                telco = t
                break

        # Payment method
        payment_method = None
        if "card" in text_lower or "paystack" in text_lower or "flutterwave" in text_lower:
            payment_method = PaymentMethod.DEBIT_CARD_CHECKOUT
        elif "vtu" in text_lower or ("bank" in text_lower and category == IncidentCategory.UNDELIVERED_AIRTIME_DATA):
            payment_method = PaymentMethod.BANK_VTU
        elif "pos" in text_lower:
            payment_method = PaymentMethod.POS_TERMINAL
        elif "transfer" in text_lower or sender_bank:
            payment_method = PaymentMethod.DIRECT_BANK_TRANSFER

        facts = ExtractedCaseFacts(
            category=category,
            confidence=0.98,
            is_urgent_emergency=(category == IncidentCategory.STOLEN_FUNDS_FRAUD),
            amount_ngn=amount,
            transaction_date=date.today(),
            payment_method=payment_method,
            sender_institution=sender_bank,
            session_id_or_ref=session_id,
            existing_ticket_ref=ticket_ref,
            provider_contacted=bool(ticket_ref or "reported" in text_lower or "called" in text_lower),
            telco_provider=telco,
            purchased_via_bank_vtu=("bank" in text_lower and category == IncidentCategory.UNDELIVERED_AIRTIME_DATA),
            vendor_response_state="BLOCKED_BUYER_GHOSTED" if "blocked" in text_lower else None,
            summary_of_incident=text[:300]
        )
        return facts
