# Resolve — Automated Evaluation Report

**Evaluation Date:** Current Benchmark  
**Total Test Cases Evaluated:** 40  

---

## 1. Quantitative Performance vs. PRD Acceptance Targets

| Evaluation Metric | PRD Target | Observed Result | Status |
| :--- | :--- | :--- | :--- |
| **Issue Classification Accuracy** | ≥ 90.0% | **97.5%** | PASS |
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
| `eval_11` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_12` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_13` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_14` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_15` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_16` | `UNDELIVERED_AIRTIME_DATA` | `UNDELIVERED_AIRTIME_DATA` | Correct | Triggered |
| `eval_17` | `UNDELIVERED_AIRTIME_DATA` | `UNDELIVERED_AIRTIME_DATA` | Correct | Triggered |
| `eval_18` | `UNDELIVERED_AIRTIME_DATA` | `UNDELIVERED_AIRTIME_DATA` | Correct | Triggered |
| `eval_19` | `UNDELIVERED_AIRTIME_DATA` | `UNDELIVERED_AIRTIME_DATA` | Correct | Triggered |
| `eval_20` | `UNDELIVERED_AIRTIME_DATA` | `UNDELIVERED_AIRTIME_DATA` | Correct | Triggered |
| `eval_21` | `STOLEN_FUNDS_FRAUD` | `STOLEN_FUNDS_FRAUD` | Correct | Triggered |
| `eval_22` | `STOLEN_FUNDS_FRAUD` | `STOLEN_FUNDS_FRAUD` | Correct | Triggered |
| `eval_23` | `STOLEN_FUNDS_FRAUD` | `STOLEN_FUNDS_FRAUD` | Correct | Triggered |
| `eval_24` | `STOLEN_FUNDS_FRAUD` | `STOLEN_FUNDS_FRAUD` | Correct | Triggered |
| `eval_25` | `STOLEN_FUNDS_FRAUD` | `STOLEN_FUNDS_FRAUD` | Correct | Triggered |
| `eval_26` | `MERCHANT_NON_DELIVERY` | `MERCHANT_NON_DELIVERY` | Correct | Triggered |
| `eval_27` | `MERCHANT_NON_DELIVERY` | `MERCHANT_NON_DELIVERY` | Correct | Triggered |
| `eval_28` | `MERCHANT_NON_DELIVERY` | `MERCHANT_NON_DELIVERY` | Correct | Triggered |
| `eval_29` | `MERCHANT_NON_DELIVERY` | `MERCHANT_NON_DELIVERY` | Correct | Triggered |
| `eval_30` | `MERCHANT_NON_DELIVERY` | `MERCHANT_NON_DELIVERY` | Correct | Triggered |
| `eval_31` | `OUT_OF_SCOPE` | `OUT_OF_SCOPE` | Correct | Triggered |
| `eval_32` | `OUT_OF_SCOPE` | `MERCHANT_NON_DELIVERY` | Mismatch | Triggered |
| `eval_33` | `OUT_OF_SCOPE` | `OUT_OF_SCOPE` | Correct | Triggered |
| `eval_34` | `OUT_OF_SCOPE` | `OUT_OF_SCOPE` | Correct | Triggered |
| `eval_35` | `AMBIGUOUS` | `AMBIGUOUS` | Correct | Triggered |
| `eval_36` | `AMBIGUOUS` | `AMBIGUOUS` | Correct | Triggered |
| `eval_37` | `AMBIGUOUS` | `AMBIGUOUS` | Correct | Triggered |
| `eval_38` | `FAILED_TRANSFER` | `FAILED_TRANSFER` | Correct | Triggered |
| `eval_39` | `UNDELIVERED_AIRTIME_DATA` | `UNDELIVERED_AIRTIME_DATA` | Correct | Triggered |
| `eval_40` | `STOLEN_FUNDS_FRAUD` | `STOLEN_FUNDS_FRAUD` | Correct | Triggered |
