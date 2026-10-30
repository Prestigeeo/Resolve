const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function requestError(res: Response, fallback: string): Promise<Error> {
  try {
    const payload = await res.json();
    return new Error(payload.detail || payload.message || fallback);
  } catch {
    return new Error(fallback);
  }
}

export interface ClarifyingQuestion {
  id: string;
  question_text: string;
  field_target: string;
  help_text?: string;
  input_type: string;
  options?: string[];
}

export interface ExtractedCaseFacts {
  category: string;
  confidence: number;
  is_urgent_emergency: boolean;
  amount_ngn?: number;
  transaction_date?: string;
  sender_institution?: string;
  recipient_institution?: string;
  session_id_or_ref?: string;
  telco_provider?: string;
  phone_number_credited?: string;
  purchased_via_bank_vtu?: boolean;
  unauthorized_reason?: string;
  account_currently_locked?: boolean;
  merchant_name_or_handle?: string;
  items_or_services_description?: string;
  agreed_delivery_date?: string;
  vendor_response_state?: string;
  provider_contacted?: boolean;
  existing_ticket_ref?: string;
  summary_of_incident: string;
}

export interface IntakeAnalysisResponse {
  case_id: string;
  case_access_token: string;
  case_status: string;
  facts: ExtractedCaseFacts;
  is_urgent_emergency: boolean;
  emergency_instructions?: {
    name: string;
    ussd_freeze_code: string;
    fraud_desk_phone: string;
    action_prompt: string;
  };
  clarifying_questions: ClarifyingQuestion[];
  missing_critical_fields: string[];
  message: string;
}

export interface ActionStep {
  step_number: number;
  title: string;
  description: string;
  channel_to_use: string;
  deadline_or_sla?: string;
  statutory_citation?: {
    publisher: string;
    title: string;
    url: string;
    statutory_rule: string;
  };
}

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  is_mandatory: boolean;
  is_collected: boolean;
}

export interface ResolutionGuidance {
  stage_name: string;
  summary: string;
  action_steps: ActionStep[];
  evidence_checklist: EvidenceItem[];
  citations: Array<{
    publisher: string;
    title: string;
    url: string;
    statutory_rule: string;
  }>;
  can_generate_document: boolean;
  document_type_recommended?: string;
}

export interface GeneratedDocument {
  document_type: string;
  title: string;
  recipient_institution: string;
  recipient_contact_info: string;
  subject_line: string;
  body_text: string;
  formal_evidence_list: string[];
  statutory_notice_clause: string;
  suggested_submission_methods: string[];
}

export const api = {
  async analyzeIntake(rawText: string, preselectedCategory?: string): Promise<IntakeAnalysisResponse> {
    const res = await fetch(`${API_BASE_URL}/intake/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text: rawText, preselected_category: preselectedCategory || null })
    });
    if (!res.ok) throw await requestError(res, "Could not analyze the complaint. Please try again.");
    return res.json();
  },

  async submitClarification(caseId: string, caseAccessToken: string, answers: Record<string, any>): Promise<IntakeAnalysisResponse> {
    const res = await fetch(`${API_BASE_URL}/intake/clarify/${caseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Case-Token": caseAccessToken },
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw await requestError(res, "Could not save those answers. Please try again.");
    return res.json();
  },

  async getCaseDetails(caseId: string, caseAccessToken: string): Promise<{ facts: ExtractedCaseFacts; guidance: ResolutionGuidance; statutory_countdown_days?: number }> {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, { headers: { "X-Case-Token": caseAccessToken } });
    if (!res.ok) throw await requestError(res, "Could not load this private case.");
    return res.json();
  },

  async generateDocument(caseId: string, caseAccessToken: string): Promise<GeneratedDocument> {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}/generate-document`, {
      method: "POST",
      headers: { "X-Case-Token": caseAccessToken }
    });
    if (!res.ok) throw await requestError(res, "Could not generate the document.");
    return res.json();
  },

  async updateTicket(caseId: string, caseAccessToken: string, ticketRef: string) {
    const res = await fetch(`${API_BASE_URL}/cases/${caseId}/ticket?ticket_ref=${encodeURIComponent(ticketRef)}`, {
      method: "PATCH",
      headers: { "X-Case-Token": caseAccessToken }
    });
    if (!res.ok) throw await requestError(res, "Could not save the ticket reference.");
    return res.json();
  },

  async getEmergencyCodes(): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE_URL}/knowledge/emergency-codes`);
    if (!res.ok) throw new Error("Failed to load emergency bank codes");
    return res.json();
  },

  async getSources(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/knowledge/sources`);
    if (!res.ok) throw new Error("Failed to load verified sources");
    return res.json();
  }
};
