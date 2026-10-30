import React, { useState } from "react";
import { Clock, Shield, CheckCircle2, AlertCircle } from "lucide-react";

interface CaseTrackerProps {
  caseId: string;
  providerContacted?: boolean;
  existingTicketRef?: string;
  countdownDays?: number;
  onUpdateTicket: (ticket: string) => Promise<void>;
  isLoading: boolean;
}

export const CaseTracker: React.FC<CaseTrackerProps> = ({
  caseId,
  providerContacted,
  existingTicketRef,
  countdownDays,
  onUpdateTicket,
  isLoading
}) => {
  const [ticketInput, setTicketInput] = useState(existingTicketRef || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    onUpdateTicket(ticketInput.trim());
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <Clock className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-slate-900">Case Tracking & Regulatory SLA Countdown</h3>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ticket logging form */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Bank / Telco Complaint Ticket Reference
          </label>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Always demand a Ticket ID from your provider. It is legally required to escalate to the CBN or NCC.
          </p>

          <form onSubmit={handleSave} className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. ACC-849201 or #10029"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={isLoading || !ticketInput.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </form>

          {existingTicketRef && (
            <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Ticket: <strong>{existingTicketRef}</strong></span>
            </div>
          )}
        </div>

        {/* Countdown card */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              REGULATORY COUNTDOWN
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">CBN / NCC Statutory Window</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              By Central Bank regulation, banks have <strong>14 days</strong> to resolve electronic complaints before you can escalate directly to the CBN Consumer Protection Department (CPD).
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Status:</span>
            <span className="text-xs font-extrabold text-emerald-700">
              {countdownDays !== undefined && countdownDays > 0 
                ? `${countdownDays} Days Remaining` 
                : "Eligible for Direct Escalation"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
