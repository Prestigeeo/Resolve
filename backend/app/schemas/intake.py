from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from .case import IncidentCategory, ExtractedCaseFacts, CaseStatus

class ClarifyingQuestion(BaseModel):
    id: str = Field(..., description="Unique ID for the question (e.g. 'q_session_id', 'q_agreed_delivery_date').")
    question_text: str = Field(..., description="The user-friendly question in clear English.")
    field_target: str = Field(..., description="The field name in ExtractedCaseFacts this question populates.")
    help_text: Optional[str] = Field(None, description="Explains why this is needed and where to find it.")
    input_type: str = Field("text", description="'text' | 'date' | 'select' | 'boolean' | 'number'")
    options: Optional[List[str]] = Field(None, description="Selectable options if input_type is 'select'.")

class IntakeRequest(BaseModel):
    raw_text: str = Field(..., min_length=5, description="The user's raw description of the incident.")
    preselected_category: Optional[IncidentCategory] = Field(None, description="Optional category chosen by user.")

class ClarificationSubmission(BaseModel):
    answers: Dict[str, Any] = Field(
        ..., 
        description="Key-value mapping of question id (or field name) to user's answer."
    )

class IntakeAnalysisResponse(BaseModel):
    case_id: str
    case_access_token: str
    case_status: CaseStatus
    facts: ExtractedCaseFacts
    is_urgent_emergency: bool = False
    emergency_instructions: Optional[Dict[str, Any]] = None
    clarifying_questions: List[ClarifyingQuestion] = []
    missing_critical_fields: List[str] = []
    message: str
