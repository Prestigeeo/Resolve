"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "../components/Header";
import { EmergencyBanner } from "../components/EmergencyBanner";
import { 
  api, 
  IntakeAnalysisResponse, 
  ResolutionGuidance, 
  GeneratedDocument, 
  ExtractedCaseFacts 
} from "../lib/api";
import { 
  Send, 
  Sparkles, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Clock, 
  RefreshCw, 
  Smartphone, 
  ShoppingBag, 
  ArrowRight, 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  Zap, 
  Lock, 
  MessageSquare, 
  Plus, 
  FileText, 
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Info
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "resolve";
  text: string;
  timestamp: string;
  empatheticIntro?: string;
  immediateAdvice?: string;
  isEmergency?: boolean;
  emergencyData?: any;
  interactiveOptions?: Array<{ label: string; value: string; field: string }>;
  evidenceChecklist?: Array<{ id: string; title: string; description: string; is_mandatory: boolean }>;
  document?: GeneratedDocument;
  guidance?: ResolutionGuidance;
  showDraftButton?: boolean;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"intake" | "emergency" | "tracker" | "sources" | "guide">("intake");
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
      text: "Hello! I am Resolve, your personal transaction dispute assistant for Nigeria.\n\nIf you experienced a failed transfer, missing airtime, an online vendor refusing delivery, or an unauthorized debit, I will help you sort it out step by step under CBN, NCC, or FCCPC rules.\n\nTell me what happened, or tap one of the common issues below to begin:",
      timestamp: "Just now",
      interactiveOptions: [
        { label: "Failed Bank Transfer", value: "I was debited for a transfer and the recipient never received the money.", field: "quick_start" },
        { label: "Vendor Refused Delivery", value: "I paid an online vendor on Instagram or WhatsApp and they stopped responding.", field: "quick_start" },
        { label: "Missing Airtime / Data", value: "My bank debited me for airtime or data, but my phone was never credited.", field: "quick_start" },
        { label: "Stolen Phone / Card Alert", value: "My phone was stolen or I noticed an unauthorized debit on my account.", field: "quick_start" }
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
      // Check if user is explicitly asking for a formal letter
      const wantsDocument = /draft|letter|petition|official document|demand notice|complaint letter/i.test(text);

      if (wantsDocument && (currentFacts || activeCaseId)) {
        const doc = await api.generateDocument(activeCaseId || undefined, caseAccessToken || undefined, currentFacts || undefined);
        const docReply: ChatMessage = {
          id: "msg_ai_doc_" + Date.now(),
          sender: "resolve",
          text: "Here is your official dispute letter, ready to send to your bank or the regulator. You can copy it or download it below:",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          document: doc
        };
        setMessages((prev) => [...prev, docReply]);
        setIsTyping(false);
        return;
      }

      // If we have an active case and were waiting for a specific question answer
      if (activeCaseId && caseAccessToken && pendingField) {
        const answers: Record<string, any> = { [pendingField]: text };
        const clarifyRes = await api.submitClarification(activeCaseId, caseAccessToken, answers);
        setCurrentFacts(clarifyRes.facts);
        setPendingField(null);

        // Fetch guidance
        const details = await api.getCaseDetails(activeCaseId, caseAccessToken);

        let followUpText = `Got it, I have noted that: **${text}**.\n\nHere is what you should do right now:`;
        
        // Practical, calm guidance
        if (clarifyRes.facts.category === "FAILED_TRANSFER") {
          followUpText = `Thank you for sharing that. Here is your direct plan of action:\n\n1. **Locate your 30-digit NIBSS Session ID**: Check your transaction receipt or bank statement. This 30-digit number is the master proof the receiving bank uses to confirm where the money is.\n2. **Share with Recipient**: Send the 30-digit Session ID to the person you sent money to. They can give it to their bank to verify if it entered their backend ledger.\n3. **Log Complaint with Your Bank**: If it does not reverse within 24 to 72 hours, open your bank app, tap Dispute / Help, paste the Session ID, and request a tracking Ticket ID.\n4. **14-Day Resolution Window**: Under Central Bank of Nigeria (CBN) rules, your bank has 14 days to resolve this. If they refuse after 14 days, you can escalate directly to the CBN Consumer Protection Department (cpd@cbn.gov.ng).`;
        }

        const aiReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: followUpText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidance: details.guidance,
          evidenceChecklist: details.guidance.evidence_checklist,
          interactiveOptions: [
            { label: "Create Official Complaint Letter", value: "Please draft my formal complaint letter now.", field: "action_request" },
            { label: "How do I find the Session ID?", value: "How do I find the 30-digit NIBSS Session ID on my bank receipt?", field: "help_request" }
          ],
          showDraftButton: true
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
          text: "Active emergency: Freeze your account immediately to prevent further withdrawals.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          empatheticIntro: intakeRes.empathetic_intro || "Please stay calm. Having your phone stolen or watching unauthorized debits happen is deeply frightening, but taking action right now will protect your balance. Your immediate priority is locking your account before visiting a branch.",
          immediateAdvice: intakeRes.immediate_advice || "Dial your bank's emergency USSD code from any borrowed phone right now to lock mobile and card transactions.",
          isEmergency: true,
          emergencyData: intakeRes.emergency_instructions || emergencyCodes["GTBANK"],
          interactiveOptions: intakeRes.action_chips || [
            { label: "I have locked my account", value: "I dialed the USSD code and locked my account. What is the next step?", field: "emergency_status" },
            { label: "My banking SIM was also stolen", value: "My SIM card was stolen with the phone.", field: "emergency_status" }
          ]
        };
        setMessages((prev) => [...prev, emergencyReply]);
        setIsTyping(false);
        return;
      }

      // Scenario 2: Conversational Triage with ONE Focused Follow-up Question
      if (intakeRes.clarifying_questions && intakeRes.clarifying_questions.length > 0) {
        const nextQ = intakeRes.clarifying_questions[0];
        setPendingField(nextQ.field_target);

        // Keep options simple: at most 2 or 3 clear options
        let options = intakeRes.action_chips;
        if (!options || options.length === 0) {
          if (nextQ.options) {
            options = nextQ.options.slice(0, 3).map((opt) => ({ label: opt, value: opt, field: nextQ.field_target }));
          } else {
            options = [
              { label: "Happened within last 48 hours", value: "It happened within the last 48 hours.", field: "timeline" },
              { label: "Over 14 days ago without refund", value: "It has been more than 14 days with no refund.", field: "timeline" }
            ];
          }
        }

        const conversationalReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: nextQ.question_text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          empatheticIntro: intakeRes.empathetic_intro,
          immediateAdvice: intakeRes.immediate_advice,
          interactiveOptions: options ? options.slice(0, 3) : undefined
        };
        setMessages((prev) => [...prev, conversationalReply]);
        setIsTyping(false);
        return;
      }

      // Scenario 3: Complete & Ready for Action Guidance
      const details = await api.getCaseDetails(intakeRes.case_id, intakeRes.case_access_token);

      const successReply: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        sender: "resolve",
        text: `I have reviewed the facts of your dispute under **${intakeRes.facts.category.replace(/_/g, " ")}**.\n\nHere is your immediate action roadmap to get this resolved:`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        empatheticIntro: intakeRes.empathetic_intro,
        immediateAdvice: intakeRes.immediate_advice,
        guidance: details.guidance,
        evidenceChecklist: details.guidance.evidence_checklist,
        interactiveOptions: [
          { label: "Create Official Complaint Letter", value: "Please draft my formal complaint letter now.", field: "action_request" }
        ],
        showDraftButton: true
      };
      setMessages((prev) => [...prev, successReply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: "msg_err_" + Date.now(),
        sender: "resolve",
        text: "I experienced a temporary network issue. Please select an option below or send your message again.",
        timestamp: "Now",
        interactiveOptions: [
          { label: "Failed Bank Transfer", value: "I was debited for a bank transfer that failed to credit.", field: "quick_start" },
          { label: "Vendor Refused Delivery", value: "Paid an online vendor who refused to deliver.", field: "quick_start" }
        ]
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (value: string) => {
    handleSendMessage(value);
  };

  const handleGenerateOfficialDocument = async () => {
    setIsTyping(true);
    try {
      const doc = await api.generateDocument(activeCaseId || undefined, caseAccessToken || undefined, currentFacts || undefined);
      const docReply: ChatMessage = {
        id: "msg_ai_doc_" + Date.now(),
        sender: "resolve",
        text: "Here is your official dispute letter, ready to send to your bank or the regulator. You can copy it or download it below:",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        document: doc
      };
      setMessages((prev) => [...prev, docReply]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyDocument = (doc: GeneratedDocument, docId: string) => {
    const fullText = `${doc.subject_line}\n\n${doc.body_text}\n\nEVIDENCE ATTACHED:\n${doc.formal_evidence_list.map((e) => `- ${e}`).join("\n")}\n\n${doc.statutory_notice_clause}`;
    navigator.clipboard.writeText(fullText);
    setCopiedDocId(docId);
    setTimeout(() => setCopiedDocId(null), 2500);
  };

  const handleDownloadDocument = (doc: GeneratedDocument) => {
    const fullText = `${doc.subject_line}\n\n${doc.body_text}\n\nEVIDENCE ATTACHED:\n${doc.formal_evidence_list.map((e) => `- ${e}`).join("\n")}\n\n${doc.statutory_notice_clause}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.document_type.toLowerCase()}.txt`;
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
        text: "Started a fresh complaint session. Tell me what happened with your transaction:",
        timestamp: "Just now",
        interactiveOptions: [
          { label: "Failed Bank Transfer", value: "I transferred money via my bank and recipient was not credited.", field: "quick_start" },
          { label: "Vendor Refused Delivery", value: "Paid an Instagram or WhatsApp vendor who refused delivery.", field: "quick_start" },
          { label: "Undelivered Airtime / Data", value: "Debited for airtime or data bundle but didn't receive value.", field: "quick_start" },
          { label: "Snatched Phone / Scam", value: "My phone was stolen, please give me the instant bank lock codes!", field: "quick_start" }
        ]
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 antialiased">
      {/* Clean Light Menu Bar */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNewChat={startNewChat}
        caseCategory={currentFacts?.category}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col h-[calc(100vh-68px)]">
        
        {/* View: How Redress Works Guide */}
        {activeTab === "guide" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center space-x-3 pb-5 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">How Redress Works in Nigeria</h2>
                <p className="text-xs text-slate-500">Your consumer rights under Central Bank of Nigeria, NCC, and FCCPC regulations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4" />
                  <span>CBN 14-Day Rule</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Failed Bank Transfers</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  When money leaves your account without reaching the recipient:
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                  <li><strong>First 24–72 hours:</strong> Over 85% of failed debits auto-reverse via daily interbank NIP reconciliation.</li>
                  <li><strong>Lodge ticket with Session ID:</strong> If unreversed, submit the 30-digit Session ID to your bank support.</li>
                  <li><strong>14-Day Window:</strong> Banks have 14 days to resolve the complaint before you can escalate directly to the CBN Consumer Protection Department (<strong>cpd@cbn.gov.ng</strong>).</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span>FCCPA 2018 Protections</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Online Vendor Non-Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Under the Federal Competition and Consumer Protection Act (FCCPA) 2018:
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                  <li><strong>Online Checkout:</strong> If paid via Paystack or Flutterwave, dispute on their lookup portal to hold merchant payouts.</li>
                  <li><strong>7-Day Demand Notice:</strong> Send a formal notice giving 7 days to deliver or refund in full.</li>
                  <li><strong>FCCPC Portal:</strong> If unfulfilled after 7 days, file directly on <strong>complaints.fccpc.gov.ng</strong>.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Smartphone className="w-4 h-4" />
                  <span>NCC Toll-Free 622</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Airtime & Data Purchases</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  When airtime or data is debited on your bank app but not received:
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                  <li><strong>Report to your Bank:</strong> The issue is usually between your bank and the VTU aggregator, not the telco.</li>
                  <li><strong>NCC 622:</strong> If unresolved after 72 hours, dial Toll-Free 622 from any phone.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Lock className="w-4 h-4" />
                  <span>Emergency Fraud Freeze</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Stolen Phones & Fraud Alerts</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  If your phone was stolen or money is moving unauthorized:
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                  <li><strong>Dial USSD code:</strong> Use any borrowed phone immediately to dial your bank's freeze code.</li>
                  <li><strong>Block SIM:</strong> Contact your telecom network to hotlist your SIM so thieves cannot get OTPs.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* View: Official Regulators */}
        {activeTab === "sources" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center space-x-3 pb-5 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Official Nigerian Regulatory Portals</h2>
                <p className="text-xs text-slate-500">The statutory dispute frameworks backing every recommendation in Resolve.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {sources.map((s) => (
                <div key={s.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {s.publisher}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{s.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-amber-700">{s.statutory_basis}</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
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

        {/* View: Conversational Chat Assistant (Clean, Focused, Friendly) */}
        {activeTab === "intake" && (
          <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Top Sub-Bar */}
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Resolve Dispute Assistant</h3>
                <span className="text-[11px] text-slate-400 hidden sm:inline">&bull; CBN, NCC &amp; FCCPC Guidelines</span>
              </div>

              {currentFacts?.category && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 capitalize">
                  {currentFacts.category.replace(/_/g, " ").toLowerCase()}
                </span>
              )}
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {msg.sender === "user" ? "You" : <Scale className="w-4 h-4 text-blue-600" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[90%] sm:max-w-xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white shadow-sm font-medium"
                      : "bg-slate-50 border border-slate-200 text-slate-800 shadow-xs"
                  }`}>
                    
                    {/* Empathetic Intro */}
                    {msg.empatheticIntro && (
                      <div className="mb-2.5 pb-2.5 border-b border-slate-200/80 text-slate-600 font-normal leading-relaxed text-xs sm:text-sm">
                        {msg.empatheticIntro}
                      </div>
                    )}

                    {/* Immediate Advice */}
                    {msg.immediateAdvice && (
                      <div className="mb-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                        <div className="font-bold flex items-center space-x-1.5 mb-0.5">
                          <Info className="w-3.5 h-3.5 text-blue-600" />
                          <span>Immediate Guidance:</span>
                        </div>
                        {msg.immediateAdvice}
                      </div>
                    )}

                    {/* Main Text */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text.split("\n\n").map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split("**").map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part
                          )}
                        </p>
                      ))}
                    </div>

                    {/* Emergency Kill-Switch Widget */}
                    {msg.isEmergency && msg.emergencyData && (
                      <div className="mt-3.5 p-4 rounded-xl bg-rose-50 border border-rose-200">
                        <h4 className="text-xs font-bold text-rose-900 flex items-center space-x-1.5 mb-1">
                          <Lock className="w-3.5 h-3.5 text-rose-600" />
                          <span>{msg.emergencyData.name} Freeze Code:</span>
                        </h4>
                        <p className="text-xs text-rose-800 mb-2.5">{msg.emergencyData.action_prompt}</p>
                        <div className="flex flex-wrap gap-2 items-center">
                          <a
                            href={`tel:${encodeURIComponent(msg.emergencyData.ussd_freeze_code)}`}
                            className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Dial USSD: {msg.emergencyData.ussd_freeze_code}</span>
                          </a>
                          {msg.emergencyData.fraud_desk_phone && (
                            <span className="text-[11px] text-rose-700">
                              Hotline: <strong>{msg.emergencyData.fraud_desk_phone}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interactive Quick-Reply Pills (At most 2-3 focused pills) */}
                    {msg.interactiveOptions && msg.interactiveOptions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/80">
                        <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                          Select a reply or type below:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.interactiveOptions.slice(0, 3).map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(opt.value)}
                              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs transition-all active:scale-95 text-left"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official Dispute Letter Card */}
                    {msg.document && (
                      <div className="mt-4 p-4 rounded-xl bg-white border border-slate-300 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                              Official Dispute Letter
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">{msg.document.title}</h4>
                            <p className="text-xs text-slate-500">
                              To: <strong>{msg.document.recipient_institution}</strong>
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyDocument(msg.document!, msg.id)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
                            >
                              {copiedDocId === msg.id ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedDocId === msg.id ? "Copied" : "Copy"}</span>
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(msg.document!)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>

                        {/* Letter Text Preview */}
                        <div className="mt-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-all">
                          <div className="font-bold text-slate-900 pb-1.5 mb-1.5 border-b border-slate-200">
                            {msg.document.subject_line}
                          </div>
                          {msg.document.body_text}
                          <div className="mt-3 pt-2.5 border-t border-slate-200 font-sans">
                            <span className="text-xs font-bold text-slate-900 block mb-1">Evidence Required:</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-600">
                              {msg.document.formal_evidence_list.map((ev, i) => (
                                <li key={i}>{ev}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Submission Channels */}
                        <div className="mt-3 text-xs">
                          <span className="font-semibold text-slate-700 block mb-1">Where to Send:</span>
                          <div className="flex flex-wrap gap-1">
                            {msg.document.suggested_submission_methods.map((method, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]"
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

              {/* Typing State */}
              {isTyping && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 border border-slate-200">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-500 font-medium ml-2">Reviewing guidelines...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center bg-slate-50 rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 p-1.5 transition-all"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe what happened with your transaction..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-all shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-2 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Strict privacy: PINs, OTPs, and BVNs are never collected or stored.</span>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
