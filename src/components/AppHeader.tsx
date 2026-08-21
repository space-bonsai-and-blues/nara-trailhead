import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

export function AppHeader() {
  const { t } = useTranslation();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email } : null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? { email: session.user.email } : null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          {t("app.name")}
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/admin-dashboard"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {t("header.account")}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {t("header.signIn")}
            </Link>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
