import pytest
from datetime import date
from decimal import Decimal
from app.schemas.case import ExtractedCaseFacts, IncidentCategory, PaymentMethod
from app.engine.completeness import CompletenessGatekeeper

def test_incomplete_failed_transfer_missing_session_id():
    facts = ExtractedCaseFacts(
        category=IncidentCategory.FAILED_TRANSFER,
        amount_ngn=Decimal("25000"),
        transaction_date=date.today(),
        sender_institution="GTBank",
        session_id_or_ref=None,  # Missing critical 30-digit Session ID
        provider_contacted=None,
        summary_of_incident="Transferred 25k to friend on OPay."
    )
    is_complete, missing, questions = CompletenessGatekeeper.evaluate_completeness(facts)
    assert is_complete is False
    assert "session_id_or_ref" in missing
    assert any(q.id == "q_session_id" for q in questions)

def test_incomplete_merchant_non_delivery_missing_delivery_date():
    facts = ExtractedCaseFacts(
        category=IncidentCategory.MERCHANT_NON_DELIVERY,
        amount_ngn=Decimal("45000"),
        transaction_date=date.today(),
        payment_method=PaymentMethod.DIRECT_BANK_TRANSFER,
        agreed_delivery_date=None,  # Missing promised delivery date
        vendor_response_state="BLOCKED_BUYER_GHOSTED",
        items_or_services_description="2 custom dresses",
        summary_of_incident="Paid Instagram vendor 45k and she blocked me."
    )
    is_complete, missing, questions = CompletenessGatekeeper.evaluate_completeness(facts)
    assert is_complete is False
    assert "agreed_delivery_date" in missing
    assert any(q.id == "q_agreed_delivery_date" for q in questions)

def test_complete_merchant_non_delivery():
    facts = ExtractedCaseFacts(
        category=IncidentCategory.MERCHANT_NON_DELIVERY,
        amount_ngn=Decimal("45000"),
        transaction_date=date(2026, 10, 15),
        payment_method=PaymentMethod.DIRECT_BANK_TRANSFER,
        agreed_delivery_date=date(2026, 10, 20),
        vendor_response_state="BLOCKED_BUYER_GHOSTED",
        items_or_services_description="2 custom dresses",
        summary_of_incident="Paid Instagram vendor 45k and she blocked me."
    )
    is_complete, missing, questions = CompletenessGatekeeper.evaluate_completeness(facts)
    assert is_complete is True
    assert len(missing) == 0
    assert len(questions) == 0
