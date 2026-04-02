"use client";

import { useState } from "react";
import { locales, localeNames, type Locale } from "@/i18n/navigation";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [open, setOpen] = useState(false);

  const handleChange = (locale: Locale) => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    window.location.reload();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
      >
        {localeNames[currentLocale]}
      </button>
      {open && (
        <div className="absolute top-12 right-0 bg-[#1A1A2E] border border-white/20 rounded-2xl overflow-hidden z-50 min-w-40">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleChange(locale)}
              className={`w-full text-left px-4 py-3 text-sm transition-all hover:bg-white/10 ${
                locale === currentLocale
                  ? "text-[#FBCD00] font-bold"
                  : "text-white"
              }`}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}