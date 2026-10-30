import json
from datetime import datetime, timezone, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..models.case import CaseRecord
from ..schemas.case import ExtractedCaseFacts, CaseStatus
from ..schemas.guidance import ResolutionGuidance
from ..schemas.document import GeneratedDocument
from ..engine.rules import DeterministicRulesEngine
from ..ai.drafter import ComplaintDrafter
from ..ai.verifier import FactGroundingVerifier

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("/")
def list_cases(session: Session = Depends(get_session)):
    cases = session.exec(select(CaseRecord).order_by(CaseRecord.created_at.desc())).all()
    return cases

@router.get("/{case_id}")
def get_case(case_id: str, session: Session = Depends(get_session)):
    case_record = session.get(CaseRecord, case_id)
    if not case_record:
        raise HTTPException(status_code=404, detail="Case not found.")
    
    facts = ExtractedCaseFacts.model_validate_json(case_record.facts_json)
    guidance = DeterministicRulesEngine.determine_guidance(facts)
    
    return {
        "case": case_record,
        "facts": facts,
        "guidance": guidance,
        "statutory_countdown_days": (14 - (date.today() - facts.transaction_date).days) if facts.transaction_date else None
    }

@router.post("/{case_id}/generate-document", response_model=GeneratedDocument)
def generate_case_document(case_id: str, session: Session = Depends(get_session)):
    case_record = session.get(CaseRecord, case_id)
    if not case_record:
        raise HTTPException(status_code=404, detail="Case not found.")

    facts = ExtractedCaseFacts.model_validate_json(case_record.facts_json)
    guidance = DeterministicRulesEngine.determine_guidance(facts)

    if not guidance.can_generate_document:
        raise HTTPException(status_code=400, detail="Document generation not permitted until evidence is complete.")

    document = ComplaintDrafter.generate_document(facts, guidance)
    
    # Run Zero-Hallucination Fact Verifier
    is_valid, violations = FactGroundingVerifier.verify_document(document, facts)
    if not is_valid:
        raise HTTPException(status_code=500, detail=f"Document failed factual grounding check: {violations}")

    case_record.generated_document_json = document.model_dump_json()
    case_record.status = CaseStatus.READY_FOR_COMPLAINT.value
    case_record.updated_at = datetime.now(timezone.utc)
    session.add(case_record)
    session.commit()

    return document

@router.patch("/{case_id}/ticket")
def update_case_ticket(case_id: str, ticket_ref: str, session: Session = Depends(get_session)):
    case_record = session.get(CaseRecord, case_id)
    if not case_record:
        raise HTTPException(status_code=404, detail="Case not found.")

    facts_dict = json.loads(case_record.facts_json)
    facts_dict["provider_contacted"] = True
    facts_dict["existing_ticket_ref"] = ticket_ref
    facts_dict["provider_contact_date"] = date.today().isoformat()
    
    updated_facts = ExtractedCaseFacts.model_validate(facts_dict)
    
    case_record.facts_json = updated_facts.model_dump_json()
    case_record.provider_contacted = True
    case_record.provider_ticket_ref = ticket_ref
    case_record.status = CaseStatus.FILED_WITH_PROVIDER.value
    case_record.follow_up_due_date = date.today() + timedelta(days=14)
    case_record.updated_at = datetime.now(timezone.utc)

    session.add(case_record)
    session.commit()
    session.refresh(case_record)

    return {"message": "Ticket updated. Statutory resolution countdown active.", "case": case_record}
