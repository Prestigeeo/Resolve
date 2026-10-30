from enum import Enum
from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal

class IncidentCategory(str, Enum):
    FAILED_TRANSFER = "FAILED_TRANSFER"
    UNDELIVERED_AIRTIME_DATA = "UNDELIVERED_AIRTIME_DATA"
    STOLEN_FUNDS_FRAUD = "STOLEN_FUNDS_FRAUD"
    MERCHANT_NON_DELIVERY = "MERCHANT_NON_DELIVERY"
    AMBIGUOUS = "AMBIGUOUS"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"

class PaymentMethod(str, Enum):
    DIRECT_BANK_TRANSFER = "DIRECT_BANK_TRANSFER"
    DEBIT_CARD_CHECKOUT = "DEBIT_CARD_CHECKOUT"
    POS_TERMINAL = "POS_TERMINAL"
    USSD_TRANSFER = "USSD_TRANSFER"
    TELCO_DIRECT = "TELCO_DIRECT"
    BANK_VTU = "BANK_VTU"
    OTHER = "OTHER"

class CaseStatus(str, Enum):
    DRAFT = "DRAFT"
    NEEDS_CLARIFICATION = "NEEDS_CLARIFICATION"
    READY_FOR_COMPLAINT = "READY_FOR_COMPLAINT"
    FILED_WITH_PROVIDER = "FILED_WITH_PROVIDER"
    ESCALATED_TO_REGULATOR = "ESCALATED_TO_REGULATOR"
    RESOLVED = "RESOLVED"
    CLOSED_UNRESOLVED = "CLOSED_UNRESOLVED"

class ExtractedCaseFacts(BaseModel):
    category: IncidentCategory = Field(
        ..., 
        description="The classified category of the user's issue."
    )
    confidence: float = Field(
        1.0, 
        ge=0.0, 
        le=1.0, 
        description="Classification confidence score."
    )
    is_urgent_emergency: bool = Field(
        False, 
        description="True if this is an active fraud/theft incident requiring immediate USSD lock."
    )
    
    # Financial details
    amount_ngn: Optional[Decimal] = Field(None, description="Amount in Nigerian Naira (NGN).")
    transaction_date: Optional[date] = Field(None, description="Date the transaction took place.")
    transaction_time: Optional[str] = Field(None, description="Approximate time of transaction (e.g., '14:30' or 'evening').")
    payment_method: Optional[PaymentMethod] = Field(None, description="Payment channel or rail used.")
    
    # Institutions & Parties
    sender_institution: Optional[str] = Field(None, description="Sender's bank/fintech (e.g., GTBank, Access, OPay, Moniepoint, Kuda).")
    recipient_institution: Optional[str] = Field(None, description="Recipient's bank/fintech or telecom operator.")
    sender_account_last4: Optional[str] = Field(None, description="Last 4 digits of sender account for identification.")
    recipient_account_or_identifier: Optional[str] = Field(None, description="Recipient account number, wallet, or phone number.")
    
    # References
    session_id_or_ref: Optional[str] = Field(
        None, 
        description="30-digit NIBSS Session ID, RRN, or gateway transaction reference."
    )
    
    # Specific fields for Category 1: Failed Transfer
    was_debited: Optional[bool] = Field(None, description="Did the sender's account get debited?")
    recipient_received: Optional[bool] = Field(None, description="Did the recipient receive the funds?")
    
    # Specific fields for Category 2: Undelivered Airtime/Data
    telco_provider: Optional[Literal["MTN", "AIRTEL", "GLO", "9MOBILE", "OTHER"]] = Field(None, description="Telecom network affected.")
    phone_number_credited: Optional[str] = Field(None, description="Target phone number for airtime/data.")
    purchased_via_bank_vtu: Optional[bool] = Field(None, description="True if bought through bank app/USSD, False if direct telco.")
    
    # Specific fields for Category 3: Stolen Funds / Fraud
    unauthorized_reason: Optional[Literal["STOLEN_PHONE_SIM", "PHISHING_OTP", "UNAUTHORIZED_DEBIT_ALERT", "COMPROMISED_CARD", "OTHER"]] = Field(
        None, description="How the unauthorized access or debit occurred."
    )
    account_currently_locked: Optional[bool] = Field(None, description="Has the user already dialed their USSD kill-switch to freeze the account?")
    
    # Specific fields for Category 4: Merchant Non-Delivery
    merchant_name_or_handle: Optional[str] = Field(None, description="Name, social handle, or phone of merchant/business.")
    items_or_services_description: Optional[str] = Field(None, description="Description of goods or services purchased.")
    agreed_delivery_date: Optional[date] = Field(None, description="Date promised for delivery of goods or services.")
    vendor_response_state: Optional[Literal["RESPONSIVE_STALLING", "REFUSED_REFUND", "BLOCKED_BUYER_GHOSTED", "NO_RESPONSE", "UNKNOWN"]] = Field(
        None, description="Current communication status with vendor."
    )
    
    # Dispute History
    provider_contacted: Optional[bool] = Field(None, description="Has the user already contacted their provider/bank/telco?")
    provider_contact_date: Optional[date] = Field(None, description="Date the provider was first contacted.")
    existing_ticket_ref: Optional[str] = Field(None, description="Existing complaint ticket reference from provider.")
    
    # Core narrative summary
    summary_of_incident: str = Field(..., description="Objective, fact-grounded summary of what happened.")
