import { createFileRoute } from "@tanstack/react-router";
import { StepScreen } from "@/components/StepScreen";
import { t } from "@/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: t("input.meta.title") },
      { name: "description", content: t("input.meta.description") },
      { property: "og:title", content: t("input.meta.title") },
      { property: "og:description", content: t("input.meta.description") },
    ],
  }),
  component: InputScreen,
});

function InputScreen() {
  return <StepScreen path="/" />;
}
