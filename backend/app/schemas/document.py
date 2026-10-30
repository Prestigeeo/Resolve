from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class GeneratedDocument(BaseModel):
    document_type: str = Field(..., description="e.g. 'STAGE_1_BANK_DISPUTE', 'CBN_CPD_PETITION', 'FCCPC_COMPLAINT_DOSSIER'")
    title: str
    recipient_institution: str
    recipient_contact_info: str
    date_generated: datetime = Field(default_factory=get_utc_now)
    subject_line: str
    body_text: str
    formal_evidence_list: List[str]
    statutory_notice_clause: str
    suggested_submission_methods: List[str]
