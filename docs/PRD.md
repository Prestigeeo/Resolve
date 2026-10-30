# RESOLVE
## Product Requirements Document (PRD)

**Project:** Resolve — AI-Powered Consumer Complaint & Redress Assistant  
**Version:** 0.2  
**Status:** Active Blueprint  
**Project type:** Standalone AI Engineering Project  
**Initial market:** Nigeria (with Pan-African scalability in mind)  
**Platform:** Mobile-first web application  
**Primary focus:**  
1. Failed bank transfers (debit without credit)  
2. Undelivered airtime/data purchases  
3. Unauthorized transactions & stolen funds (fraud/scam recovery protocol)  
4. Business/Merchant non-delivery of paid goods or services (commercial dispute & FCCPC/chargeback redress)

---

## 1. Product Overview

### 1.1 What is Resolve?

Resolve is an AI-powered consumer-resolution assistant that helps Nigerians—with Africa in mind—understand, document, and follow up on everyday transactional and commercial service complaints. It covers four critical pain points:
1. **Failed financial transactions** (where a sender is debited but the recipient is not credited).
2. **Undelivered airtime or data purchases** (purchased via telecom channels or bank VTU).
3. **Unauthorized transactions & stolen funds** (compromised accounts, POS/OTP fraud, or unauthorized transfers requiring immediate freeze, fraud-lien request, and law-enforcement documentation).
4. **Business/Vendor refusal to deliver paid goods or services** (where a consumer pays a vendor or online business via bank transfer, POS, or payment gateway like Paystack/Flutterwave, and the business refuses to deliver or refund).

When a customer loses money during a transaction or commercial purchase, the resolution process can be confusing. Customers often do not know:
- Whether their issue falls under the **Central Bank of Nigeria (CBN)**, the **Nigerian Communications Commission (NCC)**, the **Federal Competition and Consumer Protection Commission (FCCPC)**, a **Payment Gateway Dispute Desk**, or the **Bank's Fraud Desk / NPF-NCCC**.
- What difference exists between a *technical failed transfer* (automatic reversal/NIBSS recall) and a *successful transfer to a defaulting merchant* (requiring Debit Authority, Chargeback, or FCCPC/legal intervention).
- What evidence to preserve, how to write an objective, legally sound complaint, or when to escalate.

Resolve simplifies this process by turning a user's description of an incident into a structured case, identifying missing information, generating an evidence-based complaint or demand/dispute document, and guiding the user through the appropriate verified resolution pathway.

**Clear Product Boundary:** Resolve does not process refunds directly, hack or access bank systems, unilaterally freeze accounts, or guarantee that complaints will result in fund recovery.

### 1.2 Product Vision

To make seeking redress for everyday financial, telecom, and commercial consumer problems simpler, more transparent, and more accessible to ordinary Nigerians.

### 1.3 Mission

Help consumers take the right, time-sensitive next step when a service provider, payment channel, or business fails to deliver or when funds leave their account without authorization.

---

## 2. Problem Statement

Consumers experiencing failed transfers, undelivered telecom purchases, unauthorized debits, or merchant non-delivery must navigate procedures that differ drastically by issue type, payment method, and regulator.

They commonly struggle to:

- Distinguish between technical transaction failures, unauthorized fraud, and commercial breach of contract (merchant non-delivery).
- Take immediate time-critical actions within the first 24 hours of a fraudulent or unauthorized transfer (such as USSD account lock and requesting a NIBSS/Bank Fraud Desk precautionary lien before funds are dissipated).
- Know when a payment gateway (e.g., Paystack, Flutterwave, Interswitch) or Card Chargeback can be used versus when an **FCCPC** complaint and formal Notice of Non-Delivery are required.
- Determine what information is needed to report an incident (e.g., 30-digit NIBSS Session ID, Ticket ID, invoice/chat proof).
- Write a clear, objective, fact-grounded complaint without making unsupported legal claims.
- Keep track of complaint reference numbers, SLA windows, and escalation deadlines.

Resolve reduces this burden by combining structured case management, verified multi-regulator guidance (**CBN, NCC, FCCPC**), emergency fraud triage, and AI-assisted document preparation.

