import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StepScreen } from "@/components/StepScreen";
import { t, useTranslation } from "@/i18n";
import type { Category } from "@/lib/categories";
import { constraintCategories, wellbeingCategories } from "@/lib/categories";
import { useFlow } from "@/lib/flow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dealbreakers")({
  head: () => ({
    meta: [
      { title: t("dealbreakers.meta.title") },
      { name: "description", content: t("dealbreakers.meta.description") },
      { property: "og:title", content: t("dealbreakers.meta.title") },
      { property: "og:description", content: t("dealbreakers.meta.description") },
    ],
  }),
  component: DealbreakersScreen,
});

type GateAnswer = null | "yes" | "no";

function DealbreakersScreen() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const {
    relevantCategories,
    dealbreakers,
    setDealbreakers,
    mergeRelevantCategories,
  } = useFlow();

  const [answer, setAnswer] = useState<GateAnswer>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAnswer(null);
    setSelected(new Set(dealbreakers));
  }, [dealbreakers]);

  const relevantSet = useMemo(
    () => new Set(relevantCategories),
    [relevantCategories],
  );

  const hasSelection = selected.size > 0;

  const toggleSelected = (id: string) => {
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

  const handleNo = () => {
    void navigate({ to: "/report" });
  };

  const handleYes = () => {
    setAnswer("yes");
  };

  const handleNewRound = () => {
    const ids = Array.from(selected);
    setDealbreakers(ids);
    mergeRelevantCategories(ids);
    void navigate({ to: "/rating" });
  };

  const handleFinalSummary = () => {
    setDealbreakers(Array.from(selected));
    void navigate({ to: "/report" });
  };

  const handleBack = () => {
    void navigate({ to: "/weighting" });
  };

  return (
    <StepScreen
      path="/dealbreakers"
      hideFooter
      onBack={handleBack}
    >
      <div className="space-y-8 pb-8">
        {answer === null ? (
          <GatePrompt onYes={handleYes} onNo={handleNo} />
        ) : (
          <CategoryPicker
            selected={selected}
            relevantSet={relevantSet}
            onToggle={toggleSelected}
          />
        )}

        {answer === "yes" && hasSelection ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleNewRound}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-medium transition-colors hover:bg-accent"
            >
              {translate("dealbreakers.newRound")}
            </button>
            <button
              type="button"
              onClick={handleFinalSummary}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {translate("dealbreakers.finalSummary")}
            </button>
          </div>
        ) : null}
      </div>
    </StepScreen>
  );
}

function GatePrompt({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const { t: translate } = useTranslation();

  return (
    <div className="space-y-6">
      <p className="text-lg font-medium leading-relaxed text-foreground">
        {translate("dealbreakers.gatePrompt")}
      </p>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onYes}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {translate("dealbreakers.yes")}
        </button>
        <button
          type="button"
          onClick={onNo}
          className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-medium transition-colors hover:bg-accent"
        >
          {translate("dealbreakers.no")}
        </button>
      </div>
    </div>
  );
}

function CategoryPicker({
  selected,
  relevantSet,
  onToggle,
}: {
  selected: Set<string>;
  relevantSet: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { t: translate } = useTranslation();

  return (
    <div className="space-y-8">
      <CategoryGroup
        title={translate("dealbreakers.constraintsGroup")}
        categories={constraintCategories}
        selected={selected}
        relevantSet={relevantSet}
        onToggle={onToggle}
      />
      <CategoryGroup
        title={translate("dealbreakers.wellbeingGroup")}
        categories={wellbeingCategories}
        selected={selected}
        relevantSet={relevantSet}
        onToggle={onToggle}
      />
    </div>
  );
}


function CategoryGroup({
  title,
  categories,
  selected,
  relevantSet,
  onToggle,
}: {
  title: string;
  categories: Category[];
  selected: Set<string>;
  relevantSet: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <ul className="space-y-2">
        {categories.map((category) => {
          const isSelected = selected.has(category.id);
          const isRelevant = relevantSet.has(category.id);
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
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-primary" : "text-foreground",
                      )}
                    >
                      {t(category.titleId)}
                    </span>
                    {isRelevant ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {t("dealbreakers.alreadyRated")}
                      </span>
                    ) : null}
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
  );
}
