"use client";

import { useId, useRef, useState } from "react";
import { AgentMark, HumanMark, buttonClass } from "./marks";

export type PinnedOutputProps = {
  /** The step this output belongs to, for people. */
  step: string;
  /** What later steps will read. */
  summary: string;
  /** Pinned: a person supplied it. Live: the step produced it on the last run. */
  source: "pinned" | "live";
  /** Keep the current summary and stop re-running this step. */
  onPin: () => void;
  /** Drop the pin and read the last run again. */
  onUseLive: () => void;
  /** Replace the output with mock data, and pin that. */
  onSupplyMock: (summary: string) => void;
  /** Open the mock field on first render. */
  defaultEditing?: boolean;
};

/**
 * Freeze one step's output so later steps can run without running this one again.
 * Pinned means a person supplied it. Live means the step produced it.
 */
export function PinnedOutput({ step, summary, source, onPin, onUseLive, onSupplyMock, defaultEditing = false }: PinnedOutputProps) {
  const [editing, setEditing] = useState(defaultEditing);
  const [draft, setDraft] = useState(summary);
  const inputId = useId();
  const supplyButton = useRef<HTMLButtonElement>(null);
  const pinned = source === "pinned";

  const close = () => {
    setEditing(false);
    requestAnimationFrame(() => supplyButton.current?.focus());
  };
  const save = () => {
    const next = draft.trim();
    if (!next) return;
    setEditing(false);
    onSupplyMock(next);
    requestAnimationFrame(() => supplyButton.current?.focus());
  };

  return (
    <section
      aria-label={`${step} output`}
      className="flex flex-col gap-2.5 rounded-[var(--radius)] border bg-[var(--surface)] p-3 transition-[border-color] duration-200 motion-reduce:transition-none"
      style={{ borderColor: pinned ? "var(--human)" : "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-[13px] font-medium">{step}</h3>
        {pinned ? <HumanMark label="pinned" /> : <AgentMark label="live" />}
      </div>
      <p className="text-[15px] leading-snug">{summary}</p>
      <p className="text-xs text-[var(--fg-muted)]">
        {pinned
          ? "Later steps use this. This step will not run again."
          : "From the last run. Pin it so later steps can run without running this one again."}
      </p>
      {editing ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || event.repeat) return;
            event.preventDefault();
            close();
          }}
        >
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--fg-muted)]">
            Mock output
          </label>
          <input
            id={inputId}
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[15px] outline-none focus:border-[var(--human)]"
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass.primary} disabled={!draft.trim()}>
              Use this mock
            </button>
            <button type="button" onClick={close} className={buttonClass.ghost}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          {pinned ? (
            <button type="button" onClick={onUseLive} className={buttonClass.secondary}>
              Use live output
            </button>
          ) : (
            <button type="button" onClick={onPin} className={buttonClass.primary}>
              Pin this output
            </button>
          )}
          <button
            ref={supplyButton}
            type="button"
            onClick={() => {
              setDraft(pinned ? summary : "");
              setEditing(true);
            }}
            className={buttonClass.secondary}
          >
            Supply mock
          </button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {pinned ? `Pinned. ${summary}` : `Live. ${summary}`}
      </p>
    </section>
  );
}
