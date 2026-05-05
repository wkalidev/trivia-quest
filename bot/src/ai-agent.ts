import { EmbedBuilder } from "discord.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const CATEGORIES = [
  "African Geography",
  "Web3 & Crypto",
  "African History & Culture",
  "Science & Tech",
  "Sports",
  "General Knowledge",
];

export interface GeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export async function generateQuestion(
  category?: string
): Promise<GeneratedQuestion | null> {
  const cat =
    category ?? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  const prompt = `Generate a trivia question about "${cat}".
Respond ONLY with valid JSON, no markdown, no explanation:
{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "answer": "A",
  "category": "${cat}",
  "difficulty": "medium"
}
Rules:
- answer must be only the letter: A, B, C or D
- options must start with "A. ", "B. ", "C. ", "D. "
- difficulty must be: easy, medium or hard
- question must be factual and educational`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      console.error("Groq API error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed: GeneratedQuestion = JSON.parse(clean);

    if (
      !parsed.question ||
      !parsed.options ||
      parsed.options.length !== 4 ||
      !parsed.answer ||
      !parsed.category
    ) {
      console.error("Invalid question format:", parsed);
      return null;
    }

    return parsed;
  } catch (e) {
    console.error("generateQuestion error:", e);
    return null;
  }
}

export function buildQuestionEmbed(q: GeneratedQuestion): EmbedBuilder {
  const diffColors: Record<string, number> = {
    easy: 0x35d07f,
    medium: 0xfbcd00,
    hard: 0xe8533c,
  };
  const diffEmoji: Record<string, string> = {
    easy: "🟢",
    medium: "🟡",
    hard: "🔴",
  };

  return new EmbedBuilder()
    .setTitle(`🤖 AI Question — ${q.category}`)
    .setColor(diffColors[q.difficulty] ?? 0x8b5cf6)
    .setDescription(`**${q.question}**`)
    .addFields(
      ...q.options.map((opt) => ({
        name: opt.substring(0, 2),
        value: opt.substring(3),
        inline: true,
      })),
      {
        name: "✅ Answer",
        value: `||${q.answer}. ${q.options
          .find((o) => o.startsWith(q.answer))
          ?.substring(3) ?? ""}||`,
        inline: false,
      },
      {
        name: "🎯 Difficulty",
        value: `${diffEmoji[q.difficulty]} ${q.difficulty}`,
        inline: true,
      },
      {
        name: "🎮 Play & Earn",
        value: "https://trivia-quest-eight.vercel.app",
        inline: true,
      }
    )
    .setFooter({ text: "Trivia Quest AI · Powered by Groq · Celo Mainnet" })
    .setTimestamp();
}