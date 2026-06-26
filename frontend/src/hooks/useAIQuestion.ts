import { useState, useCallback } from "react";
import type { Question } from "@/lib/questions";

interface AIQuestion extends Question {
  isAI?: boolean;
}

export function useAIQuestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIQuestion = useCallback(
    async (category?: string): Promise<AIQuestion | null> => {
      setLoading(true);
      setError(null);
      try {
        const url = category
          ? `/api/ai-question?category=${encodeURIComponent(category)}`
          : "/api/ai-question";
        const res = await fetch(url, { headers: { "x-game-session": "1" } });
        if (!res.ok) throw new Error("AI unavailable");
        const data = await res.json();
        return data as AIQuestion;
      } catch (e) {
        setError("Impossible de générer une question IA.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchAIQuestion, loading, error };
}