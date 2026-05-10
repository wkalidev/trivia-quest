import { NextResponse, NextRequest } from "next/server";
import { SelfAgentVerifier } from "@selfxyz/agent-sdk";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const CATEGORIES = [
  "Géographie Africaine",
  "Web3 & Crypto",
  "Histoire & Culture",
  "Science & Tech",
  "Sports",
  "Culture Générale",
];

// ✅ Rate limiting — 10 req/min par IP
const rateLimit = new Map<string, { count: number; resetTime: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);
  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60_000 });
    return false;
  }
  if (limit.count >= 10) return true;
  limit.count++;
  return false;
}

// ✅ Self Agent verifier — singleton
const verifier = SelfAgentVerifier.create().build();

// ✅ Vérifie si la requête vient d'un agent Self vérifié
async function isSelfAgent(req: NextRequest): Promise<boolean> {
  try {
    const signature = req.headers.get("x-self-signature");
    const timestamp = req.headers.get("x-self-timestamp");
    const keytype   = req.headers.get("x-self-keytype") ?? undefined;
    if (!signature || !timestamp) return false;

    const result = await verifier.verify({
      signature,
      timestamp,
      method: req.method,
      url: req.url,
      keytype,
    });

    return result?.valid === true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  // ✅ Self Agent vérifié → bypass rate limit
  const agentVerified = await isSelfAgent(req);

  if (!agentVerified && isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Verified Self agents bypass this limit." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const category =
    searchParams.get("category") ??
    CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  const prompt = `Génère une question de quiz sur le thème "${category}".
Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans explication :
{
  "question": "...",
  "options": ["option A", "option B", "option C", "option D"],
  "answer": 0,
  "category": "${category}"
}
Règles :
- "answer" est l'index (0, 1, 2 ou 3) de la bonne réponse dans "options"
- Les options ne doivent PAS commencer par "A.", "B.", etc.
- La question doit être factuelle et éducative
- Réponds en français`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      console.error("Groq error:", res.status);
      return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (
      !parsed.question ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.answer !== "number" ||
      parsed.answer < 0 ||
      parsed.answer > 3
    ) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    return NextResponse.json({
      question: parsed.question,
      options: parsed.options,
      answer: parsed.answer,
      category: parsed.category ?? category,
      isAI: true,
      verifiedAgent: agentVerified,
    });
  } catch (e) {
    console.error("ai-question error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}