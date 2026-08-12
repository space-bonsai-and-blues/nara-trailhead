import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type OptionKey = "a" | "b";

export type MarkerState = {
  value: number;
  touched: boolean;
};

export type CategoryRating = Record<OptionKey, MarkerState>;

export type FlowState = {
  decision: string;
  optionA: string;
  optionB: string;
  relevantCategories: string[];
  ratings: Record<string, CategoryRating>;
  weights: Record<string, number>;
  dealbreakers: Record<string, OptionKey[]>;
};

export const emptyMarker: MarkerState = { value: 0, touched: false };

export const emptyRating: CategoryRating = { a: emptyMarker, b: emptyMarker };

export type FlowContextValue = FlowState & {
  setDecision: (value: string) => void;
  setOptionA: (value: string) => void;
  setOptionB: (value: string) => void;
  setRelevantCategories: (ids: string[]) => void;
  setRating: (categoryId: string, option: OptionKey, marker: MarkerState) => void;
  setWeight: (categoryId: string, weight: number) => void;
  setDealbreakers: (categoryId: string, options: OptionKey[]) => void;
  reset: () => void;
};

const initialState: FlowState = {
  decision: "",
  optionA: "",
  optionB: "",
  relevantCategories: [],
  ratings: {},
  weights: {},
  dealbreakers: {},
};

const FlowContext = createContext<FlowContextValue | undefined>(undefined);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(initialState);

  const setDecision = useCallback(
    (value: string) => setState((prev) => ({ ...prev, decision: value })),
    [],
  );
  const setOptionA = useCallback(
    (value: string) => setState((prev) => ({ ...prev, optionA: value })),
    [],
  );
  const setOptionB = useCallback(
    (value: string) => setState((prev) => ({ ...prev, optionB: value })),
    [],
  );
  const setRelevantCategories = useCallback(
    (ids: string[]) => setState((prev) => ({ ...prev, relevantCategories: ids })),
    [],
  );
  const setRating = useCallback(
    (categoryId: string, option: OptionKey, marker: MarkerState) =>
      setState((prev) => ({
        ...prev,
        ratings: {
          ...prev.ratings,
          [categoryId]: {
            ...(prev.ratings[categoryId] ?? emptyRating),
            [option]: marker,
          },
        },
      })),
    [],
  );
  const setWeight = useCallback(
    (categoryId: string, weight: number) =>
      setState((prev) => ({ ...prev, weights: { ...prev.weights, [categoryId]: weight } })),
    [],
  );
  const setDealbreakers = useCallback(
    (categoryId: string, options: OptionKey[]) =>
      setState((prev) => ({
        ...prev,
        dealbreakers: { ...prev.dealbreakers, [categoryId]: options },
      })),
    [],
  );
  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<FlowContextValue>(
    () => ({
      ...state,
      setDecision,
      setOptionA,
      setOptionB,
      setRelevantCategories,
      setRating,
      setWeight,
      setDealbreakers,
      reset,
    }),
    [
      state,
      setDecision,
      setOptionA,
      setOptionB,
      setRelevantCategories,
      setRating,
      setWeight,
      setDealbreakers,
      reset,
    ],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
}

export function getRating(
  ratings: Record<string, CategoryRating>,
  categoryId: string,
): CategoryRating {
  return ratings[categoryId] ?? emptyRating;
}
