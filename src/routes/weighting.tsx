import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { NumberScale } from "@/components/NumberScale";
import { StepScreen } from "@/components/StepScreen";
import { t, useTranslation } from "@/i18n";
import { getCategoryById } from "@/lib/categories";
import { useFlow } from "@/lib/flow-store";

export const Route = createFileRoute("/weighting")({
  head: () => ({
    meta: [
      { title: t("weighting.meta.title") },
      { name: "description", content: t("weighting.meta.description") },
      { property: "og:title", content: t("weighting.meta.title") },
      { property: "og:description", content: t("weighting.meta.description") },
    ],
  }),
  component: WeightingScreen,
});

function WeightingScreen() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { relevantCategories, weights, setWeight } = useFlow();
  const [index, setIndex] = useState(0);

  const total = relevantCategories.length;
  const categoryId = relevantCategories[index];
  const category = categoryId ? getCategoryById(categoryId) : undefined;

  if (!categoryId || !category) {
    return (
      <StepScreen path="/weighting">
        <p className="text-sm text-muted-foreground">{translate("weighting.empty")}</p>
      </StepScreen>
    );
  }

  const weight = weights[categoryId];
  const hasWeight = weight !== undefined;

  const handleNext = () => {
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      void navigate({ to: "/dealbreakers" });
    }
  };

  const handleBack = () => {
    if (index > 0) {
      setIndex(index - 1);
    } else {
      void navigate({ to: "/rating" });
    }
  };

  return (
    <StepScreen
      path="/weighting"
      subProgress={translate("weighting.categoryProgress", { current: index + 1, total })}
      continueDisabled={!hasWeight}
      footerHint={hasWeight ? undefined : translate("weighting.gateHint")}
      onContinue={handleNext}
      onBack={handleBack}
      continueLabel={translate("common.next")}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{translate(category.titleId)}</h2>
          <p className="text-sm text-muted-foreground">{translate("weighting.question")}</p>
        </div>

        <div className="space-y-2">
          <NumberScale
            value={weight}
            onSelect={(next) => setWeight(categoryId, next)}
            label={translate("weighting.question")}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{translate("weighting.scaleMin")}</span>
            <span>{translate("weighting.scaleMax")}</span>
          </div>
        </div>
      </div>
    </StepScreen>
  );
}
