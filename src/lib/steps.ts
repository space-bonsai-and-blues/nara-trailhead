import type { StringId } from "@/i18n";

export type StepPath =
  | "/"
  | "/confirm"
  | "/rating"
  | "/weighting"
  | "/dealbreakers"
  | "/report";

export type Step = {
  path: StepPath;
  titleId: StringId;
  descriptionId: StringId;
  placeholderId: StringId;
};

export const steps: Step[] = [
  {
    path: "/",
    titleId: "input.title",
    descriptionId: "input.description",
    placeholderId: "input.placeholder",
  },
  {
    path: "/confirm",
    titleId: "confirm.title",
    descriptionId: "confirm.description",
    placeholderId: "confirm.placeholder",
  },
  {
    path: "/rating",
    titleId: "rating.title",
    descriptionId: "rating.description",
    placeholderId: "rating.placeholder",
  },
  {
    path: "/weighting",
    titleId: "weighting.title",
    descriptionId: "weighting.description",
    placeholderId: "weighting.placeholder",
  },
  {
    path: "/dealbreakers",
    titleId: "dealbreakers.title",
    descriptionId: "dealbreakers.description",
    placeholderId: "dealbreakers.placeholder",
  },
  {
    path: "/report",
    titleId: "report.title",
    descriptionId: "report.description",
    placeholderId: "report.placeholder",
  },
];

export function getStep(path: StepPath) {
  const index = steps.findIndex((s) => s.path === path);
  const step = steps[index]!;
  return {
    index,
    step,
    previous: index > 0 ? steps[index - 1] : undefined,
    next: index < steps.length - 1 ? steps[index + 1] : undefined,
    total: steps.length,
  };
}
