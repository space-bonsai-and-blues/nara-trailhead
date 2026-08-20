import { Check, Globe, Info } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localeMeta, useLocale, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * The unreviewed-translation marker copy is intentionally hardcoded English for
 * every language — it must never be localized.
 */
function markerCopy(englishName: string) {
  return `${englishName} · AI-translated, not yet reviewed for accuracy`;
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [openInfo, setOpenInfo] = useState<Locale | null>(null);
  const current = localeMeta.find((m) => m.code === locale) ?? localeMeta[0]!;

  return (
    <DropdownMenu onOpenChange={() => setOpenInfo(null)}>
      <DropdownMenuTrigger
        className="inline-flex h-9 max-w-[10rem] items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium transition-colors hover:bg-accent"
        aria-label="Change language"
      >
        <Globe className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{current.autonym}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[70vh] w-64 overflow-y-auto">
        {localeMeta.map((meta) => {
          const isEnglish = meta.code === "en";
          const label = isEnglish ? meta.autonym : `${meta.autonym} (${meta.englishName})`;
          return (
            <div key={meta.code}>
              <div className="flex items-center gap-1 pr-1">
                <DropdownMenuItem
                  onSelect={() => setLocale(meta.code)}
                  className="flex flex-1 items-center gap-2"
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      meta.code === locale ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{label}</span>
                </DropdownMenuItem>
                {!isEnglish ? (
                  <button
                    type="button"
                    aria-label={markerCopy(meta.englishName)}
                    aria-expanded={openInfo === meta.code}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => setOpenInfo((prev) => (prev === meta.code ? null : meta.code))}
                  >
                    <Info className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>


              {openInfo === meta.code ? (
                <div
                  role="note"
                  className="mx-2 mb-1 rounded-md border border-border bg-popover px-3 py-2 text-xs leading-snug text-popover-foreground shadow-md"
                >
                  {markerCopy(meta.englishName)}
                </div>
              ) : null}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
