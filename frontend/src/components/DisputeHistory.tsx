"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Trash2, 
  ArrowRight, 
  MessageSquare, 
  Scale, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  ExternalLink 
} from "lucide-react";
import { GeneratedDocument } from "@/lib/api";

export interface StoredDisputeCase {
  id: string;
  category: string;
  title: string;
  createdAt: string;
  lastMessageSnippet: string;
  amount_ngn?: number;
  bankName?: string;
  document?: GeneratedDocument;
  messages: any[];
  facts?: any;
}

interface DisputeHistoryProps {
  onResumeCase: (disputeCase: StoredDisputeCase) => void;
  onStartNewCase: () => void;
}

export const DisputeHistory: React.FC<DisputeHistoryProps> = ({
  onResumeCase,
  onStartNewCase
}) => {
  const [cases, setCases] = useState<StoredDisputeCase[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("resolve_dispute_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCases(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load dispute history from localStorage", e);
    }
  }, []);

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = cases.filter((c) => c.id !== id);
    setCases(updated);
    try {
      localStorage.setItem("resolve_dispute_history", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save updated cases", err);
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear your entire dispute history?")) {
      setCases([]);
      localStorage.removeItem("resolve_dispute_history");
    }
  };

  const handleCopyDoc = (doc: GeneratedDocument) => {
    const fullText = `${doc.subject_line}\n\n${doc.body_text}\n\nEVIDENCE ATTACHED:\n${doc.formal_evidence_list.map((e) => `- ${e}`).join("\n")}\n\n${doc.statutory_notice_clause}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = (doc: GeneratedDocument) => {
    const fullText = `${doc.subject_line}\n\n${doc.body_text}\n\nEVIDENCE ATTACHED:\n${doc.formal_evidence_list.map((e) => `- ${e}`).join("\n")}\n\n${doc.statutory_notice_clause}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Resolve_Official_Dispute_${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dispute History &amp; Saved Letters</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your logged dispute sessions, statutory demand notices, and official regulator escalation letters.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {cases.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onStartNewCase}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Start New Dispute</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {cases.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-200">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Previous Disputes Yet</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              When you report a failed bank transfer, online vendor dispute, or telecom issue, your conversation history and official dispute letters will be safely archived here for your records.
            </p>
            <button
              onClick={onStartNewCase}
              className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Triage a Transaction Now</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {cases.map((c) => {
              const formattedDate = new Date(c.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={c.id}
                  onClick={() => onResumeCase(c)}
                  className="group p-5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                        {c.category ? c.category.replace(/_/g, " ") : "Dispute Case"}
                      </span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs text-slate-500">{formattedDate}</span>
                      {c.document && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <FileText className="w-3 h-3" />
                          <span>Letter Ready</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {c.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {c.lastMessageSnippet || "Active dispute conversation."}
                    </p>

                    <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500">
                      {c.bankName && (
                        <span>Bank: <strong className="text-slate-700">{c.bankName}</strong></span>
                      )}
                      {c.amount_ngn && (
                        <span>Amount: <strong className="text-slate-700">NGN {c.amount_ngn.toLocaleString()}</strong></span>
                      )}
                      <span>Turns: <strong className="text-slate-700">{c.messages?.length || 0}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    {c.document && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoc(c.document || null);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Letter</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteCase(c.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete case"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal for viewing saved dispute letter */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
                <div className="font-bold text-slate-900 pb-2 mb-2 border-b border-slate-200">
                  {selectedDoc.subject_line}
                </div>
                {selectedDoc.body_text}
                <div className="mt-4 pt-3 border-t border-slate-200 font-sans">
                  <span className="font-bold text-slate-900 block mb-1">Evidence Required:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-600">
                    {selectedDoc.formal_evidence_list.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1">Recipient Institution:</span>
                <p className="text-xs text-slate-600">{selectedDoc.recipient_institution} ({selectedDoc.recipient_contact_info})</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2">
              <button
                onClick={() => handleCopyDoc(selectedDoc)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Letter"}</span>
              </button>
              <button
                onClick={() => handleDownloadDoc(selectedDoc)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download as File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
