import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { claimFirstAdmin, adminClaimed } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";

export const Route = createFileRoute("/_authenticated/claim-admin")({
  component: ClaimAdminPage,
});

function ClaimAdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState<boolean | null>(null);

  useEffect(() => {
    void adminClaimed().then(({ claimed }) => {
      setClaimed(claimed);
      if (claimed) {
        void navigate({ to: "/admin-dashboard" });
      }
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await claimFirstAdmin({ data: { secret } });
      void navigate({ to: "/admin-dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("claimAdmin.invalid"));
    } finally {
      setLoading(false);
    }
  }

  if (claimed === null) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5">
        <p className="text-muted-foreground">{t("claimAdmin.unavailable")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center bg-background px-5">
      <div className="mx-auto w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("claimAdmin.title")}</h1>
        <p className="text-muted-foreground">{t("claimAdmin.description")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passcode">{t("claimAdmin.passcodeLabel")}</Label>
            <Input
              id="passcode"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={t("claimAdmin.passcodePlaceholder")}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("common.loading") : t("claimAdmin.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
