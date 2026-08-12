import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { StepScreen } from "@/components/StepScreen";
import { t } from "@/i18n";
import { constraintsFromNames, wellbeingCategories } from "@/lib/categories";
import { extractConcerns } from "@/lib/extract-concerns.functions";
import { useFlow } from "@/lib/flow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/confirm")({
  head: () => ({
    meta: [
      { title: t("confirm.meta.title") },
      { name: "description", content: t("confirm.meta.description") },
      { property: "og:title", content: t("confirm.meta.title") },
      { property: "og:description", content: t("confirm.meta.description") },
    ],
  }),
  component: ConfirmScreen,
});

function ConfirmScreen() {
  const { decision, setRelevantCategories } = useFlow();
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const classify = useServerFn(extractConcerns);
  const { data, isPending } = useQuery({
    queryKey: ["extract-concerns", decision],
    queryFn: () => classify({ data: { userMessage: decision } }),
    staleTime: Infinity,
    retry: false,
  });

  const relevantConstraints = useMemo(
    () => constraintsFromNames(data?.categories ?? []),
    [data?.categories],
  );

  const toggleAcknowledged = (id: string) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allAcknowledged = acknowledged.size === wellbeingCategories.length;

  return (
    <StepScreen
      path="/confirm"
      continueDisabled={!allAcknowledged}
      onBeforeContinue={() =>
        setRelevantCategories([
          ...relevantConstraints.map((category) => category.id),
          ...wellbeingCategories.map((category) => category.id),
        ])
      }
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">{t("confirm.detectedTitle")}</h2>
            <p className="text-xs text-muted-foreground">
              {isPending
                ? t("confirm.detectedLoading")
                : data?.source === "fallback"
                  ? t("confirm.detectedFallback")
                  : t("confirm.detectedHint")}
            </p>
          </div>
          {isPending ? (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              aria-live="polite"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            </div>
          ) : relevantConstraints.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              {t("confirm.detectedNone")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {relevantConstraints.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-sm text-card-foreground"
                >
                  {t(category.titleId)}
                </span>
              ))}
            </div>
          )}
        </section>


        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-tight">
                {t("confirm.wellbeingTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("confirm.wellbeingHint")}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("common.acknowledged", {
                current: acknowledged.size,
                total: wellbeingCategories.length,
              })}
            </p>
          </div>

          <ul className="space-y-2">
            {wellbeingCategories.map((category) => {
              const isAcknowledged = acknowledged.has(category.id);
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => toggleAcknowledged(category.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      isAcknowledged
                        ? "border-primary/20 bg-primary/5"
                        : "border-border bg-card hover:bg-accent",
                    )}
                    aria-pressed={isAcknowledged}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-content-center rounded-full border transition-colors",
                        isAcknowledged
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background",
                      )}
                      aria-hidden="true"
                    >
                      {isAcknowledged ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="flex-1">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          isAcknowledged ? "text-primary" : "text-foreground",
                        )}
                      >
                        {t(category.titleId)}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {t(category.descriptionId)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </StepScreen>
  );
}
