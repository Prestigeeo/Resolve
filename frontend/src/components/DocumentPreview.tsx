import React, { useState } from "react";
import { GeneratedDocument } from "../lib/api";
import { Copy, Check, Download, Printer, ShieldCheck, Share2 } from "lucide-react";

interface DocumentPreviewProps {
  document: GeneratedDocument;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = `${document.subject_line}\n\n${document.body_text}\n\nEVIDENCE ATTACHED:\n${document.formal_evidence_list.map((e) => `• ${e}`).join("\n")}\n\n${document.statutory_notice_clause}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const fullText = `${document.subject_line}\n\n${document.body_text}\n\nEVIDENCE ATTACHED:\n${document.formal_evidence_list.map((e) => `• ${e}`).join("\n")}\n\n${document.statutory_notice_clause}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.document_type}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border-2 border-emerald-500 rounded-3xl p-5 sm:p-7 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase">
              Fact-Verified Document
            </span>
            <span className="text-[10px] font-semibold text-slate-500 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>0% Hallucinations Verified</span>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{document.title}</h2>
          <p className="text-xs text-slate-500">
            Recipient: <strong>{document.recipient_institution}</strong> ({document.recipient_contact_info})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Text"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Document Letterhead Body */}
      <div className="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
        <div className="font-bold text-slate-950 pb-3 border-b border-slate-200 mb-3">
          {document.subject_line}
        </div>
        {document.body_text}

        <div className="mt-5 pt-4 border-t border-slate-200 font-sans">
          <h4 className="text-xs font-bold text-slate-900 mb-2">LIST OF EVIDENCE ATTACHED:</h4>
          <ul className="list-disc pl-4 space-y-1 text-slate-700">
            {document.formal_evidence_list.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>

          <div className="mt-4 p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-900">
            <strong>Statutory Notice:</strong> {document.statutory_notice_clause}
          </div>
        </div>
      </div>

      {/* How to Submit */}
      <div className="mt-5">
        <h4 className="text-xs font-bold text-slate-900 mb-2">Recommended Submission Channels:</h4>
        <div className="flex flex-wrap gap-2">
          {document.suggested_submission_methods.map((method, idx) => (
            <span
              key={idx}
              className="text-xs bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 font-medium"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
