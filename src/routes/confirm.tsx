import { createFileRoute } from "@tanstack/react-router";
import { StepScreen } from "@/components/StepScreen";
import { t } from "@/i18n";

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
  return <StepScreen path="/confirm" />;
}
