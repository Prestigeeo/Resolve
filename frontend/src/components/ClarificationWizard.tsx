import React, { useState } from "react";
import { ClarifyingQuestion } from "../lib/api";
import { HelpCircle, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";

interface ClarificationWizardProps {
  questions: ClarifyingQuestion[];
  category: string;
  onSubmitAnswers: (answers: Record<string, any>) => Promise<void>;
  isLoading: boolean;
}

export const ClarificationWizard: React.FC<ClarificationWizardProps> = ({
  questions,
  category,
  onSubmitAnswers,
  isLoading
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleInputChange = (field: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAnswers(answers);
  };

  return (
    <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-sm mb-6">
      <div className="flex items-start space-x-3 mb-4">
        <div className="p-2.5 bg-amber-500 rounded-xl text-white shadow-md shadow-amber-500/20 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase">
            Investigative Evidence Gate
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            We need a few critical details before taking action
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Resolve does not generate premature letters without verified facts. Answering these targeted questions ensures your complaint complies with official <strong>CBN, NCC, or FCCPC</strong> standards.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-5">
        {questions.map((q, idx) => {
          const currentVal = answers[q.field_target] || "";
          return (
            <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{q.question_text}</span>
                </label>
              </div>

              {q.help_text && (
                <div className="mt-1 text-[11px] text-slate-500 flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{q.help_text}</span>
                </div>
              )}

              {/* Input Renderers */}
              <div className="mt-2.5">
                {q.input_type === "select" && q.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInputChange(q.field_target, opt)}
                        className={`p-2.5 rounded-xl text-xs text-left font-medium transition-all border ${
                          currentVal === opt
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
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
                    className="w-full sm:w-64 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 outline-none"
                  />
                ) : q.input_type === "number" ? (
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={currentVal}
                    onChange={(e) => handleInputChange(q.field_target, e.target.value)}
                    className="w-full sm:w-64 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Type answer here..."
                    value={currentVal}
                    onChange={(e) => handleInputChange(q.field_target, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-600 outline-none"
                  />
                )}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || Object.keys(answers).length === 0}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md"
          >
            {isLoading ? <span>Updating Case Facts...</span> : (
              <>
                <span>Save Answers & Unlock Resolution Path</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
