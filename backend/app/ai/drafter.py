from datetime import datetime, date
from typing import List
from ..schemas.case import ExtractedCaseFacts, IncidentCategory, PaymentMethod
from ..schemas.guidance import ResolutionGuidance
from ..schemas.document import GeneratedDocument

class ComplaintDrafter:
    """
    Generates grounded, non-defamatory dispute documents and regulatory dossiers.
    Strictly uses verifiable facts provided by the user.
    """

    @classmethod
    def generate_document(cls, facts: ExtractedCaseFacts, guidance: ResolutionGuidance) -> GeneratedDocument:
        doc_type = guidance.document_type_recommended or "STAGE_1_BANK_DISPUTE"
        today_str = date.today().strftime("%B %d, %Y")
        amount_fmt = f"₦{facts.amount_ngn:,.2f}" if facts.amount_ngn else "[AMOUNT PENDING]"
        tx_date_str = facts.transaction_date.strftime("%B %d, %Y") if facts.transaction_date else "[DATE PENDING]"
        session_id = facts.session_id_or_ref or "[SESSION ID PENDING]"
        bank_name = facts.sender_institution or "[BANK NAME]"

        # ---------------------------------------------------------------------
        # 1. Stage 1 Bank Transfer Dispute
        # ---------------------------------------------------------------------
        if doc_type == "STAGE_1_BANK_DISPUTE":
            subject = f"FORMAL DISPUTE: FAILED ELECTRONIC FUNDS TRANSFER — {amount_fmt} (Ref: {session_id})"
            body = (
                f"Date: {today_str}\n\n"
                f"To: Customer Care & Dispute Resolution Department\n"
                f"Institution: {bank_name}\n\n"
                f"Dear Sir/Madam,\n\n"
                f"RE: NOTICE OF FAILED TRANSFER DEBIT WITHOUT BENEFICIARY CREDIT\n\n"
                f"I am writing to formally lodge a dispute regarding an electronic funds transfer initiated from my account on {tx_date_str}. "
                f"My account was debited in the sum of {amount_fmt}, but the recipient institution ({facts.recipient_institution or 'the beneficiary bank'}) "
                f"has confirmed non-receipt of value.\n\n"
                f"TRANSACTION DETAILS:\n"
                f"• Amount Debited: {amount_fmt}\n"
                f"• Transaction Date: {tx_date_str}\n"
                f"• 30-Digit NIBSS Session ID / Reference: {session_id}\n"
                f"• Sender Institution: {bank_name}\n"
                f"• Beneficiary Institution: {facts.recipient_institution or 'N/A'}\n\n"
                f"In accordance with Central Bank of Nigeria (CBN) Electronic Funds Transfer regulations, I hereby request the immediate trace "
                f"and interbank reconciliation of this transaction, and the return of debited funds if credit failure is confirmed.\n\n"
                f"Kindly provide an official Complaint Ticket ID for this dispute."
            )
            evidence = [
                "Official debit alert / statement snippet",
                "Transaction receipt showing 30-digit NIBSS Session ID",
                "Beneficiary confirmation of non-receipt"
            ]
            statutory_clause = "Pursuant to the CBN Consumer Protection Framework, the financial institution is required to acknowledge this complaint and assign a tracking reference number."
            submission = [
                f"Submit via {bank_name} Mobile App In-App Dispute Portal",
                f"Email official customer support: {bank_name} Customer Care",
                "Present physical copy at nearest branch customer service desk"
            ]
            return GeneratedDocument(
                document_type=doc_type,
                title="Stage-1 Bank Electronic Transfer Dispute Notice",
                recipient_institution=bank_name,
                recipient_contact_info=f"{bank_name} Customer Support & Dispute Desk",
                subject_line=subject,
                body_text=body,
                formal_evidence_list=evidence,
                statutory_notice_clause=statutory_clause,
                suggested_submission_methods=submission
            )

        # ---------------------------------------------------------------------
        # 2. CBN CPD Escalation Petition
        # ---------------------------------------------------------------------
        elif doc_type == "CBN_CPD_PETITION":
            subject = f"PETITION: UNRESOLVED BANK DISPUTE — {bank_name} (Ticket #{facts.existing_ticket_ref or 'PENDING'})"
            body = (
                f"Date: {today_str}\n\n"
                f"To: The Director, Consumer Protection Department (CPD)\n"
                f"Central Bank of Nigeria, Central Business District, Abuja\n"
                f"Email: cpd@cbn.gov.ng\n\n"
                f"Dear Sir/Madam,\n\n"
                f"RE: ESCALATION OF UNRESOLVED FAILED TRANSACTION COMPLAINT AGAINST {bank_name.upper()}\n\n"
                f"I hereby submit a formal regulatory petition pursuant to the CBN Consumer Complaint Lodgment Framework. "
                f"On {tx_date_str}, I was debited the sum of {amount_fmt} by {bank_name} for a transfer that was never credited to the recipient. "
                f"I previously lodged a Stage-1 dispute with {bank_name} (Reference: {facts.existing_ticket_ref or '[Ticket ID]'}), but the statutory "
                f"resolution window has elapsed without refund or satisfactory resolution.\n\n"
                f"CASE SUMMARY:\n"
                f"• Financial Institution: {bank_name}\n"
                f"• Amount in Dispute: {amount_fmt}\n"
                f"• NIBSS Session ID: {session_id}\n"
                f"• Date Debited: {tx_date_str}\n"
                f"• Initial Bank Ticket Ref: {facts.existing_ticket_ref or 'Provided in Annex'}\n\n"
                f"PRAYERS:\n"
                f"1. Order {bank_name} to immediately reverse and credit the sum of {amount_fmt} to my account.\n"
                f"2. Investigate institutional compliance with CBN electronic transaction turnaround times."
            )
            evidence = [
                "Copy of initial Stage-1 complaint lodged with bank",
                "Bank Ticket Number confirmation email/SMS",
                "Transaction receipt displaying 30-digit NIBSS Session ID",
                "Full bank statement extract showing unresolved debit"
            ]
            statutory_clause = "Submitted under Section 3.0 of the CBN Consumer Protection Framework and Section 42 of the CBN Act."
            submission = [
                "Email to: cpd@cbn.gov.ng",
                "Lodge on the CBN Consumer Complaints Management System (CCMS) portal"
            ]
            return GeneratedDocument(
                document_type=doc_type,
                title="Formal Petition to Central Bank of Nigeria Consumer Protection Department (CPD)",
                recipient_institution="Central Bank of Nigeria (CPD)",
                recipient_contact_info="cpd@cbn.gov.ng | CBN Headquarters, Abuja",
                subject_line=subject,
                body_text=body,
                formal_evidence_list=evidence,
                statutory_notice_clause=statutory_clause,
                suggested_submission_methods=submission
            )

        # ---------------------------------------------------------------------
        # 3. Urgent Fraud Desk Lien Request (Stolen Funds)
        # ---------------------------------------------------------------------
        elif doc_type == "URGENT_FRAUD_DESK_LIEN_REQUEST":
            subject = f"URGENT FRAUD ALERT: REQUEST FOR PRECAUTIONARY LIEN & RECALL — {amount_fmt}"
            body = (
                f"Date: {today_str}\n\n"
                f"To: 24/7 Fraud Desk & Internal Control Department\n"
                f"Sender Bank: {bank_name}\n"
                f"Beneficiary Institution: {facts.recipient_institution or 'Receiving Institution'}\n\n"
                f"URGENT: TIME-SENSITIVE FRAUD / UNAUTHORIZED TRANSACTION REPORT\n\n"
                f"I am writing to report an urgent, unauthorized transaction that occurred on {tx_date_str}. "
                f"The sum of {amount_fmt} was fraudulently removed from my account via {facts.unauthorized_reason or 'unauthorized digital access'}.\n\n"
                f"FRAUD TRANSACTION METRICS:\n"
                f"• Amount: {amount_fmt}\n"
                f"• Incident Date: {tx_date_str}\n"
                f"• Reference / Session ID: {session_id}\n"
                f"• Beneficiary Institution: {facts.recipient_institution or 'Identified on NIBSS receipt'}\n"
                f"• Beneficiary Identifier: {facts.recipient_account_or_identifier or 'See debit alert details'}\n\n"
                f"URGENT ACTIONS REQUESTED:\n"
                f"1. Transmit an emergency Precautionary Fraud Alert via the NIBSS Industry Portal to the beneficiary institution.\n"
                f"2. Request the immediate placement of a Post-No-Debit (PND) lien on the receiving account to preserve funds from cash dissipation.\n"
                f"3. An electronic crime report is being filed concurrently with the Nigeria Police Force National Cybercrime Centre (NPF-NCCC)."
            )
            evidence = [
                "Unauthorized debit alert SMS/email",
                "Transaction receipt showing recipient account and session reference",
                "NPF-NCCC e-reporting confirmation"
            ]
            statutory_clause = "Issued in accordance with the CBN Fraud Desk Framework and Cybercrimes (Prohibition, Prevention, etc.) Act 2015."
            submission = [
                f"Immediate email to {bank_name} Fraud Desk",
                f"Call {bank_name} 24/7 emergency fraud hotline",
                "Copy Compliance / Anti-Fraud team of receiving institution"
            ]
            return GeneratedDocument(
                document_type=doc_type,
                title="Urgent Fraud Desk Precautionary Lien & Recall Request",
                recipient_institution=f"{bank_name} Fraud Desk",
                recipient_contact_info=f"{bank_name} 24/7 Fraud Operations",
                subject_line=subject,
                body_text=body,
                formal_evidence_list=evidence,
                statutory_notice_clause=statutory_clause,
                suggested_submission_methods=submission
            )

        # ---------------------------------------------------------------------
        # 4. FCCPC Commercial Redress & Demand Notice (Merchant Non-Delivery)
        # ---------------------------------------------------------------------
        elif doc_type == "FCCPC_COMPLAINT_DOSSIER":
            merchant = facts.merchant_name_or_handle or "The Merchant / Vendor"
            items = facts.items_or_services_description or "goods/services ordered"
            agreed_date = facts.agreed_delivery_date.strftime("%B %d, %Y") if facts.agreed_delivery_date else "the agreed delivery timeline"
            
            subject = f"FORMAL NOTICE OF NON-DELIVERY & DEMAND FOR REFUND — {amount_fmt} ({items})"
            body = (
                f"Date: {today_str}\n\n"
                f"To: {merchant}\n"
                f"Copy: Federal Competition and Consumer Protection Commission (FCCPC) — complaints.fccpc.gov.ng\n\n"
                f"FORMAL NOTICE OF BREACH OF CONTRACT & STATUTORY DEMAND FOR FULL REFUND\n\n"
                f"Dear Sir/Madam,\n\n"
                f"This document constitutes formal notice regarding the transaction completed on {tx_date_str}, "
                f"wherein I paid the sum of {amount_fmt} (Transaction Ref: {session_id}) as full consideration for: {items}.\n\n"
                f"STATEMENT OF FACTS:\n"
                f"1. Payment of {amount_fmt} was confirmed by the merchant on {tx_date_str}.\n"
                f"2. Delivery was agreed to occur on or before {agreed_date}.\n"
                f"3. As of {today_str}, the agreed goods/services have NOT been delivered.\n"
                f"4. Subsequent communication: {facts.vendor_response_state or 'No satisfactory delivery or refund has been provided'}.\n\n"
                f"STATUTORY DEMAND:\n"
                f"Under Section 114 of the Federal Competition and Consumer Protection Act (FCCPA) 2018, every consumer has a statutory right "
                f"to the timely performance of services and delivery of goods. When a supplier fails to perform, the consumer is entitled to "
                f"the full refund of all consideration paid.\n\n"
                f"You are hereby given SEVEN (7) DAYS from the date of this notice to either deliver the agreed items in satisfactory condition "
                f"or issue a full refund of {amount_fmt}. Failure to do so will result in the immediate docketing of this formal complaint with "
                f"the FCCPC for deceptive trade practices."
            )
            evidence = [
                "Proof of payment (Bank transfer receipt / Checkout confirmation)",
                "Screenshot of chat agreement showing order specification and promised delivery date",
                "Screenshots demonstrating follow-up messages and merchant failure to deliver or refund"
            ]
            statutory_clause = "Issued pursuant to Sections 114, 120, and 127 of the Federal Competition and Consumer Protection Act 2018."
            submission = [
                f"Deliver via WhatsApp / Email / DM to {merchant}",
                "Upload directly to the official FCCPC complaint portal: complaints.fccpc.gov.ng",
                f"Submit copy to {bank_name} Disputed Commercial Transactions desk"
            ]
            return GeneratedDocument(
                document_type=doc_type,
                title="FCCPC Formal Notice of Non-Delivery & Demand for Refund",
                recipient_institution=merchant,
                recipient_contact_info=f"{merchant} & FCCPC Complaints Directorate",
                subject_line=subject,
                body_text=body,
                formal_evidence_list=evidence,
                statutory_notice_clause=statutory_clause,
                suggested_submission_methods=submission
            )

        # ---------------------------------------------------------------------
        # 5. Default Fallback Document
        # ---------------------------------------------------------------------
        return GeneratedDocument(
            document_type="GENERAL_CONSUMER_INQUIRY",
            title="General Consumer Redress Inquiry",
            recipient_institution=bank_name,
            recipient_contact_info="Customer Dispute Desk",
            subject_line=f"INQUIRY: TRANSACTION DISPUTE — {amount_fmt}",
            body_text=f"Formal inquiry regarding transaction of {amount_fmt} on {tx_date_str}.",
            formal_evidence_list=["Proof of payment"],
            statutory_notice_clause="Standard consumer protection guidance applies.",
            suggested_submission_methods=["Customer Service Helpdesk"]
        )
