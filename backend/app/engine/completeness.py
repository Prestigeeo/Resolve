from typing import List, Tuple
from ..schemas.case import IncidentCategory, ExtractedCaseFacts, PaymentMethod
from ..schemas.intake import ClarifyingQuestion

class CompletenessGatekeeper:
    """
    Investigative Evidence & Triage Gatekeeper.
    Prevents premature document generation by ensuring that essential case evidence
    and facts are collected before any complaint or dispute is drafted.
    """

    @classmethod
    def evaluate_completeness(cls, facts: ExtractedCaseFacts) -> Tuple[bool, List[str], List[ClarifyingQuestion]]:
        """
        Evaluates facts for completeness.
        Returns:
            (is_complete: bool, missing_fields: List[str], questions: List[ClarifyingQuestion])
        """
        category = facts.category
        missing_fields: List[str] = []
        questions: List[ClarifyingQuestion] = []

        if category == IncidentCategory.OUT_OF_SCOPE:
            return True, [], []

        if category == IncidentCategory.AMBIGUOUS:
            return False, ["category_clarification"], [
                ClarifyingQuestion(
                    id="q_category_clarification",
                    question_text="Could you clarify what type of issue occurred?",
                    field_target="category",
                    help_text="Knowing whether this was a failed transfer, airtime debit, unauthorized theft, or merchant dispute helps us apply the right regulatory rules.",
                    input_type="select",
                    options=[
                        "Failed Bank Transfer (debited, recipient not credited)",
                        "Undelivered Airtime or Data bundle",
                        "Unauthorized debit / Stolen funds",
                        "Paid a merchant/vendor who refused to deliver goods or services",
                        "Other issue"
                    ]
                )
            ]

        # Common core requirements across all valid categories
        if facts.amount_ngn is None:
            missing_fields.append("amount_ngn")
            questions.append(
                ClarifyingQuestion(
                    id="q_amount",
                    question_text="What was the exact amount involved in Naira (₦)?",
                    field_target="amount_ngn",
                    help_text="Regulators and banks require the exact debit amount to locate the ledger entry.",
                    input_type="number"
                )
            )

        if facts.transaction_date is None:
            missing_fields.append("transaction_date")
            questions.append(
                ClarifyingQuestion(
                    id="q_transaction_date",
                    question_text="On what date did this transaction occur?",
                    field_target="transaction_date",
                    help_text="Statutory resolution windows (CBN 24h/14-day, NCC SLAs) are calculated from this date.",
                    input_type="date"
                )
            )

        # -------------------------------------------------------------------------
        # Category 1: Failed Bank Transfer
        # -------------------------------------------------------------------------
        if category == IncidentCategory.FAILED_TRANSFER:
            if not facts.sender_institution:
                missing_fields.append("sender_institution")
                questions.append(
                    ClarifyingQuestion(
                        id="q_sender_bank",
                        question_text="Which bank or fintech app did you send the money from?",
                        field_target="sender_institution",
                        help_text="e.g. GTBank, Access Bank, Zenith, OPay, Moniepoint, Kuda.",
                        input_type="text"
                    )
                )

            if not facts.session_id_or_ref:
                missing_fields.append("session_id_or_ref")
                questions.append(
                    ClarifyingQuestion(
                        id="q_session_id",
                        question_text="Do you have the 30-digit NIBSS Session ID or Transaction Reference from your receipt?",
                        field_target="session_id_or_ref",
                        help_text="This 30-digit code is the definitive proof required for receiving banks to trace missing funds across NIBSS. Check your receipt or transaction history.",
                        input_type="text"
                    )
                )

            if facts.provider_contacted is None:
                missing_fields.append("provider_contacted")
                questions.append(
                    ClarifyingQuestion(
                        id="q_provider_contacted",
                        question_text="Have you already reported this failed transfer to your bank's customer support?",
                        field_target="provider_contacted",
                        help_text="CBN rules mandate filing with your bank first before escalating to the regulator.",
                        input_type="select",
                        options=["Yes, I have already reported it", "No, not yet"]
                    )
                )

        # -------------------------------------------------------------------------
        # Category 2: Undelivered Airtime / Data
        # -------------------------------------------------------------------------
        elif category == IncidentCategory.UNDELIVERED_AIRTIME_DATA:
            if facts.purchased_via_bank_vtu is None:
                missing_fields.append("purchased_via_bank_vtu")
                questions.append(
                    ClarifyingQuestion(
                        id="q_vtu_channel",
                        question_text="How did you purchase the airtime/data: through your bank app or directly from the telco?",
                        field_target="purchased_via_bank_vtu",
                        help_text="If debited by a bank app and the telco has no record, the first complaint must go to the bank/aggregator, not the telco.",
                        input_type="select",
                        options=["Through my Bank App / USSD (VTU)", "Directly via SIM / Telco App / Scratch Card"]
                    )
                )

            if not facts.telco_provider:
                missing_fields.append("telco_provider")
                questions.append(
                    ClarifyingQuestion(
                        id="q_telco_provider",
                        question_text="Which telecom network was affected?",
                        field_target="telco_provider",
                        input_type="select",
                        options=["MTN", "AIRTEL", "GLO", "9MOBILE", "OTHER"]
                    )
                )

            if not facts.phone_number_credited:
                missing_fields.append("phone_number_credited")
                questions.append(
                    ClarifyingQuestion(
                        id="q_phone_number",
                        question_text="What is the phone number that was supposed to receive the airtime or data?",
                        field_target="phone_number_credited",
                        help_text="Required by the telecom provider and NCC to verify call/data logs.",
                        input_type="text"
                    )
                )

        # -------------------------------------------------------------------------
        # Category 3: Stolen Funds / Fraud
        # -------------------------------------------------------------------------
        elif category == IncidentCategory.STOLEN_FUNDS_FRAUD:
            if facts.account_currently_locked is None:
                missing_fields.append("account_currently_locked")
                questions.append(
                    ClarifyingQuestion(
                        id="q_account_locked",
                        question_text="Have you already dialed your bank's USSD emergency code or called their fraud desk to freeze the account?",
                        field_target="account_currently_locked",
                        help_text="Freezing your account immediately is the single most critical step to prevent further withdrawals.",
                        input_type="select",
                        options=["Yes, my account/SIM is already blocked", "No, I haven't locked it yet"]
                    )
                )

            if not facts.unauthorized_reason:
                missing_fields.append("unauthorized_reason")
                questions.append(
                    ClarifyingQuestion(
                        id="q_unauthorized_reason",
                        question_text="How did this unauthorized transaction happen?",
                        field_target="unauthorized_reason",
                        input_type="select",
                        options=[
                            "My phone or SIM card was stolen",
                            "I received an unauthorized debit alert out of nowhere",
                            "I was deceived into sharing an OTP or clicking a phishing link",
                            "My ATM card details were compromised",
                            "Other"
                        ]
                    )
                )

        # -------------------------------------------------------------------------
        # Category 4: Merchant Non-Delivery (Crucial Investigative Gate!)
        # -------------------------------------------------------------------------
        elif category == IncidentCategory.MERCHANT_NON_DELIVERY:
            # 1. Payment Rails: Card/Gateway vs. Direct Transfer
            if facts.payment_method is None:
                missing_fields.append("payment_method")
                questions.append(
                    ClarifyingQuestion(
                        id="q_payment_method",
                        question_text="How did you pay the merchant?",
                        field_target="payment_method",
                        help_text="If you paid via Debit Card or an online checkout like Paystack/Flutterwave, you have fast Chargeback rights. Direct bank transfers require an FCCPC complaint and formal Demand Notice.",
                        input_type="select",
                        options=[
                            "Direct Bank Transfer (sent money to an account number)",
                            "Online Checkout / Debit Card (entered card details on website or Paystack/Flutterwave)",
                            "POS Terminal"
                        ]
                    )
                )

            # 2. Agreed Delivery Date check
            if facts.agreed_delivery_date is None:
                missing_fields.append("agreed_delivery_date")
                questions.append(
                    ClarifyingQuestion(
                        id="q_agreed_delivery_date",
                        question_text="What was the promised or agreed delivery date?",
                        field_target="agreed_delivery_date",
                        help_text="A commercial complaint cannot be filed before the promised delivery window has actually elapsed.",
                        input_type="date"
                    )
                )

            # 3. Communication Status
            if not facts.vendor_response_state:
                missing_fields.append("vendor_response_state")
                questions.append(
                    ClarifyingQuestion(
                        id="q_vendor_response_state",
                        question_text="What is the vendor's current response when you reach out?",
                        field_target="vendor_response_state",
                        help_text="This determines whether we issue a 5-day formal Demand for Refund or escalate immediately to the FCCPC and bank fraud desk.",
                        input_type="select",
                        options=[
                            "Vendor blocked me on WhatsApp / Instagram / Phone",
                            "Vendor is giving continuous excuses / stalling",
                            "Vendor explicitly refused to deliver or refund",
                            "Vendor is completely unresponsive"
                        ]
                    )
                )

            # 4. Description of goods
            if not facts.items_or_services_description:
                missing_fields.append("items_or_services_description")
                questions.append(
                    ClarifyingQuestion(
                        id="q_items_description",
                        question_text="What specific items or services did you pay for?",
                        field_target="items_or_services_description",
                        help_text="e.g. '2 tailored dresses', 'iPhone 13 screen replacement', 'Laptop charger'.",
                        input_type="text"
                    )
                )

        is_complete = len(missing_fields) == 0
        return is_complete, missing_fields, questions[:3]  # Return at most 3 prioritized questions at once
