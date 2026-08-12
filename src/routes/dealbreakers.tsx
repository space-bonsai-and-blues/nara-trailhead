import { createFileRoute } from "@tanstack/react-router";
import { StepScreen } from "@/components/StepScreen";
import { t } from "@/i18n";

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

function DealbreakersScreen() {
  return <StepScreen path="/dealbreakers" />;
}
