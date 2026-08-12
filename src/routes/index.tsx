import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StepScreen } from "@/components/StepScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [decision, setDecision] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");

  const canContinue = decision.trim() && optionA.trim() && optionB.trim();

  return (
    <StepScreen path="/" continueDisabled={!canContinue}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="decision">{t("input.decisionLabel")}</Label>
          <Textarea
            id="decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder={t("input.decisionPlaceholder")}
            className="min-h-[120px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-a">{t("input.optionALabel")}</Label>
          <Input
            id="option-a"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder={t("input.optionAPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-b">{t("input.optionBLabel")}</Label>
          <Input
            id="option-b"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder={t("input.optionBPlaceholder")}
          />
        </div>
      </div>
    </StepScreen>
  );
}
