# RESOLVE — System Architecture & Technical Specification

**Project:** Resolve — AI-Powered Consumer Complaint & Redress Assistant  
**Version:** 0.2  
**Scope:** 4 Core Nigerian Consumer Categories (Failed Transfers, Undelivered Airtime/Data, Stolen Funds/Fraud, Merchant Non-Delivery)  
**Regulators Covered:** Central Bank of Nigeria (CBN), Nigerian Communications Commission (NCC), Federal Competition and Consumer Protection Commission (FCCPC)  

---

## 1. Architectural Philosophy: Hybrid Decision Support

Resolve rejects the shallow "chatbot" pattern where an unconstrained LLM generates arbitrary letters. Instead, Resolve uses a **hybrid architecture**:
1. **Probabilistic AI (LLMs):** Natural language understanding, conversational intake (handling Nigerian English & Pidgin), extracting unstructured narratives into strict schemas, and drafting grounded documents.
2. **Deterministic Rules & State Machines (Python):** Regulatory SLA timelines, emergency fraud kill-switches, missing-evidence gates, and statutory escalation routing. The LLM is never permitted to invent deadlines or override legal rules.
3. **Verified Knowledge Retrieval (RAG):** Citation-backed official guidance from CBN, NCC, FCCPC, and payment gateway rules.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User (Mobile-First Web)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Layer 1: Security & PII Redaction Guardrail                │
│  - Blocks PIN (4 digits), OTP (6 digits), BVN (11 digits), Card PAN   │
│  - Urgent Fraud Triage (USSD Emergency Kill-Switches: *737*, *901*...) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│        Layer 2: AI Issue Classifier & Structured Fact Extractor        │
│  - Pydantic Schema Enforcement (Gemini / OpenAI structured outputs)    │
│  - Categories: FAILED_TRANSFER, AIRTIME_DATA, STOLEN_FUNDS,            │
│                MERCHANT_NON_DELIVERY, AMBIGUOUS, OUT_OF_SCOPE          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Layer 3: Evidence & Completeness Gatekeeper               │
│  - Evaluates if critical evidence is present (Session ID, receipts,   │
│    agreed delivery dates, proof of blocking, payment rails)            │
│  - If incomplete: Returns 2-3 prioritized follow-up questions          │
│    (STOPS here before any letter is generated)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Only when evidence is complete)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Layer 4: Deterministic Regulatory Rules Engine             │
│  - Maps verified case state to CBN / NCC / FCCPC / Gateway matrix      │
│  - Distinguishes Bank VTU vs. Telco, Card Chargeback vs. NIP Recall    │
│  - Selects Action Stage (Stage-1 Provider vs. Stage-2 Regulator)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Layer 5: Verified Knowledge Retrieval (RAG)                │
│  - Matches exact official source chunks from CBN, NCC, FCCPC & NIBSS  │
│  - Attaches verifiable source URLs and statutory citations             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            Layer 6: Grounded Drafter & Fact-Checking Verifier          │
│  - Generates objective, non-defamatory complaint or dispute dossier    │
│  - Verifier guarantees 0 ungrounded facts (dates, amounts, refs check) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Layer 7: Case Management & Tracking API                 │
│  - Ticket storage, follow-up reminders, SLA countdowns, PDF export     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core System Components

### 2.1 Layer 1: PII Guardrail & Emergency Fraud Triage
- **Location:** `backend/app/security/guardrails.py` & `backend/app/security/emergency_directory.py`
- **Functionality:**
  - Scans raw user input using regex and pattern detectors before reaching any database or LLM API.
  - Strips/masks sensitive credentials:
    - 4-digit ATM PINs (`\b\d{4}\b` in sensitive contexts)
    - 6-digit OTPs (`\b\d{6}\b`)
    - 11-digit BVN / NIN numbers (`\b\d{11}\b`)
    - 16-digit Card PANs (`\b(?:\d{4}[ -]?){3}\d{4}\b`)
  - Preserves legitimate reference identifiers: 10-digit NUBAN account numbers (masked in public logs), 30-digit NIBSS Session IDs, transaction references, and phone numbers.
  - **Emergency USSD Kill-Switch Triage:** If unauthorized/stolen funds are detected, the system immediately returns an emergency payload with direct USSD lock codes for Nigerian banks (e.g., GTBank `*737*51*10#`, Access `*901*911#`, Zenith `*966*911#`, FirstBank `*894*911#`, UBA `*919*9#`) and 24/7 fraud desk numbers.

