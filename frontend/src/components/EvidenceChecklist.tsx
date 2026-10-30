import React, { useState } from "react";
import { EvidenceItem } from "../lib/api";
import { CheckSquare, Square, FileText, CheckCircle2 } from "lucide-react";

interface EvidenceChecklistProps {
  items: EvidenceItem[];
}

export const EvidenceChecklist: React.FC<EvidenceChecklistProps> = ({ items }) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const total = items.length;
  const collectedCount = items.filter((item) => item.is_collected || checkedIds[item.id]).length;
  const percent = total > 0 ? Math.round((collectedCount / total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Required Evidence Checklist</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gather these supporting documents to guarantee your complaint is not dismissed.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {collectedCount}/{total} Collected ({percent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
        <div 
          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const isDone = item.is_collected || checkedIds[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`flex items-start space-x-3 p-3 rounded-2xl cursor-pointer border transition-all ${
                isDone 
                  ? "bg-emerald-50/50 border-emerald-200 text-slate-900" 
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <button type="button" className="mt-0.5 text-emerald-600 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className={`text-xs font-bold ${isDone ? "text-emerald-950" : "text-slate-900"}`}>
                    {item.title}
                  </h4>
                  {item.is_mandatory && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                      MANDATORY
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
