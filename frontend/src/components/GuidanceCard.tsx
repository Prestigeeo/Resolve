import React from "react";
import { ResolutionGuidance } from "../lib/api";
import { Clock, ExternalLink, ArrowRight, BookCheck, Shield } from "lucide-react";

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
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase">
            Official Resolution Pathway
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">{guidance.summary}</h2>
        </div>

        {countdownDays !== undefined && countdownDays !== null && (
          <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {countdownDays > 0 
                ? `${countdownDays} days left in Bank SLA` 
                : "Eligible for Direct CBN Escalation"}
            </span>
          </div>
        )}
      </div>

      {/* Step-by-Step Instructions */}
      <div className="mt-5 space-y-4">
        {guidance.action_steps.map((step) => (
          <div key={step.step_number} className="flex items-start space-x-3.5">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
              {step.step_number}
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md self-start">
                  Channel: {step.channel_to_use}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{step.description}</p>

              {step.deadline_or_sla && (
                <div className="mt-2 text-[11px] text-amber-800 font-medium flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Timeline: {step.deadline_or_sla}</span>
                </div>
              )}

              {step.statutory_citation && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Verified: <strong>{step.statutory_citation.publisher}</strong>
                  </span>
                  <a
                    href={step.statutory_citation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>View Regulation</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA to Generate Document */}
      {guidance.can_generate_document && (
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Ready to lodge your complaint?</h4>
            <p className="text-[11px] text-slate-500">
              Generate a legally grounded, zero-hallucination dispute document ready to submit.
            </p>
          </div>
          <button
            onClick={onGenerateDocument}
            disabled={isGeneratingDoc}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            {isGeneratingDoc ? <span>Generating Grounded Draft...</span> : (
              <>
                <span>Generate Official Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
