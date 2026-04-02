export const locales = ["fr", "en", "es", "it"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  fr: "🇫🇷 Français",
  en: "🇬🇧 English",
  es: "🇪🇸 Español",
  it: "🇮🇹 Italiano",
};