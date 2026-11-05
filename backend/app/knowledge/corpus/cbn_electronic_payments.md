# Central Bank of Nigeria (CBN) — Guidelines on Electronic Funds Transfer & Failed Transfer Reconciliation

## Statutory Authority
- **Enacting Body:** Central Bank of Nigeria (CBN), Financial Policy and Regulation Department & Banking Services Department
- **Legal Foundation:** CBN Guidelines on Operations of Electronic Payment Channels in Nigeria; Guidelines on Instant (Inter-Bank) Electronic Funds Transfer Services in Nigeria (2018).
- **Core Clearing Switch:** Nigeria Inter-Bank Settlement System Plc (NIBSS).

---

## Section 1: Types of Electronic Funds Transfer Failures
1. **Intra-Bank Transfer Failure (Same Bank):**
   - When a transfer occurs between accounts held at the same bank and value is not received, the sender's bank controls both ledgers.
   - **Mandatory Reversal SLA:** Intra-bank failed debits must be automatically reversed within **instant turnaround or at most 24 hours** from the timestamp of the failed transaction.
2. **Inter-Bank Transfer Failure (Different Banks via NIP):**
   - Transferred via the NIBSS Instant Payments (NIP) switch.
   - Statuses include: *Successful at Switch*, *System Timeout*, *Rejected by Beneficiary Bank*, or *Pending Reconciliation*.
   - If the switch times out or the receiving bank sends a reject signal, the funds must reverse automatically to the originating account within **instant (T+0) or maximum 24–48 hours**.

---

## Section 2: The 30-Digit NIBSS Session ID Protocol
1. **What is the Session ID?**
   - Every single electronic interbank transfer in Nigeria generates a unique 30-digit alphanumeric tracking code called the **NIP Session ID** (e.g., `100004241030123456789012345678`).
   - The first 6 digits represent the sending bank's bank code, followed by the year, month, day, hour, minute, second, and a unique transaction sequence.
2. **Evidentiary Necessity:**
   - Under CBN regulations, neither a recipient bank nor NIBSS can manually trace or unfreeze a missing transfer without the originating bank's 30-digit Session ID.
   - Any formal Stage-1 dispute or Stage-2 regulatory escalation MUST state this Session ID to enable ledger cross-matching between the sending switch and the receiving switch.

---

## Section 3: Distinction Between Failed Transfer and Completed Transfer
1. **Debit Without Credit (Technical Failure):**
   - The funds never reached the beneficiary's available balance due to network timeout or switch desynchronization. The originating bank has the legal duty to recall or reverse the funds.
2. **Completed Transfer to Defaulting Merchant:**
   - If the recipient bank acknowledged credit confirmation (Session ID status = 00 Successful), the transaction is legally complete.
   - **Important Regulatory Boundary:** A bank CANNOT unilaterally reverse a completed transfer because the sender regrets it or because an online merchant refuses to deliver. Under Nigerian banking law and the Bankers' Books Evidence Act, reversal of completed interbank transfers requires either:
     - Written Debit Authority from the recipient account holder, OR
     - A valid Court Order / Police Lien, OR
     - An adjudication by the Federal Competition and Consumer Protection Commission (FCCPC).
