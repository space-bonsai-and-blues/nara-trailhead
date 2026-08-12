import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "@/i18n";
import { getStep, type StepPath } from "@/lib/steps";
import { cn } from "@/lib/utils";

export type StepScreenProps = {
  path: StepPath;
  children?: ReactNode | undefined;
  continueDisabled?: boolean | undefined;
  /** Optional secondary progress line, e.g. "Category 3 of 12". */
  subProgress?: string | undefined;
  /** Quiet hint shown above the footer buttons. */
  footerHint?: string | undefined;
  /** When set, the primary button becomes a button that runs this instead of navigating. */
  onContinue?: (() => void) | undefined;
  /** When set, the back button runs this instead of navigating to the previous step. */
  onBack?: (() => void) | undefined;
  /** Label override for the primary action. */
  continueLabel?: string | undefined;
  /** Called before navigating to the next step (Link mode). */
  onBeforeContinue?: (() => void) | undefined;
  /** Hide the default footer so the route can render its own controls. */
  hideFooter?: boolean | undefined;
};

export function StepScreen({
  path,
  children,
  continueDisabled = false,
  subProgress,
  footerHint,
  onContinue,
  onBack,
  continueLabel,
  onBeforeContinue,
  hideFooter,
}: StepScreenProps) {
  const { t } = useTranslation();
  const { index, step, previous, next, total } = getStep(path);
  const progress = ((index + 1) / total) * 100;

  const primaryClass = cn(
    "inline-flex h-12 flex-[2] items-center justify-center rounded-full text-sm font-medium transition-opacity",
    continueDisabled
      ? "pointer-events-none bg-muted text-muted-foreground opacity-60"
      : "bg-primary text-primary-foreground hover:opacity-90",
  );
  const secondaryClass =
    "inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border text-sm font-medium transition-colors hover:bg-accent";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto w-full max-w-md px-5 pt-8">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("common.stepProgress", { current: index + 1, total })}
          </p>
          {subProgress ? <p className="text-xs text-muted-foreground">{subProgress}</p> : null}
        </div>
        <div
          className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={t("common.stepProgress", { current: index + 1, total })}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t(step.titleId)}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(step.descriptionId)}
        </p>

        {children ? (
          <div className="mt-8">{children}</div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            {t(step.placeholderId)}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 mx-auto w-full max-w-md bg-background px-5 pb-8 pt-6">
        {footerHint ? (
          <p className="mb-3 text-center text-xs text-muted-foreground">{footerHint}</p>
        ) : null}
        <div className="flex items-center gap-3">
          {onBack ? (
            <button type="button" onClick={onBack} className={secondaryClass}>
              {t("common.back")}
            </button>
          ) : previous ? (
            <Link to={previous.path} className={secondaryClass}>
              {t("common.back")}
            </Link>
          ) : null}

          {onContinue ? (
            <button
              type="button"
              onClick={onContinue}
              disabled={continueDisabled}
              className={primaryClass}
            >
              {continueLabel ?? t("common.continue")}
            </button>
          ) : next ? (
            <Link
              to={next.path}
              aria-disabled={continueDisabled}
              onClick={onBeforeContinue}
              className={primaryClass}
            >
              {continueLabel ?? t("common.continue")}
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex h-12 flex-[2] items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("common.startOver")}
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