### 2.1 Problem Hypothesis

People experiencing these problems will be more likely to submit complete complaints, act within critical regulatory windows, and follow the appropriate resolution process when they receive personalized, step-by-step guidance and ready-to-use complaint documents.

---

## 3. Target Users

### Primary users

Nigerian consumers who have experienced:

1. **Failed Bank Transfer:** Debited for a transfer (NIP/USSD/App/POS) that the recipient did not receive.
2. **Undelivered Airtime/Data:** Debited for airtime or data (via Telco or Bank VTU) that was never credited.
3. **Unauthorized / Stolen Funds:** Money transferred out of their account via unauthorized access, stolen phone/SIM, social engineering, or compromised card/OTP.
4. **Merchant / Business Non-Delivery:** Paid a vendor, social-media merchant (Instagram/WhatsApp/Jiji), or company for goods or services, and the business failed to deliver and refused to refund.

---

## 4. Product Goals

Resolve should:

1. Accurately classify the user's issue across the 4 supported categories (and flag urgent fraud immediately).
2. Collect the exact category-specific information required to prepare an effective complaint.
3. Generate clear, factually grounded, non-defamatory complaint and dispute documents.
4. Provide guidance based on verified official sources (**CBN**, **NCC**, **FCCPC**, **NPF-NCCC**, and **Payment Gateway Dispute Rules**).
5. Clearly explain regulatory realities (e.g., why banks cannot unilaterally reverse a completed transfer to a merchant without merchant Debit Authority or a formal order, and what steps the consumer must take instead).
6. Help users record complaint references, responses, and follow-up dates.
7. Protect sensitive user information (never asking for PINs, passwords, OTPs, BVNs, or full card numbers).

### Success metrics

| Metric | Initial target |
|---|---:|
| Correct issue classification across the 4 categories + out-of-scope | At least 90% on a curated test set |
| Required-field completeness in generated complaints | At least 95% |
| Complaint instructions consistent with verified CBN/NCC/FCCPC guidance | At least 95% on evaluated cases |
| Unsupported factual claims or unverified accusations in generated complaints | 0 in the release test set |
| Successful completion of the guided complaint workflow | At least 80% of usability-test participants |
| Critical sensitive-data exposure incidents (PIN/OTP/BVN/Card PAN) | 0 |

---

## 5. Minimum Viable Product (MVP)

### 5.1 Included Features

**Feature 1: Multi-category complaint intake**
Users select a complaint category or describe what happened in ordinary language (including Nigerian English / Pidgin expressions).

**Feature 2: AI-assisted issue classification & Urgent Fraud Triage**
The system classifies the incident into one of the 4 supported categories (or `OUT_OF_SCOPE` / `AMBIGUOUS`). If Unauthorized/Stolen Funds is detected, an Emergency Action Banner with Nigerian bank USSD kill-switches is immediately surfaced.

**Feature 3: Category-specific evidence checklist**
The system identifies relevant supporting evidence before any complaint is filed.

**Feature 4: Grounded complaint & notice generation**
Tailored, downloadable documents:
1. Bank / Telecom Stage-1 Complaint.
2. Urgent Fraud Report & Precautionary Lien / Recall Request.
3. Formal Notice of Non-Delivery & Demand + FCCPC / Gateway Dispute Statement.

**Feature 5: Verified multi-regulator complaint guidance**
Retrieves applicable instructions from verified CBN, NCC, FCCPC, and Payment Gateway sources.

**Feature 6: Case tracking**
Users can save a case, record ticket references, track follow-up dates, and monitor statutory countdowns.

### 5.2 Explicitly Out of Scope
The first version will not:
- Recover money directly or guarantee refunds/reversals.
- Access bank accounts, NIBSS terminals, or telecom systems directly.
- Unilaterally freeze third-party bank accounts.
- Submit complaints automatically to regulators without user action.
- Act as a licensed legal representative or court adjudicator.
- Accuse an individual or business of a crime without objective factual framing.
- Require users to share PINs, passwords, OTPs, BVNs, or full card numbers.