### 2.2 Layer 2: Pydantic Structured Schemas & Extraction
- **Location:** `backend/app/schemas/case.py` & `backend/app/ai/classifier.py`
- **Functionality:**
  - Uses Pydantic V2 models to guarantee typed, validated outputs from the LLM.
  - Supports Nigerian English, Pidgin expressions (e.g., *"they debit me but money no enter"*, *"vendor don block me for WhatsApp"*, *"I buy card since morning e never drop"*).
  - Schema structure:
    ```python
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
    ```

### 2.3 Layer 3: Evidence & Completeness Gatekeeper
- **Location:** `backend/app/engine/completeness.py`
- **Functionality:**
  - Evaluates whether the user's case has the minimum required evidence before allowing document drafting.
  - If required facts are missing, returns `status="NEEDS_CLARIFICATION"` and generates **at most 2–3 prioritized, targeted questions**:
    - *Failed Transfer:* Checks for 30-digit NIBSS Session ID, sender bank, recipient bank, amount, date.
    - *Airtime/Data:* Checks for purchase channel (Bank VTU vs. Telco), telco network, phone number, amount, date.
    - *Stolen Funds:* Checks for incident timestamp (<24h critical), recipient account info, account lock status.
    - *Merchant Non-Delivery:* Checks for payment rail (Card vs. Transfer), agreed delivery date, vendor communication status (responsive vs. ghosted/blocked), proof of order.

### 2.4 Layer 4: Deterministic Regulatory Rules Engine
- **Location:** `backend/app/engine/rules.py`
- **Functionality:**
  - Implements a state machine encoding verified Nigerian regulatory frameworks:
    - **CBN Consumer Protection Framework:** Same-bank 24-hr reversal; interbank NIP 3-5 day / 14-day statutory resolution before CBN CPD escalation.
    - **NCC Consumer Complaints Procedure (Article 126):** Mandatory Stage-1 MNO ticket reference before Toll-Free 622 or NCC portal escalation.
    - **FCCPA 2018 (Sections 114–130):** Consumer right to timely delivery and refund; distinction between Card Chargebacks (gateway) and Bank Transfer formal dispute notices.

### 2.5 Layer 5: Citation-Backed Knowledge Base & RAG
- **Location:** `backend/app/knowledge/sources.json` & `backend/app/knowledge/retriever.py`
- **Functionality:**
  - Contains curated, versioned official documents from:
    - CBN Consumer Protection Department
    - NCC Consumer Affairs Bureau
    - FCCPC Consumer Protection Regulations
    - NPF National Cybercrime Centre (NPF-NCCC)
    - Paystack / Flutterwave dispute resolution documentation
  - Every recommendation returned to the user includes:
    - `publisher`: e.g. "Central Bank of Nigeria"
    - `title`: e.g. "CBN Consumer Complaint Lodgment Procedure"
    - `url`: Official URL (e.g. `https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html`)
    - `statutory_basis`: e.g. "CBN Guidelines on Electronic Payments"

### 2.6 Layer 6: Grounded Complaint Drafter & Anti-Hallucination Verifier
- **Location:** `backend/app/ai/drafter.py` & `backend/app/ai/verifier.py`
- **Functionality:**
  - Generates the appropriate document package based on the deterministic rules outcome:
    - *Stage 1 Bank / Telco Dispute Letter*
    - *CBN CPD Escalation Petition*
    - *Urgent Bank Fraud Desk Lien & Recall Request*
    - *NPF-NCCC Statement of Facts*
    - *Formal Notice of Non-Delivery & Demand for Refund (to Merchant)*
    - *FCCPC Consumer Complaint Dossier*
    - *Card Chargeback Dispute Letter*
  - **Deterministic Fact Verifier:** A post-generation verification step that extracts all dates, monetary amounts, reference numbers, and account identifiers from the generated draft and verifies that every single one appears in the validated `ExtractedCaseFacts`. If an unrecognized number is detected, the draft is rejected and regenerated.

### 2.7 Layer 7: Case Management & Tracking API
- **Location:** `backend/app/api/` & `backend/app/models/`
- **Functionality:**
  - RESTful API built with **FastAPI** and **SQLModel / SQLite / PostgreSQL**.
  - Manages the case lifecycle:
    - `DRAFT` → `NEEDS_CLARIFICATION` → `READY_TO_FILE` → `FILED_WITH_PROVIDER` → `ESCALATED_TO_REGULATOR` → `RESOLVED` / `CLOSED`
  - Calculates dynamic countdown timers to statutory escalation eligibility (e.g., "11 days remaining before eligible for CBN CPD escalation").

---

