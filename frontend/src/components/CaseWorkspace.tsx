import React from "react";
import { CheckCircle2, CircleAlert, FileSearch, Landmark, ShieldAlert } from "lucide-react";
import { ExtractedCaseFacts } from "../lib/api";

interface CaseWorkspaceProps {
  facts: ExtractedCaseFacts;
}

const labels: Record<string, string> = {
  FAILED_TRANSFER: "Failed bank transfer",
  MERCHANT_NON_DELIVERY: "Merchant non-delivery",
  UNDELIVERED_AIRTIME_DATA: "Undelivered airtime or data",
  STOLEN_FUNDS_FRAUD: "Urgent fraud recovery",
};

export function CaseWorkspace({ facts }: CaseWorkspaceProps) {
  const urgent = facts.is_urgent_emergency;
  const category = labels[facts.category] || "Case under assessment";
  const factsFound = [facts.sender_institution, facts.amount_ngn && `₦${Number(facts.amount_ngn).toLocaleString()}`, facts.session_id_or_ref && "Transaction reference", facts.transaction_date].filter(Boolean);
  const nextEvidence = facts.category === "MERCHANT_NON_DELIVERY"
    ? "Payment proof, the order agreement, and the promised delivery date."
    : facts.category === "STOLEN_FUNDS_FRAUD"
    ? "Your debit alert, transaction reference, and the receiving institution."
    : "Your transaction receipt, sending institution, amount, and transaction reference.";

  return (
    <div className={`border-b p-4 sm:p-5 ${urgent ? "border-rose-200 bg-rose-50" : "border-blue-100 bg-blue-50/60"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${urgent ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"}`}>
            {urgent ? <ShieldAlert className="h-3.5 w-3.5" /> : <Landmark className="h-3.5 w-3.5" />}
            {urgent ? "Immediate action required" : "Decision path identified"}
          </div>
          <h2 className="mt-2 text-base font-bold text-slate-900">{category}</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600">
            {urgent ? "Secure the account first. Resolve will preserve the evidence trail for the recovery request next." : "Resolve is separating confirmed facts from missing evidence before it recommends a complaint or escalation."}
          </p>
        </div>
        <div className="rounded-xl border border-white bg-white/80 px-3 py-2 text-right shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confidence</p>
          <p className="mt-0.5 text-sm font-extrabold text-slate-900">{Math.round((facts.confidence || 0) * 100)}%</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-100 bg-white p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Facts detected</div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{factsFound.length ? factsFound.join(" · ") : "We need a few details to identify the correct route."}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-white p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800"><FileSearch className="h-3.5 w-3.5 text-blue-600" /> Evidence to close next</div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{nextEvidence}</p>
        </div>
      </div>
    </div>
  );
}
