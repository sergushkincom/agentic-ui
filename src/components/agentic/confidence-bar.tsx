import { BAND_LABEL, clamp01, confidenceBand, formatPercent } from "./format";

export type ConfidenceBarProps = {
  /** 0 to 1. */
  value: number;
  /** Below this the agent does not act alone and asks a person. Drawn as a tick on the bar. */
  askBelow?: number;
  /** What the number is based on, in plain words. Without it a percentage is just a vibe. */
  basis?: string;
  compact?: boolean;
};

const BAND_COLOR = { sure: "var(--ok)", "fairly-sure": "var(--warn)", unsure: "var(--risk)" } as const;

/**
 * Confidence in words first, number second. The tick shows where the agent stops acting alone,
 * so the reader sees the gap between "how sure" and "sure enough".
 */
export function ConfidenceBar({ value, askBelow = 0.7, basis, compact = false }: ConfidenceBarProps) {
  const v = clamp01(value);
  const band = confidenceBand(v, askBelow);
  const color = BAND_COLOR[band];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-medium" style={{ color }}>
          {BAND_LABEL[band]}
        </span>
        <span className="tabular-nums text-[var(--fg-muted)]">{formatPercent(v)}</span>
      </div>
      <div
        role="meter"
        aria-label="Agent confidence"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v * 100)}
        aria-valuetext={`${BAND_LABEL[band]}, ${formatPercent(v)}`}
        className={`relative w-full rounded-full bg-[var(--surface-2)] ${compact ? "h-1" : "h-1.5"}`}
      >
        <div className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${v * 100}%`, background: color }} />
        <span
          aria-hidden="true"
          className="absolute -top-1 -bottom-1 w-px bg-[var(--fg)] opacity-60"
          style={{ left: `${clamp01(askBelow) * 100}%` }}
        />
      </div>
      {!compact && (
        <p className="text-xs text-[var(--fg-muted)]">
          {basis ? `${basis}. ` : ""}Asks you below {formatPercent(askBelow)}.
        </p>
      )}
    </div>
  );
}
