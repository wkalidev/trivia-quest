"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-sm transition-all"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}