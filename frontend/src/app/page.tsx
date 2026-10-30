"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "../components/Header";
import { EmergencyBanner } from "../components/EmergencyBanner";
import { api, IntakeAnalysisResponse, ResolutionGuidance, GeneratedDocument, ExtractedCaseFacts } from "../lib/api";
import { 
  Send, Sparkles, Scale, Shield, AlertTriangle, CheckCircle2, Copy, Check, Download, 
  ExternalLink, Clock, RefreshCw, Smartphone, ShoppingBag, ArrowRight, BookOpen, 
  HelpCircle, ChevronRight, Zap, Lock, MessageSquare, Plus, FileText, Share2
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "resolve";
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  emergencyData?: any;
  interactiveOptions?: Array<{ label: string; value: string; field: string }>;
  evidenceChecklist?: Array<{ id: string; title: string; description: string; is_mandatory: boolean }>;
  document?: GeneratedDocument;
  guidance?: ResolutionGuidance;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"intake" | "emergency" | "tracker" | "sources">("intake");
  const [emergencyCodes, setEmergencyCodes] = useState<Record<string, any>>({});
  const [sources, setSources] = useState<any[]>([]);

  // Conversational State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Active Case Tracking
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [caseAccessToken, setCaseAccessToken] = useState<string | null>(null);
  const [currentFacts, setCurrentFacts] = useState<ExtractedCaseFacts | null>(null);
  const [pendingField, setPendingField] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    api.getEmergencyCodes().then(setEmergencyCodes).catch(console.error);
    api.getSources().then(setSources).catch(console.error);

    // Initial greeting from Resolve Advocate
    const welcomeMessage: ChatMessage = {
      id: "msg_welcome",
      sender: "resolve",
      text: "Hello! I am **Resolve**, your dedicated AI consumer resolution advocate for Nigeria.\n\nWhether you were debited for a **failed bank transfer**, bought **airtime/data that was never credited**, had your **phone stolen / account compromised**, or paid an **online vendor who refused to deliver**—I will help you take the exact legally backed next step under **CBN, NCC, or FCCPC** regulations.\n\nTell me: **What happened with your transaction?**",
      timestamp: "Just now",
      interactiveOptions: [
        { label: "💸 Failed Bank Transfer", value: "I was debited for a bank transfer that the recipient never received.", field: "quick_start" },
        { label: "📦 Vendor Refused Delivery", value: "I paid an online vendor who failed to deliver and blocked me.", field: "quick_start" },
        { label: "📶 Airtime/Data Not Credited", value: "My bank debited me for airtime/data but my phone was never credited.", field: "quick_start" },
        { label: "🚨 Snatched Phone / Scam", value: "My phone was snatched or account compromised! Help me lock it!", field: "quick_start" }
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle User Sending a Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    setInputText("");

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // If we have an active case and were waiting for a specific question answer
      if (activeCaseId && caseAccessToken && pendingField) {
        const answers: Record<string, any> = { [pendingField]: text };
        const clarifyRes = await api.submitClarification(activeCaseId, caseAccessToken, answers);
        setCurrentFacts(clarifyRes.facts);
        setPendingField(null);

        // Fetch guidance & document
        const details = await api.getCaseDetails(activeCaseId, caseAccessToken);
        const doc = await api.generateDocument(activeCaseId, caseAccessToken, clarifyRes.facts);

        const aiReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: `Got it! I have recorded: **${text}**.\n\n${clarifyRes.message}\n\nHere is your verified resolution pathway under **${details.guidance.citations[0]?.publisher || "Nigerian Regulations"}**:`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidance: details.guidance,
          evidenceChecklist: details.guidance.evidence_checklist,
          document: doc
        };
        setMessages((prev) => [...prev, aiReply]);
        setIsTyping(false);
        return;
      }

      // Initial Intake Analysis
      const intakeRes = await api.analyzeIntake(text);
      setActiveCaseId(intakeRes.case_id);
      setCaseAccessToken(intakeRes.case_access_token);
      setCurrentFacts(intakeRes.facts);

      // Scenario 1: Active Emergency Fraud detected
      if (intakeRes.is_urgent_emergency) {
        const emergencyReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: "⚠️ **ACTIVE THEFT / FRAUD EMERGENCY DETECTED!**\n\nYour immediate priority is freezing your account before visiting a branch. Below is your bank's instant USSD kill-switch code. Dial it from **ANY borrowed phone** immediately to stop unauthorized withdrawals:",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isEmergency: true,
          emergencyData: intakeRes.emergency_instructions || emergencyCodes["GTBANK"]
        };
        setMessages((prev) => [...prev, emergencyReply]);
        setIsTyping(false);
        return;
      }

      // Scenario 2: Needs Clarification (Investigative Evidence Gate)
      if (intakeRes.case_status === "NEEDS_CLARIFICATION" && intakeRes.clarifying_questions.length > 0) {
        const nextQ = intakeRes.clarifying_questions[0];
        setPendingField(nextQ.field_target);

        let options: Array<{ label: string; value: string; field: string }> | undefined;
        if (nextQ.options) {
          options = nextQ.options.map((opt) => ({ label: opt, value: opt, field: nextQ.field_target }));
        } else if (nextQ.field_target === "amount_ngn") {
          options = [
            { label: "₦10,000", value: "10000", field: "amount_ngn" },
            { label: "₦25,000", value: "25000", field: "amount_ngn" },
            { label: "₦45,000", value: "45000", field: "amount_ngn" },
            { label: "₦100,000", value: "100000", field: "amount_ngn" }
          ];
        }

        const questionReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: `I have classified this issue under **${intakeRes.facts.category.replace(/_/g, " ")}**.\n\nTo ensure your complaint complies with official regulatory standards, I need one critical piece of evidence:\n\n👉 **${nextQ.question_text}**\n\n*${nextQ.help_text || ""}*`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          interactiveOptions: options
        };
        setMessages((prev) => [...prev, questionReply]);
        setIsTyping(false);
        return;
      }

      // Scenario 3: Complete & Ready for Complaint
      const details = await api.getCaseDetails(intakeRes.case_id, intakeRes.case_access_token);
      const doc = await api.generateDocument(intakeRes.case_id, intakeRes.case_access_token, intakeRes.facts);

      const successReply: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        sender: "resolve",
        text: `✅ **Verified Case Facts:** Your dispute is structured under **${intakeRes.facts.category.replace(/_/g, " ")}**.\n\n${intakeRes.message}\n\nHere is your verified resolution timeline and your formal, grounded dispute dossier ready to lodge:`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        guidance: details.guidance,
        evidenceChecklist: details.guidance.evidence_checklist,
        document: doc
      };
      setMessages((prev) => [...prev, successReply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: "msg_err_" + Date.now(),
        sender: "resolve",
        text: "I experienced a temporary network issue connecting to the regulatory engine. Please try asking again.",
        timestamp: "Now"
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (value: string) => {
    handleSendMessage(value);
  };

  const handleCopyDocument = (doc: GeneratedDocument, docId: string) => {
    const fullText = `${doc.subject_line}\n\n${doc.body_text}\n\nEVIDENCE ATTACHED:\n${doc.formal_evidence_list.map((e) => `• ${e}`).join("\n")}\n\n${doc.statutory_notice_clause}`;
    navigator.clipboard.writeText(fullText);
    setCopiedDocId(docId);
    setTimeout(() => setCopiedDocId(null), 2500);
  };

  const handleDownloadDocument = (doc: GeneratedDocument) => {
    const fullText = `${doc.subject_line}\n\n${doc.body_text}\n\nEVIDENCE ATTACHED:\n${doc.formal_evidence_list.map((e) => `• ${e}`).join("\n")}\n\n${doc.statutory_notice_clause}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.document_type}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startNewChat = () => {
    setActiveCaseId(null);
    setCaseAccessToken(null);
    setCurrentFacts(null);
    setPendingField(null);
    setMessages([
      {
        id: "msg_new",
        sender: "resolve",
        text: "Started a new complaint session. Tell me what happened with your transaction:",
        timestamp: "Just now",
        interactiveOptions: [
          { label: "💸 Failed Bank Transfer", value: "I transferred money via my bank app and it failed to credit recipient.", field: "quick_start" },
          { label: "📦 Defaulting Vendor", value: "Paid an Instagram/WhatsApp merchant who refused to deliver.", field: "quick_start" },
          { label: "📶 Undelivered Airtime/Data", value: "Debited for airtime or data bundle but didn't receive value.", field: "quick_start" },
          { label: "🚨 Snatched Phone Fraud", value: "My phone was stolen, please give me the instant bank lock codes!", field: "quick_start" }
        ]
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 flex flex-col h-[calc(100vh-70px)]">
        
        {/* View: Regulators / Knowledge Base */}
        {activeTab === "sources" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0E1526]/90 border border-purple-500/20 rounded-3xl backdrop-blur-xl mb-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
              <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-purple-600/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Verified Regulatory Authorities in Nigeria</h2>
                <p className="text-xs text-slate-400">Statutory dispute frameworks backing every recommendation in Resolve.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {sources.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-[#090D1A] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {s.publisher}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2">{s.title}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{s.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-amber-400">{s.statutory_basis}</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-sky-400 hover:text-sky-300"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View: Emergency USSD Directory */}
        {activeTab === "emergency" && (
          <div className="flex-1 overflow-y-auto mb-4">
            <EmergencyBanner emergencyCodes={emergencyCodes} />
          </div>
        )}

        {/* View: Conversational Chat Canvas (ChatGPT for Financial Resolution) */}
        {activeTab === "intake" && (
          <div className="flex-1 flex flex-col bg-[#0B101E]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
            {/* Chat Canvas Topbar */}
            <div className="px-5 py-3 bg-[#0E1528] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>Resolve AI Advocate</span>
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">
                    CBN • NCC • FCCPC Statutory Framework
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={startNewChat}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white border border-white/10 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Dispute</span>
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md"
                      : "bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 text-white shadow-md shadow-blue-600/30"
                  }`}>
                    {msg.sender === "user" ? "You" : <Scale className="w-4 h-4 text-white" />}
                  </div>

                  {/* Message Bubble Content */}
                  <div className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/20 font-medium"
                      : "bg-[#0F172A] border border-white/10 text-slate-200 shadow-md"
                  }`}>
                    {/* Formatted Text */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text.split("\n\n").map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split("**").map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-white font-extrabold">{part}</strong> : part
                          )}
                        </p>
                      ))}
                    </div>

                    {/* Emergency Kill-Switch Widget (Rendered in Chat Bubble) */}
                    {msg.isEmergency && msg.emergencyData && (
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-rose-950/60 to-red-950/40 border border-rose-500/30">
                        <h4 className="text-xs font-bold text-white flex items-center space-x-1.5 mb-2">
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                          <span>{msg.emergencyData.name} Instant Freeze:</span>
                        </h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          <a
                            href={`tel:${encodeURIComponent(msg.emergencyData.ussd_freeze_code)}`}
                            className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-rose-600/30"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Dial USSD: {msg.emergencyData.ussd_freeze_code}</span>
                          </a>
                          <span className="text-[11px] text-rose-200">
                            Or 24/7 Hotline: <strong>{msg.emergencyData.fraud_desk_phone}</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Interactive Clickable Quick Options */}
                    {msg.interactiveOptions && msg.interactiveOptions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                          Select an option or type your reply:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.interactiveOptions.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(opt.value)}
                              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-950 to-purple-950 hover:from-indigo-900 hover:to-purple-900 text-sky-300 border border-indigo-500/30 hover:border-sky-400 transition-all shadow-sm active:scale-95"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Resolution Roadmap Widget */}
                    {msg.guidance && (
                      <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#090E1B] border border-blue-500/30">
                        <div className="flex items-center space-x-2 text-sky-400 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-wider">Official Resolution Roadmap</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white mb-3">{msg.guidance.summary}</h4>

                        <div className="space-y-2.5">
                          {msg.guidance.action_steps.map((st) => (
                            <div key={st.step_number} className="p-3 rounded-xl bg-slate-900/90 border border-white/5 flex items-start space-x-3">
                              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                {st.step_number}
                              </span>
                              <div>
                                <h5 className="text-xs font-bold text-white">{st.title}</h5>
                                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{st.description}</p>
                                {st.deadline_or_sla && (
                                  <span className="inline-block mt-1 text-[10px] text-amber-400 font-semibold">
                                    ⏱ Timeline: {st.deadline_or_sla}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official Grounded Dossier Card (Rendered Directly in Thread) */}
                    {msg.document && (
                      <div className="mt-5 p-5 rounded-2xl bg-gradient-to-b from-[#0E1528] to-[#0A0F1D] border-2 border-purple-500/40 shadow-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/10 gap-2.5">
                          <div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-widest">
                              Official Formal Document Ready
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">{msg.document.title}</h4>
                            <p className="text-[11px] text-slate-400">
                              Recipient: <strong>{msg.document.recipient_institution}</strong>
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyDocument(msg.document!, msg.id)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition-all shadow-sm"
                            >
                              {copiedDocId === msg.id ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedDocId === msg.id ? "Copied!" : "Copy Text"}</span>
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(msg.document!)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download .txt</span>
                            </button>
                          </div>
                        </div>

                        {/* Monospace Letter Body */}
                        <div className="mt-4 p-4 rounded-xl bg-[#060914] border border-white/10 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
                          <div className="font-bold text-white pb-2 mb-2 border-b border-white/10 text-xs">
                            {msg.document.subject_line}
                          </div>
                          {msg.document.body_text}
                          <div className="mt-4 pt-3 border-t border-white/10 font-sans">
                            <span className="text-[11px] font-bold text-white block mb-1">EVIDENCE CHECKLIST:</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                              {msg.document.formal_evidence_list.map((ev, i) => (
                                <li key={i}>{ev}</li>
                              ))}
                            </ul>
                            <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200">
                              <strong>Statutory Clause:</strong> {msg.document.statutory_notice_clause}
                            </div>
                          </div>
                        </div>

                        {/* Submission Methods */}
                        <div className="mt-4">
                          <span className="text-[11px] font-bold text-white block mb-1.5">Where to Submit:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.document.suggested_submission_methods.map((method, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-white/10 font-medium"
                              >
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Animation */}
              {isTyping && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-400 font-medium ml-2">Resolve is reviewing Nigerian regulations...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Floating Command Bar */}
            <div className="p-3 sm:p-4 bg-[#0B101E] border-t border-white/[0.08]">
              {/* Quick Prompt Starters */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2.5 scrollbar-none text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Quick Ask:</span>
                <button
                  type="button"
                  onClick={() => handleSendMessage("I transferred ₦25,000 from GTBank to OPay with Session ID 100004241030123456789012345678 but money no enter.")}
                  className="px-3 py-1 rounded-xl bg-[#121A30] hover:bg-[#1C284C] text-slate-300 border border-white/5 shrink-0 transition-all text-xs"
                >
                  Failed ₦25k GTBank to OPay
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("I paid an Instagram boutique ₦45,000 for dresses and she blocked me on WhatsApp after promising delivery yesterday.")}
                  className="px-3 py-1 rounded-xl bg-[#121A30] hover:bg-[#1C284C] text-slate-300 border border-white/5 shrink-0 transition-all text-xs"
                >
                  IG Boutique Blocked Me (₦45k)
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("I bought ₦5,000 MTN data on Access Bank app, debited but no data dropped on my line.")}
                  className="px-3 py-1 rounded-xl bg-[#121A30] hover:bg-[#1C284C] text-slate-300 border border-white/5 shrink-0 transition-all text-xs"
                >
                  ₦5,000 MTN Data VTU Failure
                </button>
              </div>

              {/* Chat Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center bg-[#070B16] rounded-2xl border border-white/15 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 p-1.5 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe your dispute, amount, bank, or vendor details..."
                  className="flex-1 bg-transparent px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-600/30 transition-all shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-2 text-center text-[10px] text-slate-500">
                Resolve is an AI consumer advocate decision system. All advice is grounded in verified CBN, NCC, and FCCPA statutory guidelines.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
