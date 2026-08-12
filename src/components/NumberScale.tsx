import { cn } from "@/lib/utils";

export type NumberScaleProps = {
  value: number | undefined;
  onSelect: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
};

export function NumberScale({ value, onSelect, label, min = 0, max = 5 }: NumberScaleProps) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {values.map((n) => {
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(n)}
            className={cn(
              "flex h-12 flex-1 items-center justify-center rounded-xl border text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-accent",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
