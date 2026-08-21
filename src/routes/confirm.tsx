import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StepScreen } from "@/components/StepScreen";
import { t as staticT, useTranslation } from "@/i18n";
import type { Category } from "@/lib/categories";
import { constraintCategories, wellbeingCategories } from "@/lib/categories";
import { useFlow } from "@/lib/flow-store";
import { cn } from "@/lib/utils";
import { logButton, logState } from "@/lib/session-logger";

export const Route = createFileRoute("/confirm")({
  head: () => ({
    meta: [
      { title: staticT("confirm.meta.title") },
      { name: "description", content: staticT("confirm.meta.description") },
      { property: "og:title", content: staticT("confirm.meta.title") },
      { property: "og:description", content: staticT("confirm.meta.description") },
    ],
  }),
  component: ConfirmScreen,
});

function ConfirmScreen() {
  const { t } = useTranslation();
  const { setRelevantCategories } = useFlow();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!loggedRef.current) {
      loggedRef.current = true;
      logState("confirm", { screen: "confirm", event: "screen_view" });
    }
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        logButton("confirm", "category_deselect", { categoryId: id });
      } else {
        next.add(id);
        logButton("confirm", "category_select", { categoryId: id });
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
      onBeforeContinue={() => {
        const ids = [...constraintCategories, ...wellbeingCategories]
          .filter((category) => selected.has(category.id))
          .map((category) => category.id);
        setRelevantCategories(ids);
        logState("confirm", {
          screen: "confirm",
          event: "continue",
          selectedCategories: ids,
        });
      }}
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
  const { t } = useTranslation();
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
