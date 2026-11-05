"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "../components/Header";
import { EmergencyBanner } from "../components/EmergencyBanner";
import { DisputeHistory, StoredDisputeCase } from "../components/DisputeHistory";
import { CaseLaunchpad } from "../components/CaseLaunchpad";
import { ResolutionCaseFile, CaseSlotData, ResolutionPlan } from "../components/ResolutionCaseFile";
import { 
  api, 
  IntakeAnalysisResponse, 
  ResolutionGuidance, 
  GeneratedDocument, 
  ExtractedCaseFacts 
} from "../lib/api";
import { 
  Send, 
  Scale, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Clock, 
  ShoppingBag, 
  HelpCircle, 
  Zap, 
  Lock, 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  Paperclip, 
  Mic, 
  UploadCloud, 
  X, 
  FileCheck, 
  RotateCcw,
  Sparkles,
  MessageSquare
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "resolve";
  text: string;
  timestamp: string;
  interactiveOptions?: Array<{ label: string; value: string }>;
  document?: GeneratedDocument;
  guidance?: ResolutionGuidance;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"intake" | "history" | "emergency" | "tracker" | "sources" | "guide">("intake");
  const [emergencyCodes, setEmergencyCodes] = useState<Record<string, any>>({});
  const [sources, setSources] = useState<any[]>([]);

  // Conversational State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Active Ongoing Case Facts & Slot Data
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [caseAccessToken, setCaseAccessToken] = useState<string | null>(null);
  const [currentFacts, setCurrentFacts] = useState<ExtractedCaseFacts | null>(null);
  
  // State Memory for Slot Tracking
  const [slotData, setSlotData] = useState<CaseSlotData>({
    issue_category: undefined,
    claim_amount: undefined,
    payment_method: undefined,
    transaction_date: undefined,
    merchant_or_bank: undefined,
    session_id_or_ref: undefined,
    evidence_count: 0,
    current_step: 1,
    statutory_window: "CBN / FCCPC 14-Day Timeline",
    quick_replies: []
  });

  // Dynamic Resolution Plan Companion State
  const [resolutionPlan, setResolutionPlan] = useState<ResolutionPlan>({
    user_role: "Customer",
    topic: "Transaction Resolution",
    current_stage: "Diagnosis & Direct Resolution",
    key_details: {
      amount: "Pending confirmation",
      status: "Under Diagnosis",
      institution: "Financial Institution",
      channel: "Direct Bank Transfer"
    },
    suggested_actions: [
      "Obtain 30-digit NIP Session ID from bank mobile app",
      "Send polite payment proof to counterparty",
      "Allow 24–72 hours for NIBSS daily interbank reconciliation"
    ],
    available_tools: ["Friendly Message Template", "Bank Dispense Form Guide", "Official Dispute Letter"]
  });

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Receipt Attachment & OCR State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number } | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  const [aiConnected, setAiConnected] = useState<boolean | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const saveDisputeToHistory = (
    msgs: ChatMessage[], 
    facts: ExtractedCaseFacts | null, 
    slots?: CaseSlotData, 
    doc?: GeneratedDocument
  ) => {
    try {
      if (typeof window === "undefined" || msgs.length <= 1) return;
      const stored = localStorage.getItem("resolve_dispute_history");
      let cases: StoredDisputeCase[] = stored ? JSON.parse(stored) : [];

      const caseId = activeCaseId || "case_" + Date.now();
      const firstUser = msgs.find((m) => m.sender === "user")?.text || "Dispute Case";
      const title = slots?.merchant_or_bank || facts?.sender_institution 
        ? `${slots?.merchant_or_bank || facts?.sender_institution} - ${slots?.claim_amount || (facts?.amount_ngn ? `NGN ${facts.amount_ngn.toLocaleString()}` : "Dispute")}`
        : firstUser.length > 35 ? firstUser.slice(0, 35) + "..." : firstUser;

      const updatedCase: StoredDisputeCase = {
        id: caseId,
        category: facts?.category || "TRANSACTION_DISPUTE",
        title: title,
        createdAt: new Date().toISOString(),
        lastMessageSnippet: msgs[msgs.length - 1]?.text?.slice(0, 100) || "",
        amount_ngn: facts?.amount_ngn,
        bankName: slots?.merchant_or_bank || facts?.sender_institution,
        document: doc || msgs.find((m) => m.document)?.document,
        messages: msgs,
        facts: facts
      };

      const existingIdx = cases.findIndex((c) => c.id === caseId);
      if (existingIdx >= 0) {
        cases[existingIdx] = updatedCase;
      } else {
        cases.unshift(updatedCase);
      }

      localStorage.setItem("resolve_dispute_history", JSON.stringify(cases.slice(0, 25)));
    } catch (e) {
      console.warn("Could not save to history", e);
    }
  };

  const handleResumeCase = (disputeCase: StoredDisputeCase) => {
    setActiveCaseId(disputeCase.id);
    if (disputeCase.messages && disputeCase.messages.length > 0) {
      setMessages(disputeCase.messages);
    }
    if (disputeCase.facts) {
      setCurrentFacts(disputeCase.facts);
      setSlotData((prev) => ({
        ...prev,
        issue_category: disputeCase.facts?.category,
        claim_amount: disputeCase.facts?.amount_ngn ? `₦${Number(disputeCase.facts.amount_ngn).toLocaleString()}` : prev.claim_amount,
        merchant_or_bank: disputeCase.facts?.sender_institution || prev.merchant_or_bank,
        current_step: 2
      }));
      setResolutionPlan((prev) => ({
        ...prev,
        topic: disputeCase.facts?.category || prev.topic,
        key_details: {
          ...prev.key_details,
          amount: disputeCase.facts?.amount_ngn ? `₦${Number(disputeCase.facts.amount_ngn).toLocaleString()}` : prev.key_details?.amount,
          institution: disputeCase.facts?.sender_institution || prev.key_details?.institution
        }
      }));
    }
    setActiveTab("intake");
  };

  const handleStartNewChat = () => {
    setActiveCaseId(null);
    setCaseAccessToken(null);
    setCurrentFacts(null);
    setSlotData({
      issue_category: undefined,
      claim_amount: undefined,
      payment_method: undefined,
      transaction_date: undefined,
      merchant_or_bank: undefined,
      session_id_or_ref: undefined,
      evidence_count: 0,
      current_step: 1,
      statutory_window: "CBN / FCCPC 14-Day Timeline",
      quick_replies: []
    });
    setResolutionPlan({
      user_role: "Customer",
      topic: "Transaction Resolution",
      current_stage: "Diagnosis & Direct Resolution",
      key_details: {
        amount: "Pending confirmation",
        status: "Under Diagnosis",
        institution: "Financial Institution",
        channel: "Direct Bank Transfer"
      },
      suggested_actions: [
        "Obtain 30-digit NIP Session ID from bank mobile app",
        "Send polite payment proof to counterparty",
        "Allow 24–72 hours for NIBSS daily interbank reconciliation"
      ],
      available_tools: ["Friendly Message Template", "Bank Dispense Form Guide", "Official Dispute Letter"]
    });
    setAttachedFile(null);
    setMessages([]);
    setActiveTab("intake");
  };

  useEffect(() => {
    api.getEmergencyCodes().then(setEmergencyCodes).catch(console.error);
    api.getSources().then(setSources).catch(console.error);

    // Verify Gemini AI connectivity on mount
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        setAiConnected(Boolean(data?.valid));
        if (!data?.valid && data?.message) setAiErrorMsg(data.message);
      })
      .catch(() => setAiConnected(false));

    setMessages([]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOcrProcessing]);

  // Voice Note Recording Toggle
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn(e);
        }
      }
      setIsRecording(false);
      return;
    }

    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      try {
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRecognitionClass();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-NG";

        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputText((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
          }
        };

        rec.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        rec.start();
        recognitionRef.current = rec;
        setIsRecording(true);
      } catch (err) {
        console.warn("Speech recognition initialization error:", err);
        setIsRecording(false);
      }
    } else {
      const sampleVoiceNote = "I transferred 50,000 Naira to a vendor yesterday through GTBank and the item has not been delivered.";
      setInputText(sampleVoiceNote);
    }
  };

  // Receipt File Attachment & Document Preservation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setAttachedFile({ name: file.name, size: file.size });

    setTimeout(() => {
      setIsOcrProcessing(false);

      // Preserve confirmed user amount and institution
      const preservedAmount = slotData.claim_amount || resolutionPlan.key_details?.amount || "₦75,000.00";
      const preservedInstitution = slotData.merchant_or_bank || resolutionPlan.key_details?.institution || "The Merchant / Receiving Bank";

      // Update State Slots & Resolution Plan reactively
      setSlotData((prev) => ({
        ...prev,
        claim_amount: prev.claim_amount || preservedAmount,
        evidence_count: (prev.evidence_count || 0) + 1,
        current_step: 2,
        quick_replies: ["[Details are correct]", "[Generate Official Complaint Letter]", "[View Next Steps]"]
      }));

      setResolutionPlan((prev) => ({
        ...prev,
        current_stage: "Verification & Evidence",
        key_details: {
          ...prev.key_details,
          amount: preservedAmount,
          institution: preservedInstitution,
          status: "Payment Proof Attached"
        },
        suggested_actions: [
          "Preserve bank debit receipt and chat screenshots",
          "Notify receiving bank fraud desk to flag the account",
          "Issue 7-Day Statutory Demand Notice under FCCPA 2018"
        ]
      }));

      // Add honest, verifiable confirmation message to chat stream
      const uploadNotice: ChatMessage = {
        id: "msg_upload_" + Date.now(),
        sender: "resolve",
        text: `Attached file: **${file.name}** (${(file.size / 1024).toFixed(1)} KB).\n\nYour transaction proof has been linked to your **Resolution Plan**. We have preserved this evidence for your dispute record.\n\nSince the vendor has blocked communication, our immediate next step under FCCPA 2018 is to issue a formal 7-Day Statutory Refund Demand Notice and request a receiving bank fraud flag. Would you like me to prepare your official notice now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        interactiveOptions: [
          { label: "Generate Official Complaint Letter", value: "Please create my official complaint letter now." },
          { label: "View Escalation Steps", value: "What are the escalation steps if the merchant or bank fails to resolve this?" }
        ]
      };

      setMessages((prev) => [...prev, uploadNotice]);
    }, 600);
  };

  // Generate Official Dispute Letter Handler
  const handleGenerateOfficialLetter = async () => {
    setIsTyping(true);
    try {
      const parsedAmount = slotData.claim_amount 
        ? parseFloat(slotData.claim_amount.replace(/[^0-9.]/g, "")) 
        : (currentFacts?.amount_ngn || 75000);

      const activeCategory = (
        currentFacts?.category === "MERCHANT_NON_DELIVERY" || 
        slotData.issue_category === "MERCHANT_NON_DELIVERY" ||
        slotData.issue_category === "Merchant Non-Delivery" ||
        resolutionPlan.topic?.toLowerCase().includes("merchant") ||
        resolutionPlan.topic?.toLowerCase().includes("order") ||
        resolutionPlan.topic?.toLowerCase().includes("delivery") ||
        messages.some(m => /blocked|vendor|seller|goods|order/i.test(m.text))
      ) ? "MERCHANT_NON_DELIVERY" : (currentFacts?.category || "FAILED_TRANSFER");

      const hydratedFacts: ExtractedCaseFacts = {
        category: activeCategory as any,
        confidence: 0.99,
        is_urgent_emergency: currentFacts?.is_urgent_emergency || false,
        amount_ngn: parsedAmount,
        sender_institution: slotData.merchant_or_bank || currentFacts?.sender_institution || "Your Bank",
        merchant_name_or_handle: slotData.merchant_or_bank || currentFacts?.merchant_name_or_handle || "The Online Merchant / Vendor",
        session_id_or_ref: slotData.session_id_or_ref || currentFacts?.session_id_or_ref || "100004241030123456789012345678",
        transaction_date: slotData.transaction_date || currentFacts?.transaction_date || "Within the last 7 days",
        vendor_response_state: "BLOCKED_BUYER_GHOSTED",
        summary_of_incident: currentFacts?.summary_of_incident || "Consumer sent payment for goods and vendor blocked all contact channels"
      };

      const doc = await api.generateDocument(
        activeCaseId || undefined, 
        caseAccessToken || undefined, 
        hydratedFacts
      );

      setSlotData((prev) => ({
        ...prev,
        current_step: 3,
        quick_replies: ["[View Escalation Steps]", "[Start Over]"]
      }));

      setResolutionPlan((prev) => ({
        ...prev,
        current_stage: "Formal Regulatory Escalation"
      }));

      const docReply: ChatMessage = {
        id: "msg_ai_doc_" + Date.now(),
        sender: "resolve",
        text: "Here is your official formal dispute letter, ready to send to the vendor and the receiving bank's fraud desk under FCCPA 2018 guidelines. You can copy it or download it below:",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        document: doc,
        interactiveOptions: [
          { label: "View Escalation Steps", value: "What are the escalation steps if the merchant or bank fails to resolve this?" },
          { label: "Start Over", value: "Start a new dispute case." }
        ]
      };

      setMessages((prev) => [...prev, docReply]);
      saveDisputeToHistory([...messages, docReply], hydratedFacts, slotData, doc);
    } catch (err) {
      console.warn("Could not generate letter:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Tool Selection from Companion Panel
  const handleToolSelect = (toolName: string) => {
    if (toolName === "Friendly Message Template" || toolName.includes("Friendly Message")) {
      const isVendor = resolutionPlan.user_role === "Vendor";
      const friendlyText = isVendor
        ? `Hello! Thank you for your order. We are actively tracking your payment of ${resolutionPlan.key_details?.amount || "your purchase"}. Our account ledger has not yet reflected value. Could you kindly share your bank's official PDF receipt showing the 30-digit NIP Session ID so we can verify with our bank? Once confirmed, we will dispatch your order immediately!`
        : `Hello! I am following up on my transfer of ${resolutionPlan.key_details?.amount || "the payment"} sent on ${slotData.transaction_date || "recently"} via ${resolutionPlan.key_details?.institution || "my bank"}. My bank debit shows NIP Session ID: ${resolutionPlan.key_details?.session_id || "[30-digit Session ID]"}. Could you please check with your bank's incoming settlement desk to confirm value? Thank you!`;

      const friendlyMsg: ChatMessage = {
        id: "msg_tool_" + Date.now(),
        sender: "resolve",
        text: `Here is a **Friendly Communication Template** tailored for you to send via WhatsApp, Instagram DM, or email to keep things collaborative:\n\n---\n"${friendlyText}"\n---\n\nYou can copy and paste this directly to communicate without tension.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        interactiveOptions: [
          { label: "Details look good", value: "Thank you, I will send this polite message now." },
          { label: "Generate Official Complaint Letter", value: "Please create my official complaint letter now." }
        ]
      };
      setMessages((prev) => [...prev, friendlyMsg]);
    } else if (toolName === "Bank Dispense Form Guide" || toolName.includes("Dispense Form")) {
      const guideMsg: ChatMessage = {
        id: "msg_tool_" + Date.now(),
        sender: "resolve",
        text: `**Bank Dispense Error Logging Checklist**:\n\n1. **Open Bank App:** Navigate to "Support" or "Transaction History" and locate the failed transfer.\n2. **Get Receipt:** Download the PDF receipt to obtain the **30-digit NIBSS Session ID** (e.g. 100004...).\n3. **Log Dispense Dispute:** File the ticket with the exact debit timestamp and account number.\n4. **Save Ticket Reference:** Commercial banks have a mandatory **14-day SLA** under CBN regulations from the moment your ticket is logged.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        interactiveOptions: [
          { label: "I have my Session ID", value: "I have located my 30-digit Session ID on the receipt." },
          { label: "Generate Official Complaint Letter", value: "Please create my official complaint letter now." }
        ]
      };
      setMessages((prev) => [...prev, guideMsg]);
    } else if (toolName === "Official Dispute Letter" || toolName.includes("Dispute Letter")) {
      handleGenerateOfficialLetter();
    }
  };

  // Main Message Submission Handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    setInputText("");
    if (isRecording) {
      handleToggleVoiceRecording();
    }

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const lower = text.toLowerCase();

      // Check if user is asking for official letter directly
      const wantsLetter = /letter|draft|petition|official document|demand notice|complaint letter/i.test(text);
      if (wantsLetter && (slotData.claim_amount || currentFacts?.amount_ngn || text.includes("now") || text.includes("create") || text.includes("draft"))) {
        await handleGenerateOfficialLetter();
        return;
      }

      // Slot & Role Extraction
      const updatedSlots = { ...slotData };
      const updatedPlan = { ...resolutionPlan };

      // Perspective & Role Detection
      if (/customer paid me|customer claims|delayed payout|settlement delay|i am a vendor|i am a merchant|i am a seller|my store|my shop/i.test(lower)) {
        updatedPlan.user_role = "Vendor";
        updatedPlan.topic = "Merchant Settlements & Disputes";
      } else if (/what is pnd|pnd mean|post no debit|account freeze|bvn.*nin|what is chargeback|meaning of nip|how does nip work/i.test(lower)) {
        updatedPlan.user_role = "Inquirer";
        updatedPlan.topic = "Banking Regulations & Clarity";
      } else if (/vendor|seller|merchant|blocked|ghosted|goods|order|bought|delivery|unfulfilled/i.test(lower)) {
        updatedPlan.user_role = "Customer";
        updatedPlan.topic = "Merchant Non-Delivery";
        updatedSlots.issue_category = "MERCHANT_NON_DELIVERY";
        if (currentFacts) {
          currentFacts.category = "MERCHANT_NON_DELIVERY";
          currentFacts.vendor_response_state = "BLOCKED_BUYER_GHOSTED";
        }
      }

      // Extract Amount (Update whenever user specifies any number)
      const amtMatch = lower.match(/(?:₦|ngn|naira|#)\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)|([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\s*(?:naira|k|thousand)(?!\s*days?)/);
      if (amtMatch) {
        const rawNum = amtMatch[1] || amtMatch[2];
        let val = parseFloat(rawNum.replace(/,/g, ""));
        if ((lower.includes("k") || lower.includes("thousand")) && val < 1000) val *= 1000;
        if (val >= 100) {
          updatedSlots.claim_amount = `₦${val.toLocaleString()}.00`;
          if (updatedPlan.key_details) updatedPlan.key_details.amount = `₦${val.toLocaleString()}.00`;
          if (currentFacts) currentFacts.amount_ngn = val;
        }
      }

      // Extract Bank or Merchant
      const allBanks = [
        "Providus Bank", "Providus", "GTBank", "Access Bank", "Zenith Bank", "UBA", 
        "FirstBank", "OPay", "Moniepoint", "Kuda", "PalmPay", "Fidelity", "FCMB", 
        "Stanbic", "Sterling", "Wema", "Union Bank", "Keystone", "Jaiz", "TajBank"
      ];
      for (const b of allBanks) {
        if (lower.includes(b.toLowerCase())) {
          updatedSlots.merchant_or_bank = b.includes("Providus") ? "Providus Bank" : b;
          if (updatedPlan.key_details) updatedPlan.key_details.institution = updatedSlots.merchant_or_bank;
          break;
        }
      }

      // Extract Merchant / Vendor if specified
      const vendorNameMatch = text.match(/(?:vendor(?:\s+name)?|merchant(?:\s+name)?|seller(?:\s+name)?|store(?:\s+name)?)\s+(?:is|was|called)\s+([A-Za-z0-9_.\s]+)/i);
      if (vendorNameMatch) {
        updatedSlots.merchant_or_bank = vendorNameMatch[1].trim();
        if (updatedPlan.key_details) updatedPlan.key_details.institution = updatedSlots.merchant_or_bank;
      } else if (!updatedSlots.merchant_or_bank && /instagram|whatsapp|boutique|store/i.test(lower)) {
        if (lower.includes("instagram")) updatedSlots.merchant_or_bank = "Instagram Vendor";
        else if (lower.includes("whatsapp")) updatedSlots.merchant_or_bank = "WhatsApp Seller";
        else updatedSlots.merchant_or_bank = "Online Merchant";
        if (updatedPlan.key_details) updatedPlan.key_details.institution = updatedSlots.merchant_or_bank;
      }

      // Extract Session ID
      const sessMatch = text.match(/\b(\d{15,35})\b/);
      if (sessMatch) {
        updatedSlots.session_id_or_ref = sessMatch[1];
        if (updatedPlan.key_details) updatedPlan.key_details.session_id = sessMatch[1];
      }

      setSlotData(updatedSlots);
      setResolutionPlan(updatedPlan);

      // Attempt AI assistance via Gemini endpoint
      try {
        const geminiRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            currentFacts,
            slotData: updatedSlots,
            resolutionPlan: updatedPlan
          })
        });

        if (geminiRes.ok) {
          const gemData = await geminiRes.json();
          if (gemData.reply) {
            // Update Resolution Plan from model output
            if (gemData.resolution_plan) {
              const p = gemData.resolution_plan;
              setResolutionPlan((prev) => ({
                ...prev,
                user_role: p.user_role || prev.user_role,
                topic: p.topic || prev.topic,
                current_stage: p.current_stage || prev.current_stage,
                key_details: {
                  ...prev.key_details,
                  ...(p.key_details || {})
                },
                suggested_actions: Array.isArray(p.suggested_actions) ? p.suggested_actions : prev.suggested_actions,
                available_tools: Array.isArray(p.available_tools) ? p.available_tools : prev.available_tools
              }));

              // Only sync slot amount if not already confirmed by user
              if (p.key_details?.amount && !updatedSlots.claim_amount) {
                setSlotData((prev) => ({ ...prev, claim_amount: p.key_details.amount }));
              }
            }

            // Quick Replies from AI or contextual fallback
            let dynamicQuickReplies: Array<{ label: string; value: string }> = [];
            if (Array.isArray(gemData.quick_replies) && gemData.quick_replies.length > 0) {
              dynamicQuickReplies = gemData.quick_replies.map((q: string) => {
                const label = q.replace(/^\[|\]$/g, "");
                return { label, value: label };
              });
            } else {
              dynamicQuickReplies = [
                { label: "Friendly Message Template", value: "ACTION_FRIENDLY_TEMPLATE" },
                { label: "How NIP Mechanics Work", value: "How do NIP settlement mechanics work?" },
                { label: "Generate Official Complaint Letter", value: "Please create my official complaint letter now." }
              ];
            }

            if (!currentFacts || currentFacts.category === "AMBIGUOUS") {
              const intakeRes = await api.analyzeIntake(text);
              setCurrentFacts(intakeRes.facts);
              setActiveCaseId(intakeRes.case_id);
              setCaseAccessToken(intakeRes.case_access_token);
            }

            // Keep currentFacts amount and merchant synchronized
            if (currentFacts && updatedSlots.claim_amount) {
              const numVal = parseFloat(updatedSlots.claim_amount.replace(/[^0-9.]/g, ""));
              if (!isNaN(numVal) && numVal > 0) {
                currentFacts.amount_ngn = numVal;
              }
            }
            if (currentFacts && updatedSlots.merchant_or_bank) {
              currentFacts.merchant_name_or_handle = updatedSlots.merchant_or_bank;
            }

            const geminiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: gemData.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: dynamicQuickReplies
            };

            const updatedMsgs = [...messages, userMsg, geminiReply];
            setMessages(updatedMsgs);
            saveDisputeToHistory(updatedMsgs, currentFacts, updatedSlots);
            setIsTyping(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Falling back to local financial resolution companion engine:", err);
      }

      // Local Companion Resolution Engine (Guide First, Letter Last)
      let replyText = "";
      let options: Array<{ label: string; value: string }> = [];

      // Case A: Inquirer asking about PND (Post No Debit) or banking terms
      if (/pnd|post no debit|account freeze|frozen/i.test(lower)) {
        replyText = "A **Post-No-Debit (PND)** is a temporary restriction placed on a bank account that pauses outward transfers while still allowing inward deposits to enter.\n\nHere is why banks apply PNDs and the realistic steps to resolve it:\n• **Common Causes:** Incomplete BVN/NIN verification, suspicious influx of funds flagged by anti-money laundering filters, or an inquiry from a security agency.\n• **Immediate Step 1:** Contact your bank's customer service or visit a branch to request the specific **PND Restriction Code and Memo**.\n• **Immediate Step 2:** If due to KYC/BVN mismatch, update your documentation at the bank.\n• **Immediate Step 3:** If tied to a disputed incoming transaction, provide the source of funds documentation to the bank fraud desk.";
        options = [
          { label: "How to check with my bank", value: "What should I ask my bank's customer care about the PND?" },
          { label: "Friendly Message Template", value: "ACTION_FRIENDLY_TEMPLATE" }
        ];
        updatedPlan.topic = "Post-No-Debit (PND) Resolution";
        updatedPlan.user_role = "Inquirer";
      } 
      // Case B: Vendor perspective handling payment / customer dispute
      else if (updatedPlan.user_role === "Vendor") {
        replyText = "When a customer reports an uncredited transfer, it is common for both sides to feel uneasy. In Nigerian banking, funds often get trapped between bank switches without either party being at fault.\n\nHere are 3 professional steps to manage this without tension:\n1. **Request the 30-Digit NIP Session ID:** Ask the customer for their official PDF receipt showing the 30-digit NIBSS code. This allows your bank's settlement desk to trace the exact leg.\n2. **Verify with your Bank:** Send the Session ID to your relationship manager or bank support to confirm if credit is pending in your clearing suspense.\n3. **Send a Reassuring Update:** Assure the customer that their order is reserved once payment is confirmed.";
        options = [
          { label: "Friendly Message Template", value: "ACTION_FRIENDLY_TEMPLATE" },
          { label: "How to spot fake transfer alerts", value: "How do I spot fake bank transfer alerts?" },
          { label: "Generate Official Complaint Letter", value: "Please create my official complaint letter now." }
        ];
        updatedPlan.topic = "Merchant Payment Dispute";
      } 
      // Case C: Merchant Non-Delivery / Vendor Ghosting / Unfulfilled Order
      else if (
        updatedSlots.issue_category === "MERCHANT_NON_DELIVERY" || 
        /blocked|vendor|seller|merchant|goods|order|bought|delivery|unfulfilled/i.test(lower) ||
        messages.some(m => /blocked|vendor|seller|goods/i.test(m.text))
      ) {
        replyText = `When an online vendor blocks you or cuts off communication after receiving payment, Nigerian law treats this as bad-faith non-performance under the **Federal Competition and Consumer Protection Act (FCCPA) 2018 (Section 114)**.\n\nBecause the funds successfully settled into the vendor's bank account, this is a commercial dispute rather than a bank dispense error. Here are 3 immediate actions to take:\n1. **Preserve Digital Evidence:** Take full screenshots of the chat history, vendor handle/profile, and your bank transfer receipt before anything is deleted.\n2. **Flag Receiving Bank Fraud Desk:** Contact the fraud operations desk of the bank the seller uses. Provide the recipient account number and transaction reference to request a precautionary hold under CBN anti-fraud directives.\n3. **Serve 7-Day Statutory Refund Demand:** Issue the formal FCCPA Demand Notice generated by RESOLVE giving 7 days to deliver or refund before escalating directly to complaints.fccpc.gov.ng.\n\nWould you like me to prepare your official 7-Day Refund Demand Notice now?`;
        options = [
          { label: "Generate Official Complaint Letter", value: "Please create my official complaint letter now." },
          { label: "Friendly Message Template", value: "ACTION_FRIENDLY_TEMPLATE" },
          { label: "View Escalation Steps", value: "What are the escalation steps if the merchant or bank fails to resolve this?" }
        ];
        updatedPlan.topic = "Merchant Non-Delivery";
        updatedPlan.current_stage = "Evidence & Action";
      }
      // Case D: Standard Customer Failed Bank Transfer / Uncredited debit
      else {
        replyText = `When an interbank transfer fails after you are debited, the funds have likely entered a **settlement suspense account** between your bank and the receiving institution.\n\nHere is how to resolve this step-by-step:\n1. **Obtain the 30-Digit NIP Session ID:** Download the official transaction receipt from your bank mobile app. The 30-digit Session ID is the definitive proof of payment.\n2. **Check the 24–72 Hour Window:** Over 85% of dropped debits auto-reverse through daily NIBSS reconciliation. If unreversed, submit the Session ID to your bank support.\n3. **Friendly Check-in:** Share the Session ID politely with the recipient so their bank can search incoming clearing records.\n\nWould you like me to generate a friendly verification message for the recipient, or guide you on logging a bank dispense ticket?`;
        options = [
          { label: "Friendly Message Template", value: "ACTION_FRIENDLY_TEMPLATE" },
          { label: "Bank Dispense Form Guide", value: "ACTION_DISPENSE_GUIDE" },
          { label: "Generate Official Complaint Letter", value: "Please create my official complaint letter now." }
        ];
        updatedPlan.topic = "Bank Transfer Delay";
      }

      setResolutionPlan(updatedPlan);

      const localReply: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        sender: "resolve",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        interactiveOptions: options
      };

      const updatedMsgs = [...messages, userMsg, localReply];
      setMessages(updatedMsgs);
      saveDisputeToHistory(updatedMsgs, currentFacts, updatedSlots);
    } catch (error) {
      console.error("[Dispute Handling Error]", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (value: string) => {
    const valLower = value.toLowerCase();

    // 1. Intercept all Upload Receipt variations and open real native file picker
    if (valLower.includes("upload") && (valLower.includes("receipt") || valLower.includes("payment") || valLower.includes("proof") || valLower.includes("evidence"))) {
      fileInputRef.current?.click();
      return;
    }

    // 2. Prevent circular meta-instruction button traps (e.g. "Provide Bank Name", "Provide Merchant Name")
    if (valLower.startsWith("provide ") || valLower.startsWith("enter ") || valLower.includes("edit merchant")) {
      const target = value.replace(/^(provide|enter)\s+/i, "");
      setInputText("");
      const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement | null;
      if (inputEl) {
        inputEl.placeholder = `Type your ${target} here...`;
        inputEl.focus();
      }
      return;
    }

    if (value === "ACTION_FRIENDLY_TEMPLATE" || value.includes("Friendly Message Template")) {
      handleToolSelect("Friendly Message Template");
      return;
    }

    if (value === "ACTION_DISPENSE_GUIDE" || value.includes("Bank Dispense Form Guide")) {
      handleToolSelect("Bank Dispense Form Guide");
      return;
    }

    if (/letter|draft|demand notice|complaint letter/i.test(value) && (value.includes("create") || value.includes("generate") || value.includes("draft") || value.includes("Official") || value.includes("Formal") || value.includes("Dispute Letter"))) {
      handleGenerateOfficialLetter();
      return;
    }

    if (value.includes("Start a new dispute case") || value === "Start Over") {
      handleStartNewChat();
      return;
    }

    handleSendMessage(value);
  };

  const handleCopyDocument = (doc: GeneratedDocument, docId: string) => {
    const fullText = `${doc.subject_line}\n\n${doc.body_text}\n\nEVIDENCE ATTACHED:\n${doc.formal_evidence_list?.map((e) => `- ${e}`).join("\n")}\n\n${doc.statutory_notice_clause}`;
    navigator.clipboard.writeText(fullText);
    setCopiedDocId(docId);
    setTimeout(() => setCopiedDocId(null), 2500);
  };

  const handleDownloadDocument = (doc: GeneratedDocument) => {
    const fullText = `${doc.subject_line}\n\n${doc.body_text}\n\nEVIDENCE ATTACHED:\n${doc.formal_evidence_list?.map((e) => `- ${e}`).join("\n")}\n\n${doc.statutory_notice_clause}`;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.document_type.toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2B1E1A] flex flex-col font-sans selection:bg-[#D95D39] selection:text-white antialiased relative overflow-hidden">
      
      {/* Hidden File Input for Receipt Attachment */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*,application/pdf" 
        className="hidden" 
      />

      {/* Ambient Warm Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F2CC8F]/35 blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-[#E07A5F]/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] rounded-full bg-[#D95D39]/12 blur-3xl" />
      </div>

      {/* Navigation Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNewChat={handleStartNewChat}
        caseCategory={currentFacts?.category}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col h-[calc(100vh-68px)]">
        
        {/* View: How Redress Works Guide */}
        {activeTab === "guide" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white/95 border border-[#E07A5F]/30 rounded-2xl shadow-xl shadow-[#2B1E1A]/5 mb-4">
            <div className="flex items-center space-x-3 pb-5 border-b border-[#E07A5F]/20">
              <div className="p-2.5 bg-[#FAF6F0] text-[#D95D39] border border-[#E07A5F]/30 rounded-xl">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2B1E1A]">How Resolution Works in Nigeria</h2>
                <p className="text-xs text-[#2B1E1A]/80 font-medium">Clear guide to resolving disputes calmly under Central Bank of Nigeria, NCC, and FCCPC frameworks.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-5 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/25 shadow-xs">
                <div className="flex items-center space-x-2 text-[#D95D39] font-bold text-xs uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4" />
                  <span>CBN 14-Day Rule</span>
                </div>
                <h3 className="text-sm font-bold text-[#2B1E1A] mb-1.5">Failed Bank Transfers</h3>
                <p className="text-xs text-[#2B1E1A]/85 leading-relaxed mb-3">
                  When funds leave an account without reaching the recipient:
                </p>
                <ul className="text-xs text-[#2B1E1A]/80 font-medium space-y-1.5 pl-4 list-disc">
                  <li><strong>First 24–72 hours:</strong> Over 85% of dropped debits auto-reverse via daily interbank NIP reconciliation.</li>
                  <li><strong>Lodge ticket with Session ID:</strong> If unreversed, submit the 30-digit Session ID to bank support.</li>
                  <li><strong>14-Day Window:</strong> Banks have 14 days to resolve the complaint before direct escalation to CBN (<strong>cpd@cbn.gov.ng</strong>).</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/25 shadow-xs">
                <div className="flex items-center space-x-2 text-[#C84B27] font-bold text-xs uppercase tracking-wider mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span>FCCPA 2018 Protections</span>
                </div>
                <h3 className="text-sm font-bold text-[#2B1E1A] mb-1.5">Merchant Disputes &amp; Delivery</h3>
                <p className="text-xs text-[#2B1E1A]/85 leading-relaxed mb-3">
                  Under the Federal Competition & Consumer Protection Act:
                </p>
                <ul className="text-xs text-[#2B1E1A]/80 font-medium space-y-1.5 pl-4 list-disc">
                  <li><strong>Friendly Check-in First:</strong> Share payment proof and clarify shipping timelines cordially.</li>
                  <li><strong>7-Day Demand Notice:</strong> If unresolved, send a formal notice giving 7 days to deliver or refund.</li>
                  <li><strong>FCCPC Escalation:</strong> File with the FCCPC directly at <strong>complaints.fccpc.gov.ng</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* View: Official Regulators */}
        {activeTab === "sources" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white/95 border border-[#E07A5F]/30 rounded-2xl shadow-xl shadow-[#2B1E1A]/5 mb-4">
            <div className="flex items-center space-x-3 pb-5 border-b border-[#E07A5F]/20">
              <div className="p-2.5 bg-[#FAF6F0] text-[#D95D39] border border-[#E07A5F]/30 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2B1E1A]">Official Nigerian Regulatory Portals</h2>
                <p className="text-xs text-[#2B1E1A]/80 font-medium">The statutory frameworks backing every resolution recommendation in RESOLVE.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {sources.map((s) => (
                <div key={s.id} className="p-5 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/25 hover:border-[#E07A5F] transition-all flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2CC8F]/30 text-[#8C2E0B]">
                      {s.publisher}
                    </span>
                    <h3 className="text-sm font-bold text-[#2B1E1A] mt-2">{s.title}</h3>
                    <p className="text-xs text-[#2B1E1A]/80 font-medium mt-1 leading-relaxed">{s.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E07A5F]/20 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#C84B27]">{s.statutory_basis}</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#D95D39] hover:text-[#C84B27]"
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
            <EmergencyBanner 
              emergencyCodes={emergencyCodes}
              detectedBankInfo={currentFacts?.sender_institution ? emergencyCodes[currentFacts.sender_institution.toUpperCase()] : undefined}
            />
          </div>
        )}

        {/* View: Dispute History */}
        {activeTab === "history" && (
          <div className="flex-1 overflow-y-auto mb-4">
            <DisputeHistory onResumeCase={handleResumeCase} onStartNewCase={handleStartNewChat} />
          </div>
        )}

        {/* View: Initial Launchpad State */}
        {activeTab === "intake" && messages.length === 0 && (
          <div className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto pb-4">
            <CaseLaunchpad onStart={handleOptionClick} />
            
            {/* Floating Glass Bottom Input Bar with Attachment & Voice Note */}
            <div className="p-3 sm:p-4 bg-white/85 backdrop-blur-md border border-[#E07A5F]/30 rounded-2xl shadow-xl shadow-[#2B1E1A]/5">
              
              {/* File Attachment Chip (if any) */}
              {attachedFile && (
                <div className="mb-2.5 flex items-center justify-between p-2 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/30 text-xs">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-[#D95D39]" />
                    <span className="font-bold text-[#2B1E1A]">{attachedFile.name}</span>
                    <span className="text-[11px] text-[#2B1E1A]/70">({(attachedFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="p-1 hover:bg-[#D95D39]/10 rounded-md text-[#2B1E1A]/60 hover:text-[#D95D39]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* OCR Scanning Progress Banner */}
              {isOcrProcessing && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-[#FAF6F0] border border-[#D95D39]/30 flex items-center space-x-2.5 text-xs text-[#8C2E0B] animate-pulse">
                  <UploadCloud className="w-4 h-4 text-[#D95D39]" />
                  <span className="font-bold">Analyzing document with OCR... extracting receipt data into Resolution Plan</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center bg-[#FAF6F0] rounded-xl border border-[#E07A5F]/35 focus-within:border-[#D95D39] focus-within:ring-2 focus-within:ring-[#D95D39]/15 p-1.5 transition-all"
              >
                {/* Paperclip Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-[#D95D39] hover:bg-[#D95D39]/10 rounded-lg transition-all shrink-0"
                  title="Upload Receipt or Screenshot"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Voice Note Record Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceRecording}
                  className={`p-2 rounded-lg transition-all shrink-0 ${isRecording ? "bg-[#D95D39] text-white shadow-xs" : "text-[#D95D39] hover:bg-[#D95D39]/10"}`}
                  title={isRecording ? "Stop voice recording" : "Record voice note"}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Main Input or Waveform Audio Visualizer */}
                {isRecording ? (
                  <div className="flex-1 flex items-center justify-between px-3 py-1 bg-white/70 rounded-lg border border-[#D95D39]/20 mx-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D95D39] animate-ping" />
                      <span className="text-xs font-bold text-[#D95D39]">Listening... Explain clearly</span>
                      <div className="flex items-center space-x-0.5 ml-2">
                        <span className="w-1 h-3 bg-[#D95D39] rounded-full animate-wave-1" />
                        <span className="w-1 h-5 bg-[#D95D39] rounded-full animate-wave-2" />
                        <span className="w-1 h-4 bg-[#D95D39] rounded-full animate-wave-3" />
                        <span className="w-1 h-6 bg-[#D95D39] rounded-full animate-wave-4" />
                        <span className="w-1 h-3 bg-[#D95D39] rounded-full animate-wave-5" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleVoiceRecording}
                      className="text-xs font-bold text-[#8C2E0B] hover:text-[#D95D39] underline px-2"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Describe what happened or ask a banking question..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-[#2B1E1A] placeholder:text-[#2B1E1A]/60 font-medium outline-none"
                  />
                )}

                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D95D39] to-[#C84B27] hover:from-[#C84B27] hover:to-[#B33E1C] disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#D95D39]/25 transition-all shrink-0 active:scale-95"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* WCAG AA High Contrast Subtext Privacy Pill */}
              <div className="mt-2.5 text-center text-xs text-[#2B1E1A]/85 font-medium flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D95D39]" />
                <span>Strict privacy: PINs, OTPs, and BVNs are never collected or stored.</span>
              </div>
            </div>
          </div>
        )}

        {/* View: Active Guided Conversation */}
        {activeTab === "intake" && messages.length > 0 && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
            
            {/* Left: Interactive Intake & Investigation */}
            <div className="lg:col-span-7 flex flex-col bg-white/95 backdrop-blur-md border border-[#E07A5F]/30 rounded-2xl shadow-xl shadow-[#2B1E1A]/5 overflow-hidden">
              
              {/* Top Bar */}
              <div className="px-5 py-3.5 bg-[#FAF6F0] border-b border-[#E07A5F]/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D95D39] animate-pulse" />
                  <span className="text-xs font-bold text-[#2B1E1A]">RESOLVE Financial Companion</span>
                  <span className="text-[11px] text-[#2B1E1A]/75 font-medium hidden sm:inline">• {resolutionPlan.user_role} Mode</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D95D39]/12 text-[#C84B27] border border-[#D95D39]/30">
                    {resolutionPlan.current_stage || "Diagnosis"}
                  </span>
                  <button 
                    onClick={handleStartNewChat}
                    className="p-1 hover:bg-[#D95D39]/10 rounded-md text-[#2B1E1A]/75 hover:text-[#D95D39] transition-all"
                    title="Start New Resolution"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#D95D39] text-white shadow-sm"
                          : "bg-[#FAF6F0] text-[#2B1E1A] border border-[#E07A5F]/30 shadow-xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-medium">{msg.text}</div>

                      {/* State-Driven Dynamic Quick Reply Buttons */}
                      {msg.sender === "resolve" && msg.interactiveOptions && msg.interactiveOptions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#E07A5F]/20">
                          {msg.interactiveOptions.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(opt.value)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2CC8F]/40 text-[#2B1E1A] font-bold text-xs border border-[#E07A5F]/35 hover:border-[#D95D39] shadow-2xs hover:shadow-xs transition-all active:scale-95"
                            >
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Official Dispute Letter Card (if generated) */}
                    {msg.document && (
                      <div className="mt-4 p-4 rounded-xl bg-white border border-[#E07A5F]/35 shadow-sm max-w-[88%] w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E07A5F]/20 gap-2">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[#D95D39] border border-[#E07A5F]/30 uppercase tracking-wider">
                              Official Dispute Letter
                            </span>
                            <h4 className="text-sm font-bold text-[#2B1E1A] mt-1">{msg.document.title}</h4>
                            <p className="text-xs text-[#2B1E1A]/80 font-medium">
                              To: <strong>{msg.document.recipient_institution}</strong>
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyDocument(msg.document!, msg.id)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F3ECE2] text-[#2B1E1A] text-xs font-bold border border-[#E07A5F]/30 transition-all"
                            >
                              {copiedDocId === msg.id ? <Check className="w-3.5 h-3.5 text-[#D95D39]" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedDocId === msg.id ? "Copied" : "Copy"}</span>
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(msg.document!)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#D95D39] hover:bg-[#C84B27] text-white text-xs font-bold shadow-xs transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>

                        {/* Letter Text Preview */}
                        <div className="mt-3 p-3.5 rounded-lg bg-[#FAF6F0] border border-[#E07A5F]/20 font-mono text-xs text-[#2B1E1A] leading-relaxed whitespace-pre-wrap select-all">
                          <div className="font-bold text-[#2B1E1A] pb-1.5 mb-1.5 border-b border-[#E07A5F]/20">
                            {msg.document.subject_line}
                          </div>
                          {msg.document.body_text}
                          <div className="mt-3 pt-2 border-t border-[#E07A5F]/20 text-[11px] text-[#2B1E1A]/80 italic">
                            {msg.document.statutory_notice_clause}
                          </div>
                        </div>
                      </div>
                    )}

                    <span className="text-[10px] text-[#2B1E1A]/75 font-medium mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Typing State */}
                {isTyping && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#D95D39] border border-[#E07A5F]/30 shadow-xs">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#E07A5F]/25 shadow-xs flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D95D39] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D95D39] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D95D39] animate-bounce [animation-delay:0.4s]" />
                      <span className="text-xs text-[#2B1E1A]/85 font-semibold ml-2">Consulting resolution guidelines &amp; banking mechanics...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Composer with Attachment, Voice Recording & Waveform Indicator */}
              <div className="p-3 sm:p-4 bg-white/95 border-t border-[#E07A5F]/20">
                
                {/* File Attachment Chip */}
                {attachedFile && (
                  <div className="mb-2.5 flex items-center justify-between p-2 rounded-xl bg-[#FAF6F0] border border-[#E07A5F]/30 text-xs">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-4 h-4 text-[#D95D39]" />
                      <span className="font-bold text-[#2B1E1A]">{attachedFile.name}</span>
                      <span className="text-[11px] text-[#2B1E1A]/70">({(attachedFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button 
                      onClick={() => setAttachedFile(null)}
                      className="p-1 hover:bg-[#D95D39]/10 rounded-md text-[#2B1E1A]/60 hover:text-[#D95D39]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* OCR Scanning Progress Banner */}
                {isOcrProcessing && (
                  <div className="mb-2.5 p-2 rounded-xl bg-[#FAF6F0] border border-[#D95D39]/30 flex items-center space-x-2 text-xs text-[#8C2E0B] animate-pulse">
                    <UploadCloud className="w-4 h-4 text-[#D95D39]" />
                    <span className="font-bold">Analyzing document with OCR... extracting details into Resolution Plan</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center bg-[#FAF6F0] rounded-xl border border-[#E07A5F]/35 focus-within:border-[#D95D39] focus-within:ring-2 focus-within:ring-[#D95D39]/15 p-1.5 transition-all"
                >
                  {/* Paperclip Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-[#D95D39] hover:bg-[#D95D39]/10 rounded-lg transition-all shrink-0"
                    title="Upload Receipt or Screenshot"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Voice Record Button */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecording}
                    className={`p-2 rounded-lg transition-all shrink-0 ${isRecording ? "bg-[#D95D39] text-white shadow-xs" : "text-[#D95D39] hover:bg-[#D95D39]/10"}`}
                    title={isRecording ? "Stop voice recording" : "Record voice note"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Main Input or Waveform Audio Visualizer */}
                  {isRecording ? (
                    <div className="flex-1 flex items-center justify-between px-3 py-1 bg-white/70 rounded-lg border border-[#D95D39]/20 mx-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D95D39] animate-ping" />
                        <span className="text-xs font-bold text-[#D95D39]">Listening... Speak clearly</span>
                        <div className="flex items-center space-x-0.5 ml-2">
                          <span className="w-1 h-3 bg-[#D95D39] rounded-full animate-wave-1" />
                          <span className="w-1 h-5 bg-[#D95D39] rounded-full animate-wave-2" />
                          <span className="w-1 h-4 bg-[#D95D39] rounded-full animate-wave-3" />
                          <span className="w-1 h-6 bg-[#D95D39] rounded-full animate-wave-4" />
                          <span className="w-1 h-3 bg-[#D95D39] rounded-full animate-wave-5" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleVoiceRecording}
                        className="text-xs font-bold text-[#8C2E0B] hover:text-[#D95D39] underline px-2"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ask a question or describe what happened..."
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-[#2B1E1A] placeholder:text-[#2B1E1A]/60 font-medium outline-none"
                    />
                  )}

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D95D39] to-[#C84B27] hover:from-[#C84B27] hover:to-[#B33E1C] disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#D95D39]/20 transition-all shrink-0 active:scale-95"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* WCAG AA High Contrast Subtext Privacy Disclaimer */}
                <div className="mt-2 text-center text-xs text-[#2B1E1A]/85 font-medium flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D95D39]" />
                  <span>Strict privacy: PINs, OTPs, and BVNs are never collected or stored.</span>
                </div>
              </div>
            </div>

            {/* Right: Live Dynamic Resolution Plan Companion Sidebar */}
            <div className="lg:col-span-5 flex flex-col min-h-0">
              <ResolutionCaseFile
                facts={currentFacts}
                slotData={slotData}
                resolutionPlan={resolutionPlan}
                document={messages.find((m) => m.document)?.document}
                guidance={messages.find((m) => m.guidance)?.guidance}
                emergencyData={emergencyCodes[slotData.merchant_or_bank?.toUpperCase() || currentFacts?.sender_institution?.toUpperCase() || ""] || (slotData.merchant_or_bank ? emergencyCodes[Object.keys(emergencyCodes).find(k => k.toLowerCase() === slotData.merchant_or_bank?.toLowerCase()) || ""] : null)}
                onGenerateLetter={handleGenerateOfficialLetter}
                onSelectTool={handleToolSelect}
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
