import pytest
from datetime import date, timedelta
from decimal import Decimal
from app.schemas.case import ExtractedCaseFacts, IncidentCategory, PaymentMethod
from app.engine.rules import DeterministicRulesEngine

def test_failed_transfer_eligible_for_cbn_escalation():
    facts = ExtractedCaseFacts(
        category=IncidentCategory.FAILED_TRANSFER,
        amount_ngn=Decimal("120000"),
        transaction_date=date.today() - timedelta(days=20), # > 14 days ago
        sender_institution="Access Bank",
        recipient_institution="Zenith Bank",
        session_id_or_ref="100004241030123456789012345678",
        provider_contacted=True,
        existing_ticket_ref="ACC-948201",
        summary_of_incident="Transferred 120k over 20 days ago, bank refused to resolve."
    )
    guidance = DeterministicRulesEngine.determine_guidance(facts)
    assert guidance.stage_name == "STAGE_2_REGULATOR_ESCALATION"
    assert guidance.document_type_recommended == "CBN_CPD_PETITION"
    assert any("Central Bank of Nigeria" in c.publisher for c in guidance.citations)

def test_merchant_non_delivery_via_card_chargeback():
    facts = ExtractedCaseFacts(
        category=IncidentCategory.MERCHANT_NON_DELIVERY,
        amount_ngn=Decimal("32000"),
        transaction_date=date.today() - timedelta(days=5),
        payment_method=PaymentMethod.DEBIT_CARD_CHECKOUT,
        merchant_name_or_handle="TechGadgets NG",
        items_or_services_description="Laptop charger",
        agreed_delivery_date=date.today() - timedelta(days=2),
        vendor_response_state="NO_RESPONSE",
        summary_of_incident="Bought charger online via Paystack card checkout, vendor disappeared."
    )
    guidance = DeterministicRulesEngine.determine_guidance(facts)
    assert guidance.stage_name == "GATEWAY_CHARGEBACK"
    assert guidance.document_type_recommended == "CARD_CHARGEBACK_DISPUTE_LETTER"

def test_merchant_non_delivery_via_transfer_fccpc():
    facts = ExtractedCaseFacts(
        category=IncidentCategory.MERCHANT_NON_DELIVERY,
        amount_ngn=Decimal("45000"),
        transaction_date=date.today() - timedelta(days=10),
        payment_method=PaymentMethod.DIRECT_BANK_TRANSFER,
        merchant_name_or_handle="@BoutiqueNG",
        items_or_services_description="2 custom dresses",
        agreed_delivery_date=date.today() - timedelta(days=5),
        vendor_response_state="BLOCKED_BUYER_GHOSTED",
        summary_of_incident="Paid boutique 45k via bank transfer, vendor blocked me on WhatsApp."
    )
    guidance = DeterministicRulesEngine.determine_guidance(facts)
    assert guidance.stage_name == "FCCPC_COMMERCIAL_REDRESS"
    assert guidance.document_type_recommended == "FCCPC_COMPLAINT_DOSSIER"
    assert any("FCCPC" in c.publisher for c in guidance.citations)
