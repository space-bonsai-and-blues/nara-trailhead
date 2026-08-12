import { createFileRoute } from "@tanstack/react-router";
import { StepScreen } from "@/components/StepScreen";
import { t } from "@/i18n";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: t("report.meta.title") },
      { name: "description", content: t("report.meta.description") },
      { property: "og:title", content: t("report.meta.title") },
      { property: "og:description", content: t("report.meta.description") },
    ],
  }),
  component: ReportScreen,
});

function ReportScreen() {
  return <StepScreen path="/report" />;
}