## 3. Technology Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Backend Framework** | Python 3.11+, FastAPI | High performance, native async, automatic OpenAPI documentation, seamless integration with AI libraries. |
| **Data Validation** | Pydantic V2 | Strict type safety, fast schema validation, and structured LLM outputs. |
| **Database & ORM** | SQLModel / SQLAlchemy (SQLite for local dev, PostgreSQL for production) | Type-safe models compatible with Pydantic and async database sessions. |
| **LLM Integration** | Google Gemini (`gemini-2.5-flash`) / OpenAI (`gpt-4o-mini`) via unified client | Cost-effective, high speed, reliable JSON/structured output compliance, Pidgin/Nigerian language understanding. |
| **Deterministic Engine** | Pure Python State Machine | Zero API cost, predictable, testable, and guaranteed compliance with Nigerian regulatory SLAs. |
| **Testing & Evaluation** | `pytest`, custom eval suite (`evals/run_evals.py`) | Quantitative verification of PRD acceptance criteria (≥90% classification, ≥95% completeness, 0 hallucinations). |
| **Frontend** | React / Next.js (Tailwind CSS, Lucide icons) | Mobile-first responsive UI, interactive step-by-step intake wizard, evidence checklist, and PDF export. |
| **Deployment** | Docker & Docker Compose | Single-command reproducible setup across any environment. |

---

## 4. Directory Structure

```text
resolve/
├── docs/
│   ├── PRD.md                        # Product Requirements Document (v0.2)
│   ├── ARCHITECTURE.md               # This system architecture specification
│   ├── PROBLEM_VALIDATION.md         # 12 real Nigerian consumer cases & decision tree
│   └── EVALUATION_REPORT.md          # Evaluation metrics & test results
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app & CORS configuration
│   │   ├── config.py                 # App settings (LLM provider, API keys, DB URL)
│   │   ├── database.py               # SQLModel DB session & engine
│   │   ├── models/
│   │   │   ├── case.py               # Case database model
│   │   │   └── case_event.py         # Case timeline / event log model
│   │   ├── schemas/
│   │   │   ├── intake.py             # User input & clarifying questions schemas
│   │   │   ├── case.py               # Category-specific case facts & extraction schemas
│   │   │   ├── guidance.py           # Resolution path & evidence checklist schemas
│   │   │   └── document.py           # Generated complaint / dossier schemas
│   │   ├── security/
│   │   │   ├── guardrails.py         # PII redactor (PIN/OTP/BVN/Card PAN)
│   │   │   └── emergency_directory.py# Nigerian bank USSD kill-switches & fraud desklines
│   │   ├── engine/
│   │   │   ├── completeness.py       # Evidence gatekeeper & follow-up question generator
│   │   │   ├── rules.py              # Deterministic CBN / NCC / FCCPC state machine
│   │   │   └── checklist.py          # Category-specific evidence checklist builder
│   │   ├── knowledge/
│   │   │   ├── sources.json          # Verified CBN, NCC, FCCPC, NPF-NCCC metadata
│   │   │   ├── corpus/               # Markdown chunks of official guidance
│   │   │   └── retriever.py          # Citation-backed guidance retriever
│   │   ├── ai/
│   │   │   ├── llm_client.py         # Multi-provider client (Gemini, OpenAI, Mock)
│   │   │   ├── classifier.py         # Issue classifier & structured facts extractor
│   │   │   ├── drafter.py            # Grounded complaint & dispute dossier generator
│   │   │   └── verifier.py           # Anti-hallucination fact checking verifier
│   │   └── api/
│   │       ├── router.py             # API router aggregator
│   │       ├── routes_intake.py      # /api/v1/intake (analyze, clarify)
│   │       ├── routes_cases.py       # /api/v1/cases (CRUD, timeline, generate docs)
│   │       └── routes_knowledge.py   # /api/v1/knowledge (sources, emergency directory)
│   ├── evals/
│   │   ├── dataset.json              # 30+ curated Nigerian test cases (Pidgin, fraud, missing info)
│   │   └── run_evals.py              # Automated evaluator scoring PRD metrics
│   ├── tests/
│   │   ├── test_guardrails.py        # PII & emergency triage tests
│   │   ├── test_completeness.py      # Evidence gatekeeper tests
│   │   ├── test_rules.py             # Deterministic regulatory rules tests
│   │   ├── test_verifier.py          # Zero-hallucination verification tests
│   │   └── test_api.py               # FastAPI endpoints integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                         # Mobile-first Next.js web application
│   ├── src/
│   │   ├── app/                      # Next.js App Router (page.tsx, layout.tsx, cases/)
│   │   ├── components/               # UI components (IntakeWizard, EvidenceChecklist, etc.)
│   │   └── lib/                      # API client & formatting utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml                # Unified Docker composition
└── README.md                         # Setup & quickstart guide
```
