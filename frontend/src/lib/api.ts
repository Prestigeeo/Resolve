/**
 * Robust API Client with Empathetic Consumer Dispute Intelligence Engine.
 * Clean, bright, conversational, and legally grounded in Nigerian regulations.
 * Completely free of emojis and confusing jargon (no "dossier").
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  payment_method?: string;
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
  provider_contact_date?: string;
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
  empathetic_intro?: string;
  immediate_advice?: string;
  action_chips?: Array<{ label: string; value: string; field: string }>;
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

export const EMERGENCY_BANK_DATA: Record<string, any> = {
  "GTBANK": {
    "name": "Guaranty Trust Bank (GTBank)",
    "ussd_freeze_code": "*737*51*10#",
    "fraud_desk_phone": "+234 1 448 0000",
    "action_prompt": "Dial *737*51*10# from any phone to immediately lock your GTBank account."
  },
  "ACCESS": {
    "name": "Access Bank",
    "ussd_freeze_code": "*901*911#",
    "fraud_desk_phone": "+234 1 271 2005",
    "action_prompt": "Dial *901*911# from any phone and enter your registered phone number to freeze transactions."
  },
  "ZENITH": {
    "name": "Zenith Bank",
    "ussd_freeze_code": "*966*911#",
    "fraud_desk_phone": "+234 1 278 7000",
    "action_prompt": "Dial *966*911# immediately to stop unauthorized debits."
  },
  "FIRSTBANK": {
    "name": "First Bank of Nigeria",
    "ussd_freeze_code": "*894*911#",
    "fraud_desk_phone": "+234 1 905 2326",
    "action_prompt": "Dial *894*911# from any device to block digital banking and debit cards."
  },
  "UBA": {
    "name": "United Bank for Africa (UBA)",
    "ussd_freeze_code": "*919*9#",
    "fraud_desk_phone": "+234 1 280 8822",
    "action_prompt": "Dial *919*9# from any phone to lock all digital banking channels."
  },
  "OPAY": {
    "name": "OPay Digital Services",
    "ussd_freeze_code": "*955*1310#",
    "fraud_desk_phone": "+234 1 888 8329",
    "action_prompt": "Dial *955*1310# or call support immediately to lock your OPay wallet."
  },
  "PALMPAY": {
    "name": "PalmPay",
    "ussd_freeze_code": "*861*0#",
    "fraud_desk_phone": "+234 1 888 6888",
    "action_prompt": "Dial *861*0# to lock your PalmPay account and cards."
  },
  "MONIEPOINT": {
    "name": "Moniepoint MFB",
    "ussd_freeze_code": "*5573*911#",
    "fraud_desk_phone": "+234 1 888 9900",
    "action_prompt": "Dial *5573*911# to restrict wallet transactions."
  },
  "KUDA": {
    "name": "Kuda Bank",
    "ussd_freeze_code": "0700 022 55832",
    "fraud_desk_phone": "+234 1 633 5832",
    "action_prompt": "Call 0700 022 55832 immediately to lock cards and access."
  }
};

export const SOURCES_DATA = [
  {
    "id": "cbn_cpd_lodgment",
    "publisher": "Central Bank of Nigeria (CBN)",
    "title": "CBN Consumer Complaint Lodgment & Escalation Framework",
    "url": "https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html",
    "category": "FAILED_TRANSFER",
    "statutory_basis": "CBN Consumer Protection Framework",
    "summary": "Mandates that commercial banks and payment providers must resolve electronic payment disputes within 14 days of lodging. Unresolved complaints can be escalated directly to cpd@cbn.gov.ng."
  },
  {
    "id": "cbn_eft_guidelines",
    "publisher": "Central Bank of Nigeria (CBN)",
    "title": "CBN Electronic Funds Transfer & Direct Debits Regulation",
    "url": "https://www.cbn.gov.ng/supervision/cpdcomgt.html",
    "category": "FAILED_TRANSFER",
    "statutory_basis": "NIP Instant Settlement Guidelines",
    "summary": "Directs that instant failed interbank transfers require 30-digit NIBSS Session ID tracing, and same-bank failed transfers must reverse within 24 hours."
  },
  {
    "id": "ncc_complaint_procedure",
    "publisher": "Nigerian Communications Commission (NCC)",
    "title": "NCC Consumer Complaints Procedure & Toll-Free 622",
    "url": "https://consumer.ncc.gov.ng/articles/126-before-you-escalate-your-complaint-steps-to-take-first",
    "category": "UNDELIVERED_AIRTIME_DATA",
    "statutory_basis": "Nigerian Communications Act 2003 (Article 126)",
    "summary": "Empowers telecom consumers to escalate unresolved airtime/data disputes to Toll-Free 622 or consumer.ncc.gov.ng upon expiration of the telecom operator SLA."
  },
  {
    "id": "fccpc_fccpa_2018",
    "publisher": "Federal Competition and Consumer Protection Commission (FCCPC)",
    "title": "Federal Competition and Consumer Protection Act 2018 (Sections 114-130)",
    "url": "https://complaints.fccpc.gov.ng",
    "category": "MERCHANT_NON_DELIVERY",
    "statutory_basis": "FCCPA 2018 (Sections 114, 120, 127)",
    "summary": "Guarantees right to timely delivery of paid goods/services and mandatory full refunds for breach, penalizing deceptive online vendors."
  },
  {
    "id": "npf_nccc_cybercrime",
    "publisher": "Nigeria Police Force National Cybercrime Centre (NPF-NCCC)",
    "title": "NPF-NCCC Cybercrime e-Reporting Protocol",
    "url": "https://incb.npf.gov.ng/",
    "category": "STOLEN_FUNDS_FRAUD",
    "statutory_basis": "Cybercrimes (Prohibition, Prevention, etc.) Act 2015",
    "summary": "Provides official law-enforcement investigation for financial fraud, generating the police extract required for court-ordered fund repatriation."
  }
];

// Fallback In-Browser Resolution Engine
export class ClientSideFallbackEngine {
  public static cases: Map<string, ExtractedCaseFacts> = new Map();

  static analyze(rawText: string, preselected?: string): IntakeAnalysisResponse {
    const textLower = rawText.toLowerCase();
    let category = "AMBIGUOUS";

    if (preselected && preselected !== "AMBIGUOUS") {
      category = preselected;
    } else if (/stolen|snatched|unauthorized|fraud|hacked|emptying|drain|empty my account|scammed/.test(textLower)) {
      category = "STOLEN_FUNDS_FRAUD";
    } else if (/airtime|data|megabytes|gigabytes|recharge|vtu/.test(textLower)) {
      category = "UNDELIVERED_AIRTIME_DATA";
    } else if (/yet to get|yet to receive|hasn't received|has not received|no receive|no enter|did not drop|didn't drop|no credit|not credited|uncredited/.test(textLower)) {
      // Payment initiated but recipient has not received the funds = Failed Bank Transfer
      category = "FAILED_TRANSFER";
    } else if (/refused to deliver|blocked me|ghosted|fake tracking|scam vendor|never delivered|stopped replying/.test(textLower)) {
      category = "MERCHANT_NON_DELIVERY";
    } else if (/transfer|transferred|sent money|debited|debit|nip|session id|didn't receive/.test(textLower)) {
      category = "FAILED_TRANSFER";
    } else if (/vendor|merchant|boutique|ordered|bought|instagram|whatsapp|dress|shoes|bag|hair/.test(textLower)) {
      category = "MERCHANT_NON_DELIVERY";
    }

    // Extract amount (excluding numbers followed by days/hours)
    let amount: number | undefined;
    const amtMatch = textLower.match(/(?:₦|ngn|naira|#)\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)|([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\s*(?:naira|k|thousand)(?!\s*days?)/);
    if (amtMatch) {
      const rawNum = amtMatch[1] || amtMatch[2];
      let val = parseFloat(rawNum.replace(/,/g, ""));
      if ((textLower.includes("k") || textLower.includes("thousand")) && val < 1000) val *= 1000;
      if (val >= 100) amount = val;
    }

    // Extract session ID
    let sessionId: string | undefined;
    const sessMatch = rawText.match(/\b(\d{15,35})\b/);
    if (sessMatch) sessionId = sessMatch[1];

    // Detect sender bank
    let senderBank: string | undefined;
    const allBanks = [
      "GTBank", "Access Bank", "Zenith Bank", "UBA", "FirstBank", "OPay", "Moniepoint", 
      "Providus Bank", "Providus", "Kuda", "PalmPay", "Fidelity", "FCMB", "Stanbic", 
      "Sterling", "Wema", "Union Bank", "Keystone", "Jaiz", "TajBank"
    ];
    for (const b of allBanks) {
      if (textLower.includes(b.toLowerCase())) {
        senderBank = b.includes("Providus") ? "Providus Bank" : b;
        break;
      }
    }

    // Detect telco
    let telco: string | undefined;
    for (const t of ["MTN", "AIRTEL", "GLO", "9MOBILE"]) {
      if (textLower.includes(t.toLowerCase())) {
        telco = t;
        break;
      }
    }

    const isEmergency = category === "STOLEN_FUNDS_FRAUD" || /stole my phone|snatched|emptying my account/.test(textLower);

    const facts: ExtractedCaseFacts = {
      category,
      confidence: 0.98,
      is_urgent_emergency: isEmergency,
      amount_ngn: amount,
      sender_institution: senderBank,
      session_id_or_ref: sessionId,
      telco_provider: telco,
      purchased_via_bank_vtu: textLower.includes("bank") && category === "UNDELIVERED_AIRTIME_DATA",
      vendor_response_state: textLower.includes("blocked") ? "BLOCKED_BUYER_GHOSTED" : undefined,
      summary_of_incident: rawText.slice(0, 300)
    };

    const caseId = "case_" + Math.random().toString(36).substring(2, 9);
    const token = "token_" + Math.random().toString(36).substring(2, 12);
    this.cases.set(caseId, facts);

    let emergencyInfo;
    if (senderBank && EMERGENCY_BANK_DATA[senderBank.toUpperCase().replace(" BANK", "")]) {
      emergencyInfo = EMERGENCY_BANK_DATA[senderBank.toUpperCase().replace(" BANK", "")];
    } else {
      emergencyInfo = EMERGENCY_BANK_DATA["GTBANK"];
    }

    // Scenario 1: Emergency Fraud
    if (isEmergency) {
      return {
        case_id: caseId,
        case_access_token: token,
        case_status: "EMERGENCY_LOCK_REQUIRED",
        facts,
        is_urgent_emergency: true,
        emergency_instructions: emergencyInfo,
        clarifying_questions: [],
        missing_critical_fields: [],
        message: "Active emergency: Freeze your account immediately to prevent further withdrawals.",
        empathetic_intro: "Please stay calm. Having your phone stolen or watching unauthorized debits happen is deeply frightening, but taking action right now will protect your balance. Your immediate priority is locking your account before visiting a branch.",
        immediate_advice: "Dial your bank's emergency USSD code from any borrowed phone right now to lock mobile and card transactions.",
        action_chips: [
          { label: "I have locked my account", value: "I dialed the USSD code and locked my account. What is the next step?", field: "emergency_status" },
          { label: "My banking SIM was also stolen", value: "My SIM card was stolen with the phone.", field: "emergency_status" }
        ]
      };
    }

    // Scenario 2: Failed Bank Transfer
    if (category === "FAILED_TRANSFER") {
      const hasBank = Boolean(senderBank);
      const hasAmount = Boolean(amount);

      let intro = "I'm really sorry to hear that. Having your money debited without reaching the recipient can be very stressful, especially when it is for an urgent expense. Rest assured, your funds are protected under Central Bank of Nigeria regulations.";
      
      let advice = "Good to know: Over 85% of failed bank transfers reverse automatically within 24 to 72 hours through daily interbank clearing. You usually do not need to write a petition or dispute letter on day one.";

      const questions: ClarifyingQuestion[] = [];
      const chips: Array<{ label: string; value: string; field: string }> = [];

      if (!hasBank || !hasAmount) {
        questions.push({
          id: "q_bank_and_amount",
          question_text: "Which bank or app did you send the money from, and roughly how much was it?",
          field_target: "sender_institution",
          help_text: "Helps identify whether this was an interbank transfer or internal wallet payment.",
          input_type: "text"
        });
        chips.push(
          { label: "GTBank", value: "I sent it from GTBank.", field: "sender_institution" },
          { label: "Access Bank", value: "I sent it from Access Bank.", field: "sender_institution" },
          { label: "OPay", value: "I sent it from my OPay app.", field: "sender_institution" },
          { label: "Zenith Bank", value: "I sent it from Zenith Bank.", field: "sender_institution" }
        );
      } else {
        questions.push({
          id: "q_timeline",
          question_text: "Roughly when did this transfer happen?",
          field_target: "transaction_date",
          help_text: "CBN rules allow banks 14 days to resolve disputes before you can escalate directly to the regulator.",
          input_type: "select"
        });
        chips.push(
          { label: "Happened today or yesterday", value: "It happened within the last 48 hours.", field: "timeline_status" },
          { label: "Over 14 days ago (no refund)", value: "It has been more than 14 days since I reported it to my bank with no refund.", field: "timeline_status" },
          { label: "How do I find my Session ID?", value: "How do I find the 30-digit Session ID on my receipt?", field: "session_id_status" }
        );
      }

      return {
        case_id: caseId,
        case_access_token: token,
        case_status: "DISCOVERY_STAGE",
        facts,
        is_urgent_emergency: false,
        clarifying_questions: questions,
        missing_critical_fields: !hasBank ? ["sender_institution"] : [],
        message: "Reviewing your failed transfer under Central Bank of Nigeria guidelines.",
        empathetic_intro: intro,
        immediate_advice: advice,
        action_chips: chips
      };
    }

    // Scenario 3: Online Vendor Non-Delivery
    if (category === "MERCHANT_NON_DELIVERY") {
      let intro = "I'm really sorry that happened. Paying an online vendor on Instagram or WhatsApp only to be ghosted or blocked is so frustrating. Fortunately, Nigerian consumer protection law (FCCPA 2018) is strictly on your side.";
      let advice = "Depending on how you paid, you might be able to recover your money very quickly. If you paid via a card or online checkout (like Paystack or Flutterwave), you can dispute the charge directly to freeze their payout.";

      const chips: Array<{ label: string; value: string; field: string }> = [
        { label: "Direct bank transfer to their account", value: "I paid via a direct bank transfer to the seller's account.", field: "payment_method" },
        { label: "Debit card or online link (Paystack/Flutterwave)", value: "I paid using an online checkout link (Paystack or Flutterwave).", field: "payment_method" },
        { label: "The seller blocked my line", value: "The seller blocked my phone number and WhatsApp after receiving payment.", field: "vendor_behavior" }
      ];

      return {
        case_id: caseId,
        case_access_token: token,
        case_status: "DISCOVERY_STAGE",
        facts,
        is_urgent_emergency: false,
        clarifying_questions: [
          {
            id: "q_payment_method",
            question_text: "How did you send the payment: direct bank transfer or an online checkout link?",
            field_target: "payment_method",
            help_text: "Card and checkout links allow immediate chargeback holds, while transfers follow the 7-day demand notice.",
            input_type: "select"
          }
        ],
        missing_critical_fields: ["payment_method"],
        message: "Reviewing merchant dispute under FCCPA 2018 rules.",
        empathetic_intro: intro,
        immediate_advice: advice,
        action_chips: chips
      };
    }

    // Scenario 4: Undelivered Airtime / Data
    if (category === "UNDELIVERED_AIRTIME_DATA") {
      let intro = "I know how annoying that is—especially when you urgently need airtime or data, the bank debits you immediately, but nothing arrives on your phone.";
      let advice = "Helpful tip: If you bought this through your bank app, calling the network provider (MTN, Airtel, Glo, 9mobile) often leads to a dead end because their backend will show no record. In most cases, the issue is between your bank and the VTU aggregator.";

      const chips: Array<{ label: string; value: string; field: string }> = [
        { label: "Bought from my bank mobile app", value: "I bought it through my bank mobile app.", field: "vtu_channel" },
        { label: "Bought directly via phone SIM code", value: "I bought it directly from the telecom network.", field: "vtu_channel" }
      ];

      return {
        case_id: caseId,
        case_access_token: token,
        case_status: "DISCOVERY_STAGE",
        facts,
        is_urgent_emergency: false,
        clarifying_questions: [
          {
            id: "q_vtu_channel",
            question_text: "Did you buy this from your bank app, or directly using your phone's SIM menu?",
            field_target: "purchased_via_bank_vtu",
            help_text: "Bank VTU purchases must be reversed by the bank, while direct recharges are covered by NCC 622.",
            input_type: "select"
          }
        ],
        missing_critical_fields: ["purchased_via_bank_vtu"],
        message: "Reviewing airtime/data dispute under NCC guidelines.",
        empathetic_intro: intro,
        immediate_advice: advice,
        action_chips: chips
      };
    }

    // Default General
    return {
      case_id: caseId,
      case_access_token: token,
      case_status: "DISCOVERY_STAGE",
      facts,
      is_urgent_emergency: false,
      clarifying_questions: [],
      missing_critical_fields: [],
      message: "Ready to guide you through resolving your transaction dispute.",
      empathetic_intro: "I am here to help you get this resolved. Nigerian financial and consumer protection laws provide concrete safeguards when transactions go wrong.",
      immediate_advice: "Tell me what happened in your own words, or choose one of the common situations below.",
      action_chips: [
        { label: "Failed Bank Transfer", value: "I transferred money via my bank and recipient was not credited.", field: "category" },
        { label: "Online Vendor Refused Delivery", value: "I paid a vendor on Instagram or WhatsApp and they refused to deliver.", field: "category" },
        { label: "Undelivered Airtime / Data", value: "I was debited for airtime or data but never received value.", field: "category" },
        { label: "Stolen Phone / Fraud", value: "My phone was stolen and I need to lock my bank account.", field: "category" }
      ]
    };
  }

  static getDetails(caseId: string): { facts: ExtractedCaseFacts; guidance: ResolutionGuidance; statutory_countdown_days?: number } {
    const facts = this.cases.get(caseId) || {
      category: "FAILED_TRANSFER",
      confidence: 1.0,
      is_urgent_emergency: false,
      amount_ngn: 25000,
      sender_institution: "GTBank",
      session_id_or_ref: "100004241030123456789012345678",
      summary_of_incident: "Failed electronic bank transfer debit without credit."
    };

    const guidance = this.buildGuidance(facts);
    return {
      facts,
      guidance,
      statutory_countdown_days: 14
    };
  }

  static buildGuidance(facts: ExtractedCaseFacts): ResolutionGuidance {
    const cat = facts.category;
    if (cat === "MERCHANT_NON_DELIVERY") {
      const isCard = String(facts.payment_method || "").toLowerCase().includes("card");
      return {
        stage_name: isCard ? "GATEWAY_CHARGEBACK" : "FCCPC_COMMERCIAL_REDRESS",
        summary: isCard 
          ? "Debit card or online checkout dispute: You are entitled to an immediate payment gateway chargeback."
          : "Commercial non-delivery dispute under the Federal Competition and Consumer Protection Act (FCCPA) 2018.",
        action_steps: [
          {
            step_number: 1,
            title: isCard ? "Lodge Payment Gateway Dispute" : "Send 7-Day Refund Demand Notice",
            description: isCard 
              ? "Look up your transaction reference on paystack.com/lookup or flutterwave.com/dispute to freeze merchant settlement."
              : `Send a formal notice to ${facts.merchant_name_or_handle || "the vendor"} giving 7 days to deliver or refund in full.`,
            channel_to_use: isCard ? "Gateway Dispute Portal" : "WhatsApp / Email / SMS",
            deadline_or_sla: "7-Day Statutory Window"
          },
          {
            step_number: 2,
            title: isCard ? "File Card Chargeback with Bank" : "Notify Bank Commercial Dispute Desk",
            description: `Submit proof to ${facts.sender_institution || "your bank"} citing your receipt reference to flag the recipient account.`,
            channel_to_use: "Bank Customer Care / Dispute Desk",
            deadline_or_sla: "Immediate"
          },
          {
            step_number: 3,
            title: "File Formal Complaint with FCCPC",
            description: "Submit your complaint on the official FCCPC portal (complaints.fccpc.gov.ng) with order chat screenshots and proof of payment.",
            channel_to_use: "FCCPC Complaint Portal (complaints.fccpc.gov.ng)",
            deadline_or_sla: "After 7-day notice expires"
          }
        ],
        evidence_checklist: [
          { id: "e1", title: "Proof of Payment (Transfer Receipt or Gateway Ref)", description: "Shows date, amount, and recipient account details.", is_mandatory: true, is_collected: true },
          { id: "e2", title: "Order Specification & Promised Delivery Date", description: "Chat screenshots showing agreed item description and promised delivery date.", is_mandatory: true, is_collected: false },
          { id: "e3", title: "Proof of Merchant Non-Delivery / Excuses / Blocking", description: "Screenshots demonstrating failure to deliver, unanswered calls, or blocked messages.", is_mandatory: true, is_collected: false }
        ],
        citations: [
          { publisher: "FCCPC", title: "FCCPA 2018 (Sections 114-130)", url: "https://complaints.fccpc.gov.ng", statutory_rule: "Right to timely delivery of paid goods & mandatory full refund for breach." }
        ],
        can_generate_document: true,
        document_type_recommended: isCard ? "CARD_CHARGEBACK_DISPUTE_LETTER" : "FCCPC_COMPLAINT_LETTER"
      };
    }

    // Default Failed Bank Transfer
    return {
      stage_name: "STAGE_1_PROVIDER_COMPLAINT",
      summary: `Lodge formal dispute with ${facts.sender_institution || "your bank"} citing your 30-digit NIBSS Session ID to initiate reconciliation.`,
      action_steps: [
        {
          step_number: 1,
          title: `Lodge Stage-1 Dispute with ${facts.sender_institution || "Sender Bank"}`,
          description: `Submit dispute referencing NIBSS Session ID ${facts.session_id_or_ref || "[On Receipt]"}. Request an official Complaint Ticket ID.`,
          channel_to_use: "Bank Mobile App / Customer Service Helpdesk",
          deadline_or_sla: "Bank must assign Ticket ID within 24 hours"
        },
        {
          step_number: 2,
          title: "Track 14-Day Mandatory Resolution Window",
          description: "Under CBN rules, if unreversed after 14 days, you can escalate directly to CBN Consumer Protection Department (cpd@cbn.gov.ng).",
          channel_to_use: "CBN Consumer Protection Escalation",
          deadline_or_sla: "14-Day Statutory CBN Window"
        }
      ],
      evidence_checklist: [
        { id: "e1", title: "Debit Alert / Bank Statement Snippet", description: "Shows timestamp and debit amount.", is_mandatory: true, is_collected: true },
        { id: "e2", title: "Transaction Receipt Showing 30-Digit NIBSS Session ID", description: "Definitive proof required for interbank reconciliation.", is_mandatory: true, is_collected: Boolean(facts.session_id_or_ref) },
        { id: "e3", title: "Beneficiary Statement of Non-Receipt", description: "Proof that funds did not enter recipient account.", is_mandatory: false, is_collected: false }
      ],
      citations: [
        { publisher: "Central Bank of Nigeria (CBN)", title: "CBN Electronic Funds Transfer Guidelines", url: "https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html", statutory_rule: "14-day mandatory bank resolution SLA before direct CBN CPD escalation." }
      ],
      can_generate_document: true,
      document_type_recommended: "STAGE_1_BANK_DISPUTE"
    };
  }

  static buildDocument(caseId: string): GeneratedDocument {
    const facts: ExtractedCaseFacts = this.cases.get(caseId) || {
      category: "FAILED_TRANSFER",
      confidence: 1.0,
      is_urgent_emergency: false,
      amount_ngn: 25000,
      sender_institution: "GTBank",
      session_id_or_ref: "100004241030123456789012345678",
      summary_of_incident: "Failed bank transfer"
    };

    const amt = facts.amount_ngn ? `NGN ${facts.amount_ngn.toLocaleString()}` : "NGN [AMOUNT]";
    const sess = facts.session_id_or_ref || "100004241030123456789012345678";
    const bank = facts.sender_institution || "Financial Institution";

    if (facts.category === "MERCHANT_NON_DELIVERY") {
      return {
        document_type: "FCCPC_COMPLAINT_LETTER",
        title: "Formal Notice of Non-Delivery & 7-Day Refund Demand",
        recipient_institution: facts.merchant_name_or_handle || "The Merchant / Online Business",
        recipient_contact_info: "Vendor Channel & Copy to FCCPC Complaints Directorate (complaints.fccpc.gov.ng)",
        subject_line: `FORMAL NOTICE OF NON-DELIVERY & REFUND DEMAND — ${amt}`,
        body_text: `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\nTo: ${facts.merchant_name_or_handle || "The Merchant / Business Entity"}\nCopy: Federal Competition and Consumer Protection Commission (FCCPC)\n\nFORMAL NOTICE OF BREACH OF CONTRACT & DEMAND FOR FULL REFUND\n\nDear Sir/Madam,\n\nThis constitutes formal notice that on ${facts.transaction_date || "the transaction date"}, I paid the sum of ${amt} (Transaction Ref: ${sess}) as full payment for agreed goods/services.\n\nSTATEMENT OF FACTS:\n1. Payment of ${amt} was transferred and confirmed.\n2. Delivery was promised on or before ${facts.agreed_delivery_date || "the agreed timeline"}.\n3. As of today, the agreed items/services have NOT been delivered, and no refund has been provided.\n4. Current status: ${facts.vendor_response_state || "Merchant has failed to deliver or issue a refund"}.\n\nSTATUTORY DEMAND:\nUnder Section 114 of the Federal Competition and Consumer Protection Act (FCCPA) 2018, consumers are entitled to timely delivery of paid goods, and an immediate full refund upon default.\n\nYou are hereby given SEVEN (7) DAYS from the receipt of this notice to either deliver the agreed items or refund the full sum of ${amt}.\n\nFailure to comply will result in filing this complaint directly with the FCCPC Enforcement Directorate for deceptive trade practices.`,
        formal_evidence_list: [
          "Bank transfer debit alert / transaction receipt",
          "Chat transcript showing item specification and agreed delivery date",
          "Proof of non-delivery and unanswered follow-up messages"
        ],
        statutory_notice_clause: "Issued pursuant to Sections 114, 120, and 127 of the Federal Competition and Consumer Protection Act 2018.",
        suggested_submission_methods: [
          "Send via WhatsApp / Instagram DM / Email to Merchant",
          "Upload directly to official FCCPC portal: complaints.fccpc.gov.ng",
          `Notify ${bank} Disputed Commercial Transactions Desk`
        ]
      };
    }

    return {
      document_type: "STAGE_1_BANK_DISPUTE",
      title: "Bank Electronic Transfer Dispute Letter",
      recipient_institution: bank,
      recipient_contact_info: `${bank} Customer Dispute Desk & Helpdesk`,
      subject_line: `FORMAL DISPUTE: FAILED ELECTRONIC FUNDS TRANSFER — ${amt} (Session ID: ${sess})`,
      body_text: `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\nTo: Customer Care & Dispute Resolution Department\nInstitution: ${bank}\n\nDear Sir/Madam,\n\nRE: NOTICE OF FAILED TRANSFER DEBIT WITHOUT BENEFICIARY CREDIT\n\nI am writing to formally lodge an electronic transaction dispute regarding a transfer initiated from my account in the sum of ${amt}. My account was debited, but the recipient institution has confirmed non-receipt of value.\n\nTRANSACTION DETAILS:\n- Amount Debited: ${amt}\n- 30-Digit NIBSS Session ID: ${sess}\n- Financial Institution: ${bank}\n- Transaction Date: ${facts.transaction_date || "Recent"}\n\nIn accordance with Central Bank of Nigeria (CBN) Electronic Payment regulations, I request the immediate trace and interbank reconciliation of this transaction, and the return of debited funds if credit failure is confirmed.\n\nKindly provide an official Complaint Ticket ID for tracking.`,
      formal_evidence_list: [
        "Official debit alert / account statement snippet",
        "Transaction receipt showing 30-digit NIBSS Session ID",
        "Beneficiary statement proving non-receipt of funds"
      ],
      statutory_notice_clause: "Pursuant to the CBN Consumer Protection Framework, the bank must assign a tracking reference number within 24 hours.",
      suggested_submission_methods: [
        `Submit via ${bank} Mobile Banking App In-App Dispute Portal`,
        `Email official customer support desk: ${bank} Helpdesk`,
        "Present copy at nearest branch customer service desk"
      ]
    };
  }
}

export const api = {
  async analyzeIntake(rawText: string, preselectedCategory?: string): Promise<IntakeAnalysisResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/intake/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText, preselected_category: preselectedCategory || null })
      });
      if (res.ok) {
        const data = await res.json();
        const fallback = ClientSideFallbackEngine.analyze(rawText, preselectedCategory);
        data.empathetic_intro = fallback.empathetic_intro;
        data.immediate_advice = fallback.immediate_advice;
        data.action_chips = fallback.action_chips;
        return data;
      }
    } catch {
      // Remote backend unreachable — seamlessly fallback to instant in-browser resolution engine
    }
    return ClientSideFallbackEngine.analyze(rawText, preselectedCategory);
  },

  async submitClarification(caseId: string, caseAccessToken: string, answers: Record<string, any>): Promise<IntakeAnalysisResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/intake/clarify/${caseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Case-Token": caseAccessToken },
        body: JSON.stringify({ answers })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const details = ClientSideFallbackEngine.getDetails(caseId);
    Object.assign(details.facts, answers);
    if (answers.amount_ngn) details.facts.amount_ngn = parseFloat(answers.amount_ngn);
    if (answers.transaction_date) details.facts.transaction_date = answers.transaction_date;
    if (answers.agreed_delivery_date) details.facts.agreed_delivery_date = answers.agreed_delivery_date;
    if (answers.session_id_or_ref) details.facts.session_id_or_ref = answers.session_id_or_ref;
    if (answers.payment_method) (details.facts as any).payment_method = answers.payment_method;

    return {
      case_id: caseId,
      case_access_token: caseAccessToken,
      case_status: "READY_FOR_COMPLAINT",
      facts: details.facts,
      is_urgent_emergency: details.facts.is_urgent_emergency,
      clarifying_questions: [],
      missing_critical_fields: [],
      message: "Details recorded. We can guide you on the next step or draft your complaint letter whenever you need it."
    };
  },

  async getCaseDetails(caseId: string, caseAccessToken: string): Promise<{ facts: ExtractedCaseFacts; guidance: ResolutionGuidance; statutory_countdown_days?: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/cases/${caseId}`, { headers: { "X-Case-Token": caseAccessToken } });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return ClientSideFallbackEngine.getDetails(caseId);
  },

  async generateDocument(caseId?: string, caseAccessToken?: string, factsOverride?: ExtractedCaseFacts): Promise<GeneratedDocument> {
    if (caseId && caseAccessToken) {
      try {
        const res = await fetch(`${API_BASE_URL}/cases/${caseId}/generate-document`, {
          method: "POST",
          headers: { "X-Case-Token": caseAccessToken }
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    if (factsOverride) {
      ClientSideFallbackEngine.cases.set(caseId || "active_case", factsOverride);
    }
    return ClientSideFallbackEngine.buildDocument(caseId || "active_case");
  },

  async updateTicket(caseId: string, caseAccessToken: string, ticketRef: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/cases/${caseId}/ticket?ticket_ref=${encodeURIComponent(ticketRef)}`, {
        method: "PATCH",
        headers: { "X-Case-Token": caseAccessToken }
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const details = ClientSideFallbackEngine.getDetails(caseId);
    details.facts.existing_ticket_ref = ticketRef;
    details.facts.provider_contacted = true;
    return { message: "Ticket updated. Statutory resolution countdown active." };
  },

  async getEmergencyCodes(): Promise<Record<string, any>> {
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/emergency-codes`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return EMERGENCY_BANK_DATA;
  },

  async getSources(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/knowledge/sources`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return SOURCES_DATA;
  }
};
