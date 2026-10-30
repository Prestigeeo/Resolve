from typing import List, Optional
from pydantic import BaseModel, Field

class OfficialCitation(BaseModel):
    publisher: str = Field(..., description="e.g. 'Central Bank of Nigeria (CBN)', 'NCC', 'FCCPC'")
    title: str = Field(..., description="Title of regulation or official guideline")
    url: str = Field(..., description="Official URL")
    statutory_rule: str = Field(..., description="The specific rule or SLA window enforced")

class EvidenceItem(BaseModel):
    id: str = Field(..., description="Unique identifier for evidence item")
    title: str = Field(..., description="Name of required evidence")
    description: str = Field(..., description="Details on what is needed and why")
    is_mandatory: bool = Field(True, description="True if filing without this is almost certainly rejected")
    is_collected: bool = Field(False, description="Whether user has uploaded or confirmed this item")

class ActionStep(BaseModel):
    step_number: int
    title: str
    description: str
    channel_to_use: str = Field(..., description="e.g. 'Bank In-App Help', 'NCC Toll-Free 622', 'FCCPC Portal'")
    deadline_or_sla: Optional[str] = None
    statutory_citation: Optional[OfficialCitation] = None

class ResolutionGuidance(BaseModel):
    stage_name: str = Field(..., description="'STAGE_1_PROVIDER_COMPLAINT' | 'STAGE_2_REGULATOR_ESCALATION' | 'EMERGENCY_LOCK' | 'GATEWAY_CHARGEBACK'")
    summary: str
    action_steps: List[ActionStep]
    evidence_checklist: List[EvidenceItem]
    citations: List[OfficialCitation]
    can_generate_document: bool = True
    document_type_recommended: Optional[str] = None
