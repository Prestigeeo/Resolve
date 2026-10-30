import json
from decimal import Decimal
from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session
from ..database import get_session
from ..models.case import CaseRecord
from ..schemas.intake import IntakeRequest, IntakeAnalysisResponse, ClarificationSubmission
from ..schemas.case import ExtractedCaseFacts, CaseStatus, IncidentCategory
from ..security.guardrails import SecurityGuardrail
from ..security.case_access import issue_case_access_token, require_case_access
from ..ai.classifier import IssueClassifier
from ..engine.completeness import CompletenessGatekeeper

router = APIRouter(prefix="/intake", tags=["Intake"])

@router.post("/analyze", response_model=IntakeAnalysisResponse)
async def analyze_intake(request: IntakeRequest, session: Session = Depends(get_session)):
    # 1. PII and Security Guardrails
    sanitized_text, redacted_items = SecurityGuardrail.sanitize_input(request.raw_text)
    is_urgent, emergency_info = SecurityGuardrail.check_urgent_fraud_emergency(sanitized_text)

    # 2. AI Extraction and Classification
    facts = await IssueClassifier.classify_and_extract(sanitized_text, request.preselected_category)
    if is_urgent:
        facts.is_urgent_emergency = True

    # 3. Completeness and Evidence Gatekeeper
    is_complete, missing_fields, questions = CompletenessGatekeeper.evaluate_completeness(facts)
    status = CaseStatus.READY_FOR_COMPLAINT if is_complete else CaseStatus.NEEDS_CLARIFICATION

    # 4. Persistence
    case_access_token, access_token_hash = issue_case_access_token()
    case_record = CaseRecord(
        access_token_hash=access_token_hash,
        category=facts.category.value,
        status=status.value,
        is_urgent_emergency=facts.is_urgent_emergency,
        amount_ngn=float(facts.amount_ngn) if facts.amount_ngn else None,
        transaction_date=facts.transaction_date,
        sender_institution=facts.sender_institution,
        recipient_institution=facts.recipient_institution,
        session_id_or_ref=facts.session_id_or_ref,
        facts_json=facts.model_dump_json(),
        clarifying_questions_json=json.dumps([q.model_dump() for q in questions]) if questions else None
    )
    session.add(case_record)
    session.commit()
    session.refresh(case_record)

    # 5. Formulate Response Message
    if is_urgent:
        message = "Active emergency detected. Immediate USSD account lock instructions provided below."
    elif not is_complete:
        message = f"We have identified your issue as {facts.category.value}. Before drafting a formal complaint, we need a few critical details to ensure your case is actionable."
    else:
        message = f"Case facts verified for {facts.category.value}. Ready to generate your dispute document and statutory action steps."

    return IntakeAnalysisResponse(
        case_id=case_record.id,
        case_access_token=case_access_token,
        case_status=status,
        facts=facts,
        is_urgent_emergency=facts.is_urgent_emergency,
        emergency_instructions=emergency_info,
        clarifying_questions=questions,
        missing_critical_fields=missing_fields,
        message=message
    )

@router.post("/clarify/{case_id}", response_model=IntakeAnalysisResponse)
async def submit_clarification(case_id: str, submission: ClarificationSubmission, x_case_token: str | None = Header(default=None, alias="X-Case-Token"), session: Session = Depends(get_session)):
    case_record = session.get(CaseRecord, case_id)
    if not case_record:
        raise HTTPException(status_code=404, detail="Case not found.")
    require_case_access(case_record, x_case_token)

    facts_dict = json.loads(case_record.facts_json)
    
    # Update facts with user answers
    for field, value in submission.answers.items():
        if field == "amount_ngn" and value:
            try:
                facts_dict[field] = str(value)
            except:
                pass
        elif field == "transaction_date" and value:
            facts_dict[field] = value
        elif field == "category" and value:
            category_map = {
                "Failed Bank Transfer (debited, recipient not credited)": "FAILED_TRANSFER",
                "Undelivered Airtime or Data bundle": "UNDELIVERED_AIRTIME_DATA",
                "Unauthorized debit / Stolen funds": "STOLEN_FUNDS_FRAUD",
                "Paid a merchant/vendor who refused to deliver goods or services": "MERCHANT_NON_DELIVERY",
                "Other issue": "OUT_OF_SCOPE",
            }
            facts_dict[field] = category_map.get(str(value), value)
        elif field == "payment_method" and value:
            payment_map = {
                "Direct Bank Transfer (sent money to an account number)": "DIRECT_BANK_TRANSFER",
                "Online Checkout / Debit Card (entered card details on website or Paystack/Flutterwave)": "DEBIT_CARD_CHECKOUT",
                "POS Terminal": "POS_TERMINAL",
            }
            facts_dict[field] = payment_map.get(str(value), value)
        elif field == "vendor_response_state" and value:
            response_map = {
                "Vendor blocked me on WhatsApp / Instagram / Phone": "BLOCKED_BUYER_GHOSTED",
                "Vendor is giving continuous excuses / stalling": "RESPONSIVE_STALLING",
                "Vendor explicitly refused to deliver or refund": "REFUSED_REFUND",
                "Vendor is completely unresponsive": "NO_RESPONSE",
            }
            facts_dict[field] = response_map.get(str(value), value)
        elif field == "unauthorized_reason" and value:
            reason_map = {
                "My phone or SIM card was stolen": "STOLEN_PHONE_SIM",
                "I received an unauthorized debit alert out of nowhere": "UNAUTHORIZED_DEBIT_ALERT",
                "I was deceived into sharing an OTP or clicking a phishing link": "PHISHING_OTP",
                "My ATM card details were compromised": "COMPROMISED_CARD",
                "Other": "OTHER",
            }
            facts_dict[field] = reason_map.get(str(value), value)
        elif field == "provider_contacted" and value:
            facts_dict[field] = ("yes" in str(value).lower() or value is True)
        elif field == "purchased_via_bank_vtu" and value:
            facts_dict[field] = ("bank" in str(value).lower())
        elif field == "account_currently_locked" and value:
            facts_dict[field] = ("yes" in str(value).lower() or value is True)
        elif field in facts_dict and value:
            facts_dict[field] = value

    updated_facts = ExtractedCaseFacts.model_validate(facts_dict)
    is_complete, missing_fields, questions = CompletenessGatekeeper.evaluate_completeness(updated_facts)
    status = CaseStatus.READY_FOR_COMPLAINT if is_complete else CaseStatus.NEEDS_CLARIFICATION

    case_record.status = status.value
    case_record.facts_json = updated_facts.model_dump_json()
    case_record.amount_ngn = float(updated_facts.amount_ngn) if updated_facts.amount_ngn else None
    case_record.transaction_date = updated_facts.transaction_date
    case_record.session_id_or_ref = updated_facts.session_id_or_ref
    case_record.updated_at = datetime.now(timezone.utc)
    case_record.clarifying_questions_json = json.dumps([q.model_dump() for q in questions]) if questions else None

    session.add(case_record)
    session.commit()
    session.refresh(case_record)

    return IntakeAnalysisResponse(
        case_id=case_record.id,
        # The client already possesses this token; it is intentionally not
        # re-issued by a clarification response.
        case_access_token=x_case_token,
        case_status=status,
        facts=updated_facts,
        is_urgent_emergency=updated_facts.is_urgent_emergency,
        clarifying_questions=questions,
        missing_critical_fields=missing_fields,
        message="Case updated successfully." if is_complete else "Additional evidence needed."
    )
