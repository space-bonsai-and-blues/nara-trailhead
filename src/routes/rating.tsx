import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RatingSlider } from "@/components/RatingSlider";
import { StepScreen } from "@/components/StepScreen";
import { t, useTranslation } from "@/i18n";
import { getCategoryById } from "@/lib/categories";
import { getRating, useFlow, type OptionKey } from "@/lib/flow-store";

export const Route = createFileRoute("/rating")({
  head: () => ({
    meta: [
      { title: t("rating.meta.title") },
      { name: "description", content: t("rating.meta.description") },
      { property: "og:title", content: t("rating.meta.title") },
      { property: "og:description", content: t("rating.meta.description") },
    ],
  }),
  component: RatingScreen,
});

function RatingScreen() {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { relevantCategories, ratings, setRating, optionA, optionB } = useFlow();
  const [index, setIndex] = useState(0);

  const total = relevantCategories.length;
  const categoryId = relevantCategories[index];
  const category = categoryId ? getCategoryById(categoryId) : undefined;

  if (!categoryId || !category) {
    return (
      <StepScreen path="/rating">
        <p className="text-sm text-muted-foreground">{translate("rating.empty")}</p>
      </StepScreen>
    );
  }

  const markers = getRating(ratings, categoryId);
  const bothTouched = markers.a.touched && markers.b.touched;

  const labels: Record<OptionKey, string> = {
    a: optionA.trim() || translate("input.optionALabel"),
    b: optionB.trim() || translate("input.optionBLabel"),
  };

  const handleNext = () => {
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      void navigate({ to: "/weighting" });
    }
  };

  const handleBack = () => {
    if (index > 0) {
      setIndex(index - 1);
    } else {
      void navigate({ to: "/confirm" });
    }
  };

  return (
    <StepScreen
      path="/rating"
      subProgress={translate("rating.categoryProgress", { current: index + 1, total })}
      continueDisabled={!bothTouched}
      footerHint={bothTouched ? undefined : translate("rating.gateHint")}
      onContinue={handleNext}
      onBack={handleBack}
      continueLabel={translate("common.next")}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{translate(category.titleId)}</h2>
          <p className="text-sm text-muted-foreground">{translate(category.descriptionId)}</p>
        </div>

        <RatingSlider
          markers={markers}
          labels={labels}
          onChange={(option, marker) => setRating(categoryId, option, marker)}
        />
      </div>
    </StepScreen>
  );
}
