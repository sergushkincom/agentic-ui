"use client";

import { useState } from "react";
import { formatDuration } from "./format";
import { Chevron } from "./marks";
import { StatusMorph } from "./status-morph";

export type ThinkingStep = { label: string; status: "done" | "active" | "pending" | "failed" };

export type ThinkingStateProps = {
  state: "thinking" | "done" | "failed";
  steps: ThinkingStep[];
  elapsedMs: number;
  /** Steps are folded by default: the summary line is what most people need. */
  defaultOpen?: boolean;
};

/**
 * What the agent is doing while you wait. One line says the current step and how long it has
 * taken; the full list is one click away. "Thinking…" alone gives no reason to keep waiting.
 */
export function ThinkingState({ state, steps, elapsedMs, defaultOpen = false }: ThinkingStateProps) {
  const [open, setOpen] = useState(defaultOpen);
  const active = steps.find((s) => s.status === "active");
  const failed = steps.find((s) => s.status === "failed");
  const doneCount = steps.filter((s) => s.status === "done").length;

  const summary =
    state === "thinking"
      ? (active?.label ?? "Starting")
      : state === "failed"
        ? `Stopped at: ${failed?.label ?? "a step"}`
        : `Thought for ${formatDuration(elapsedMs)} · ${doneCount} steps`;

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-[var(--radius)] px-3 py-2.5 text-left text-[13px]"
      >
        <span className="flex size-4 items-center justify-center">
          <StatusMorph glyph={state === "thinking" ? "spinner" : state === "failed" ? "alert" : "check"} className="size-4" />
        </span>
        <span className={`min-w-0 flex-1 truncate ${state === "thinking" ? "aui-pulse" : ""}`}>{summary}</span>
        {state === "thinking" && (
          <span className="tabular-nums text-[var(--fg-muted)]">{formatDuration(elapsedMs)}</span>
        )}
        <span className="text-[var(--fg-muted)]">
          <Chevron open={open} />
        </span>
      </button>
      {open && (
        <ol className="flex flex-col gap-1.5 border-t border-[var(--border)] px-3 py-2.5 text-[13px]">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <StepIcon status={s.status} />
              <span
                className={
                  s.status === "pending"
                    ? "text-[var(--fg-muted)]"
                    : s.status === "failed"
                      ? "text-[var(--risk)]"
                      : ""
                }
              >
                {s.label}
              </span>
            </li>
          ))}
        </ol>
      )}
      <span className="sr-only" aria-live="polite">
        {state === "done" ? summary : ""}
      </span>
    </div>
  );
}

function StepIcon({ status }: { status: ThinkingStep["status"] }) {
  const label = { done: "Done", active: "In progress", pending: "Not started", failed: "Failed" }[status];
  const glyph = status === "active" ? "spinner" : status === "done" ? "check" : status === "failed" ? "alert" : null;
  return (
    <span className="flex size-4 shrink-0 items-center justify-center" title={label}>
      <span className="sr-only">{label}: </span>
      {glyph ? (
        <StatusMorph glyph={glyph} />
      ) : (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--fg-muted)] opacity-50" />
      )}
    </span>
  );
}
