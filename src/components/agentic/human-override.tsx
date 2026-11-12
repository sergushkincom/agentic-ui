"use client";

import { useId, useRef, useState } from "react";
import { AgentMark, HumanMark, buttonClass } from "./marks";

export type HumanOverrideProps = {
  label: string;
  /** What the agent filled in. */
  agentValue: string;
  /** The current value: the agent's, or the person's after an override. */
  value: string;
  /** Whose value is shown. After an override the agent must leave the field alone. */
  source: "agent" | "human";
  onChange: (value: string, source: "agent" | "human") => void;
  /** Why the agent chose its value, one line. */
  reason?: string;
};

/**
 * A field the agent filled in, that a person can take over in one step.
 * After an override the field says who changed it and what the agent had, and the agent's value
 * is one click away. The promise to the person: your correction stays.
 */
export function HumanOverride({ label, agentValue, value, source, onChange, reason }: HumanOverrideProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputId = useId();
  const editButton = useRef<HTMLButtonElement>(null);

  const start = () => {
    setDraft(value);
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    requestAnimationFrame(() => editButton.current?.focus());
  };
  const save = () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== value) onChange(next, next === agentValue ? "agent" : "human");
    requestAnimationFrame(() => editButton.current?.focus());
  };

  const isHuman = source === "human";

  return (
    <div
      className="flex flex-col gap-2 rounded-[var(--radius)] border bg-[var(--surface)] p-3"
      style={{ borderColor: isHuman ? "var(--human)" : "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-xs font-medium text-[var(--fg-muted)]">
          {label}
        </label>
        {isHuman ? <HumanMark label="Changed by you" /> : <AgentMark label="Filled by agent" />}
      </div>

      {editing ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          onKeyDown={(e) => {
            if (e.key !== "Escape" || e.repeat) return;
            e.preventDefault();
            cancel();
          }}
        >
          <input
            id={inputId}
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-8 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[15px] outline-none focus:border-[var(--human)]"
          />
          <button type="submit" className={buttonClass.primary}>
            Save
          </button>
          <button type="button" onClick={cancel} className={buttonClass.ghost}>
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <output id={inputId} className="min-w-0 truncate text-[15px] font-medium">
            {value}
          </output>
          <button ref={editButton} type="button" onClick={start} className={buttonClass.secondary}>
            Change
          </button>
        </div>
      )}

      {isHuman ? (
        <p className="flex flex-wrap items-center gap-x-1 text-xs text-[var(--fg-muted)]">
          <span>
            Agent had <span className="text-[var(--fg)]">{agentValue}</span>. It won&apos;t overwrite your value.
          </span>
          <button
            type="button"
            onClick={() => onChange(agentValue, "agent")}
            className="rounded-sm text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Use agent&apos;s value
          </button>
        </p>
      ) : (
        reason && <p className="text-xs text-[var(--fg-muted)]">{reason}</p>
      )}
    </div>
  );
}
