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
  Scale, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Clock, 
  Smartphone, 
  ShoppingBag, 
  HelpCircle, 
  Zap, 
  Lock, 
  FileText, 
  ShieldCheck,
  BookOpen,
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
  interactiveOptions?: Array<{ label: string; value: string }>;
  evidenceChecklist?: Array<{ id: string; title: string; description: string; is_mandatory: boolean }>;
  document?: GeneratedDocument;
  guidance?: ResolutionGuidance;
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

  // Active Ongoing Case Facts (Preserved across all turns)
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [caseAccessToken, setCaseAccessToken] = useState<string | null>(null);
  const [currentFacts, setCurrentFacts] = useState<ExtractedCaseFacts | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    api.getEmergencyCodes().then(setEmergencyCodes).catch(console.error);
    api.getSources().then(setSources).catch(console.error);

    // Initial warm greeting
    const welcomeMessage: ChatMessage = {
      id: "msg_welcome",
      sender: "resolve",
      text: "Hello! I am Resolve, your personal transaction dispute assistant for Nigeria.\n\nIf you experienced a failed bank transfer, missing airtime/data, an online vendor refusing delivery, or an unauthorized debit, I will help you sort it out step by step under CBN, NCC, or FCCPC rules.\n\nTell me what happened, or tap one of the common issues below to begin:",
      timestamp: "Just now",
      interactiveOptions: [
        { label: "Failed Bank Transfer", value: "I was debited for a transfer and the recipient never received the money." },
        { label: "Vendor Refused Delivery", value: "I paid an online vendor on Instagram or WhatsApp and they stopped responding." },
        { label: "Missing Airtime / Data", value: "My bank debited me for airtime or data, but my phone was never credited." },
        { label: "Stolen Phone / Fraud Alert", value: "My phone was stolen or I noticed an unauthorized debit on my account." }
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
      const lower = text.toLowerCase();

      // 1. Direct Question Handler: "What does SLA mean?"
      if (/what does sla mean|what is sla|meaning of sla|explain sla/i.test(lower)) {
        const slaReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: "SLA stands for **Service Level Agreement**.\n\nIn Nigerian banking, an SLA is the **legally mandated deadline** that your bank has to resolve an issue.\n\nUnder Central Bank of Nigeria (CBN) regulations, commercial banks have a **14-day mandatory SLA** to investigate and resolve failed electronic transfer complaints after you lodge a ticket.\n\nIf your bank fails to refund or resolve the transaction within that 14-day window, you earn the legal right to escalate directly to the Central Bank of Nigeria (cpd@cbn.gov.ng) for regulatory enforcement.\n\nHave you already reported this failed transfer to your bank, or would you like to draft a formal complaint letter now?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          interactiveOptions: [
            { label: "Yes, I logged a ticket with my bank", value: "Yes, I opened a complaint ticket with customer care." },
            { label: "No, I haven't reported it yet", value: "No, I have not reported it to my bank yet." },
            { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." }
          ]
        };
        setMessages((prev) => [...prev, slaReply]);
        setIsTyping(false);
        return;
      }

      // 2. Direct Question Handler: "Where is the Session ID?"
      if (/how do i find|where is the session id|where to find|what is a session id/i.test(lower) && lower.includes("session")) {
        const sessionReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: "To find your 30-digit NIBSS Session ID:\n\n1. Open your bank mobile app and tap on the transaction in your history.\n2. View or download the official transaction receipt.\n3. Look for a 30-digit number labeled **Session ID**, **NIBSS Ref**, or **Transaction Reference** (it usually begins with your bank's 6-digit code, like 100004... or 000014...).\n\nThis 30-digit code is the definitive proof that allows the receiving bank to locate the money in their backend ledger.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          interactiveOptions: [
            { label: "I have the Session ID", value: "I have found my 30-digit Session ID on the receipt." },
            { label: "My receipt only shows a short reference", value: "My receipt only has a short reference number, not 30 digits." },
            { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." }
          ]
        };
        setMessages((prev) => [...prev, sessionReply]);
        setIsTyping(false);
        return;
      }

      // 3. Direct Question Handler: Cryptocurrency / P2P Disputes
      if (/crypto|cryptocurrency|bitcoin|btc|usdt|eth|p2p|binance|bybit|kucoin/i.test(lower)) {
        const cryptoReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: "Cryptocurrency and P2P trades operate under specific regulatory boundaries in Nigeria:\n\n1. **No Bank / CBN SLA Reversals**: Under Central Bank of Nigeria (CBN) regulations, commercial banks **cannot reverse blockchain transfers** or intervene in P2P crypto trades. NIBSS Session IDs only trace Naira bank-to-bank transfers, not crypto.\n\n2. **P2P Exchange Trades (Binance, Bybit, KuCoin)**: If you transferred crypto on a P2P exchange and haven't received the cash transfer, **DO NOT release the crypto or confirm payment!** Click the **Appeal** button immediately inside the exchange app before the countdown timer expires. The platform's escrow will lock the funds pending proof.\n\n3. **Did you transfer Naira to buy crypto?** If your Nigerian bank debited your account for a Naira transfer to a P2P merchant who claims they never got it, that **Naira transfer leg** can be traced using your bank's 30-digit NIBSS Session ID.\n\n4. **Off-Exchange / WhatsApp Scams**: If you sent crypto directly to an unverified private wallet or Telegram/WhatsApp contact, banks have no mechanism to retrieve it. This is criminal fraud under the Cybercrimes Act 2015 and must be escalated to the Police Special Fraud Unit (PSFU) or EFCC.\n\nWhich of these situations matches what happened?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          interactiveOptions: [
            { label: "P2P Exchange Appeal (Binance/Bybit)", value: "I traded on a P2P exchange and haven't received cash." },
            { label: "My bank debited me for Naira", value: "My bank debited me for the Naira transfer to buy crypto." },
            { label: "I was scammed outside an exchange", value: "I sent crypto directly to someone outside an exchange." }
          ]
        };
        setMessages((prev) => [...prev, cryptoReply]);
        setIsTyping(false);
        return;
      }

      // 4. User asking for a formal letter
      const wantsLetter = /draft|letter|petition|official document|demand notice|complaint letter/i.test(text);
      if (wantsLetter && currentFacts) {
        const doc = await api.generateDocument(activeCaseId || undefined, caseAccessToken || undefined, currentFacts);
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

      // 4. Try live Gemini on Vercel
      try {
        const geminiRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            currentFacts
          })
        });

        if (geminiRes.ok) {
          const gemData = await geminiRes.json();
          if (gemData.reply) {
            // Also update category/facts if not already set
            if (!currentFacts || currentFacts.category === "AMBIGUOUS") {
              const intakeRes = await api.analyzeIntake(text);
              setCurrentFacts(intakeRes.facts);
              setActiveCaseId(intakeRes.case_id);
              setCaseAccessToken(intakeRes.case_access_token);
            }

            const geminiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: gemData.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
                { label: "What is my next step?", value: "What is my exact next step to resolve this?" }
              ]
            };
            setMessages((prev) => [...prev, geminiReply]);
            setIsTyping(false);
            return;
          }
        }
      } catch (err) {
        // Fallback to local rule engine
      }

      // Case 1: We ALREADY have an active ongoing case! (Never forget context!)
      if (currentFacts && currentFacts.category && currentFacts.category !== "AMBIGUOUS") {
        const updatedFacts = { ...currentFacts };

        // Carefully extract amount (ONLY if it's NOT followed by days/hours)
        const amtMatch = lower.match(/(?:₦|ngn|naira|#)\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)|([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\s*(?:naira|k|thousand)(?!\s*days?)/);
        if (amtMatch && !updatedFacts.amount_ngn) {
          const rawNum = amtMatch[1] || amtMatch[2];
          let val = parseFloat(rawNum.replace(/,/g, ""));
          if ((lower.includes("k") || lower.includes("thousand")) && val < 1000) val *= 1000;
          if (val >= 100) updatedFacts.amount_ngn = val;
        }

        // Extract sender bank ONLY if explicitly named
        const allBanks = [
          "Providus Bank", "Providus", "GTBank", "Access Bank", "Zenith Bank", "UBA", 
          "FirstBank", "OPay", "Moniepoint", "Kuda", "PalmPay", "Fidelity", "FCMB", 
          "Stanbic", "Sterling", "Wema", "Union Bank", "Keystone", "Jaiz", "TajBank"
        ];
        for (const b of allBanks) {
          if (lower.includes(b.toLowerCase())) {
            updatedFacts.sender_institution = b.includes("Providus") ? "Providus Bank" : b;
            break;
          }
        }

        // Critical: If user clarifies that the recipient/vendor hasn't received the money (and it's NOT crypto), this is a FAILED_TRANSFER
        if (/yet to receive|not received|didn't receive|did not receive|no enter|no credit|yet to get|hasn't gotten|has not gotten/i.test(lower) && !/crypto|bitcoin|btc|usdt|p2p/i.test(lower)) {
          updatedFacts.category = "FAILED_TRANSFER";
        }

        const sessMatch = text.match(/\b(\d{15,35})\b/);
        if (sessMatch) updatedFacts.session_id_or_ref = sessMatch[1];

        // Check timeline mention (e.g. 7 days, 14 days, yesterday)
        const waitedMatch = lower.match(/(?:waited|been|waiting|past|over|for)\s*([0-9]+)\s*days?/);
        let daysMentioned = waitedMatch ? parseInt(waitedMatch[1]) : undefined;
        if (!daysMentioned && lower.includes("7 days")) daysMentioned = 7;
        if (!daysMentioned && lower.includes("14 days")) daysMentioned = 14;
        if (!daysMentioned && (lower.includes("yesterday") || lower.includes("today") || lower.includes("48 hours"))) daysMentioned = 2;

        setCurrentFacts(updatedFacts);

        // Intelligently respond within the context of their category
        if (updatedFacts.category === "FAILED_TRANSFER") {
          const bankName = updatedFacts.sender_institution || "your bank";

          // If user specifically clarified that the recipient has not received the money
          if (/yet to receive|not received|didn't receive|no enter|she's yet to/i.test(lower) || (updatedFacts.sender_institution && daysMentioned)) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `Understood! Since the recipient has not received the money, this is a **Failed Interbank Transfer** from ${bankName}.\n\nBecause it has been ${daysMentioned ? `${daysMentioned} days` : "several days"} without an automatic reversal, the funds are stuck in NIBSS interbank transit.\n\nHere is your exact immediate step:\n1. **Locate your 30-digit NIBSS Session ID**: Download your receipt from the ${bankName} app.\n2. **Share with Recipient**: They can show this 30-digit number to their bank to check their incoming ledger.\n3. **Lodge Complaint with ${bankName}**: Under Central Bank of Nigeria (CBN) rules, ${bankName} has a **mandatory 14-day window** to resolve or reverse this.\n\nHave you already received an official Complaint Ticket ID from ${bankName}, or would you like me to prepare an official dispute letter now?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: `Yes, I logged a ticket with ${bankName}`, value: `Yes, I opened a complaint ticket with ${bankName}.` },
                { label: "No, I haven't reported it yet", value: "No, I have not reported it to my bank yet." },
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }
          // If user specifically said they have waited 7 days or more
          if (daysMentioned && daysMentioned >= 7 && daysMentioned < 14) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `Understood. Waiting ${daysMentioned} days without a reversal is deeply frustrating. Because more than 72 hours have passed, the automatic NIBSS interbank auto-reversal did not resolve it.\n\nHere is where you stand under Central Bank of Nigeria (CBN) regulations:\n\n1. **The 14-Day Bank SLA**: Under the CBN Consumer Protection Framework, commercial banks have a mandatory **14-day window** to resolve electronic payment complaints once logged.\n2. **Have you opened an official ticket?** If you have already reported this to your bank's customer service, that 14-day clock is currently running.\n3. **If 14 days expire without a refund**: You earn the legal right to escalate directly to the Central Bank of Nigeria Consumer Protection Department (cpd@cbn.gov.ng).\n\nHave you already received an official Complaint Ticket ID from your bank, or would you like to draft a formal complaint letter now?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Yes, I logged a ticket with my bank", value: "Yes, I opened a complaint ticket with customer care." },
                { label: "No, I haven't reported it to my bank yet", value: "No, I have not reported it to my bank yet." },
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          if (daysMentioned && daysMentioned >= 14) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `Because it has been **over 14 days** since the transaction with no refund, your bank has violated the Central Bank of Nigeria (CBN) dispute resolution deadline.\n\nYou are now legally entitled to escalate directly to the **CBN Consumer Protection Department (cpd@cbn.gov.ng)**.\n\nI can draft your official CBN escalation letter right now citing your transaction details and demanding immediate resolution.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
                { label: "What evidence should I attach?", value: "What evidence do I need to attach to the CBN complaint?" }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          // If user reports they have a ticket
          if (lower.includes("ticket") || lower.includes("logged") || lower.includes("reported")) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `That is good—logging the ticket started your bank's statutory 14-day resolution clock under CBN rules.\n\nWhile your bank investigates with the receiving bank across NIBSS, keep your Ticket ID and 30-digit Session ID handy.\n\nWould you like me to prepare a formal dispute letter for your records or to follow up with your bank's dispute desk?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
                { label: "What if the bank stops responding?", value: "What should I do if the bank stops responding after 14 days?" }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          // If user hasn't provided bank or amount yet
          if (!updatedFacts.sender_institution || !updatedFacts.amount_ngn) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: "To help you take the exact right step: which bank or app did you send the money from, and roughly how much was it?",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "GTBank", value: "I sent it from GTBank." },
                { label: "Access Bank", value: "I sent it from Access Bank." },
                { label: "OPay", value: "I sent it from my OPay app." },
                { label: "Zenith Bank", value: "I sent it from Zenith Bank." }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          // If both bank and amount are present
          const amountText = `NGN ${updatedFacts.amount_ngn.toLocaleString()}`;

          const aiReply: ChatMessage = {
            id: "msg_ai_" + Date.now(),
            sender: "resolve",
            text: `Got it: ${amountText} from ${bankName}.\n\nTo give you the most accurate next step: roughly how long ago did this transfer happen?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            interactiveOptions: [
              { label: "Happened within last 48 hours", value: "It happened within the last 48 hours." },
              { label: "I have waited 3 to 7 days", value: "I have already waited for 7 days the money has not been reversed." },
              { label: "Over 14 days ago without refund", value: "It has been more than 14 days with no refund." }
            ]
          };
          setMessages((prev) => [...prev, aiReply]);
          setIsTyping(false);
          return;
        }

        // If Merchant Non-delivery
        if (updatedFacts.category === "MERCHANT_NON_DELIVERY") {
          // A: User asks about Paystack or Flutterwave
          if (/paystack|flutterwave|online checkout|link|gateway/i.test(lower)) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `If you paid via an online checkout gateway like **Paystack** or **Flutterwave**, you have a fast recovery route:\n\n1. **Locate your Payment Reference**: Check your email receipt for a transaction reference starting with \`trx_\` (Paystack) or \`FLW-\` (Flutterwave).\n2. **File a Dispute Directly**: Submit the reference directly at **paystack.com/dispute** or **flutterwave.com/dispute**.\n3. **Merchant Settlement Lien**: Both gateways will temporarily freeze the merchant's pending settlement balance while investigating your delivery proof.\n\nDid you receive an email receipt with a transaction reference, or did you pay via direct bank transfer?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "I have the Paystack reference", value: "I have my payment reference number from the email receipt." },
                { label: "I paid via direct bank transfer", value: "I paid via a direct bank transfer to the seller's account." },
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          // B: User mentions direct bank transfer
          if (/direct bank transfer|bank transfer|transferred to|sent to account|paid with providus|paid with/i.test(lower)) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `Understood. Because you paid via direct bank transfer, the money settled straight into the merchant's bank account.\n\nHere is your exact recovery roadmap under Nigerian consumer protection law (FCCPA 2018):\n\n1. **Serve a 7-Day Statutory Demand Notice**: Before escalating to the FCCPC or law enforcement, the law requires formal evidence that you gave the vendor 7 calendar days to deliver the goods or refund your money.\n2. **Bank Fraud Desk Restriction**: You can take your bank transfer receipt and WhatsApp/Instagram chat history to your bank's dispute desk to request a fraud alert on the receiving account.\n3. **FCCPC Enforcement**: If the vendor ignores the 7-day notice, submit your formal case directly to the Federal Competition & Consumer Protection Commission (complaints.fccpc.gov.ng).\n\nWould you like me to draft your official 7-Day Statutory Refund Demand Notice now?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
                { label: "The seller blocked my line", value: "The seller blocked my phone number and WhatsApp after receiving payment." },
                { label: "What evidence do I need to attach?", value: "What evidence do I need to attach to the demand notice?" }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          // C: User mentions the seller blocked them or ghosted
          if (/blocked|ghosted|unreachable|deleted/i.test(lower)) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `Blocking your phone number or WhatsApp after accepting payment is **prima facie evidence of intentional commercial fraud** under Section 114 of the FCCPA 2018.\n\nHere are the critical steps to protect your claim immediately:\n\n1. **Preserve Digital Evidence**: Take full screenshots of the chat history, vendor handle, phone number, and bank account name before they delete their profile or messages.\n2. **Flag Receiving Account**: Report the vendor's account number to your bank's fraud desk as an active scam to restrict their BVN.\n3. **Official Redress Filing**: I will prepare a formal Statutory Demand Notice citing Section 114, which serves as your mandatory evidentiary backing for FCCPC escalation.\n\nWould you like me to generate your official dispute document now?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
                { label: "How to dispute via Paystack/Flutterwave?", value: "How do I dispute this if I paid with Paystack or Flutterwave?" },
                { label: "How to report to FCCPC", value: "How do I submit this directly to the FCCPC portal?" }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          // D: User asks about evidence to attach
          if (/evidence|attach|proof|documents/i.test(lower)) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `To ensure your dispute is airtight under FCCPA rules, assemble these four items:\n\n1. **Proof of Payment**: Official PDF transaction receipt from your bank showing the date, amount, and recipient account details.\n2. **Agreement / Order Summary**: Screenshots of the WhatsApp, Instagram DM, or invoice agreeing on the price, delivery timeframe, and items.\n3. **Proof of Breach / Ghosting**: Screenshots showing your follow-up inquiries being ignored, unanswered, or showing that you were blocked.\n4. **Official 7-Day Demand Notice**: The formal redress letter generated by Resolve.\n\nReady to generate your formal dispute letter?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
                { label: "How to report to FCCPC", value: "How do I submit this directly to the FCCPC portal?" }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          // E: User asks how to report to FCCPC
          if (/fccpc|portal|report to fccpc/i.test(lower)) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: `The **Federal Competition and Consumer Protection Commission (FCCPC)** is Nigeria's federal authority for consumer redress:\n\n1. Visit the official portal: **complaints.fccpc.gov.ng**\n2. Select "Submit New Consumer Complaint" and categorize under "E-Commerce / Online Purchase".\n3. Upload your transaction receipt, chat evidence, and the official 7-Day Demand Notice generated by Resolve.\n4. The FCCPC summons the vendor or freezes their registered business account if they fail to provide restitution.\n\nWould you like me to draft your official demand letter to attach to your FCCPC filing?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
                { label: "I paid via direct bank transfer", value: "I paid via a direct bank transfer to the seller's account." }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          // Default fallback for Merchant Non-delivery
          const aiReply: ChatMessage = {
            id: "msg_ai_" + Date.now(),
            sender: "resolve",
            text: `Under Section 114 of the Federal Competition and Consumer Protection Act (FCCPA) 2018, online vendors are legally required to deliver paid goods on time or issue a mandatory full refund.\n\nTo guide you on the fastest recovery path: did you pay the seller via direct bank transfer, or through an online checkout link like Paystack or Flutterwave?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            interactiveOptions: [
              { label: "Direct bank transfer to their account", value: "I paid via a direct bank transfer to the seller's account." },
              { label: "How to dispute via Paystack/Flutterwave?", value: "How do I dispute this if I paid with Paystack or Flutterwave?" },
              { label: "The seller blocked my line", value: "The seller blocked my phone number and WhatsApp after receiving payment." }
            ]
          };
          setMessages((prev) => [...prev, aiReply]);
          setIsTyping(false);
          return;
        }

        // If Undelivered Airtime / Data
        if (updatedFacts.category === "UNDELIVERED_AIRTIME_DATA") {
          if (/bank app|mobile app|app/i.test(lower)) {
            const aiReply: ChatMessage = {
              id: "msg_ai_" + Date.now(),
              sender: "resolve",
              text: "Since you purchased through your bank app, this is almost always a failure between your bank and the VTU aggregator (like Interswitch or Unified Payments), NOT the telecom network.\n\nCalling MTN, Airtel, Glo, or 9mobile will not help because their systems have no record of the payment.\n\nUnder NCC and CBN regulations, your bank must reverse the debit within **24 to 48 hours**. If it exceeds 48 hours, you have the right to lodge a formal complaint.\n\nWould you like me to draft a complaint letter to your bank's dispute desk?",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              interactiveOptions: [
                { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
                { label: "It has been over 48 hours", value: "It has been more than 48 hours and the money was not reversed." }
              ]
            };
            setMessages((prev) => [...prev, aiReply]);
            setIsTyping(false);
            return;
          }

          const aiReply: ChatMessage = {
            id: "msg_ai_" + Date.now(),
            sender: "resolve",
            text: "For airtime or data purchased directly from a telecom provider, the Nigerian Communications Commission (NCC) mandates resolution within 24 hours.\n\nIf your service has not been delivered or reversed, you can dial the **NCC Toll-Free Consumer Helpline at 622** from any mobile phone to register an immediate regulatory grievance.\n\nWould you like me to prepare a formal escalation complaint?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            interactiveOptions: [
              { label: "Create Official Complaint Letter", value: "Please create my official complaint letter now." },
              { label: "Bought from my bank mobile app", value: "I bought it through my bank mobile app." }
            ]
          };
          setMessages((prev) => [...prev, aiReply]);
          setIsTyping(false);
          return;
        }
      }

      // Case 2: Brand new intake conversation (First message)
      const intakeRes = await api.analyzeIntake(text);
      setActiveCaseId(intakeRes.case_id);
      setCaseAccessToken(intakeRes.case_access_token);
      setCurrentFacts(intakeRes.facts);

      // Scenario A: Active Emergency Fraud detected
      if (intakeRes.is_urgent_emergency) {
        const emergencyReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: "Active security emergency: Freeze your account immediately to prevent further withdrawals.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          empatheticIntro: "Please stay calm. Having your phone stolen or watching unauthorized debits happen is deeply frightening, but taking action right now will protect your balance. Your immediate priority is locking your account before visiting a branch.",
          immediateAdvice: "Dial your bank's emergency USSD code from any borrowed phone right now to lock mobile and card transactions.",
          isEmergency: true,
          emergencyData: intakeRes.emergency_instructions || emergencyCodes["GTBANK"],
          interactiveOptions: [
            { label: "I have locked my account", value: "I dialed the USSD code and locked my account. What is the next step?" },
            { label: "My banking SIM was also stolen", value: "My SIM card was stolen with the phone." }
          ]
        };
        setMessages((prev) => [...prev, emergencyReply]);
        setIsTyping(false);
        return;
      }

      // Scenario B: Failed Bank Transfer Initial Turn
      if (intakeRes.facts.category === "FAILED_TRANSFER") {
        const hasBank = Boolean(intakeRes.facts.sender_institution);
        const hasAmount = Boolean(intakeRes.facts.amount_ngn && intakeRes.facts.amount_ngn >= 100);

        let questionText = "Which bank or fintech app did you send the money from, and roughly how much was it?";
        let pills: Array<{ label: string; value: string }> = [
          { label: "GTBank", value: "I sent it from GTBank." },
          { label: "Access Bank", value: "I sent it from Access Bank." },
          { label: "OPay", value: "I sent it from my OPay app." },
          { label: "Zenith Bank", value: "I sent it from Zenith Bank." }
        ];

        if (hasBank && hasAmount) {
          questionText = `Got it: NGN ${intakeRes.facts.amount_ngn?.toLocaleString()} from ${intakeRes.facts.sender_institution}.\n\nRoughly how long ago did this transfer happen?`;
          pills = [
            { label: "Happened within last 48 hours", value: "It happened within the last 48 hours." },
            { label: "I have waited 3 to 7 days", value: "I have already waited for 7 days the money has not been reversed." },
            { label: "Over 14 days ago without refund", value: "It has been more than 14 days with no refund." }
          ];
        }

        const conversationalReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: questionText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          empatheticIntro: "I'm really sorry to hear that. Having your money debited without reaching the recipient can be very stressful, especially when it is for an urgent expense. Rest assured, your funds are protected under Central Bank of Nigeria regulations.",
          immediateAdvice: "Good to know: Over 85% of failed bank transfers reverse automatically within 24 to 72 hours through daily interbank clearing. You usually do not need to write a petition or dispute letter on day one.",
          interactiveOptions: pills
        };
        setMessages((prev) => [...prev, conversationalReply]);
        setIsTyping(false);
        return;
      }

      // Scenario C: Online Vendor Non-Delivery Initial Turn
      if (intakeRes.facts.category === "MERCHANT_NON_DELIVERY") {
        const conversationalReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: "How did you pay the seller: direct bank transfer or through an online checkout link (like Paystack or Flutterwave)?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          empatheticIntro: "I'm really sorry that happened. Paying an online vendor on Instagram or WhatsApp only to be ghosted or blocked is so frustrating. Fortunately, Nigerian consumer protection law (FCCPA 2018) is strictly on your side.",
          immediateAdvice: "Depending on how you paid, you might be able to recover your money very quickly. If you paid via a card or online checkout (like Paystack or Flutterwave), you can dispute the charge directly to freeze their payout.",
          interactiveOptions: [
            { label: "Direct bank transfer to their account", value: "I paid via a direct bank transfer to the seller's account." },
            { label: "Card or online link (Paystack/Flutterwave)", value: "I paid using an online checkout link (Paystack or Flutterwave)." },
            { label: "The seller blocked my line", value: "The seller blocked my phone number and WhatsApp after receiving payment." }
          ]
        };
        setMessages((prev) => [...prev, conversationalReply]);
        setIsTyping(false);
        return;
      }

      // Scenario D: Undelivered Airtime / Data Initial Turn
      if (intakeRes.facts.category === "UNDELIVERED_AIRTIME_DATA") {
        const conversationalReply: ChatMessage = {
          id: "msg_ai_" + Date.now(),
          sender: "resolve",
          text: "Did you buy this from your bank app, or directly using your phone's SIM menu?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          empatheticIntro: "I know how annoying that is—especially when you urgently need airtime or data, the bank debits you immediately, but nothing arrives on your phone.",
          immediateAdvice: "Helpful tip: If you bought this through your bank app, calling the network provider (MTN, Airtel, Glo, 9mobile) often leads to a dead end because their backend will show no record. In most cases, the issue is between your bank and the VTU aggregator.",
          interactiveOptions: [
            { label: "Bought from my bank mobile app", value: "I bought it through my bank mobile app." },
            { label: "Bought directly via phone SIM code", value: "I bought it directly from the telecom network." }
          ]
        };
        setMessages((prev) => [...prev, conversationalReply]);
        setIsTyping(false);
        return;
      }

      // Default fallback
      const conversationalReply: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        sender: "resolve",
        text: "Tell me a bit more about what occurred, or choose one of the options below so I can guide you properly:",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        interactiveOptions: [
          { label: "Failed Bank Transfer", value: "I was debited for a bank transfer that failed to credit." },
          { label: "Vendor Refused Delivery", value: "Paid an online vendor who refused to deliver." },
          { label: "Missing Airtime / Data", value: "Debited for airtime or data but never received value." }
        ]
      };
      setMessages((prev) => [...prev, conversationalReply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: "msg_err_" + Date.now(),
        sender: "resolve",
        text: "I experienced a temporary network issue. Please select an option below or send your message again.",
        timestamp: "Now",
        interactiveOptions: [
          { label: "Failed Bank Transfer", value: "I was debited for a bank transfer that failed to credit." },
          { label: "Vendor Refused Delivery", value: "Paid an online vendor who refused to deliver." }
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
    setMessages([
      {
        id: "msg_new",
        sender: "resolve",
        text: "Started a fresh complaint session. Tell me what happened with your transaction:",
        timestamp: "Just now",
        interactiveOptions: [
          { label: "Failed Bank Transfer", value: "I transferred money via my bank and recipient was not credited." },
          { label: "Vendor Refused Delivery", value: "Paid an Instagram or WhatsApp vendor who refused delivery." },
          { label: "Undelivered Airtime / Data", value: "Debited for airtime or data bundle but didn't receive value." },
          { label: "Snatched Phone / Scam", value: "My phone was stolen, please give me the instant bank lock codes!" }
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
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col h-[calc(100vh-68px)]">
        
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

              {currentFacts?.category && currentFacts.category !== "AMBIGUOUS" && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
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
                  placeholder="Type your message or answer here..."
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
