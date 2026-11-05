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
              <span className="w-2.5 h-2.5 rounded-full bg-[#D95D39]" />
              <h2 className="text-xl font-bold text-[#2B1E1A] tracking-tight font-outfit">Resolution History &amp; Saved Letters</h2>
            </div>
            <p className="text-xs text-[#2B1E1A]/60 mt-1">
              Your logged resolution sessions, statutory demand notices, and official regulator escalation letters.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {cases.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#C84B27] hover:bg-[#C84B27]/10 border border-[#C84B27]/25 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onStartNewCase}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D95D39] to-[#C84B27] hover:from-[#C84B27] hover:to-[#B33E1C] text-white text-xs font-bold shadow-md shadow-[#D95D39]/20 transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Start New Resolution</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {cases.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#D95D39]/10 flex items-center justify-center text-[#D95D39] mx-auto mb-4 border border-[#E07A5F]/25 shadow-xs">
              <Clock className="w-6 h-6 text-[#D95D39]" />
            </div>
            <h3 className="text-base font-bold text-[#2B1E1A] font-outfit">No Previous Resolutions Yet</h3>
            <p className="text-xs text-[#2B1E1A]/60 mt-1.5 leading-relaxed">
              When you report a failed bank transfer, online vendor dispute, or telecom issue, your conversation history and official dispute letters will be safely archived here for your records.
            </p>
            <button
              onClick={onStartNewCase}
              className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D95D39] to-[#C84B27] hover:from-[#C84B27] hover:to-[#B33E1C] text-white text-xs font-bold shadow-md shadow-[#D95D39]/20 transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Resolve a Transaction Now</span>
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
                  className="group p-5 rounded-2xl bg-white/80 hover:bg-white border border-[#E07A5F]/20 hover:border-[#D95D39]/40 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D95D39]/10 text-[#D95D39] border border-[#D95D39]/20 uppercase tracking-wider">
                        {c.category ? c.category.replace(/_/g, " ") : "Resolution Case"}
                      </span>
                      <span className="text-xs text-[#2B1E1A]/30">&bull;</span>
                      <span className="text-xs text-[#2B1E1A]/60">{formattedDate}</span>
                      {c.document && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2CC8F]/30 text-[#C84B27] border border-[#E07A5F]/30">
                          <FileText className="w-3 h-3" />
                          <span>Letter Ready</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#2B1E1A] group-hover:text-[#D95D39] transition-colors truncate font-outfit">
                      {c.title}
                    </h4>

                    <p className="text-xs text-[#2B1E1A]/70 line-clamp-1">
                      {c.lastMessageSnippet || "Active resolution conversation."}
                    </p>

                    <div className="flex items-center space-x-4 pt-1 text-[11px] text-[#2B1E1A]/60">
                      {c.bankName && (
                        <span>Bank: <strong className="text-[#2B1E1A] font-semibold">{c.bankName}</strong></span>
                      )}
                      {c.amount_ngn && (
                        <span>Amount: <strong className="text-[#D95D39] font-bold">₦{c.amount_ngn.toLocaleString()}</strong></span>
                      )}
                      <span>Turns: <strong className="text-[#2B1E1A] font-semibold">{c.messages?.length || 0}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    {c.document && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoc(c.document || null);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#E07A5F]/25 text-[#2B1E1A] text-xs font-bold transition-all shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#D95D39]" />
                        <span>View Letter</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteCase(c.id, e)}
                      className="p-1.5 rounded-lg text-[#2B1E1A]/40 hover:text-[#C84B27] hover:bg-[#C84B27]/10 transition-colors"
                      title="Delete case"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-[#D95D39]/10 text-[#D95D39] flex items-center justify-center group-hover:bg-[#D95D39] group-hover:text-white transition-all">
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
        <div className="fixed inset-0 z-50 bg-[#2B1E1A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E07A5F]/25 overflow-hidden">
            <div className="p-5 border-b border-[#E07A5F]/20 flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#D95D39]" />
                <h3 className="text-sm font-bold text-[#2B1E1A] font-outfit">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-[#2B1E1A]/50 hover:text-[#2B1E1A] text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 bg-[#FAF6F0] border border-[#E07A5F]/20 rounded-xl font-mono text-xs text-[#2B1E1A] leading-relaxed whitespace-pre-wrap select-all">
                <div className="font-bold text-[#2B1E1A] pb-2 mb-2 border-b border-[#E07A5F]/20">
                  {selectedDoc.subject_line}
                </div>
                {selectedDoc.body_text}
                <div className="mt-4 pt-3 border-t border-[#E07A5F]/20 font-sans">
                  <span className="font-bold text-[#2B1E1A] block mb-1">Evidence Required:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs text-[#2B1E1A]/70">
                    {selectedDoc.formal_evidence_list.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-[#2B1E1A] block mb-1">Recipient Institution:</span>
                <p className="text-xs text-[#2B1E1A]/70">{selectedDoc.recipient_institution} ({selectedDoc.recipient_contact_info})</p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E07A5F]/20 bg-[#FAF6F0] flex items-center justify-end space-x-2">
              <button
                onClick={() => handleCopyDoc(selectedDoc)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E07A5F]/25 text-[#2B1E1A] text-xs font-bold hover:bg-[#FAF6F0] transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#D95D39]" /> : <Copy className="w-3.5 h-3.5 text-[#D95D39]" />}
                <span>{copied ? "Copied" : "Copy Letter"}</span>
              </button>
              <button
                onClick={() => handleDownloadDoc(selectedDoc)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D95D39] to-[#C84B27] hover:from-[#C84B27] hover:to-[#B33E1C] text-white text-xs font-bold shadow-md shadow-[#D95D39]/20 transition-all active:scale-95"
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
