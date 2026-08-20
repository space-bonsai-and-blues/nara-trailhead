import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/i18n";

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-5 py-3">
        <span className="text-sm font-semibold tracking-tight">{t("app.name")}</span>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
