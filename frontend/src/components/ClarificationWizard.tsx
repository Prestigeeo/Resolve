import React, { useState } from "react";
import { ClarifyingQuestion } from "../lib/api";
import { HelpCircle, ArrowRight, AlertTriangle } from "lucide-react";

interface ClarificationWizardProps {
  questions: ClarifyingQuestion[];
  category: string;
  onSubmitAnswers: (answers: Record<string, string | number | boolean>) => Promise<void>;
  isLoading: boolean;
}

export const ClarificationWizard: React.FC<ClarificationWizardProps> = ({
  questions,
  onSubmitAnswers,
  isLoading
}) => {
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAnswers(answers);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl mb-6 backdrop-blur-xl">
      {/* Background ambient amber glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-start space-x-3.5 mb-5">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl text-white shadow-lg shadow-amber-500/20 shrink-0 border border-amber-400/30">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            Investigative Evidence Gate
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1 tracking-tight">
            Additional details required before drafting
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Resolve does not generate unverified claims. Answering these targeted questions guarantees your complaint meets strict <strong>CBN, NCC, or FCCPC</strong> evidentiary standards.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4 mt-6">
        {questions.map((q, idx) => {
          const currentVal = answers[q.field_target] !== undefined ? String(answers[q.field_target]) : "";
          return (
            <div key={q.id} className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <label className="text-xs font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shadow-md shadow-blue-600/30">
                    {idx + 1}
                  </span>
                  <span>{q.question_text}</span>
                </label>
              </div>

              {q.help_text && (
                <div className="mt-1.5 text-[11px] text-slate-400 flex items-center space-x-1.5 pl-8">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{q.help_text}</span>
                </div>
              )}

              {/* Input Types */}
              <div className="mt-3 pl-8">
                {q.input_type === "select" && q.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInputChange(q.field_target, opt)}
                        className={`p-3 rounded-xl text-xs text-left font-medium transition-all border ${
                          currentVal === opt
                            ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 font-bold"
                            : "bg-slate-900 text-slate-300 border-white/5 hover:bg-slate-800 hover:border-white/15"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : q.input_type === "date" ? (
                  <input
                    type="date"
                    value={currentVal}
                    onChange={(e) => handleInputChange(q.field_target, e.target.value)}
                    className="w-full sm:w-64 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                ) : q.input_type === "number" ? (
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={currentVal}
                    onChange={(e) => handleInputChange(q.field_target, e.target.value)}
                    className="w-full sm:w-64 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none placeholder:text-slate-600"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Enter answer here..."
                    value={currentVal}
                    onChange={(e) => handleInputChange(q.field_target, e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none placeholder:text-slate-600"
                  />
                )}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-end pt-3">
          <button
            type="submit"
            disabled={isLoading || Object.keys(answers).length === 0}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 border border-white/10"
          >
            {isLoading ? <span>Updating Facts...</span> : (
              <>
                <span>Save Facts & Unlock Resolution Path</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
