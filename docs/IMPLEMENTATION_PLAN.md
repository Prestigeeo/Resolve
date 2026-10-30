# RESOLVE — Implementation Plan & Roadmap

**Project:** Resolve — AI-Powered Consumer Complaint & Redress Assistant  
**Version:** 0.2  
**Target:** Final Project for AI Engineering Bootcamp at Tag Ecosystem  

---

## 1. Overview of Project Documentation

All foundational blueprints are stored in your workspace `docs/` folder:
- [PRD.md](file:///Users/prestige/Downloads/Tag%20Final%20Project/docs/PRD.md): Product Requirements Document covering the 4 Core Categories (**CBN**, **NCC**, **FCCPC**, **NPF-NCCC**).
- [ARCHITECTURE.md](file:///Users/prestige/Downloads/Tag%20Final%20Project/docs/ARCHITECTURE.md): Full technical specification, hybrid pipeline, Pydantic schemas, and regulatory rules engine.
- [PROBLEM_VALIDATION.md](file:///Users/prestige/Downloads/Tag%20Final%20Project/docs/PROBLEM_VALIDATION.md): Empirical evidence from 12+ real Nigerian consumer cases and the **"Resolution Product vs. Letter Generator"** decision tree.
- [IMPLEMENTATION_PLAN.md](file:///Users/prestige/Downloads/Tag%20Final%20Project/docs/IMPLEMENTATION_PLAN.md): This file — step-by-step development roadmap, milestones, and deliverables.

---

## 2. Phase-by-Phase Roadmap

### Phase 1: Problem Validation & Empirical Grounding (Completed)
- Researched 12+ real Nigerian consumer cases from public forums (Nairaland, X/Twitter, consumer reports) across:
  1. Failed Bank Transfers (NIP timeout, Session ID confusion, 14-day CBN escalation).
  2. Undelivered Airtime/Data (Bank VTU vs. Direct Telco, NCC 622).
  3. Stolen Funds / Fraud (Emergency USSD kill-switches, Precautionary Fraud Liens, NPF-NCCC reports).
  4. Merchant Non-Delivery (Card/Paystack Chargebacks vs. Bank Transfer Demand Notice & FCCPC portal).
- Defined the **Investigative Evidence & Triage Gate**: Resolve asks targeted follow-up questions to gather evidence before any document is drafted.

---

### Phase 2: Core Engine & Regulatory Knowledge Base (Next Up)
**Deliverables:**
1. **Security & PII Guardrail:**
   - Detect and mask PINs (4 digits), OTPs (6 digits), BVNs (11 digits), and 16-digit Card PANs.
   - Emergency USSD kill-switch directory for all major Nigerian banks (GTBank, Access, Zenith, UBA, FirstBank, Stanbic, etc.).
2. **Pydantic Schemas:**
   - Typed data models for Intake, Case Facts extraction across all 4 categories, Follow-up Questions, Evidence Checklists, and Complaint Documents.
3. **Evidence & Completeness Gatekeeper:**
   - Category-specific missing-field analyzer that evaluates case completeness and returns prioritized follow-up questions.
4. **Deterministic Regulatory Rules Engine:**
   - State machine for CBN, NCC, FCCPC, and Payment Gateway dispute SLAs.
5. **Verified Knowledge Base:**
   - Curated corpus of official CBN, NCC, FCCPC, and NPF-NCCC guidelines with direct source citations.

---

### Phase 3: AI Pipeline & Anti-Hallucination Verifier
**Deliverables:**
1. **Unified LLM Client:**
   - Abstraction supporting Google Gemini (`gemini-2.5-flash`), OpenAI (`gpt-4o-mini`), and a deterministic `mock` provider for offline testing and zero-cost CI.
2. **Issue Classifier & Fact Extractor:**
   - Extracts structured facts from user descriptions in standard English and Nigerian Pidgin.
3. **Citation-Backed RAG Retriever:**
   - Retrieves relevant statutory provisions and official escalation steps based on extracted case facts.
4. **Grounded Complaint & Dossier Drafter:**
   - Generates Stage-1 Bank/Telco complaints, CBN CPD petitions, Urgent Fraud Lien requests, Card Chargebacks, and FCCPC dossiers.
5. **Zero-Hallucination Fact Verifier:**
   - Deterministic post-check verifying that every date, amount, reference code, and party name matches validated case facts.

---

### Phase 4: Backend API & Case Management Persistence
**Deliverables:**
1. **FastAPI Application:**
   - High-performance async REST API with interactive Swagger docs (`/docs`).
2. **Database Models & Persistence:**
   - SQLModel / SQLite (zero-config local dev) + PostgreSQL ready for deployment.
   - Case tracking: statuses, references, follow-up dates, and statutory escalation countdowns.
3. **API Endpoints:**
   - `POST /api/v1/intake/analyze`: Classify issue, detect emergency fraud, extract facts, identify missing evidence, generate follow-up questions.
   - `POST /api/v1/intake/clarify`: Ingest user answers to follow-up questions and update case state.
   - `POST /api/v1/cases/{id}/generate-document`: Produce grounded dispute document and evidence checklist.
   - `GET /api/v1/cases/{id}`: Retrieve case status, timeline, and next regulatory action.
   - `GET /api/v1/knowledge/sources`: Retrieve verified official sources with live URLs.
   - `GET /api/v1/emergency/ussd-codes`: Retrieve Nigerian bank emergency freeze codes.

---

### Phase 5: Automated Evaluation Suite (Bootcamp Acceptance Testing)
**Deliverables:**
1. **Curated Nigerian Test Dataset (`backend/evals/dataset.json`):**
   - 30+ comprehensive test scenarios including:
     - Clear-cut cases across all 4 categories
     - Nigerian Pidgin and informal expressions
     - Incomplete descriptions requiring clarification
     - Active fraud emergencies (triggering USSD lock)
     - Ambiguous inputs (e.g. transfer sent vs. goods not received)
     - Out-of-scope requests (e.g. crypto investment schemes, visa scams)
2. **Automated Evaluation Runner (`backend/evals/run_evals.py`):**
   - Scores the system against your PRD success criteria:
     - Classification Accuracy (Target: ≥ 90%)
     - Required Field Completeness (Target: ≥ 95%)
     - Guidance Grounding & Source Consistency (Target: ≥ 95%)
     - Hallucinated Facts / Unverified Claims (Target: 0)
     - PII Leakage / Sensitive Data Exposure (Target: 0)
3. **Generated Evaluation Report (`docs/EVALUATION_REPORT.md`):**
   - Quantitative evaluation scorecard ready to present to your bootcamp instructors.

---

### Phase 6: Mobile-First Frontend & Demo Readiness
**Deliverables:**
1. **Mobile-First Next.js / React UI:**
   - Conversational + structured intake wizard.
   - Emergency Account Freeze Banner (dial USSD directly on mobile).
   - Dynamic Clarifying Questions UI (answering missing evidence questions).
   - Interactive Evidence Checklist (checkboxes for receipts, chat screenshots, Session IDs).
   - Document Review & One-Click Copy / Download (PDF / TXT).
   - Case Tracker dashboard with statutory SLA countdowns.
2. **Containerization & Deployment:**
   - `docker-compose.yml` for running backend, database, and frontend in one command.
   - CI/CD workflow (`.github/workflows/ci.yml`).
