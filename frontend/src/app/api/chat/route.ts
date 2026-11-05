import { NextResponse } from "next/server";

const modelName = () => {
  const configured = (process.env.GEMINI_MODEL || "gemini-3.5-flash-lite").trim();
  return /^[a-z0-9.-]+$/i.test(configured) ? configured : "gemini-3.5-flash-lite";
};

const publicStatus = (status: number) => {
  if (status === 401 || status === 403) return "AI credentials need attention. Resolve is using its verified rule engine.";
  if (status === 429) return "AI assistance is busy right now. Resolve is using its verified rule engine.";
  return "AI assistance is temporarily unavailable. Resolve is using its verified rule engine.";
};

const SYSTEM_PROMPT = `You are RESOLVE, a deeply knowledgeable, empathetic, and expert financial resolution companion tailored for Nigeria's financial ecosystem.

Your mission is to sit side-by-side with users—whether they are customers, merchants/vendors, or everyday individuals seeking financial clarity—and guide them step-by-step through resolving transaction issues, understanding banking regulations, and managing financial disputes.

### 1. Persona & Tone
- Warm, Grounded & Expert Companion: Talk like a knowledgeable, calm, and reliable friend who happens to be an expert in CBN, FCCPC, NIBSS, and NCC financial regulations.
- Objective & Multi-Perspective: Adapt seamlessly based on who is asking:
  - If a Customer: Guide them on recovering funds, verifying transaction statuses, and communicating effectively without assuming malice.
  - If a Vendor: Help them protect their business, manage pending settlement delays, resolve customer disputes professionally, and understand refund/chargeback rules.
  - If an Inquirer: Break down complex banking terms (e.g., PND orders, BVN/NIN linkage, chargebacks, NIP session IDs) into simple, practical language.
- NEVER Accusatory: Maintain neutrality. Avoid informal or accusatory terms like "scammer," "rogue vendor," "thief," or "fraudster." Refer to parties professionally as "the seller," "the buyer," "the financial institution," or "the payment gateway."

### 2. Conversational Approach: "Guide First, Letter Last"
- Diagnose First: Never jump straight to generating formal letters unless explicitly requested. Start by diagnosing the root cause.
  * CRITICAL DISTINCTION: If an online vendor blocked the user or refused delivery after receiving money, this is a MERCHANT NON-DELIVERY dispute under FCCPA 2018 (Section 114), NOT a failed bank transfer. The funds successfully settled with the merchant! Do not treat it as a bank dispense error.
  * If an interbank transfer dropped and the recipient never received value, this is an NIP switch failure covered by CBN 14-day reversal guidelines.
- Explain the Mechanics: Help the user understand WHY the issue is happening (e.g. "Because you paid via direct bank transfer, the funds are already with the receiving bank, so our immediate lever is alerting the receiving bank's fraud desk...").
- Provide Actionable Next Steps: Give 2–3 clear, realistic steps the user can take right now.

### 3. Strict Anti-Hallucination & Fact Preservation Rules
- NEVER invent facts, banks, or session IDs. If the user hasn't named their bank, DO NOT guess or assume it is GTBank! Ask which bank sent the money.
- If the user specifies an amount (e.g. ₦75,000), ALWAYS lock and preserve ₦75,000. Never revert or overwrite it with ₦50,000.
- NEVER claim that an OCR scan happened unless confirmed in the chat.

### 4. Dynamic Resolution Plan Output
At the end of EVERY response where transaction details, diagnostic steps, or advice are identified, you MUST output a structured JSON block at the very end of your response inside a \`\`\`json codeblock:

\`\`\`json
{
  "resolution_plan": {
    "user_role": "Customer",
    "topic": "Merchant Non-Delivery",
    "current_stage": "Diagnosis & Direct Resolution",
    "key_details": {
      "amount": "₦75,000.00",
      "status": "Vendor Unreachable / Blocked Buyer",
      "institution": "Pending Confirmation",
      "channel": "Direct Bank Transfer"
    },
    "suggested_actions": [
      "Preserve chat transcripts and bank transfer receipt",
      "Notify receiving bank fraud desk to flag beneficiary account",
      "Issue 7-Day Statutory Refund Demand under FCCPA 2018"
    ],
    "available_tools": [
      "Friendly Message Template",
      "Receiving Bank Fraud Alert",
      "Official Dispute Letter"
    ]
  },
  "quick_replies": [
    "[Instagram Vendor]",
    "[WhatsApp Seller]",
    "[Direct Bank Transfer]"
  ]
}
\`\`\`

### 5. Strict Rule for Quick Reply Buttons (No Meta-Instruction Loops)
- NEVER suggest meta-prompts like "[Provide Merchant Name]", "[Provide Bank Name]", "[Enter Claim Amount]", or "[Upload Payment Receipt]".
- Quick replies MUST be concrete user answers that the user can click directly:
  * For Bank choices: "[GTBank]", "[Access Bank]", "[Zenith Bank]", "[OPay]", "[Kuda]"
  * For Merchant Platform: "[Instagram Seller]", "[WhatsApp Vendor]", "[Online Store]"
  * For Payment Method: "[Direct Bank Transfer]", "[Card Checkout]", "[POS Terminal]"
  * For Confirmation: "[Details are correct]", "[Generate Dispute Letter]", "[View Next Steps]"

### 6. Communication Rules:
- Keep text concise (3-5 sentences plus clear bullet points).
- Strictly DO NOT use any emojis.
- Ground advice in CBN, NIBSS, NCC, and FCCPA statutory rules.`;

