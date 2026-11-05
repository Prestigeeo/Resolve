"use client";

import React, { useState } from "react";
import { 
  Scale, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  FileText, 
  Zap,
  Paperclip,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Building,
  User,
  Store,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { ExtractedCaseFacts, GeneratedDocument, ResolutionGuidance } from "../lib/api";

export interface ResolutionPlan {
  user_role?: "Customer" | "Vendor" | "Inquirer" | string;
  topic?: string;
  current_stage?: string;
  key_details?: {
    amount?: string;
    status?: string;
    institution?: string;
    channel?: string;
    session_id?: string;
  };
  suggested_actions?: string[];
  available_tools?: string[];
}

export interface CaseSlotData {
  issue_category?: string;
  claim_amount?: string;
  payment_method?: string;
  transaction_date?: string;
  merchant_or_bank?: string;
  session_id_or_ref?: string;
  evidence_count: number;
  evidence_files?: Array<{ name: string; type: string; date: string }>;
  current_step: 1 | 2 | 3;
  statutory_window?: string;
  quick_replies?: string[];
}

interface ResolutionCaseFileProps {
  facts: ExtractedCaseFacts | null;
  slotData?: CaseSlotData | null;
  resolutionPlan?: ResolutionPlan | null;
  guidance?: ResolutionGuidance | null;
  document?: GeneratedDocument | null;
  emergencyData?: any;
  onGenerateLetter?: () => void;
  onSelectTool?: (toolName: string) => void;
}

export function ResolutionCaseFile({
  facts,
  slotData,
  resolutionPlan,
  guidance,
  document,
  emergencyData,
  onGenerateLetter,
  onSelectTool
}: ResolutionCaseFileProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"plan" | "templates" | "mechanics">("plan");
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Derive Role & Topic
  const userRole = resolutionPlan?.user_role || (slotData?.merchant_or_bank?.toLowerCase().includes("customer") ? "Vendor" : "Customer");
  const topic = resolutionPlan?.topic || slotData?.issue_category || (facts?.category === "FAILED_TRANSFER" ? "Failed Bank Transfer" : facts?.category === "MERCHANT_NON_DELIVERY" ? "Order & Delivery Resolution" : "Transaction Resolution");
  const stage = resolutionPlan?.current_stage || (document ? "Formal Regulatory Escalation" : slotData?.current_step === 2 ? "Verification & Evidence" : "Diagnosis & Direct Resolution");

  // Derive Key Details
  const amountStr = resolutionPlan?.key_details?.amount || slotData?.claim_amount || (facts?.amount_ngn ? `₦${Number(facts.amount_ngn).toLocaleString()}` : "Pending confirmation");
  const statusStr = resolutionPlan?.key_details?.status || (facts?.category === "FAILED_TRANSFER" ? "Debited / Uncredited" : "Under Diagnosis");
  const institution = resolutionPlan?.key_details?.institution || slotData?.merchant_or_bank || facts?.sender_institution || "Financial Institution";
  const channel = resolutionPlan?.key_details?.channel || slotData?.payment_method || "Direct Bank Transfer / NIP";
  const sessionId = resolutionPlan?.key_details?.session_id || slotData?.session_id_or_ref || facts?.session_id_or_ref;

  // Actions
  const actions = resolutionPlan?.suggested_actions && resolutionPlan.suggested_actions.length > 0 
    ? resolutionPlan.suggested_actions 
    : [
        "Obtain 30-digit NIP Session ID from your bank mobile app",
        "Send polite payment proof to the counterparty",
        "Allow 24–72 hours for NIBSS daily interbank reconciliation"
      ];

  const tools = resolutionPlan?.available_tools && resolutionPlan.available_tools.length > 0
    ? resolutionPlan.available_tools
    : ["Friendly Message Template", "Bank Dispense Form Guide", "Official Dispute Letter"];

  const isEmergency = facts?.is_urgent_emergency;

  // Friendly Message Template Content
  const friendlyTemplateCustomer = `Hello, I'm checking in regarding my recent transfer of ${amountStr} made on ${slotData?.transaction_date || "recently"} via ${institution}. My bank indicates the debit was processed with NIP Session ID: ${sessionId || "[Attach 30-digit ID]"}. Could you please check with your bank's incoming settlement desk so we can confirm value? Thank you for your support!`;
  
  const friendlyTemplateVendor = `Hello, thank you for your order. We are actively tracking your payment of ${amountStr}. Our account has not yet reflected value. Could you kindly share your bank's official PDF receipt showing the 30-digit NIP Session ID so we can trace this directly with our bank? Once confirmed, your order will be prioritized immediately.`;

  const friendlyTemplate = userRole === "Vendor" ? friendlyTemplateVendor : friendlyTemplateCustomer;

  const handleCopyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  const handleCopyLetter = () => {
    if (!document) return;
    const fullText = `${document.subject_line}\n\n${document.body_text}\n\nEVIDENCE ATTACHED:\n${document.formal_evidence_list?.map((e) => `• ${e}`).join("\n") || "Transaction receipt"}\n\n${document.statutory_notice_clause || ""}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadLetter = () => {
    if (!document) return;
    const fullText = `${document.subject_line}\n\n${document.body_text}\n\nEVIDENCE ATTACHED:\n${document.formal_evidence_list?.map((e) => `• ${e}`).join("\n") || "Transaction receipt"}\n\n${document.statutory_notice_clause || ""}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `Resolution_Document_${facts?.category || "Dispute"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-md border border-[#E07A5F]/30 rounded-2xl shadow-xl shadow-[#2B1E1A]/5 overflow-hidden">
      
      {/* Top Header & Companion Role Badge */}
      <div className={`p-4 border-b flex items-start justify-between ${isEmergency ? "bg-[#C84B27]/10 border-[#C84B27]/30" : "bg-[#FAF6F0] border-[#E07A5F]/25"}`}>
        <div>
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center space-x-1 ${
              userRole === "Vendor" 
                ? "bg-[#E07A5F]/15 text-[#C84B27] border-[#E07A5F]/35" 
                : userRole === "Inquirer"
                ? "bg-[#F2CC8F]/30 text-[#8C2E0B] border-[#F2CC8F]/60"
                : "bg-[#D95D39]/10 text-[#C84B27] border-[#D95D39]/30"
            }`}>
              {userRole === "Vendor" ? <Store className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
              <span>{userRole} Companion</span>
            </span>

            <span className="text-[11px] font-semibold text-[#2B1E1A]/85">
              {topic}
            </span>
          </div>

          <h2 className="text-base font-extrabold text-[#2B1E1A] mt-1 font-outfit">
            Resolution Plan
          </h2>
        </div>

        <span className="text-[10px] font-bold text-[#8C2E0B] bg-[#F2CC8F]/30 border border-[#E07A5F]/30 px-2.5 py-1 rounded-lg shadow-2xs">
          Guide First
        </span>
      </div>

      {/* Emergency Lock Alert Banner (if applicable) */}
      {isEmergency && emergencyData && (
        <div className="bg-gradient-to-r from-[#D95D39] to-[#C84B27] text-white p-3.5 px-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#F2CC8F] animate-pulse shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold">{emergencyData.name} Freeze Code: </span>
              <strong className="underline decoration-white font-mono text-sm">{emergencyData.ussd_freeze_code}</strong>
            </div>
          </div>
          <a
            href={`tel:${encodeURIComponent(emergencyData.ussd_freeze_code)}`}
            className="bg-white hover:bg-[#FAF6F0] text-[#C84B27] text-xs font-black px-3 py-1 rounded-lg transition-all shadow-sm shrink-0"
          >
            Dial Now
          </a>
        </div>
      )}

      {/* Stage Stepper Banner */}
      <div className="px-4 py-2.5 bg-[#FAF6F0]/90 border-b border-[#E07A5F]/20 flex items-center justify-between text-xs font-semibold text-[#2B1E1A]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#D95D39] animate-pulse" />
          <span className="text-[11px] text-[#2B1E1A]/80 font-medium">Stage:</span>
          <span className="text-[11px] font-bold text-[#D95D39]">{stage}</span>
        </div>
        <span className="text-[10px] text-[#2B1E1A]/70 font-medium">CBN &bull; FCCPC Standards</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#E07A5F]/20 bg-[#FAF6F0]/60 px-3 pt-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("plan")}
          className={`px-3.5 py-2 border-b-2 transition-all ${activeTab === "plan" ? "border-[#D95D39] text-[#D95D39] font-bold bg-white rounded-t-lg shadow-2xs" : "border-transparent text-[#2B1E1A]/70 hover:text-[#2B1E1A]"}`}
        >
          Resolution Plan
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-3.5 py-2 border-b-2 transition-all ${activeTab === "templates" ? "border-[#D95D39] text-[#D95D39] font-bold bg-white rounded-t-lg shadow-2xs" : "border-transparent text-[#2B1E1A]/70 hover:text-[#2B1E1A]"}`}
        >
          Tools &amp; Templates {document ? "✓" : ""}
        </button>
        <button
          onClick={() => setActiveTab("mechanics")}
          className={`px-3.5 py-2 border-b-2 transition-all ${activeTab === "mechanics" ? "border-[#D95D39] text-[#D95D39] font-bold bg-white rounded-t-lg shadow-2xs" : "border-transparent text-[#2B1E1A]/70 hover:text-[#2B1E1A]"}`}
        >
          Banking Mechanics
        </button>
      </div>

      {/* Tab 1: Resolution Plan Dashboard */}
      {activeTab === "plan" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* 4 Structured Key Details Cards */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Amount */}
            <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/25 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#8C2E0B] uppercase tracking-wider">
                Claim Amount
              </span>
              <div className="my-1.5">
                <span className="text-sm font-extrabold text-[#D95D39] font-outfit">
                  {amountStr}
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#2B1E1A]/75">
                {institution}
              </span>
            </div>

            {/* Status */}
            <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/25 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#8C2E0B] uppercase tracking-wider">
                Current Status
              </span>
              <div className="my-1.5">
                <span className="text-xs font-bold text-[#2B1E1A] line-clamp-1">
                  {statusStr}
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#2B1E1A]/75">
                {channel}
              </span>
            </div>

            {/* Session ID / Evidence */}
            <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/25 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#8C2E0B] uppercase tracking-wider">
                NIP Session ID
              </span>
              <div className="my-1.5">
                <span className="text-xs font-mono font-bold text-[#2B1E1A] truncate block">
                  {sessionId ? `${sessionId.slice(0, 10)}...${sessionId.slice(-6)}` : "Pending receipt"}
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#C84B27]">
                {sessionId ? "Verified code" : "Needed from receipt"}
              </span>
            </div>

            {/* Resolution Window */}
            <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/25 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#8C2E0B] uppercase tracking-wider">
                Statutory Window
              </span>
              <div className="my-1.5">
                <span className="text-xs font-bold text-[#2B1E1A]">
                  CBN 14-Day SLA
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#C84B27]">
                FCCPA 7-Day Window
              </span>
            </div>

          </div>

          {/* Actionable Next Steps (2-3 realistic actions) */}
          <div className="p-4 rounded-xl bg-white border border-[#E07A5F]/25 shadow-xs">
            <h4 className="text-xs font-bold text-[#2B1E1A] mb-3 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D95D39]" />
                <span>Actionable Steps to Take Right Now</span>
              </span>
              <span className="text-[10px] font-semibold text-[#D95D39]">
                {actions.length} Steps
              </span>
            </h4>

            <div className="space-y-2.5">
              {actions.map((act, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-[#FAF6F0] border border-[#E07A5F]/15 text-xs text-[#2B1E1A]/90 font-medium">
                  <span className="w-5 h-5 rounded-full bg-[#D95D39] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="leading-snug">{act}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Resolution Tools */}
          <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/25 shadow-xs">
            <h4 className="text-xs font-bold text-[#2B1E1A] mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#D95D39]" />
              <span>Available Companion Tools</span>
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {tools.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab("templates");
                    if (onSelectTool) onSelectTool(t);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2CC8F]/30 border border-[#E07A5F]/30 text-xs font-bold text-[#2B1E1A] transition-all shadow-2xs hover:shadow-xs flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D95D39]" />
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Message Templates & Dispute Letter */}
      {activeTab === "templates" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Friendly Message Template Card */}
          <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/30 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E07A5F]/20">
              <div className="flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-[#D95D39]" />
                <h4 className="text-xs font-bold text-[#2B1E1A]">Friendly Communication Template</h4>
              </div>
              <button
                onClick={() => handleCopyTemplate(friendlyTemplate, "friendly")}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#F2CC8F]/30 border border-[#E07A5F]/30 rounded-md text-[11px] font-bold text-[#D95D39] transition-all shadow-2xs"
              >
                {copiedTemplate === "friendly" ? <Check className="w-3 h-3 text-[#D95D39]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTemplate === "friendly" ? "Copied" : "Copy Template"}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#2B1E1A]/75 mb-2">
              Send this via WhatsApp, Instagram DM, or email to resolve the issue cordially without escalation:
            </p>
            <div className="p-3 bg-white border border-[#E07A5F]/20 rounded-lg font-mono text-[11px] text-[#2B1E1A] leading-relaxed whitespace-pre-wrap select-all">
              {friendlyTemplate}
            </div>
          </div>

          {/* Bank Dispense Form Guide */}
          <div className="p-4 rounded-xl bg-white border border-[#E07A5F]/25 shadow-xs">
            <div className="flex items-center space-x-1.5 pb-2 mb-2 border-b border-[#E07A5F]/15">
              <Building className="w-4 h-4 text-[#D95D39]" />
              <h4 className="text-xs font-bold text-[#2B1E1A]">Bank Dispense Error Guide</h4>
            </div>
            <ul className="text-[11px] text-[#2B1E1A]/80 font-medium space-y-1.5 pl-4 list-disc">
              <li>Open your bank app customer service or dispense portal.</li>
              <li>Input the exact debit timestamp and account number.</li>
              <li>Paste the <strong>30-digit NIBSS Session ID</strong> (mandatory for interbank search).</li>
              <li>Save your <strong>Complaint Ticket ID</strong> (this starts the CBN 14-day resolution clock).</li>
            </ul>
          </div>

          {/* Official Dispute Letter */}
          <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/30 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E07A5F]/20">
              <div className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#D95D39]" />
                <h4 className="text-xs font-bold text-[#2B1E1A]">Formal Statutory Dispute Letter</h4>
              </div>
              {document && (
                <div className="flex space-x-1.5">
                  <button
                    onClick={handleCopyLetter}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#F2CC8F]/30 border border-[#E07A5F]/30 rounded-md text-[11px] font-bold text-[#D95D39] transition-all shadow-2xs"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#D95D39]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handleDownloadLetter}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#D95D39] hover:bg-[#C84B27] text-white rounded-md text-[11px] font-bold transition-all shadow-xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {document ? (
              <div className="p-3 bg-white border border-[#E07A5F]/20 rounded-lg font-mono text-[11px] text-[#2B1E1A] leading-relaxed whitespace-pre-wrap select-all max-h-60 overflow-y-auto">
                <strong>{document.subject_line}</strong>
                {"\n\n"}
                {document.body_text}
                {"\n\n"}
                <strong>EVIDENCE ATTACHED:</strong>
                {"\n"}
                {document.formal_evidence_list?.map((e) => `• ${e}`).join("\n") || "Transaction receipt"}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[11px] text-[#2B1E1A]/75">
                  Following the "Guide First, Letter Last" approach, formal letters are reserved for when direct resolution stalls.
                </p>
                {onGenerateLetter && (
                  <button
                    onClick={onGenerateLetter}
                    className="mt-3 inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-[#D95D39] hover:bg-[#C84B27] text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Generate Official Letter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Banking Mechanics & Regulations */}
      {activeTab === "mechanics" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="p-3 rounded-xl bg-[#F2CC8F]/30 border border-[#E07A5F]/25 text-xs text-[#2B1E1A] leading-relaxed">
            <div className="font-bold flex items-center space-x-1.5 mb-1 text-[#D95D39]">
              <Scale className="w-4 h-4 text-[#D95D39]" />
              <span>Understanding the Mechanics</span>
            </div>
            Why transactions delay and how Nigerian settlement infrastructure works under the hood.
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E07A5F]/25">
              <span className="text-[10px] font-bold text-[#D95D39] uppercase">NIP Switch Mechanics</span>
              <h5 className="font-bold text-[#2B1E1A] mt-0.5">Settlement Suspense Accounts</h5>
              <p className="text-[11px] text-[#2B1E1A]/80 mt-1 leading-relaxed">
                When an electronic transfer drops between sending and receiving banks, funds are quarantined in an interbank settlement suspense ledger. 85% auto-reverse during nightly NIBSS reconciliation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E07A5F]/25">
              <span className="text-[10px] font-bold text-[#E07A5F] uppercase">Account Restrictions</span>
              <h5 className="font-bold text-[#2B1E1A] mt-0.5">Post-No-Debit (PND) Orders</h5>
              <p className="text-[11px] text-[#2B1E1A]/80 mt-1 leading-relaxed">
                A PND is a temporary freeze placed on outward debits by a bank or court order. Inward credits are permitted. Resolved by KYC updates or contacting the issuing fraud desk.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E07A5F]/25">
              <span className="text-[10px] font-bold text-[#C84B27] uppercase">Statutory Rights</span>
              <h5 className="font-bold text-[#2B1E1A] mt-0.5">CBN 14-Day Resolution Clock</h5>
              <p className="text-[11px] text-[#2B1E1A]/80 mt-1 leading-relaxed">
                Commercial banks have 14 calendar days to investigate and resolve or reverse a lodged dispute before consumer escalation to the Central Bank of Nigeria Consumer Protection Department (cpd@cbn.gov.ng).
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
