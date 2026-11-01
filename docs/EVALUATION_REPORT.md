# Resolve — Automated Evaluation Report

**Evaluation Date:** Current Benchmark  
**Total Test Cases Evaluated:** 10  

---

## 1. Quantitative Performance vs. PRD Acceptance Targets

| Evaluation Metric | PRD Target | Observed Result | Status |
| :--- | :--- | :--- | :--- |
| **Issue Classification Accuracy** | ≥ 90.0% | **100.0%** | PASS |
| **Urgent Fraud / Emergency Detection** | 100.0% | **100.0%** | PASS |
| **Zero Unsupported Factual Claims** | 0 Hallucinations | **0 Hallucinations** | PASS |
| **Sensitive PII / Credential Exposure** | 0 Incidents | **0 Incidents** | PASS |

---

## 2. Test Case Breakdown

| Case ID | Expected Category | Predicted Category | Classification | Emergency Protocol |
| :--- | :--- | :--- | :--- | :--- |
| `eval_01` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_02` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_03` | `UNDELIVERED_AIRTIME_DATA` | `UNDELIVERED_AIRTIME_DATA` | Correct | Triggered |
| `eval_04` | `STOLEN_FUNDS_FRAUD` | `STOLEN_FUNDS_FRAUD` | Correct | Triggered |
| `eval_05` | `MERCHANT_NON_DELIVERY` | `MERCHANT_NON_DELIVERY` | Correct | Triggered |
| `eval_06` | `MERCHANT_NON_DELIVERY` | `MERCHANT_NON_DELIVERY` | Correct | Triggered |
| `eval_07` | `OUT_OF_SCOPE` | `OUT_OF_SCOPE` | Correct | Triggered |
| `eval_08` | `OUT_OF_SCOPE` | `OUT_OF_SCOPE` | Correct | Triggered |
| `eval_09` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_10` | `UNDELIVERED_AIRTIME_DATA` | `UNDELIVERED_AIRTIME_DATA` | Correct | Triggered |
