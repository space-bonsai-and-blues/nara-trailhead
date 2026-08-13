import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StepScreen } from "@/components/StepScreen";
import { t } from "@/i18n";
import type { Category } from "@/lib/categories";
import {
  constraintCategories,
  constraintsFromNames,
  wellbeingCategories,
} from "@/lib/categories";
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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const classify = useServerFn(extractConcerns);
  const { data, isPending } = useQuery({
    queryKey: ["extract-concerns", decision],
    queryFn: () => classify({ data: { userMessage: decision } }),
    staleTime: Infinity,
    retry: false,
  });

  // Detection still runs, but it never pre-ticks rows: the user picks everything.
  void data;


  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const countIn = (list: Category[]) => list.filter((c) => selected.has(c.id)).length;

  const hasSelection = selected.size > 0;

  return (
    <StepScreen
      path="/confirm"
      continueDisabled={!hasSelection}
      footerHint={hasSelection ? undefined : t("confirm.gateHint")}
      onBeforeContinue={() =>
        setRelevantCategories(
          [...constraintCategories, ...wellbeingCategories]
            .filter((category) => selected.has(category.id))
            .map((category) => category.id),
        )
      }
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-tight">{t("confirm.detectedTitle")}</h2>
              <p className="text-xs text-muted-foreground">{t("confirm.detectedHint")}</p>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">
              {t("common.selectedCount", {
                current: countIn(constraintCategories),
                total: constraintCategories.length,
              })}
            </p>
          </div>

          <CategoryRows categories={constraintCategories} selected={selected} onToggle={toggle} />
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-tight">
                {t("confirm.wellbeingTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("confirm.wellbeingHint")}</p>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">
              {t("common.selectedCount", {
                current: countIn(wellbeingCategories),
                total: wellbeingCategories.length,
              })}
            </p>
          </div>

          <CategoryRows categories={wellbeingCategories} selected={selected} onToggle={toggle} />
        </section>
      </div>
    </StepScreen>
  );
}

function CategoryRows({
  categories,
  selected,
  onToggle,
}: {
  categories: Category[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {categories.map((category) => {
        const isSelected = selected.has(category.id);
        return (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => onToggle(category.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                isSelected
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card hover:bg-accent",
              )}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-content-center rounded-full border transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background",
                )}
                aria-hidden="true"
              >
                {isSelected ? <Check className="h-3 w-3" /> : null}
              </span>
              <span className="flex-1">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    isSelected ? "text-primary" : "text-foreground",
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
  );
}
