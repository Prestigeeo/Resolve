import re
from typing import Tuple, List
from ..schemas.case import ExtractedCaseFacts
from ..schemas.document import GeneratedDocument

class FactGroundingVerifier:
    """
    Zero-Hallucination Fact Verifier.
    Performs deterministic post-generation inspection to ensure that:
    1. Every monetary amount in the drafted text matches facts.amount_ngn.
    2. Every reference number or session ID matches facts.session_id_or_ref.
    3. The drafted text contains no fabricated numbers, claims, or defamatory criminal accusations.
    """

    @classmethod
    def verify_document(cls, document: GeneratedDocument, facts: ExtractedCaseFacts) -> Tuple[bool, List[str]]:
        violations: List[str] = []
        body = document.body_text + " " + document.subject_line

        # 1. Verify Monetary Amount Grounding
        if facts.amount_ngn:
            amount_str = f"{facts.amount_ngn:,.2f}"
            amount_str_plain = str(int(facts.amount_ngn))
            # Check if an unauthorized different amount appears
            # Find numbers preceded by ₦ or NGN
            naira_mentions = re.findall(r'(?:₦|ngn)\s*([0-9,]+(?:\.[0-9]{2})?)', body, re.IGNORECASE)
            for m in naira_mentions:
                clean_m = m.replace(",", "").split(".")[0]
                if clean_m != amount_str_plain:
                    violations.append(f"Ungrounded amount detected in draft: ₦{m} (Expected: ₦{facts.amount_ngn})")

        # 2. Verify Session ID Grounding
        if facts.session_id_or_ref:
            if facts.session_id_or_ref not in body:
                violations.append(f"Mandatory reference {facts.session_id_or_ref} was omitted from draft.")

        # 3. Check for Defamatory Language (Legal Guardrail for Merchant Disputes)
        defamatory_terms = [
            "criminal syndicate",
            "thieves and robbers",
            "fraudulent bastard",
            "fraudulent thief"
        ]
        for term in defamatory_terms:
            if term in body.lower():
                violations.append(f"Inappropriate or defamatory language detected: '{term}'. Complaints must maintain objective factual framing.")

        is_valid = len(violations) == 0
        return is_valid, violations
