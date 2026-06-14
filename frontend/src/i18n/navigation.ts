export const locales = ["fr", "en", "es", "it", "pt", "ar", "zh", "sw"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  fr: "🇫🇷 Français",
  en: "🇬🇧 English",
  es: "🇪🇸 Español",
  it: "🇮🇹 Italiano",
  pt: "🇧🇷 Português",
  ar: "🇸🇦 العربية",
  zh: "🇨🇳 中文",
  sw: "🇰🇪 Kiswahili",
};
