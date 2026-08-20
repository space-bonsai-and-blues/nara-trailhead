import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultLocale, isLocale, t, type Locale, type StringId } from "./index";

const STORAGE_KEY = "trailhead.locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Read persisted choice after hydration so SSR markup always matches.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isLocale(stored)) setLocaleState(stored);
    } catch {
      /* storage unavailable — stay on the default locale */
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore persistence failures */
    }
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return (
    useContext(LocaleContext) ?? {
      locale: defaultLocale,
      setLocale: () => {},
    }
  );
}

export function useTranslation() {
  const { locale } = useLocale();
  return useMemo(
    () => ({
      locale,
      t: (id: StringId, vars?: Record<string, string | number>) => t(id, vars, locale),
    }),
    [locale],
  );
}
