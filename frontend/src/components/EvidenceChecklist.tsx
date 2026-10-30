import React, { useState } from "react";
import { EvidenceItem } from "../lib/api";
import { Square, FileText, CheckCircle2 } from "lucide-react";

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
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Required Evidence Checklist</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Preserve these supporting records so your complaint cannot be dismissed for lack of proof.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
            {collectedCount}/{total} Verified ({percent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const isDone = item.is_collected || checkedIds[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`flex items-start space-x-3.5 p-3.5 rounded-2xl cursor-pointer border transition-all ${
                isDone 
                  ? "bg-blue-950/30 border-blue-500/40 text-white" 
                  : "bg-slate-950/60 border-white/5 text-slate-300 hover:bg-slate-800/60 hover:border-white/15"
              }`}
            >
              <button type="button" className="mt-0.5 text-blue-400 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-400 fill-blue-500/20" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-xs font-bold ${isDone ? "text-blue-200" : "text-white"}`}>
                    {item.title}
                  </h4>
                  {item.is_mandatory && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
