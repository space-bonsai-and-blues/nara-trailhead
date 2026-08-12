import { useCallback, useRef, useState } from "react";
import { useTranslation } from "@/i18n";
import type { MarkerState, OptionKey } from "@/lib/flow-store";
import { cn } from "@/lib/utils";

export const RATING_MIN = -5;
export const RATING_MAX = 5;

export type RatingSliderProps = {
  markers: Record<OptionKey, MarkerState>;
  labels: Record<OptionKey, string>;
  onChange: (option: OptionKey, marker: MarkerState) => void;
};

const options: OptionKey[] = ["a", "b"];

function clamp(value: number) {
  return Math.min(RATING_MAX, Math.max(RATING_MIN, value));
}

function percentFor(value: number) {
  return ((value - RATING_MIN) / (RATING_MAX - RATING_MIN)) * 100;
}

export function RatingSlider({ markers, labels, onChange }: RatingSliderProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<OptionKey | null>(null);
  const draggingRef = useRef<OptionKey | null>(null);

  const valueFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return 0;
    const ratio = (clientX - rect.left) / rect.width;
    return clamp(Math.round(ratio * (RATING_MAX - RATING_MIN) + RATING_MIN));
  }, []);

  const handlePointerDown = (option: OptionKey) => (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (active !== option) {
      // First tap only selects the marker — dragging starts on a later press.
      setActive(option);
      onChange(option, { ...markers[option], touched: true });
      return;
    }
    draggingRef.current = option;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (option: OptionKey) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current !== option) return;
    const value = valueFromClientX(event.clientX);
    if (value !== markers[option].value) {
      onChange(option, { value, touched: true });
    }
  };

  const handlePointerUp = (option: OptionKey) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current === option) {
      draggingRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
    onChange(option, { ...markers[option], touched: true });
  };

  const handleKeyDown = (option: OptionKey) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (active !== option) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(option);
        onChange(option, { ...markers[option], touched: true });
      }
      return;
    }
    let delta = 0;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") delta = 1;
    if (delta === 0) return;
    event.preventDefault();
    onChange(option, { value: clamp(markers[option].value + delta), touched: true });
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">{t("rating.markerHint")}</p>

      <div className="px-2 pb-6 pt-12">
        <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-muted">
          <span
            className="absolute left-1/2 top-1/2 h-4 w-px -translate-y-1/2 bg-border"
            aria-hidden="true"
          />

          {options.map((option, optionIndex) => {
            const marker = markers[option];
            const isActive = active === option;
            return (
              <div
                key={option}
                role="slider"
                tabIndex={0}
                aria-label={labels[option]}
                aria-valuemin={RATING_MIN}
                aria-valuemax={RATING_MAX}
                aria-valuenow={marker.value}
                aria-valuetext={
                  marker.touched
                    ? String(marker.value)
                    : t("rating.markerUntouched", { option: labels[option] })
                }
                data-testid={`rating-marker-${option}`}
                data-touched={marker.touched}
                onPointerDown={handlePointerDown(option)}
                onPointerMove={handlePointerMove(option)}
                onPointerUp={handlePointerUp(option)}
                onKeyDown={handleKeyDown(option)}
                className={cn(
                  "absolute top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none place-content-center rounded-full border-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "z-20 border-primary bg-primary text-primary-foreground shadow-lg"
                    : marker.touched
                      ? "z-10 border-primary bg-background text-primary"
                      : "z-10 border-dashed border-muted-foreground bg-background text-muted-foreground",
                )}
                style={{
                  left: `${percentFor(marker.value)}%`,
                  marginTop: optionIndex === 0 ? "-1.5rem" : "1.5rem",
                }}
              >
                {marker.touched ? marker.value : "?"}
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex justify-between text-xs text-muted-foreground">
          <span>{t("rating.scaleMin")}</span>
          <span>{t("rating.scaleMid")}</span>
          <span>{t("rating.scaleMax")}</span>
        </div>
      </div>

      <ul className="space-y-2">
        {options.map((option) => {
          const marker = markers[option];
          return (
            <li
              key={option}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                active === option ? "border-primary bg-primary/5" : "border-border bg-card",
              )}
            >
              <span className="min-w-0 flex-1 truncate font-medium">{labels[option]}</span>
              <span className={marker.touched ? "text-foreground" : "text-muted-foreground"}>
                {marker.touched ? marker.value : t("rating.notSet")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
