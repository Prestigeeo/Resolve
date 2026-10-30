import React from "react";
import { ResolutionGuidance } from "../lib/api";
import { Clock, ExternalLink, ArrowRight, ShieldCheck, Scale } from "lucide-react";

interface GuidanceCardProps {
  guidance: ResolutionGuidance;
  countdownDays?: number;
  onGenerateDocument: () => void;
  isGeneratingDoc: boolean;
}

export const GuidanceCard: React.FC<GuidanceCardProps> = ({
  guidance,
  countdownDays,
  onGenerateDocument,
  isGeneratingDoc
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
            Verified Redress Pathway
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 tracking-tight">{guidance.summary}</h2>
        </div>

        {countdownDays !== undefined && countdownDays !== null && (
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              {countdownDays > 0 
                ? `${countdownDays} days left in Bank SLA` 
                : "Eligible for Direct CBN Escalation"}
            </span>
          </div>
        )}
      </div>

      {/* Action Steps */}
      <div className="mt-6 space-y-4">
        {guidance.action_steps.map((step) => (
          <div key={step.step_number} className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-md shadow-blue-600/30 border border-white/10">
              {step.step_number}
            </div>
            <div className="flex-1 bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <h4 className="text-xs font-bold text-white tracking-wide">{step.title}</h4>
                <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 border border-white/10 px-2.5 py-0.5 rounded-md self-start">
                  Channel: {step.channel_to_use}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{step.description}</p>

              {step.deadline_or_sla && (
                <div className="mt-2.5 text-[11px] text-amber-300 font-medium flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timeline: {step.deadline_or_sla}</span>
                </div>
              )}

              {step.statutory_citation && (
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Verified: <strong className="text-white">{step.statutory_citation.publisher}</strong>
                  </span>
                  <a
                    href={step.statutory_citation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>View Regulation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA to Generate Document */}
      {guidance.can_generate_document && (
        <div className="mt-7 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white">Ready to file your formal complaint?</h4>
            <p className="text-[11px] text-slate-400">
              Generate a legally grounded, zero-hallucination document formatted for immediate submission.
            </p>
          </div>
          <button
            onClick={onGenerateDocument}
            disabled={isGeneratingDoc}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 border border-white/10"
          >
            {isGeneratingDoc ? <span>Generating Verified Draft...</span> : (
              <>
                <span>Generate Official Document</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
