"use client";

import { useId, useState } from "react";
import { HumanMark, buttonClass } from "./marks";
import { StatusMorph } from "./status-morph";

export type WaitMode = "reply" | "approval";

export type WaitForPersonProps = {
  /** What the run was doing when it stopped. */
  task: string;
  /** The question, in one sentence. */
  prompt: string;
  mode: WaitMode;
  status: "waiting" | "resumed";
  /** What the person sent. Shown once the run resumes. */
  answer?: string;
  onRespond: (answer: string) => void;
};

/**
 * A run that has stopped until a person answers. The question is the whole point: a reply, or
 * an approval. This is not a field the agent filled in, and it is not a scored proposal.
 * Nothing continues until they answer. Then the card is a receipt.
 */
export function WaitForPerson({ task, prompt, mode, status, answer, onRespond }: WaitForPersonProps) {
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const waiting = status === "waiting";

  return (
    <article
      className="flex flex-col gap-3 rounded-[var(--radius-lg)] border bg-[var(--surface)] p-3"
      style={{ borderColor: waiting ? "var(--human)" : "var(--ok)" }}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <HumanMark label={waiting ? "Waiting for you" : "You answered"} />
        {waiting ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--human)]">
            <PauseMark />
            <span aria-live="polite">Run paused</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ok)]">
            <StatusMorph glyph="check" />
            <span aria-live="polite">Resumed</span>
          </span>
        )}
      </header>

      <div className="flex flex-col gap-1">
        {waiting && mode === "reply" ? (
          <label htmlFor={inputId} className="text-[15px] leading-snug font-medium">
            {prompt}
          </label>
        ) : (
          <p className="text-[15px] leading-snug font-medium">{prompt}</p>
        )}
        <p className="text-[13px] text-[var(--fg-muted)]">{task}</p>
      </div>

      {waiting ? (
        mode === "reply" ? (
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const next = draft.trim();
              if (!next) return;
              onRespond(next);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || event.repeat) return;
              event.preventDefault();
              setDraft("");
            }}
          >
            <input
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Your reply"
              className="h-8 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[14px] outline-none focus:border-[var(--human)]"
            />
            <button type="submit" className={buttonClass.primary}>
              Reply
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onRespond("Approved")} className={buttonClass.primary}>
              Approve
            </button>
            <button type="button" onClick={() => onRespond("Sent back")} className={buttonClass.secondary}>
              Send back
            </button>
          </div>
        )
      ) : (
        <p className="text-[13px] leading-relaxed">
          {answer && <span className="font-medium">{answer}. </span>}
          <span className="text-[var(--fg-muted)]">The run continues from here.</span>
        </p>
      )}

      {waiting && <p className="text-xs text-[var(--fg-muted)]">The run stays paused until you answer.</p>}
    </article>
  );
}

/** Two bars, not a spinner: the agent is not working, the run is held. The pulse is the hold. */
function PauseMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="aui-pulse size-3.5 shrink-0" fill="currentColor">
      <rect x="3.25" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.75" y="2.5" width="3" height="11" rx="1" />
    </svg>
  );
}
