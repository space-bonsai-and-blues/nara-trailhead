import { Link } from "@tanstack/react-router";
import { useTranslation } from "@/i18n";
import { getStep, type StepPath } from "@/lib/steps";

export function StepScreen({ path }: { path: StepPath }) {
  const { t } = useTranslation();
  const { index, step, previous, next, total } = getStep(path);
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto w-full max-w-md px-5 pt-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("common.stepProgress", { current: index + 1, total })}
        </p>
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

        <div className="mt-8 rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
          {t(step.placeholderId)}
        </div>
      </main>

      <footer className="sticky bottom-0 mx-auto w-full max-w-md bg-background px-5 pb-8 pt-6">
        <div className="flex items-center gap-3">
          {previous ? (
            <Link
              to={previous.path}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border text-sm font-medium transition-colors hover:bg-accent"
            >
              {t("common.back")}
            </Link>
          ) : null}
          {next ? (
            <Link
              to={next.path}
              className="inline-flex h-12 flex-[2] items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("common.continue")}
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
