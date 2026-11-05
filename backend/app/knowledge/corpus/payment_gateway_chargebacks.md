# Payment Gateway & Card Scheme Chargeback Procedures in Nigeria

## Statutory & Regulatory Framework
- **Regulated Entities:** Payment Solution Service Providers (PSSPs), Card Schemes (Mastercard, Visa, Verve), Central Bank of Nigeria (CBN).
- **Core Gateways in Nigeria:** Paystack, Flutterwave, Interswitch / Quickteller, Monnify, Remita.
- **Governing Rules:** CBN Regulatory Framework for Payment Service Providers; International Card Scheme Dispute & Chargeback Rules (Mastercard/Visa Chargeback Guide).

---

## Section 1: When Does a Chargeback Apply?
1. **Direct Bank Transfer vs. Online Checkout / Card:**
   - When a consumer pays a vendor via **Direct Bank Transfer** to an account number, Card Scheme Chargeback rules DO NOT apply. The user must seek redress under FCCPA 2018 or via fraud lien if criminal.
   - When a consumer pays using their **Debit/Credit Card**, or enters payment via an **Online Checkout Modal** (e.g., Paystack Checkout, Flutterwave Checkout):
   - The transaction is covered under Card Scheme Chargeback and Gateway Dispute Protections.
2. **Qualifying Grounds for Chargeback (Reason Code: Merchandise / Services Not Received):**
   - The cardholder authorized payment for goods or services.
   - The merchant agreed to deliver on a specified date.
   - The delivery date passed without receipt of goods or services.
   - The cardholder made a reasonable attempt to resolve the issue with the merchant and the merchant failed to respond or refund.

---

## Section 2: Procedure for Lodging Gateway Inquiries & Bank Chargebacks
1. **Gateway Transaction Dispute Lookup:**
   - Buyers who paid via online checkout can locate their transaction directly on the gateway lookup portal:
     - Paystack Dispute Lookup: `https://paystack.com/lookup`
     - Flutterwave Consumer Support: `https://flutterwave.com/ng/contact-us`
   - The gateway places an immediate inquiry with the merchant and can freeze pending settlement disbursements from the merchant's payout balance.
2. **Issuing Bank Chargeback Claim:**
   - The consumer's card-issuing bank (e.g. GTBank, Zenith, Access) is legally obligated to initiate an official Chargeback against the merchant's acquiring bank via Mastercard/Visa/Verve settlement rails.
   - **Time Limit:** Cardholder chargeback claims must be submitted within **120 calendar days** from the transaction date or agreed delivery date.
   - **Required Documentation:**
     - Card PAN first 6 and last 4 digits (e.g., `5399-xxxx-xxxx-1234`).
     - Payment receipt showing transaction reference code.
     - Proof of non-delivery (copies of unanswered chats or blocked communication).
