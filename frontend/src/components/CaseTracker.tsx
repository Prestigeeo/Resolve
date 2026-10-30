import React, { useState } from "react";
import { Clock, CheckCircle2, ShieldAlert, Tag } from "lucide-react";

interface CaseTrackerProps {
  existingTicketRef?: string;
  countdownDays?: number;
  onUpdateTicket: (ticket: string) => Promise<void>;
  isLoading: boolean;
}

export const CaseTracker: React.FC<CaseTrackerProps> = ({
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
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-xl mb-6">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10">
        <Clock className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-sm font-bold text-white">Complaint Reference & Regulatory Countdown</h3>
          <p className="text-xs text-slate-400">Track statutory resolution periods mandated by Nigerian regulatory frameworks.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ticket logging form */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5">
          <label className="text-xs font-bold text-white block mb-1">
            Bank / Telco Ticket Reference Number
          </label>
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Always demand a Ticket ID from your provider. A verified tracking reference is required by law to escalate to the CBN or NCC.
          </p>

          <form onSubmit={handleSave} className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. ACC-849201 or #10029"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isLoading || !ticketInput.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/30 border border-white/10"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </form>

          {existingTicketRef && (
            <div className="mt-3 flex items-center space-x-2 text-xs text-blue-300 font-medium bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Active Tracking Reference: <strong className="text-white">{existingTicketRef}</strong></span>
            </div>
          )}
        </div>

        {/* Regulatory SLA Countdown */}
        <div className="bg-gradient-to-br from-slate-950/80 to-indigo-950/30 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Statutory Resolution SLA
            </span>
            <h4 className="text-sm font-bold text-white mt-2">CBN / NCC Mandated Window</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              By Central Bank regulation, financial institutions have <strong>14 days</strong> from lodging to resolve electronic payment complaints before direct escalation to the CBN Consumer Protection Department (CPD).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Escalation Eligibility:</span>
            <span className="text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
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
