import pytest
from datetime import date
from decimal import Decimal
from app.schemas.case import ExtractedCaseFacts, IncidentCategory
from app.schemas.document import GeneratedDocument
from app.ai.verifier import FactGroundingVerifier

def test_fact_verifier_catches_hallucinated_amount():
    facts = ExtractedCaseFacts(
        category=IncidentCategory.FAILED_TRANSFER,
        amount_ngn=Decimal("25000"),
        transaction_date=date.today(),
        sender_institution="GTBank",
        session_id_or_ref="100004241030123456789012345678",
        summary_of_incident="Transferred 25k."
    )
    # Document contains hallucinated amount ₦75,000 instead of ₦25,000
    doc = GeneratedDocument(
        document_type="STAGE_1_BANK_DISPUTE",
        title="Dispute Notice",
        recipient_institution="GTBank",
        recipient_contact_info="Support",
        subject_line="Failed Transfer",
        body_text="I was debited ₦75,000.00 for Ref: 100004241030123456789012345678",
        formal_evidence_list=[],
        statutory_notice_clause="",
        suggested_submission_methods=[]
    )
    is_valid, violations = FactGroundingVerifier.verify_document(doc, facts)
    assert is_valid is False
    assert any("Ungrounded amount" in v for v in violations)

def test_fact_verifier_passes_grounded_document():
    facts = ExtractedCaseFacts(
        category=IncidentCategory.FAILED_TRANSFER,
        amount_ngn=Decimal("25000"),
        transaction_date=date.today(),
        sender_institution="GTBank",
        session_id_or_ref="100004241030123456789012345678",
        summary_of_incident="Transferred 25k."
    )
    doc = GeneratedDocument(
        document_type="STAGE_1_BANK_DISPUTE",
        title="Dispute Notice",
        recipient_institution="GTBank",
        recipient_contact_info="Support",
        subject_line="Failed Transfer — ₦25,000.00",
        body_text="I was debited ₦25,000.00 for Ref: 100004241030123456789012345678",
        formal_evidence_list=[],
        statutory_notice_clause="",
        suggested_submission_methods=[]
    )
    is_valid, violations = FactGroundingVerifier.verify_document(doc, facts)
    assert is_valid is True
    assert len(violations) == 0
