import { createFileRoute } from "@tanstack/react-router";
import { StepScreen } from "@/components/StepScreen";
import { t } from "@/i18n";

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
  return <StepScreen path="/weighting" />;
}