export async function GET() {
  const rawKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
  
  if (!apiKey) {
    return NextResponse.json({
      status: "missing_key",
      hasKey: false,
      valid: false,
      message: "GEMINI_API_KEY is not configured on Vercel."
    });
  }

  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName()}:generateContent`;
    const res = await fetch(testUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "hi" }] }],
        generationConfig: { maxOutputTokens: 2 }
      })
    });

    if (res.ok) {
      return NextResponse.json({
        status: "configured",
        hasKey: true,
        valid: true,
        message: "AI assistance is available."
      });
    }

    return NextResponse.json({
      status: "invalid_key",
      hasKey: true,
      valid: false,
      message: publicStatus(res.status)
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "network_error",
      hasKey: true,
      valid: false,
      message: "AI assistance is temporarily unavailable."
    });
  }
}

export async function POST(req: Request) {
  try {
    const { messages, currentFacts, slotData, resolutionPlan } = await req.json();

    const rawApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!rawApiKey) {
      console.warn("[Resolve /api/chat] GEMINI_API_KEY is not configured on Vercel.");
      return NextResponse.json(
        { error: "AI assistance is unavailable. Resolve is using its verified rule engine." },
        { status: 503 }
      );
    }
    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Filter out initial welcome message if any
    const chatTurns = (messages || []).filter((m: any, idx: number) => !(idx === 0 && m.sender === "resolve"));

    // Context note with already extracted slots / resolution plan
    let contextNote = "";
    const activeRole = resolutionPlan?.user_role || "Customer";
    const activeTopic = resolutionPlan?.topic || slotData?.issue_category || currentFacts?.category || "Financial Dispute";
    const activeAmount = slotData?.claim_amount || resolutionPlan?.key_details?.amount || (currentFacts?.amount_ngn ? `₦${Number(currentFacts.amount_ngn).toLocaleString()}` : "Not yet specified");
    const activeBank = slotData?.merchant_or_bank || resolutionPlan?.key_details?.institution || currentFacts?.sender_institution || "Not yet specified";
    const activeStatus = resolutionPlan?.key_details?.status || "In Progress";
    const activeStage = resolutionPlan?.current_stage || "Diagnosis & Direct Resolution";

    contextNote = `[COMPANION MEMORY & GROUNDING — NEVER OVERWRITE USER FACTS]:
- User Role: ${activeRole}
- Active Topic: ${activeTopic}
- Confirmed Amount: ${activeAmount} (DO NOT REVERT OR CHANGE THIS AMOUNT)
- Confirmed Institution/Vendor: ${activeBank} (DO NOT GUESS GTBANK UNLESS EXPLICITLY STATED)
- Current Stage: ${activeStage}
- Current Status: ${activeStatus}
Diagnose root cause calmly. If a vendor blocked the user, this is Merchant Non-Delivery under FCCPA 2018. Never suggest circular buttons like '[Provide Bank Name]'. Give concrete options.\n\n`;

    for (let i = 0; i < chatTurns.length; i++) {
      const msg = chatTurns[i];
      const role = msg.sender === "user" ? "user" : "model";
      let textContent = (msg.text || "").trim();
      if (!textContent) continue;

      if (i === chatTurns.length - 1 && role === "user") {
        textContent = contextNote + textContent;
      }

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n\n${textContent}`;
      } else {
        contents.push({
          role,
          parts: [{ text: textContent }]
        });
      }
    }

    // Must start with user
    while (contents.length > 0 && contents[0].role !== "user") {
      contents.shift();
    }

    if (contents.length === 0) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    const model = modelName();
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 900
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (rawReply) {
          // Parse JSON block if provided by model
          let cleanReply = rawReply;
          let parsedResolutionPlan: any = null;
          let quickReplies: string[] = [];

          const jsonMatch = rawReply.match(/```json\s*([\s\S]*?)\s*```/) || rawReply.match(/(\{[\s\S]*"resolution_plan"[\s\S]*\})/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[1]);
              parsedResolutionPlan = parsed.resolution_plan || null;
              if (Array.isArray(parsed.quick_replies)) {
                // Filter out any meta-instruction buttons that slipped through
                quickReplies = parsed.quick_replies.filter((q: string) => 
                  !/provide|enter claim|enter date|upload payment/i.test(q)
                );
              }
              // Strip json block from visible reply
              cleanReply = rawReply.replace(jsonMatch[0], "").trim();
            } catch (err) {
              console.warn("Could not parse json payload from Gemini:", err);
            }
          }

          // Strip any emojis
          cleanReply = cleanReply.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, "").trim();

          return NextResponse.json({
            reply: cleanReply,
            resolution_plan: parsedResolutionPlan,
            case_file_update: parsedResolutionPlan,
            quick_replies: quickReplies
          });
        }
      }
      console.warn(`[Gemini model ${model} failed]`, res.status);
      return NextResponse.json({ error: publicStatus(res.status) }, { status: 502 });
    } catch (error) {
      console.warn("[Resolve AI request failed]", error);
      return NextResponse.json({ error: "AI assistance is temporarily unavailable. Resolve is using its verified rule engine." }, { status: 502 });
    }
  } catch (error) {
    console.error("[Chat Route Error]", error);
    return NextResponse.json({ error: "AI assistance is temporarily unavailable. Resolve is using its verified rule engine." }, { status: 500 });
  }
}
