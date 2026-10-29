export const locales = ["lo", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "lo";
export const localeCookie = "kcc_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}
