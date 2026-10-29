import { defaultLocale, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { lo } from "./dictionaries/lo";

function fillMissing(
  fallback: Record<string, unknown>,
  translated: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fallback).map(([key, value]) => {
      const candidate = translated[key];
      if (typeof value === "string")
        return [
          key,
          typeof candidate === "string" && candidate.trim() ? candidate : value,
        ];
      return [
        key,
        fillMissing(
          value as Record<string, unknown>,
          candidate && typeof candidate === "object"
            ? (candidate as Record<string, unknown>)
            : {},
        ),
      ];
    }),
  );
}

const dictionaries: Record<Locale, Dictionary> = {
  en,
  lo: fillMissing(en, lo) as Dictionary,
};

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  );
}

export type { Dictionary, Locale };
