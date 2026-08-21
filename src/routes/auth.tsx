import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { redirect?: string };
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/claim-admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage(t("auth.signupSuccess"));
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage(t("auth.resetSent"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: redirectTo });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.unknownError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center bg-background px-5">
      <div className="mx-auto w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signup" ? t("auth.signupTitle") : mode === "forgot" ? t("auth.forgotTitle") : t("auth.signinTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                required
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? t("common.loading")
              : mode === "signup"
                ? t("auth.signupButton")
                : mode === "forgot"
                  ? t("auth.resetButton")
                  : t("auth.signinButton")}
          </Button>
        </form>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {mode === "signin" && (
            <>
              <button type="button" onClick={() => setMode("signup")} className="text-left hover:underline">
                {t("auth.switchToSignup")}
              </button>
              <button type="button" onClick={() => setMode("forgot")} className="text-left hover:underline">
                {t("auth.forgotPassword")}
              </button>
            </>
          )}
          {(mode === "signup" || mode === "forgot") && (
            <button type="button" onClick={() => setMode("signin")} className="text-left hover:underline">
              {t("auth.switchToSignin")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
