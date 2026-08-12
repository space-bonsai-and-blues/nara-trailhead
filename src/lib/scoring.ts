// Deterministic scoring: raw rating (-5..+5) × weight (0..5) per category,
// summed into each option's total and into constraint / wellbeing subtotals.
// No normalization, no AI call. See the standalone scoring spec for the equivalent shape.
import { categories, type Category, type CategoryType } from "@/lib/categories";
import { getRating, type CategoryRating, type OptionKey } from "@/lib/flow-store";

export type CategoryScore = {
  id: string;
  type: CategoryType;
  rated: boolean;
  /** Rating value per option, -5..+5. */
  ratings: Record<OptionKey, number>;
  /** Weight 0..5 for this category. */
  weight: number;
  /** rating * weight per option. */
  contributions: Record<OptionKey, number>;
};

export type OptionScore = {
  total: number;
  constraint: number;
  wellbeing: number;
};

export type ScoreResult = {
  a: OptionScore;
  b: OptionScore;
  /** All 18 categories, in registry order. */
  categories: CategoryScore[];
};

const emptyOptionScore = (): OptionScore => ({ total: 0, constraint: 0, wellbeing: 0 });

/**
 * Raw weighted score: per category, rating (-5..+5) x weight (0..5), summed into
 * each option's total and into its constraint / wellbeing subtotal. No normalization.
 */
export function computeScore(
  ratings: Record<string, CategoryRating>,
  weights: Record<string, number>,
  relevantCategories: string[],
): ScoreResult {
  const relevant = new Set(relevantCategories);
  const a = emptyOptionScore();
  const b = emptyOptionScore();

  const rows: CategoryScore[] = categories.map((category: Category) => {
    const rated = relevant.has(category.id);
    const rating = getRating(ratings, category.id);
    const weight = weights[category.id] ?? 0;

    const values: Record<OptionKey, number> = {
      a: rated ? rating.a.value : 0,
      b: rated ? rating.b.value : 0,
    };
    const contributions: Record<OptionKey, number> = {
      a: rated ? values.a * weight : 0,
      b: rated ? values.b * weight : 0,
    };

    if (rated) {
      a.total += contributions.a;
      b.total += contributions.b;
      if (category.type === "constraint") {
        a.constraint += contributions.a;
        b.constraint += contributions.b;
      } else {
        a.wellbeing += contributions.a;
        b.wellbeing += contributions.b;
      }
    }

    return {
      id: category.id,
      type: category.type,
      rated,
      ratings: values,
      weight: rated ? weight : 0,
      contributions,
    };
  });

  return { a, b, categories: rows };
}

export function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
