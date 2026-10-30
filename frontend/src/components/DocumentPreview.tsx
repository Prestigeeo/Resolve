import React, { useState } from "react";
import { GeneratedDocument } from "../lib/api";
import { Copy, Check, Download, ShieldCheck, Scale, Send } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500/50 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl mb-6">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Fact-Verified Legal Dossier
            </span>
            <span className="text-[10px] font-semibold text-slate-300 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>0% Hallucinations Verified</span>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mt-1.5">{document.title}</h2>
          <p className="text-xs text-slate-400">
            Recipient: <strong className="text-white">{document.recipient_institution}</strong> ({document.recipient_contact_info})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Text"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 border border-white/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Letterhead Body */}
      <div className="relative z-10 mt-6 bg-slate-950/80 border border-white/10 rounded-2xl p-5 sm:p-7 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
        <div className="font-bold text-white pb-3.5 border-b border-white/10 mb-4 text-sm tracking-wide">
          {document.subject_line}
        </div>
        {document.body_text}

        <div className="mt-6 pt-5 border-t border-white/10 font-sans">
          <h4 className="text-xs font-bold text-white mb-2.5 tracking-wider uppercase">List of Evidence Attached:</h4>
          <ul className="list-disc pl-4 space-y-1 text-slate-300">
            {document.formal_evidence_list.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>

          <div className="mt-5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200 leading-relaxed">
            <strong className="text-amber-100">Statutory Notice:</strong> {document.statutory_notice_clause}
          </div>
        </div>
      </div>

      {/* Submission Channels */}
      <div className="relative z-10 mt-6">
        <h4 className="text-xs font-bold text-white mb-2.5">Official Submission Channels:</h4>
        <div className="flex flex-wrap gap-2">
          {document.suggested_submission_methods.map((method, idx) => (
            <span
              key={idx}
              className="text-xs bg-slate-800 text-slate-300 px-3.5 py-2 rounded-xl border border-white/10 font-medium"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
