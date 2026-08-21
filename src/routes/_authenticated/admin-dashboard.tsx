import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listSessions } from "@/lib/sessions.functions";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";

export const Route = createFileRoute("/_authenticated/admin-dashboard")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fetchSessions = useServerFn(listSessions);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: () => fetchSessions(),
  });

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background px-5 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("adminDashboard.title")}</h1>
            <p className="text-muted-foreground">{t("adminDashboard.description")}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            {t("adminDashboard.signOut")}
          </Button>
        </div>

        {isLoading && <p className="text-muted-foreground">{t("common.loading")}</p>}
        {error && <p className="text-destructive">{error.message}</p>}

        {!isLoading && !error && (
          <>
            <p className="text-sm text-muted-foreground">
              {t("adminDashboard.sessionCount", { count: data?.sessions.length ?? 0 })}
            </p>

            {data?.sessions.length === 0 ? (
              <p className="text-muted-foreground">{t("adminDashboard.noSessions")}</p>
            ) : (
              <div className="space-y-3">
                {data?.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{new Date(session.started_at).toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        {session.completed ? t("adminDashboard.sessionCompleted") : t("adminDashboard.sessionInProgress")}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {t("adminDashboard.sessionEvents")}: {(session.events as unknown[]).length}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
