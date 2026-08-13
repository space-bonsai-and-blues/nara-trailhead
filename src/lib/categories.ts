import type { StringId } from "@/i18n";

export type CategoryType = "constraint" | "wellbeing";

export type Category = {
  id: string;
  type: CategoryType;
  titleId: StringId;
  descriptionId: StringId;
};

/**
 * Complete source of truth for all categories used across the app.
 * Constraint categories are evaluated against the decision text; wellbeing
 * categories are always shown for acknowledgement.
 */
export const categories: Category[] = [
  // Constraint categories
  {
    id: "time",
    type: "constraint",
    titleId: "category.time.title",
    descriptionId: "category.time.description",
  },
  {
    id: "money",
    type: "constraint",
    titleId: "category.money.title",
    descriptionId: "category.money.description",
  },
  {
    id: "effort",
    type: "constraint",
    titleId: "category.effort.title",
    descriptionId: "category.effort.description",
  },
  {
    id: "quality",
    type: "constraint",
    titleId: "category.quality.title",
    descriptionId: "category.quality.description",
  },
  {
    id: "reliability",
    type: "constraint",
    titleId: "category.reliability.title",
    descriptionId: "category.reliability.description",
  },
  {
    id: "risk",
    type: "constraint",
    titleId: "category.risk.title",
    descriptionId: "category.risk.description",
  },
  {
    id: "accessibility",
    type: "constraint",
    titleId: "category.accessibility.title",
    descriptionId: "category.accessibility.description",
  },
  {
    id: "availability",
    type: "constraint",
    titleId: "category.availability.title",
    descriptionId: "category.availability.description",
  },
  {
    id: "logistics",
    type: "constraint",
    titleId: "category.logistics.title",
    descriptionId: "category.logistics.description",
  },
  {
    id: "requirements",
    type: "constraint",
    titleId: "category.requirements.title",
    descriptionId: "category.requirements.description",
  },
  {
    id: "convenience",
    type: "constraint",
    titleId: "category.convenience.title",
    descriptionId: "category.convenience.description",
  },

  // Wellbeing categories
  {
    id: "enjoyment",
    type: "wellbeing",
    titleId: "category.enjoyment.title",
    descriptionId: "category.enjoyment.description",
  },
  {
    id: "passion",
    type: "wellbeing",
    titleId: "category.passion.title",
    descriptionId: "category.passion.description",
  },
  {
    id: "social",
    type: "wellbeing",
    titleId: "category.social.title",
    descriptionId: "category.social.description",
  },
  {
    id: "values",
    type: "wellbeing",
    titleId: "category.values.title",
    descriptionId: "category.values.description",
  },
  {
    id: "accomplishment",
    type: "wellbeing",
    titleId: "category.accomplishment.title",
    descriptionId: "category.accomplishment.description",
  },
  {
    id: "health",
    type: "wellbeing",
    titleId: "category.health.title",
    descriptionId: "category.health.description",
  },
  {
    id: "financial",
    type: "wellbeing",
    titleId: "category.financial.title",
    descriptionId: "category.financial.description",
  },
];

export const constraintCategories = categories.filter((c) => c.type === "constraint");
export const wellbeingCategories = categories.filter((c) => c.type === "wellbeing");

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

/**
 * Maps the classifier's exact category names (copied verbatim from the
 * extract-concerns taxonomy) onto the registry IDs used across the app.
 */
export const categoryNameToId: Record<string, string> = {
  // Constraint (11)
  Time: "time",
  Money: "money",
  Effort: "effort",
  Quality: "quality",
  Reliability: "reliability",
  "Risk & Uncertainty": "risk",
  Accessibility: "accessibility",
  Availability: "availability",
  Logistics: "logistics",
  Requirements: "requirements",
  Convenience: "convenience",
  // Wellbeing (7)
  "Enjoyment & Satisfaction": "enjoyment",
  "True Passion": "passion",
  "Social & Relational": "social",
  "Values, Identity & Ethics": "values",
  Accomplishment: "accomplishment",
  Health: "health",
  "Financial Stability": "financial",
};

/** Translate classifier names into known constraint categories, ignoring unknowns. */
export function constraintsFromNames(names: string[]): Category[] {
  const ids = new Set(
    names.map((name) => categoryNameToId[name]).filter((id): id is string => Boolean(id)),
  );
  return constraintCategories.filter((c) => ids.has(c.id));
}
