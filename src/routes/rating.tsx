import { createFileRoute } from "@tanstack/react-router";
import { StepScreen } from "@/components/StepScreen";
import { t } from "@/i18n";

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
  return <StepScreen path="/rating" />;
}
