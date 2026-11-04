import { NextResponse } from "next/server";

const modelName = () => {
  const configured = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
  return /^[a-z0-9.-]+$/i.test(configured) ? configured : "gemini-2.5-flash";
};

const publicStatus = (status: number) => {
  if (status === 401 || status === 403) return "AI credentials need attention. Resolve is using its verified rule engine.";
  if (status === 429) return "AI assistance is busy right now. Resolve is using its verified rule engine.";
  return "AI assistance is temporarily unavailable. Resolve is using its verified rule engine.";
};

const SYSTEM_PROMPT = `You are Resolve, an empathetic, highly knowledgeable consumer transaction dispute advocate in Nigeria.
Your role is to help Nigerian consumers understand, document, and resolve transaction issues under verified regulations:
1. Failed Bank Transfers (CBN 14-Day Mandatory SLA, 30-digit NIBSS Session ID tracing, CBN CPD escalation).
   Note: If a user transferred money to someone or a vendor, and the recipient has NOT received the money, this is a FAILED BANK TRANSFER debit-without-credit issue, NOT a merchant refusal.
2. Undelivered Airtime/Data (Bank VTU aggregator issue vs. telecom recharge, NCC Toll-Free 622).
3. Online Vendor Non-Delivery (Instagram/WhatsApp vendors who received payment but ghosted, blocked the buyer, or refused delivery, FCCPA 2018 7-day refund demand notice, complaints.fccpc.gov.ng).
4. Stolen Phones & Compromised Accounts (Immediate bank USSD freeze codes, SIM blocking, bank fraud desk lien).

COMMUNICATION GUIDELINES:
- Warm, empathetic, human, and reassuring. Speak like a knowledgeable Nigerian legal/fintech expert friend.
- Understand Nigerian context, banks (GTBank, Access, Zenith, OPay, Moniepoint, Providus, Kuda, FirstBank, UBA, etc.), and terms like Session ID, SLA, NIP, VTU.
- If the user asks a question (e.g. "what does SLA mean?", "where is my session ID?"), answer it directly, clearly, and concisely.
- Never invent bank names, amounts, or reference numbers that the user did not provide.
- Keep answers clean, well-spaced, and easy to read on mobile (short paragraphs).
- Strictly DO NOT use any emojis anywhere in your response.
- Do NOT use obscure jargon like "dossier" — use "Official Complaint Letter" or "Dispute Letter".`;

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

  // Ping Gemini API with a minimal token request to verify the key with Google
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
    const { messages, currentFacts } = await req.json();

    const rawApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!rawApiKey) {
      console.warn("[Resolve /api/chat] GEMINI_API_KEY is not configured on Vercel.");
      return NextResponse.json(
        { error: "AI assistance is unavailable. Resolve is using its verified rule engine." },
        { status: 503 }
      );
    }
    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");

    // Build contents strictly compliant with Gemini API specifications:
    // 1. Must start with role "user"
    // 2. Roles must strictly alternate between "user" and "model"
    // 3. No consecutive same-role turns
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Filter out initial welcome message if it was sent by resolve
    const chatTurns = (messages || []).filter((m: any, idx: number) => !(idx === 0 && m.sender === "resolve"));

    let contextNote = "";
    if (currentFacts && currentFacts.category && currentFacts.category !== "AMBIGUOUS") {
      contextNote = `[Dispute Context: Category=${currentFacts.category}, Bank=${currentFacts.sender_institution || "Unknown"}, Amount=${currentFacts.amount_ngn || "Unknown"}]\n\n`;
    }

    for (let i = 0; i < chatTurns.length; i++) {
      const msg = chatTurns[i];
      const role = msg.sender === "user" ? "user" : "model";
      let textContent = (msg.text || "").trim();
      if (!textContent) continue;

      if (i === chatTurns.length - 1 && role === "user" && contextNote) {
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
              temperature: 0.3,
              maxOutputTokens: 800
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (reply) return NextResponse.json({ reply: reply.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, "") });
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
