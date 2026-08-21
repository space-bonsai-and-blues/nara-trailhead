import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { StepScreen } from "@/components/StepScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t as staticT, useTranslation } from "@/i18n";
import { useFlow } from "@/lib/flow-store";
import { ensureSession, logText, logState } from "@/lib/session-logger";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: staticT("input.meta.title") },
      { name: "description", content: staticT("input.meta.description") },
      { property: "og:title", content: staticT("input.meta.title") },
      { property: "og:description", content: staticT("input.meta.description") },
    ],
  }),
  component: InputScreen,
});

function InputScreen() {
  const { t } = useTranslation();
  const { decision, optionA, optionB, setDecision, setOptionA, setOptionB } = useFlow();

  const missingDecision = !decision.trim();
  const missingOptionA = !optionA.trim();
  // Spec: up to two options, two is the cap — only one is required to continue.
  const missingOptions = missingOptionA && !optionB.trim();
  const canContinue = !missingDecision && !missingOptions;

  const footerHint = canContinue
    ? undefined
    : missingDecision && missingOptions
      ? t("input.hintAll")
      : missingDecision
        ? t("input.hintDecision")
        : t("input.hintOptions");

  const requiredNote = (
    <span className="mt-1 block text-xs text-muted-foreground">{t("input.required")}</span>
  );
  const optionalNote = (
    <span className="mt-1 block text-xs text-muted-foreground">{t("input.optional")}</span>
  );

  return (
    <StepScreen path="/" continueDisabled={!canContinue} footerHint={footerHint}>
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
          {missingDecision ? requiredNote : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-a">{t("input.optionALabel")}</Label>
          <Input
            id="option-a"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder={t("input.optionAPlaceholder")}
          />
          {missingOptions ? requiredNote : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-b">{t("input.optionBLabel")}</Label>
          <Input
            id="option-b"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder={t("input.optionBPlaceholder")}
          />
          {optionalNote}
        </div>
      </div>
    </StepScreen>
  );
}
