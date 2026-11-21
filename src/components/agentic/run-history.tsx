"use client";

import { formatLogTime } from "./format";
import { nextEnabledIndex } from "./keyboard";
import { StatusMorph } from "./status-morph";

export type RunHistoryStatus = "success" | "error" | "canceled";

export type RunHistoryRun = {
  id: string;
  status: RunHistoryStatus;
  /** When it started, already in words. "14 Nov, 14:16". */
  at: string;
  durationMs: number;
  /** What the run was for. */
  label: string;
};

export type RunHistoryProps = {
  runs: RunHistoryRun[];
  /** The run the rest of the screen is showing. */
  selectedId: string;
  onSelect: (id: string) => void;
};

const WORD: Record<RunHistoryStatus, string> = {
  success: "Succeeded",
  error: "Error",
  canceled: "Canceled",
};

const BAR: Record<RunHistoryStatus, string> = {
  success: "var(--ok)",
  error: "var(--risk)",
  canceled: "var(--fg-muted)",
};

/**
 * Past runs. Each row says when it started, how it ended, and how long it took.
 * The highlighted row is the run in view. The parent owns that choice.
 */
export function RunHistory({ runs, selectedId, onSelect }: RunHistoryProps) {
  const selectedIndex = Math.max(
    0,
    runs.findIndex((run) => run.id === selectedId),
  );

  if (runs.length === 0) {
    return <p className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-6 text-[13px] text-[var(--fg-muted)]">No runs yet.</p>;
  }

  return (
    <div
      role="listbox"
      aria-label="Past runs"
      className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]"
      onKeyDown={(event) => {
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]')];
        const current = buttons.findIndex((button) => button === event.target || button.contains(event.target as Node));
        if (current < 0) return;
        const next = nextEnabledIndex(current, buttons.length, event.key);
        if (next === null) return;
        event.preventDefault();
        buttons[next]?.focus();
        const id = buttons[next]?.getAttribute("data-run-id");
        if (id) onSelect(id);
      }}
    >
      {runs.map((run, index) => {
          const selected = run.id === selectedId;
          return (
            <button
              key={run.id}
              type="button"
              role="option"
              data-run-id={run.id}
              aria-selected={selected}
              tabIndex={index === selectedIndex ? 0 : -1}
              onClick={() => onSelect(run.id)}
              className={`flex w-full items-start gap-2.5 border-b border-[var(--border)] px-3 py-2.5 text-left last:border-b-0 ${selected ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]"}`}
              style={{ boxShadow: selected ? `inset 3px 0 0 ${BAR[run.status]}` : undefined }}
            >
              <RunMark status={run.status} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px]">{run.label}</span>
                <span className="mt-0.5 block text-[12px] text-[var(--fg-muted)]">
                  <Outcome status={run.status} />
                  <span aria-hidden="true"> · </span>
                  <span className="tabular-nums">{formatLogTime(run.durationMs)}</span>
                </span>
              </span>
              <span className="shrink-0 pt-0.5 text-[11px] tabular-nums text-[var(--fg-muted)]">{run.at}</span>
            </button>
          );
        })}
    </div>
  );
}

function Outcome({ status }: { status: RunHistoryStatus }) {
  const tone = status === "error" ? "text-[var(--risk)]" : status === "success" ? "text-[var(--ok)]" : "text-[var(--fg-muted)]";
  return <span className={tone}>{WORD[status]}</span>;
}

function RunMark({ status }: { status: RunHistoryStatus }) {
  const glyph = status === "success" ? "check" : status === "error" ? "alert" : null;
  return (
    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
      {glyph ? (
        <StatusMorph glyph={glyph} />
      ) : (
        <span aria-hidden="true" className="size-2 rounded-[2px] border border-[var(--fg-muted)]" />
      )}
    </span>
  );
}
