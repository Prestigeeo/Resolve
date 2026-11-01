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
  ChevronDown,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      text: "Hello! I am Resolve, your dedicated consumer resolution advocate for Nigeria.\n\nWhether you were debited for a failed bank transfer that never reached the recipient, purchased airtime/data that was never credited, had your phone stolen or account compromised, or paid an online vendor who refused delivery—I am here to guide you step-by-step under verified Central Bank of Nigeria (CBN), NCC, and FCCPC statutory frameworks.\n\nTell me what happened in your own words, or choose one of the situations below:",
      timestamp: "Just now",
      interactiveOptions: [
        { label: "Failed Bank Transfer", value: "I was debited for a bank transfer that the recipient never received.", field: "quick_start" },
        { label: "Vendor Refused Delivery", value: "I paid an online vendor on Instagram or WhatsApp who refused to deliver and blocked me.", field: "quick_start" },
        { label: "Undelivered Airtime / Data", value: "My bank debited me for airtime/data but my phone was never credited.", field: "quick_start" },
        { label: "Snatched Phone / Account Compromised", value: "My phone was snatched or account compromised! Help me lock it immediately!", field: "quick_start" }
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
      // Check if user is explicitly requesting a formal document
      const wantsDocument = /draft|letter|petition|dossier|official document|demand notice/i.test(text);

      if (wantsDocument && (currentFacts || activeCaseId)) {
        const doc = await api.generateDocument(activeCaseId || undefined, caseAccessToken || undefined, currentFacts || undefined);
        const docReply: ChatMessage = {
          id: "msg_ai_doc_" + Date.now(),
          sender: "resolve",
          text: "I have prepared your formal redress dossier. It is strictly grounded in verified facts and regulatory provisions (CBN/NCC/FCCPC). You can review, copy, or download it below:",
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

        let followUpText = `Got it, I have noted that: **${text}**.\n\nHere is how you should handle this right now:`;
        
        // Practical guidance based on context
        if (clarifyRes.facts.category === "FAILED_TRANSFER") {
          followUpText = `Thank you for sharing that context. Having recorded **${text}**, here is your direct action plan:\n\n1. **Locate your 30-digit NIBSS Session ID**: Check your transaction receipt or statement. This 30-digit number is the only evidence the beneficiary bank needs to trace the funds in their backend ledger.\n2. **Check with Beneficiary**: Send the 30-digit Session ID to the beneficiary so they can present it to their bank's customer support.\n3. **Log Complaint with Sending Bank**: If it has not reversed within 24 to 72 hours, open your bank app -> Support -> Dispute and lodge a ticket.\n4. **Statutory 14-Day Window**: Under CBN rules, your bank has 14 days to resolve the dispute before you can escalate directly to the CBN Consumer Protection Department (cpd@cbn.gov.ng).`;
        }

        const aiReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: followUpText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidance: details.guidance,
          evidenceChecklist: details.guidance.evidence_checklist,
          interactiveOptions: [
            { label: "Draft Official Escalation Letter", value: "Please draft my formal complaint letter now.", field: "action_request" },
            { label: "How do I find the Session ID?", value: "How do I find the 30-digit NIBSS Session ID on my bank receipt?", field: "help_request" },
            { label: "Bank has ignored me for 14+ days", value: "It has been over 14 days since I lodged the complaint with my bank and they refused to refund.", field: "timeline_status" }
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
          text: "Active security emergency detected! Dial your bank's instant USSD kill-switch code from any phone immediately to freeze your account before visiting a branch.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          empatheticIntro: intakeRes.empathetic_intro || "Please stay calm. Having your phone stolen or watching unauthorized debits is terrifying, but acting quickly will protect your remaining balance. First priority is locking your account right now.",
          immediateAdvice: intakeRes.immediate_advice || "Dial your bank's emergency USSD code immediately from ANY available phone (borrow a friend's phone). It locks mobile and card access on the spot.",
          isEmergency: true,
          emergencyData: intakeRes.emergency_instructions || emergencyCodes["GTBANK"],
          interactiveOptions: intakeRes.action_chips || [
            { label: "My account is now locked", value: "I have dialed the USSD code and locked my account. What is the next step?", field: "emergency_status" },
            { label: "Phone & SIM were stolen", value: "Both my phone and banking SIM were stolen together.", field: "emergency_status" }
          ]
        };
        setMessages((prev) => [...prev, emergencyReply]);
        setIsTyping(false);
        return;
      }

      // Scenario 2: Conversational Triage with Follow-up Questions
      if (intakeRes.clarifying_questions && intakeRes.clarifying_questions.length > 0) {
        const nextQ = intakeRes.clarifying_questions[0];
        setPendingField(nextQ.field_target);

        let options = intakeRes.action_chips;
        if (!options || options.length === 0) {
          if (nextQ.options) {
            options = nextQ.options.map((opt) => ({ label: opt, value: opt, field: nextQ.field_target }));
          } else {
            options = [
              { label: "It happened today / yesterday", value: "It happened within the last 48 hours.", field: "timeline" },
              { label: "I have the receipt / Session ID", value: "Yes, I have the receipt and Session ID.", field: "evidence" },
              { label: "Draft official letter for me", value: "Please draft my formal complaint letter now.", field: "action_request" }
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
          interactiveOptions: options,
          showDraftButton: true
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
          { label: "Draft Official Legal Dossier", value: "Please draft my formal complaint letter now.", field: "action_request" },
          { label: "How to track the 14-day CBN SLA?", value: "How do I track the statutory 14-day resolution countdown?", field: "help_request" }
        ],
        showDraftButton: true
      };
      setMessages((prev) => [...prev, successReply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: "msg_err_" + Date.now(),
        sender: "resolve",
        text: "I experienced a temporary network issue. Don't worry—you can try tapping one of the options below or sending your message again.",
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
        text: "I have compiled your formal redress dossier. It is strictly grounded in verified facts and regulatory provisions (CBN/NCC/FCCPC). You can review, copy, or download it below:",
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
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white antialiased">
      {/* Unicorn Menu Bar */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNewChat={startNewChat}
        caseCategory={currentFacts?.category}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 flex flex-col h-[calc(100vh-68px)]">
        
        {/* View: How Redress Works Guide */}
        {activeTab === "guide" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0B101D]/90 border border-white/[0.08] rounded-3xl backdrop-blur-xl mb-4 shadow-2xl">
            <div className="flex items-center space-x-3.5 pb-5 border-b border-white/10">
              <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-600/30">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">How Financial Redress Works in Nigeria</h2>
                <p className="text-xs text-slate-400 mt-0.5">Understanding your statutory consumer rights under Central Bank of Nigeria, NCC, and FCCPC rules.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              <div className="p-5 rounded-2xl bg-[#090D1A] border border-white/[0.08] hover:border-blue-500/30 transition-all">
                <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Central Bank of Nigeria (CBN) 14-Day Rule</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Failed Bank Transfers (NIP Debit Without Credit)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When you initiate an interbank transfer in Nigeria and money leaves your account without crediting the recipient, the transaction is governed by the CBN Consumer Protection Framework.
                </p>
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 text-sky-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span className="text-slate-300"><strong>First 24–72 hours:</strong> Over 85% of failed debits auto-reverse through automated NIBSS reconciliation. Check the 30-digit Session ID on your receipt.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 text-sky-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span className="text-slate-300"><strong>Stage-1 Bank Complaint:</strong> If unreversed, lodge a dispute with your bank citing the 30-digit Session ID. The bank must assign a Ticket ID within 24 hours.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 text-sky-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span className="text-slate-300"><strong>14-Day Statutory Deadline:</strong> Banks have 14 days to resolve the complaint. If they fail, you are legally entitled to escalate directly to CBN Consumer Protection Department (<strong>cpd@cbn.gov.ng</strong>).</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#090D1A] border border-white/[0.08] hover:border-purple-500/30 transition-all">
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>FCCPA 2018 Statutory Protections</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Online Vendor Non-Delivery (Instagram & WhatsApp)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under Sections 114–130 of the Federal Competition and Consumer Protection Act (FCCPA) 2018, consumers who pay for goods or services have a legal right to timely delivery or a mandatory full refund.
                </p>
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span className="text-slate-300"><strong>Online Checkout Protection:</strong> If you paid through Paystack or Flutterwave, submit a transaction dispute on their lookup portal to place an immediate payout hold.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span className="text-slate-300"><strong>7-Day Statutory Notice:</strong> For direct bank transfers, deliver a formal Notice of Breach giving 7 days to fulfill or refund.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span className="text-slate-300"><strong>FCCPC Enforcement:</strong> If the 7 days elapse without refund, file the docket directly at <strong>complaints.fccpc.gov.ng</strong>.</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#090D1A] border border-white/[0.08] hover:border-indigo-500/30 transition-all">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Smartphone className="w-4 h-4" />
                  <span>NCC Consumer Code & Toll-Free 622</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Undelivered Airtime & Data Bundles</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When money leaves your bank for airtime or data, but your phone is not credited, 90% of issues occur between your bank and the VTU aggregator.
                </p>
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span className="text-slate-300"><strong>Report to Bank First:</strong> If bought through your bank app, the first dispute must go to your bank, not the telco.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span className="text-slate-300"><strong>Escalate to NCC 622:</strong> If unresolved after 72 hours, dial Toll-Free 622 from any Nigerian mobile network to reach the NCC Consumer Affairs Bureau.</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#090D1A] border border-white/[0.08] hover:border-rose-500/30 transition-all">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Active Emergency Fraud Protocol</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Stolen Phones & Unauthorized Transfers</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every second counts when a phone is snatched or account is compromised. Nigerian banks offer dedicated emergency USSD kill-switches.
                </p>
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span className="text-slate-300"><strong>Dial Kill-Switch Code:</strong> Use ANY borrowed phone immediately to dial your bank's code (e.g. *737*51*10# for GTBank).</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span className="text-slate-300"><strong>Hotlist SIM:</strong> Contact your telecom operator to block the SIM so thieves cannot receive SMS OTPs.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span className="text-slate-300"><strong>Bank Precautionary Lien & Police Report:</strong> Request a Post-No-Debit (PND) on recipient accounts and report to NPF-NCCC (incb.npf.gov.ng).</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View: Regulators / Knowledge Base */}
        {activeTab === "sources" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0B101D]/90 border border-white/[0.08] rounded-3xl backdrop-blur-xl mb-4 shadow-2xl">
            <div className="flex items-center space-x-3.5 pb-5 border-b border-white/10">
              <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-600/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Verified Regulatory Authorities in Nigeria</h2>
                <p className="text-xs text-slate-400 mt-0.5">Statutory dispute frameworks backing every recommendation in Resolve.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {sources.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-[#090D1A] border border-white/[0.08] hover:border-blue-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-sky-300 border border-blue-500/20">
                      {s.publisher}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2">{s.title}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{s.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-400">{s.statutory_basis}</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
                    >
                      <span>Official Portal</span>
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

        {/* View: Conversational Chat Assistant (The Core Experience) */}
        {activeTab === "intake" && (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
            
            {/* Main Conversational Thread Card */}
            <div className="flex-1 flex flex-col bg-[#0A0F1D]/95 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
              
              {/* Top Sub-Bar */}
              <div className="px-5 py-3.5 bg-[#090D1A] border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xs font-bold text-white">Resolve Dispute Advocate</h3>
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Active Guidance Engine &bull; CBN, NCC &amp; FCCPC Frameworks
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {currentFacts && (
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 border border-white/10"
                    >
                      Case Facts
                    </button>
                  )}
                  <button
                    onClick={startNewChat}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-300 hover:text-white border border-white/10 transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    <span>New Case</span>
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
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-md ${
                      msg.sender === "user"
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                        : "bg-[#11182B] border border-white/10 text-sky-400"
                    }`}>
                      {msg.sender === "user" ? "You" : <Scale className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble Content */}
                    <div className={`max-w-[88%] sm:max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 font-medium"
                        : "bg-[#0E1528] border border-white/[0.08] text-slate-200 shadow-md"
                    }`}>
                      
                      {/* Empathetic Introduction (Friend-to-Friend Reassurance) */}
                      {msg.empatheticIntro && (
                        <div className="mb-3 pb-3 border-b border-white/[0.08] text-slate-300 font-normal leading-relaxed">
                          {msg.empatheticIntro}
                        </div>
                      )}

                      {/* Immediate Practical Advice (Non-letter direct triage) */}
                      {msg.immediateAdvice && (
                        <div className="mb-3.5 p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 text-xs text-sky-200 leading-relaxed">
                          <div className="font-bold text-white flex items-center space-x-1.5 mb-1">
                            <Info className="w-3.5 h-3.5 text-sky-400" />
                            <span>Practical Advice:</span>
                          </div>
                          {msg.immediateAdvice}
                        </div>
                      )}

                      {/* Main Message Text */}
                      <div className="whitespace-pre-wrap space-y-2">
                        {msg.text.split("\n\n").map((paragraph, pIdx) => (
                          <p key={pIdx}>
                            {paragraph.split("**").map((part, i) =>
                              i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
                            )}
                          </p>
                        ))}
                      </div>

                      {/* Emergency Kill-Switch Widget */}
                      {msg.isEmergency && msg.emergencyData && (
                        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-rose-950/70 to-red-950/40 border border-rose-500/30">
                          <h4 className="text-xs font-bold text-white flex items-center space-x-1.5 mb-2">
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                            <span>{msg.emergencyData.name} Instant Kill-Switch:</span>
                          </h4>
                          <p className="text-xs text-rose-200 mb-3">{msg.emergencyData.action_prompt}</p>
                          <div className="flex flex-wrap gap-2.5 items-center">
                            <a
                              href={`tel:${encodeURIComponent(msg.emergencyData.ussd_freeze_code)}`}
                              className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Dial USSD: {msg.emergencyData.ussd_freeze_code}</span>
                            </a>
                            {msg.emergencyData.fraud_desk_phone && (
                              <span className="text-[11px] text-rose-200 font-medium">
                                24/7 Fraud Desk: <strong>{msg.emergencyData.fraud_desk_phone}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Interactive Clickable Quick Options */}
                      {msg.interactiveOptions && msg.interactiveOptions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                            Choose an option or type your reply:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {msg.interactiveOptions.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => handleOptionClick(opt.value)}
                                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-sky-300 border border-white/10 hover:border-sky-400/40 transition-all shadow-sm active:scale-95 text-left"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* On-Demand Document Generation Button */}
                      {msg.showDraftButton && !msg.document && (
                        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <span className="text-[11px] text-slate-400">
                            Need a formal legal redress document right now?
                          </span>
                          <button
                            onClick={handleGenerateOfficialDocument}
                            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-95 shrink-0"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Draft Official Redress Dossier</span>
                          </button>
                        </div>
                      )}

                      {/* Verified Resolution Roadmap Widget */}
                      {msg.guidance && (
                        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#090E1B] border border-blue-500/25">
                          <div className="flex items-center space-x-2 text-sky-400 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Statutory Resolution Roadmap</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-white mb-3">{msg.guidance.summary}</h4>

                          <div className="space-y-2.5">
                            {msg.guidance.action_steps.map((st) => (
                              <div key={st.step_number} className="p-3 rounded-xl bg-slate-900/90 border border-white/5 flex items-start space-x-3">
                                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                  {st.step_number}
                                </span>
                                <div>
                                  <h5 className="text-xs font-bold text-white">{st.title}</h5>
                                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{st.description}</p>
                                  {st.deadline_or_sla && (
                                    <span className="inline-block mt-1 text-[10px] text-amber-400 font-semibold">
                                      Timeline: {st.deadline_or_sla}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Official Grounded Dossier Card */}
                      {msg.document && (
                        <div className="mt-5 p-5 rounded-2xl bg-[#080D1B] border border-blue-500/30 shadow-2xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/10 gap-2.5">
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/40 uppercase tracking-widest">
                                Official Redress Dossier Prepared
                              </span>
                              <h4 className="text-sm font-bold text-white mt-1.5">{msg.document.title}</h4>
                              <p className="text-[11px] text-slate-400">
                                Recipient: <strong>{msg.document.recipient_institution}</strong>
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCopyDocument(msg.document!, msg.id)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold border border-white/10 transition-all shadow-sm"
                              >
                                {copiedDocId === msg.id ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedDocId === msg.id ? "Copied" : "Copy Text"}</span>
                              </button>
                              <button
                                onClick={() => handleDownloadDocument(msg.document!)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download .txt</span>
                              </button>
                            </div>
                          </div>

                          {/* Letter Body Preview */}
                          <div className="mt-4 p-4 rounded-xl bg-[#050812] border border-white/10 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
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

                          {/* Submission Channels */}
                          <div className="mt-4">
                            <span className="text-[11px] font-bold text-white block mb-1.5">Where to Submit:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.document.suggested_submission_methods.map((method, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-white/10 font-medium"
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
                    <div className="w-8 h-8 rounded-xl bg-[#11182B] border border-white/10 flex items-center justify-center text-sky-400 shadow-md">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0E1528] border border-white/[0.08] flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-xs text-slate-400 font-medium ml-2">Resolve is reviewing Nigerian regulations...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Floating Composer */}
              <div className="p-3 sm:p-4 bg-[#080C17] border-t border-white/[0.08]">
                {/* Quick Starters */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2.5 scrollbar-none text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Quick Ask:</span>
                  <button
                    type="button"
                    onClick={() => handleSendMessage("I transferred 25,000 Naira from GTBank to OPay, debited but recipient no receive am.")}
                    className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/5 shrink-0 transition-all text-xs"
                  >
                    Failed 25,000 NGN Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage("I paid an Instagram boutique 45,000 Naira and she blocked me on WhatsApp after promising delivery yesterday.")}
                    className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/5 shrink-0 transition-all text-xs"
                  >
                    IG Boutique Blocked Me (45k NGN)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage("I bought 5,000 Naira MTN data on Access Bank app, debited but no data dropped on my line.")}
                    className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/5 shrink-0 transition-all text-xs"
                  >
                    5,000 NGN Data VTU Failure
                  </button>
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center bg-[#050812] rounded-2xl border border-white/10 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 p-1.5 transition-all shadow-inner"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Describe your transaction dispute, bank, amount, or vendor details..."
                    className="flex-1 bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="mt-2 text-center text-[10px] text-slate-500 flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Strict privacy: PINs, OTPs, and BVNs are automatically protected. Grounded in CBN, NCC, and FCCPA statutory guidelines.</span>
                </div>
              </div>

            </div>

            {/* Case Intelligence Sidebar (Desktop & Collapsible Mobile) */}
            {currentFacts && (
              <div className={`w-full lg:w-80 bg-[#0A0F1D]/95 border border-white/[0.08] rounded-3xl p-5 flex flex-col shadow-xl backdrop-blur-2xl ${sidebarOpen ? "block" : "hidden lg:flex"}`}>
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">Dispute Summary</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30">
                    Active
                  </span>
                </div>

                <div className="mt-4 space-y-3.5 flex-1 overflow-y-auto text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category</span>
                    <span className="font-bold text-white capitalize">{currentFacts.category.replace(/_/g, " ").toLowerCase()}</span>
                  </div>

                  {currentFacts.amount_ngn && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Amount in Dispute</span>
                      <span className="font-extrabold text-sky-300 text-sm">NGN {currentFacts.amount_ngn.toLocaleString()}</span>
                    </div>
                  )}

                  {currentFacts.sender_institution && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sending Institution</span>
                      <span className="font-medium text-slate-200">{currentFacts.sender_institution}</span>
                    </div>
                  )}

                  {currentFacts.session_id_or_ref && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Session ID / Reference</span>
                      <span className="font-mono text-[11px] text-slate-300 break-all">{currentFacts.session_id_or_ref}</span>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-[#070B16] border border-white/5 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Statutory SLA Window</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Under Central Bank of Nigeria regulations, banks must resolve failed electronic transfer complaints within 14 days of lodging.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleGenerateOfficialDocument}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generate Formal Dossier</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <button
                    onClick={() => setActiveTab("emergency")}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    View Emergency USSD Freeze Codes &rarr;
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
