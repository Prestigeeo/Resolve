import uuid
from datetime import datetime, timezone, date
from typing import Optional
from sqlmodel import SQLModel, Field

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class CaseRecord(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    # Hash of the opaque capability returned only when a case is created. This
    # lets an anonymous user continue their own case without making all cases
    # publicly enumerable.
    access_token_hash: str = Field(index=True)
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)
    
    category: str
    status: str
    is_urgent_emergency: bool = False
    
    # Financial fields
    amount_ngn: Optional[float] = None
    transaction_date: Optional[date] = None
    sender_institution: Optional[str] = None
    recipient_institution: Optional[str] = None
    session_id_or_ref: Optional[str] = None
    
    # Provider tracking
    provider_contacted: bool = False
    provider_ticket_ref: Optional[str] = None
    follow_up_due_date: Optional[date] = None
    
    # Serialized JSON blobs for facts, questions, and documents
    facts_json: str
    clarifying_questions_json: Optional[str] = None
    generated_document_json: Optional[str] = None
