import en from "./en.json";
import bn from "./bn.json";
import fil from "./fil.json";
import hi from "./hi.json";
import id from "./id.json";
import ja from "./ja.json";
import km from "./km.json";
import ko from "./ko.json";
import lo from "./lo.json";
import mn from "./mn.json";
import ms from "./ms.json";
import my from "./my.json";
import ne from "./ne.json";
import pt from "./pt.json";
import si from "./si.json";
import ta from "./ta.json";
import tet from "./tet.json";
import th from "./th.json";
import ur from "./ur.json";
import vi from "./vi.json";
import zhHans from "./zh-Hans.json";
import zhHant from "./zh-Hant.json";

export const locales = {
  en,
  th,
  vi,
  id,
  ms,
  ta,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  lo,
  my,
  km,
  ja,
  ko,
  hi,
  ne,
  fil,
  mn,
  tet,
  si,
  bn,
  ur,
  pt,
} as const;

export type Locale = keyof typeof locales;
export type StringId = keyof typeof en;

export const defaultLocale: Locale = "en";

export type LocaleMeta = {
  code: Locale;
  /** Name of the language in its own script. */
  autonym: string;
  /** English name of the language. */
  englishName: string;
};

/**
 * Display metadata for every locale that has a file in this folder. The
 * switcher renders this list directly — it never hardcodes a language count.
 */
export const localeMeta: LocaleMeta[] = [
  { code: "en", autonym: "English", englishName: "English" },
  { code: "th", autonym: "ไทย", englishName: "Thai" },
  { code: "vi", autonym: "Tiếng Việt", englishName: "Vietnamese" },
  { code: "id", autonym: "Bahasa Indonesia", englishName: "Indonesian" },
  { code: "ms", autonym: "Bahasa Melayu", englishName: "Bahasa Malaysia" },
  { code: "ta", autonym: "தமிழ்", englishName: "Tamil" },
  { code: "zh-Hans", autonym: "简体中文", englishName: "Chinese, Simplified" },
  { code: "zh-Hant", autonym: "繁體中文", englishName: "Chinese, Traditional" },
  { code: "lo", autonym: "ລາວ", englishName: "Lao" },
  { code: "my", autonym: "မြန်မာ", englishName: "Burmese" },
  { code: "km", autonym: "ខ្មែរ", englishName: "Khmer" },
  { code: "ja", autonym: "日本語", englishName: "Japanese" },
  { code: "ko", autonym: "한국어", englishName: "Korean" },
  { code: "hi", autonym: "हिन्दी", englishName: "Hindi" },
  { code: "ne", autonym: "नेपाली", englishName: "Nepali" },
  { code: "fil", autonym: "Filipino", englishName: "Filipino" },
  { code: "mn", autonym: "Монгол", englishName: "Mongolian" },
  { code: "tet", autonym: "Tetun", englishName: "Tetum" },
  { code: "si", autonym: "සිංහල", englishName: "Sinhala" },
  { code: "bn", autonym: "বাংলা", englishName: "Bengali" },
  { code: "ur", autonym: "اردو", englishName: "Urdu" },
  { code: "pt", autonym: "Português", englishName: "Portuguese" },
].filter((meta): meta is LocaleMeta => meta.code in locales);

export function isLocale(value: string): value is Locale {
  return value in locales;
}

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

export { LocaleProvider, useLocale, useTranslation } from "./locale-context";
