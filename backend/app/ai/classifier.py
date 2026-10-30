from typing import Optional
from .llm_client import LLMClient
from ..schemas.case import ExtractedCaseFacts, IncidentCategory

SYSTEM_CLASSIFIER_PROMPT = """
You are Resolve, an expert AI assistant specializing in Nigerian consumer dispute resolution.
Your task is to analyze user complaints regarding financial transactions, telecom purchases, stolen funds, or merchant non-delivery.

Categories to classify:
1. FAILED_TRANSFER: Sender was debited for a bank transfer (NIP/USSD/app) but recipient did not receive the funds.
2. UNDELIVERED_AIRTIME_DATA: User was debited for airtime or data (via bank VTU or telco) but airtime/data was not received.
3. STOLEN_FUNDS_FRAUD: Unauthorized debit, stolen phone/SIM, account hack, or social engineering/OTP fraud requiring immediate account freezing.
4. MERCHANT_NON_DELIVERY: User paid a business, merchant, or online/social-media vendor (Instagram, WhatsApp, website) for goods/services, and the business failed to deliver and refused to refund.
5. AMBIGUOUS: User's complaint lacks sufficient context to determine the incident type.
6. OUT_OF_SCOPE: Issues outside Nigerian consumer financial/telecom/commercial protection (e.g., criminal assault, landlord disputes, crypto speculative investment loss).

You understand Nigerian English, Nigerian banking terminology (e.g. NIBSS Session ID, NUBAN, NIP, VTU, STAN, RRN), and Nigerian Pidgin (e.g. 'they debit me', 'vendor don block me', 'card no drop').

Strictly extract all verifiable facts (amounts, dates, references, banks, telecom providers) into the schema.
Never fabricate amounts, reference numbers, or dates that the user did not provide.
"""

class IssueClassifier:
    @classmethod
    async def classify_and_extract(cls, text: str, preselected_category: Optional[IncidentCategory] = None) -> ExtractedCaseFacts:
        prompt = f"User narrative:\n\"\"\"{text}\"\"\"\n"
        if preselected_category:
            prompt += f"\nNote: User manually pre-selected category: {preselected_category.value}\n"

        facts = await LLMClient.extract_structured(
            prompt=prompt,
            schema_cls=ExtractedCaseFacts,
            system_instruction=SYSTEM_CLASSIFIER_PROMPT
        )
        if preselected_category and facts.category == IncidentCategory.AMBIGUOUS:
            facts.category = preselected_category

        return facts
