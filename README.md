# RESOLVE — AI-Powered Consumer Complaint & Redress Assistant (Nigeria)

> **Final Project for AI Engineering Bootcamp at Tag Ecosystem**  
> *A hybrid decision-support system that turns chaotic transaction disputes into verified regulatory complaints and actionable next steps.*

[![Tests](https://img.shields.io/badge/pytest-17%20passed%20(100%25)-emerald.svg)](backend/tests/)
[![Accuracy](https://img.shields.io/badge/Evaluation%20Accuracy-100%25-blue.svg)](docs/EVALUATION_REPORT.md)
[![Regulators](https://img.shields.io/badge/Regulators-CBN%20%7C%20NCC%20%7C%20FCCPC-purple.svg)](docs/PRD.md)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

---

## 1. Problem Overview & Core Philosophy

In Nigeria, millions of consumers lose money daily to failed bank transfers (debit without credit), undelivered telecom airtime/data, stolen phones/scams, and online vendors who ghost after receiving payment.

Consumers get trapped in institutional blame games (Bank A blames Bank B; telcos blame banks; banks refuse to reverse vendor transfers without debit authority). When consumers turn to AI, shallow chatbots generate generic, useless letters that fail because they lack mandatory regulatory evidence (e.g., 30-digit NIBSS Session IDs, promised delivery dates, or expired statutory SLAs).

### The Core Design Principle: Decision Support vs. Letter Generator
**Resolve is NOT a letter generator.** Resolve is a **hybrid AI decision-support system**:
1. **Investigative Evidence Gatekeeper:** Halts premature drafting until critical facts (Session IDs, payment rails, agreed delivery dates, and proof of blocking) are verified.
2. **Deterministic Rules Engine:** The LLM is never allowed to hallucinate regulatory deadlines. Statutory SLAs (CBN 14-day rule, NCC 622, Card Chargebacks, FCCPA 2018) are calculated deterministically.
3. **Zero-Hallucination Verifier:** A post-generation verification pass guarantees that 100% of dates, amounts, and references in the drafted complaint match verified facts.

---

## 2. Supported Categories & Regulators

| Category | Primary Focus | Regulatory Authority | Action Documents Generated |
| :--- | :--- | :--- | :--- |
| **1. Failed Bank Transfers** | Debit without credit (NIP/USSD/App) | **Central Bank of Nigeria (CBN)** | • Stage-1 Bank Dispute Notice<br>• Formal CBN CPD Escalation Petition |
| **2. Undelivered Airtime/Data** | VTU bank debits vs. direct telco recharge | **Nigerian Communications Commission (NCC)** | • Stage-1 Telco/Bank Complaint<br>• NCC Toll-Free 622 Escalation Summary |
| **3. Stolen Funds & Scams** | Snatched phones, unauthorized debits, OTP fraud | **CBN Fraud Desks & NPF-NCCC** | • Instant USSD Account Lock (All Banks)<br>• Urgent Bank Precautionary Lien Request<br>• Police Extract / Cybercrime Report |
| **4. Merchant Non-Delivery** | Social media vendors (Instagram/WhatsApp) who refuse to deliver or refund | **FCCPC (FCCPA 2018) & Payment Gateways** | • Card/Paystack Chargeback Dispute<br>• Formal 7-Day Refund Demand Notice<br>• Official FCCPC Complaint Dossier |

---

## 3. Quantitative Evaluation Benchmark

Tested against a curated benchmark of realistic Nigerian consumer scenarios (including Nigerian Pidgin, incomplete narratives, and active theft):

| Metric | PRD Target | Observed Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Issue Classification Accuracy** | ≥ 90.0% | **100.0%** | ✅ PASS |
| **Urgent Fraud / Emergency Detection** | 100.0% | **100.0%** | ✅ PASS |
| **Zero Unsupported Factual Claims** | 0 Hallucinations | **0 Hallucinations** | ✅ PASS |
| **PII / Sensitive Credential Exposure** | 0 Incidents | **0 Incidents** | ✅ PASS |
| **Test Suite Pass Rate** | 100% | **17 / 17 Passed (100%)** | ✅ PASS |

Full test breakdown available in [docs/EVALUATION_REPORT.md](docs/EVALUATION_REPORT.md).

---

## 4. Live Cloud Deployment Guide

### Deploy Backend to Render (in 2 minutes)
1. Go to [Render.com](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Choose:
   - **Root Directory:** `backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `LLM_PROVIDER`: `gemini` (or `openai` or `mock`)
   - `GEMINI_API_KEY`: Your Google AI Studio API key
5. Click **Create Web Service**. Your live backend will be at:  
   `https://<your-render-app>.onrender.com`

---

### Deploy Frontend to Vercel (in 1 minute)
1. Go to [Vercel.com](https://vercel.com) and click **Add New > Project**.
2. Select your GitHub repository.
3. Choose:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Next.js`
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://<your-render-app>.onrender.com/api/v1`
5. Click **Deploy**. Your mobile-first web app will be live at:  
   `https://<your-project>.vercel.app`

---

## 5. Local Development Setup

### Backend (FastAPI + Python 3.11+)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run automated tests
pytest -v

# Run the API server
uvicorn app.main:app --reload --port 8000
```
Interactive API docs available at `http://localhost:8000/docs`.

### Frontend (Next.js 14 + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` on your mobile phone or browser.

---

## 6. Project Documentation
- [PRD.md](docs/PRD.md): Product Requirements Document (v0.2).
- [ARCHITECTURE.md](docs/ARCHITECTURE.md): System design, Pydantic schemas, and regulatory state machine.
- [PROBLEM_VALIDATION.md](docs/PROBLEM_VALIDATION.md): 12 empirical Nigerian consumer cases and the evidence-gathering decision tree.
- [EVALUATION_REPORT.md](docs/EVALUATION_REPORT.md): Quantitative benchmark scorecard.
