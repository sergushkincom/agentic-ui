/** Pure helpers shared by the components. No React here, so they are unit-tested on their own. */

export type ConfidenceBand = "sure" | "fairly-sure" | "unsure";

/**
 * Confidence in words. A number alone ("72%") asks the reader to know what is good enough;
 * the band says what the agent will do about it. Below `askBelow` the agent asks a person.
 */
export function confidenceBand(value: number, askBelow = 0.7): ConfidenceBand {
  const v = clamp01(value);
  if (v < askBelow) return "unsure";
  if (v >= Math.max(0.85, askBelow)) return "sure";
  return "fairly-sure";
}

export const BAND_LABEL: Record<ConfidenceBand, string> = {
  sure: "Sure",
  "fairly-sure": "Fairly sure",
  unsure: "Not sure, asks you",
};

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function formatPercent(value: number): string {
  return `${Math.round(clamp01(value) * 100)}%`;
}

/** "0.4s", "6s", "1m 05s". Short enough for a status line. */
export function formatDuration(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe < 1000) return `${(safe / 1000).toFixed(1)}s`;
  const s = Math.round(safe / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${String(s % 60).padStart(2, "0")}s`;
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
