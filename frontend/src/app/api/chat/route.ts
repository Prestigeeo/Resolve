import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Resolve, an empathetic, highly knowledgeable consumer transaction dispute advocate in Nigeria.
Your role is to help Nigerian consumers resolve:
1. Failed Bank Transfers (NIP debit without credit, 30-digit NIBSS Session ID, CBN 14-day mandatory SLA before cpd@cbn.gov.ng escalation).
2. Undelivered Airtime/Data (Bank VTU aggregator failures vs. telecom SIM recharge, NCC Toll-Free 622).
3. Online Vendor Non-Delivery (Instagram/WhatsApp vendors ghosting or blocking buyers, FCCPA 2018 7-day refund demand notice, complaints.fccpc.gov.ng).
4. Stolen Phones / Unauthorized Fraud (Immediate bank USSD kill-switches, SIM hotlisting, 24/7 bank fraud desk lien).

COMMUNICATION GUIDELINES:
- Warm, empathetic, human, and reassuring. Speak like a knowledgeable Nigerian legal/fintech expert friend.
- If the user asks a question (e.g. "what does SLA mean?", "where is my session ID?", "what is NIP?"), answer the question clearly, concisely, and accurately in Nigerian context.
- Never invent bank names, amounts, or reference numbers that the user did not provide.
- Keep your answers clean, well-spaced, and easy to read on mobile.
- Strictly DO NOT use any emojis anywhere in your response.
- Do NOT use obscure jargon like "dossier" — use "Official Complaint Letter" or "Dispute Letter".`;

export async function POST(req: Request) {
  try {
    const { messages, currentFacts } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on Vercel." },
        { status: 503 }
      );
    }

    // Format chat history for Gemini
    const contents = [];

    // Context preamble if facts are known
    let contextNote = "";
    if (currentFacts && currentFacts.category && currentFacts.category !== "AMBIGUOUS") {
      contextNote = `[Active Case Context: Category=${currentFacts.category}, Bank=${currentFacts.sender_institution || "Unknown"}, Amount=${currentFacts.amount_ngn || "Unknown"}, SessionID=${currentFacts.session_id_or_ref || "Unknown"}]\n\n`;
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.sender === "user" ? "user" : "model";
      let textContent = msg.text || "";

      if (i === messages.length - 1 && role === "user" && contextNote) {
        textContent = contextNote + textContent;
      }

      contents.push({
        role,
        parts: [{ text: textContent }]
      });
    }

    // Call Google Gemini REST API (gemini-2.5-flash / gemini-1.5-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800
        }
      })
    });

    if (!geminiRes.ok) {
      // Try fallback to gemini-1.5-flash
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
        })
      });

      if (!fallbackRes.ok) {
        const errText = await fallbackRes.text();
        return NextResponse.json({ error: errText }, { status: 500 });
      }

      const fbData = await fallbackRes.json();
      const reply = fbData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return NextResponse.json({ reply });
    }

    const data = await geminiRes.json();
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip any accidental emojis
    reply = reply.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, "");

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate reply" }, { status: 500 });
  }
}
