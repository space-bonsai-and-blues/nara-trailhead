import en from "./en.json";

export const locales = { en } as const;

export type Locale = keyof typeof locales;
export type StringId = keyof typeof en;

export const defaultLocale: Locale = "en";

/**
 * Look up a user-facing string by ID. Never hardcode copy in JSX — add a key
 * to en.json and read it through here so new locales are a drop-in file.
 */
export function t(
  id: StringId,
  vars?: Record<string, string | number>,
  locale: Locale = defaultLocale,
): string {
  const table = locales[locale] as Record<string, string>;
  const raw = table[id] ?? (locales[defaultLocale] as Record<string, string>)[id] ?? id;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function useTranslation(locale: Locale = defaultLocale) {
  return {
    locale,
    t: (id: StringId, vars?: Record<string, string | number>) => t(id, vars, locale),
  };
}
