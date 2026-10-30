from datetime import date, timedelta
from typing import Optional, List
from ..schemas.case import IncidentCategory, ExtractedCaseFacts, PaymentMethod
from ..schemas.guidance import ResolutionGuidance, ActionStep, OfficialCitation
from .checklist import EvidenceChecklistBuilder

class DeterministicRulesEngine:
    """
    Deterministic Regulatory Rules Engine.
    Enforces Nigerian consumer protection frameworks (CBN, NCC, FCCPC, NPF-NCCC, Payment Gateways).
    The LLM never guesses deadlines or legal routing.
    """

    @classmethod
    def determine_guidance(cls, facts: ExtractedCaseFacts) -> ResolutionGuidance:
        category = facts.category
        today = date.today()

        # Build category-specific checklist
        evidence_list = EvidenceChecklistBuilder.build_checklist(facts)

        # ---------------------------------------------------------------------
        # Category 1: Failed Bank Transfer (CBN Framework)
        # ---------------------------------------------------------------------
        if category == IncidentCategory.FAILED_TRANSFER:
            elapsed_days = (today - facts.transaction_date).days if facts.transaction_date else 0
            
            # Scenario A: Eligible for CBN Consumer Protection Department Escalation
            # Eligible if provider was contacted and more than 14 days have passed or provider gave unsatisfactory response
            if facts.provider_contacted and (elapsed_days >= 14 or facts.existing_ticket_ref):
                citation = OfficialCitation(
                    publisher="Central Bank of Nigeria (CBN)",
                    title="CBN Consumer Complaint Lodgment & Escalation Procedure",
                    url="https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html",
                    statutory_rule="CBN circular stipulates banks must resolve electronic payment complaints within 14 days; failure permits direct escalation to CBN CPD."
                )
                steps = [
                    ActionStep(
                        step_number=1,
                        title="Submit Escalation Petition to CBN Consumer Protection Department (CPD)",
                        description=f"Send your formal petition to cpd@cbn.gov.ng referencing your bank ({facts.sender_institution or 'Bank'}) and ticket reference #{facts.existing_ticket_ref or 'Pending'}.",
                        channel_to_use="Email (cpd@cbn.gov.ng) / CBN CCMS Portal",
                        deadline_or_sla="CBN acknowledges within 48 hours and sanctions defaulting banks.",
                        statutory_citation=citation
                    ),
                    ActionStep(
                        step_number=2,
                        title="Attach Mandatory Supporting Evidence",
                        description="Ensure your email includes the 30-digit NIBSS Session ID, bank debit alert, and proof of your Stage-1 complaint.",
                        channel_to_use="Email Attachment",
                        deadline_or_sla="Immediate",
                        statutory_citation=citation
                    )
                ]
                return ResolutionGuidance(
                    stage_name="STAGE_2_REGULATOR_ESCALATION",
                    summary="Your bank has exceeded the regulatory window. You are legally entitled to escalate directly to the Central Bank of Nigeria Consumer Protection Department (CPD).",
                    action_steps=steps,
                    evidence_checklist=evidence_list,
                    citations=[citation],
                    can_generate_document=True,
                    document_type_recommended="CBN_CPD_PETITION"
                )

            # Scenario B: Stage 1 Bank Transfer Dispute
            citation = OfficialCitation(
                publisher="Central Bank of Nigeria (CBN)",
                title="CBN Guidelines on Electronic Funds Transfer & Dispute Resolution",
                url="https://www.cbn.gov.ng/supervision/cpdcomgt.html",
                statutory_rule="Same-bank failed transfers must reverse in 24 hours; interbank transfers require NIP Session ID dispute lodging."
            )
            steps = [
                ActionStep(
                    step_number=1,
                    title=f"Lodge Stage-1 Dispute with Sender Bank ({facts.sender_institution or 'Your Bank'})",
                    description=f"Submit a formal dispute quoting Session ID '{facts.session_id_or_ref or '[Pending]'}'. Request an official Complaint Ticket ID.",
                    channel_to_use="Bank Mobile App / Helpdesk / Branch",
                    deadline_or_sla="Bank must provide a Tracking Ticket ID within 24 hours.",
                    statutory_citation=citation
                ),
                ActionStep(
                    step_number=2,
                    title="Track Resolution Countdown",
                    description="Record your Ticket Number in Resolve. If the funds are not refunded within the regulatory period, Resolve will automatically unlock your CBN escalation dossier.",
                    channel_to_use="Resolve Case Tracker",
                    deadline_or_sla="14-day statutory resolution window.",
                    statutory_citation=citation
                )
            ]
            return ResolutionGuidance(
                stage_name="STAGE_1_PROVIDER_COMPLAINT",
                summary=f"Lodge your Stage-1 formal dispute with {facts.sender_institution or 'your bank'} citing your 30-digit NIBSS Session ID to initiate NIP interbank reconciliation.",
                action_steps=steps,
                evidence_checklist=evidence_list,
                citations=[citation],
                can_generate_document=True,
                document_type_recommended="STAGE_1_BANK_DISPUTE"
            )

        # ---------------------------------------------------------------------
        # Category 2: Undelivered Airtime / Data (NCC Framework)
        # ---------------------------------------------------------------------
        elif category == IncidentCategory.UNDELIVERED_AIRTIME_DATA:
            # Scenario A: Stage 2 NCC 622 Escalation
            if facts.provider_contacted and facts.existing_ticket_ref:
                citation = OfficialCitation(
                    publisher="Nigerian Communications Commission (NCC)",
                    title="NCC Consumer Complaints Procedure & Toll-Free 622 Hotline",
                    url="https://consumer.ncc.gov.ng/articles/126-before-you-escalate-your-complaint-steps-to-take-first",
                    statutory_rule="Consumers may escalate unresolved telecom service complaints to NCC via 622 upon expiration of provider SLA."
                )
                steps = [
                    ActionStep(
                        step_number=1,
                        title="Call NCC Toll-Free Hotline (622) or Use Consumer Portal",
                        description=f"Call 622 (toll-free from any network) or visit consumer.ncc.gov.ng. Provide your {facts.telco_provider or 'Telco'} Ticket #{facts.existing_ticket_ref}.",
                        channel_to_use="Phone: Dial 622 / Web: consumer.ncc.gov.ng",
                        deadline_or_sla="NCC intervenes directly with the MNO.",
                        statutory_citation=citation
                    )
                ]
                return ResolutionGuidance(
                    stage_name="STAGE_2_REGULATOR_ESCALATION",
                    summary="Your telecom operator has failed to resolve the undelivered recharge. You are eligible to escalate directly to the NCC via Toll-Free 622.",
                    action_steps=steps,
                    evidence_checklist=evidence_list,
                    citations=[citation],
                    can_generate_document=True,
                    document_type_recommended="NCC_ESCALATION_SUMMARY"
                )

            # Scenario B: Stage 1 Telco / Bank VTU Complaint
            is_vtu = facts.purchased_via_bank_vtu is True
            first_target = f"Sender Bank / VTU Channel ({facts.sender_institution or 'Bank'})" if is_vtu else f"Telecom Provider ({facts.telco_provider or 'MNO'})"
            citation = OfficialCitation(
                publisher="Nigerian Communications Commission (NCC) & CBN",
                title="Consumer Code of Practice Regulations & VTU Guidelines",
                url="https://consumer.ncc.gov.ng/consumer-complaints/procedure-to-file-a-complaint",
                statutory_rule="First tier complaint must be submitted to the service provider, who must assign a unique ticket reference."
            )
            steps = [
                ActionStep(
                    step_number=1,
                    title=f"Lodge Complaint with {first_target}",
                    description=f"Report the undelivered airtime/data for phone number {facts.phone_number_credited or 'your number'}. Request a mandatory Ticket ID.",
                    channel_to_use="Customer Care (300 for Telco or Bank In-App)",
                    deadline_or_sla="Provider must respond within 24-48 hours.",
                    statutory_citation=citation
                )
            ]
            return ResolutionGuidance(
                stage_name="STAGE_1_PROVIDER_COMPLAINT",
                summary=f"Submit your Stage-1 complaint to {first_target}. If unresolved, Resolve will format your escalation to NCC Toll-Free 622.",
                action_steps=steps,
                evidence_checklist=evidence_list,
                citations=[citation],
                can_generate_document=True,
                document_type_recommended="STAGE_1_TELCO_VTU_COMPLAINT"
            )

        # ---------------------------------------------------------------------
        # Category 3: Stolen Funds / Fraud (Emergency Protocol)
        # ---------------------------------------------------------------------
        elif category == IncidentCategory.STOLEN_FUNDS_FRAUD:
            citation = OfficialCitation(
                publisher="Central Bank of Nigeria & NPF-NCCC",
                title="CBN Fraud Desk Framework & Cybercrimes Act 2015",
                url="https://incb.npf.gov.ng/",
                statutory_rule="Banks operate 24/7 fraud desks to place precautionary Post-No-Debit (PND) liens on recipient accounts across the NIBSS portal."
            )
            steps = [
                ActionStep(
                    step_number=1,
                    title="Lock Your Account & SIM Card Immediately",
                    description="If not already done, dial your bank's USSD emergency kill-switch from any phone to freeze further withdrawals.",
                    channel_to_use="Bank USSD Kill-Switch",
                    deadline_or_sla="Critical: Must be done within minutes/hours.",
                    statutory_citation=citation
                ),
                ActionStep(
                    step_number=2,
                    title=f"Contact {facts.sender_institution or 'Bank'} Fraud Desk for Precautionary Lien & Recall",
                    description=f"Submit the Urgent Fraud Dispute Request to place an interbank lien on {facts.recipient_institution or 'the receiving bank account'} before funds are cashed out.",
                    channel_to_use="Bank 24/7 Fraud Hotline & Email",
                    deadline_or_sla="Within 24 hours of incident.",
                    statutory_citation=citation
                ),
                ActionStep(
                    step_number=3,
                    title="File Electronic Report with Nigeria Police Force Cybercrime Centre (NPF-NCCC)",
                    description="File a cybercrime report at incb.npf.gov.ng to obtain the official Police Extract / Bankers Order required for permanent fund recovery.",
                    channel_to_use="NPF-NCCC Portal (incb.npf.gov.ng)",
                    deadline_or_sla="Immediate",
                    statutory_citation=citation
                )
            ]
            return ResolutionGuidance(
                stage_name="EMERGENCY_LOCK_AND_LIEN",
                summary="Active unauthorized transaction detected. Take immediate account freezing actions and dispatch the Precautionary Fraud Lien Request to your bank's Fraud Desk.",
                action_steps=steps,
                evidence_checklist=evidence_list,
                citations=[citation],
                can_generate_document=True,
                document_type_recommended="URGENT_FRAUD_DESK_LIEN_REQUEST"
            )

        # ---------------------------------------------------------------------
        # Category 4: Merchant Non-Delivery (FCCPC & Chargeback Matrix)
        # ---------------------------------------------------------------------
        elif category == IncidentCategory.MERCHANT_NON_DELIVERY:
            # Sub-scenario 1: Paid via Card / Online Checkout (Paystack / Flutterwave)
            if facts.payment_method == PaymentMethod.DEBIT_CARD_CHECKOUT:
                citation = OfficialCitation(
                    publisher="Payment Card Industry & Gateway Dispute Framework",
                    title="Card Scheme Chargeback Rules (Merchandise Not Received)",
                    url="https://paystack.com/lookup",
                    statutory_rule="Consumers paying via debit card/checkout have chargeback rights against merchants who fail to deliver proof of fulfillment."
                )
                steps = [
                    ActionStep(
                        step_number=1,
                        title="Look Up Transaction on Gateway Dispute Portal",
                        description="If paid via Paystack or Flutterwave checkout, enter your transaction reference or card digits at paystack.com/lookup to freeze merchant settlement.",
                        channel_to_use="Gateway Dispute Portal (paystack.com/lookup)",
                        deadline_or_sla="Within 30 days of transaction.",
                        statutory_citation=citation
                    ),
                    ActionStep(
                        step_number=2,
                        title="File Card Chargeback with Your Issuing Bank",
                        description="Submit a Chargeback request for 'Services/Goods Not Received'. The bank reverses payment if the merchant cannot produce signed delivery proof.",
                        channel_to_use="Issuing Bank Card Services",
                        deadline_or_sla="Immediate",
                        statutory_citation=citation
                    )
                ]
                return ResolutionGuidance(
                    stage_name="GATEWAY_CHARGEBACK",
                    summary="Because you paid via Card / Online Checkout, you have strong Chargeback rights. You can freeze settlement and compel a refund.",
                    action_steps=steps,
                    evidence_checklist=evidence_list,
                    citations=[citation],
                    can_generate_document=True,
                    document_type_recommended="CARD_CHARGEBACK_DISPUTE_LETTER"
                )

            # Sub-scenario 2: Direct Bank Transfer to Defaulting Merchant (FCCPC Pathway)
            citation = OfficialCitation(
                publisher="Federal Competition and Consumer Protection Commission (FCCPC)",
                title="Federal Competition and Consumer Protection Act (FCCPA) 2018 (Sections 114–130)",
                url="https://complaints.fccpc.gov.ng",
                statutory_rule="Section 114 guarantees right to timely delivery; failure obligates full refund and exposes defaulting business to regulatory enforcement."
            )
            is_ghosted = facts.vendor_response_state == "BLOCKED_BUYER_GHOSTED"
            steps = [
                ActionStep(
                    step_number=1,
                    title="Send Formal Notice of Non-Delivery & Demand for Refund (7-Day Cure Notice)",
                    description=f"Deliver the formal demand notice to {facts.merchant_name_or_handle or 'the merchant'} establishing a mandatory paper trail under FCCPA 2018.",
                    channel_to_use="WhatsApp / Email / SMS",
                    deadline_or_sla="Give 5–7 days for delivery or refund.",
                    statutory_citation=citation
                ),
                ActionStep(
                    step_number=2,
                    title="Notify Sender Bank of Disputed Commercial Transaction",
                    description=f"Submit disputed transaction notification to {facts.sender_institution or 'your bank'} citing Session ID '{facts.session_id_or_ref or 'Pending'}' to request beneficiary bank contact merchant.",
                    channel_to_use="Bank Dispute Desk",
                    deadline_or_sla="Immediate",
                    statutory_citation=citation
                ),
                ActionStep(
                    step_number=3,
                    title="Lodge Formal Complaint with FCCPC",
                    description="Submit your complaint dossier on the official FCCPC portal (complaints.fccpc.gov.ng) with screenshots of proof of payment and order agreement.",
                    channel_to_use="FCCPC Complaint Portal (complaints.fccpc.gov.ng)",
                    deadline_or_sla="Upon expiration of demand notice or if blocked.",
                    statutory_citation=citation
                )
            ]
            return ResolutionGuidance(
                stage_name="FCCPC_COMMERCIAL_REDRESS",
                summary=f"Commercial dispute for undelivered goods. Resolve has structured your formal Demand Notice and official FCCPC complaint dossier under the FCCPA 2018.",
                action_steps=steps,
                evidence_checklist=evidence_list,
                citations=[citation],
                can_generate_document=True,
                document_type_recommended="FCCPC_COMPLAINT_DOSSIER"
            )

        # Fallback / Out of Scope
        return ResolutionGuidance(
            stage_name="GENERAL_ADVISORY",
            summary="We have recorded your details. Please review official consumer protection guidelines.",
            action_steps=[],
            evidence_checklist=[],
            citations=[],
            can_generate_document=False,
            document_type_recommended=None
        )
