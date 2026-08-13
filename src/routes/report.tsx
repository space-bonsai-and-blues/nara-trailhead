import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StepScreen } from "@/components/StepScreen";
import { t, useTranslation, type StringId } from "@/i18n";
import { getCategoryById } from "@/lib/categories";
import { useFlow } from "@/lib/flow-store";
import { computeScore, formatSigned, type CategoryScore } from "@/lib/scoring";

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
  const { t: translate } = useTranslation();
  const { optionA, optionB, ratings, weights, relevantCategories, dealbreakers, resetFlow } =
    useFlow();
  const [open, setOpen] = useState(false);

  const score = useMemo(
    () => computeScore(ratings, weights, relevantCategories),
    [ratings, weights, relevantCategories],
  );

  const labelA = optionA.trim() || translate("report.optionAFallback");
  const labelB = optionB.trim() || translate("report.optionBFallback");

  // Group labels always use the full term / explanation form.
  const groupLabel = (type: "constraint" | "wellbeing") =>
    translate(type === "constraint" ? "report.constraintFull" : "report.wellbeingFull");

  const options = [
    { key: "a" as const, label: labelA, score: score.a },
    { key: "b" as const, label: labelB, score: score.b },
  ];

  return (
    <StepScreen path="/report" onStartOver={resetFlow}>
      <div className="space-y-8 pb-4">
        <section aria-label={translate("report.totalsLabel")}>
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <div
                key={option.key}
                className="rounded-xl border border-border bg-card px-4 py-5 text-center"
              >
                <p className="text-sm font-medium leading-snug">{option.label}</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums">
                  {formatSigned(option.score.total)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {translate("report.totalCaption")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">{translate("report.groupsTitle")}</h2>
          {options.map((option) => (
            <div key={option.key} className="rounded-xl border border-border bg-card px-4 py-4">
              <p className="text-sm font-medium">{option.label}</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{groupLabel("constraint")}</dt>
                  <dd className="tabular-nums">{formatSigned(option.score.constraint)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{groupLabel("wellbeing")}</dt>
                  <dd className="tabular-nums">{formatSigned(option.score.wellbeing)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </section>

        {dealbreakers.length > 0 ? (
          <section className="rounded-xl border-2 border-accent-foreground/20 bg-accent px-4 py-4">
            <h2 className="text-sm font-semibold">{translate("report.dealbreakerTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {translate("report.dealbreakerBody")}
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {dealbreakers.map((id) => {
                const category = getCategoryById(id);
                if (!category) return null;
                return (
                  <li key={id} className="font-medium">
                    {translate(category.titleId)}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-medium transition-colors hover:bg-accent"
          >
            {translate(open ? "report.breakdownHide" : "report.breakdownShow")}
          </button>

          {open ? (
            <ul className="mt-4 space-y-2">
              {score.categories.map((row) => (
                <BreakdownRow key={row.id} row={row} labelA={labelA} labelB={labelB} />
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </StepScreen>
  );
}

function BreakdownRow({
  row,
  labelA,
  labelB,
}: {
  row: CategoryScore;
  labelA: string;
  labelB: string;
}) {
  const { t: translate } = useTranslation();
  const category = getCategoryById(row.id);
  if (!category) return null;

  const titleId: StringId = category.titleId;

  return (
    <li className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{translate(titleId)}</p>
        <p className="text-xs text-muted-foreground">
          {row.rated
            ? translate("report.breakdownWeight", { weight: row.weight })
            : translate("report.notRated")}
        </p>
      </div>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="truncate text-muted-foreground">{labelA}</dt>
          <dd className="tabular-nums">
            {row.rated
              ? `${formatSigned(row.ratings.a)} → ${formatSigned(row.contributions.a)}`
              : translate("report.notRatedValue")}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="truncate text-muted-foreground">{labelB}</dt>
          <dd className="tabular-nums">
            {row.rated
              ? `${formatSigned(row.ratings.b)} → ${formatSigned(row.contributions.b)}`
              : translate("report.notRatedValue")}
          </dd>
        </div>
      </dl>
    </li>
  );
}
