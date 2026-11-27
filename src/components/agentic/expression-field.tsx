"use client";

import { useEffect, useId, useRef } from "react";
import { nextEnabledIndex } from "./keyboard";
import { AgentMark } from "./marks";

/** A field on a previous step. Written as that step's name and the field, not as code. */
export type FieldReference = {
  step: string;
  field: string;
};

export type ExpressionFieldProps = {
  label: string;
  mode: "fixed" | "expression";
  /** What you typed. Used while mode is fixed. */
  fixedValue: string;
  /** The previous step's field. Null until one is chosen. */
  reference: FieldReference | null;
  /** Fields a person can insert, in list order. */
  fields: FieldReference[];
  onMode: (mode: "fixed" | "expression") => void;
  onFixedValue: (value: string) => void;
  onReference: (reference: FieldReference) => void;
  /** The list of previous fields is open. */
  choosing: boolean;
  onChoosing: (choosing: boolean) => void;
};

/**
 * A value that is either typed, or taken from a field on a previous step.
 * The reference is the step's name and the field, in ordinary type. It is not a correction:
 * nothing here says the agent was wrong.
 */
export function ExpressionField({
  label,
  mode,
  fixedValue,
  reference,
  fields,
  onMode,
  onFixedValue,
  onReference,
  choosing,
  onChoosing,
}: ExpressionFieldProps) {
  const labelId = useId();
  const hintId = useId();
  const inputId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const expressionButton = useRef<HTMLButtonElement>(null);
  const valueButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!choosing) return;
    const selected =
      listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]') ??
      listRef.current?.querySelector<HTMLElement>('[role="option"]') ??
      listRef.current;
    selected?.focus();
  }, [choosing]);

  useEffect(() => {
    if (!restoreFocus.current || choosing) return;
    restoreFocus.current = false;
    (valueButton.current ?? expressionButton.current)?.focus();
  }, [choosing, reference]);

  const closeList = () => {
    restoreFocus.current = true;
    onChoosing(false);
  };

  const modes = [
    { id: "fixed" as const, label: "Fixed" },
    { id: "expression" as const, label: "Expression" },
  ];

  const hint =
    mode === "fixed"
      ? "A value you type. The step uses it as written."
      : "Taken from a previous step. It changes when that step's output changes.";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span id={labelId} className="text-xs font-medium text-[var(--fg-muted)]">
          {label}
        </span>
        <div
          role="radiogroup"
          aria-label="Value kind"
          className="inline-flex gap-0.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] p-0.5"
          onKeyDown={(event) => {
            const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
            const current = buttons.findIndex((button) => button === event.target);
            if (current < 0) return;
            const key = event.key === "ArrowRight" ? "ArrowDown" : event.key === "ArrowLeft" ? "ArrowUp" : event.key;
            const next = nextEnabledIndex(current, buttons.length, key, () => false);
            if (next === null) return;
            event.preventDefault();
            const id = buttons[next]?.dataset.mode;
            if (id === "fixed" || id === "expression") onMode(id);
            buttons[next]?.focus();
          }}
        >
          {modes.map((item) => {
            const selected = mode === item.id;
            return (
              <button
                key={item.id}
                ref={item.id === "expression" ? expressionButton : undefined}
                type="button"
                role="radio"
                data-mode={item.id}
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onMode(item.id)}
                className={`h-7 rounded-[var(--radius-sm)] px-2.5 text-xs font-medium ${selected ? (item.id === "expression" ? "bg-[var(--agent)] text-[var(--bg)] shadow-sm" : "bg-[var(--surface)] text-[var(--fg)] shadow-sm") : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === "fixed" ? (
        <input
          id={inputId}
          aria-labelledby={labelId}
          aria-describedby={hintId}
          value={fixedValue}
          onChange={(event) => onFixedValue(event.target.value)}
          className="h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[15px] outline-none focus:border-[var(--accent)]"
        />
      ) : reference ? (
        <div className="flex h-9 items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--agent)] bg-[var(--agent-soft)] px-2.5">
          <span className="min-w-0 truncate text-[15px]">
            <span className="sr-only">
              {label}, from {reference.step}, {reference.field}.
            </span>
            <span aria-hidden="true" className="text-[var(--fg)]">
              {reference.step}
            </span>
            <span aria-hidden="true" className="px-1.5 text-[var(--fg-muted)]">
              ·
            </span>
            <span aria-hidden="true" className="font-medium text-[var(--agent)]">
              {reference.field}
            </span>
          </span>
          <button
            ref={valueButton}
            type="button"
            aria-describedby={hintId}
            onClick={() => onChoosing(true)}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] px-2 text-[13px] font-medium text-[var(--fg)] hover:bg-[var(--bg)]"
          >
            Change
            <span className="sr-only">
              {" "}
              {label}, from {reference.step}, {reference.field}
            </span>
          </button>
        </div>
      ) : (
        <button
          ref={valueButton}
          type="button"
          aria-describedby={hintId}
          onClick={() => onChoosing(true)}
          className="flex h-9 w-full items-center rounded-[var(--radius-sm)] border border-dashed border-[var(--agent)] bg-[var(--bg)] px-2.5 text-left text-[15px] text-[var(--fg-muted)]"
        >
          Choose a field from a previous step
          <span className="sr-only"> for {label}</span>
        </button>
      )}

      <p id={hintId} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--fg-muted)]">
        {mode === "expression" && <AgentMark label="From a step" />}
        {hint}
      </p>

      {mode === "expression" && choosing && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={`Fields for ${label}`}
          tabIndex={fields.length === 0 ? 0 : undefined}
          className="max-h-56 overflow-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] py-1 outline-none"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !event.repeat) {
              event.preventDefault();
              closeList();
              return;
            }
            const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]')];
            const current = buttons.findIndex((button) => button === event.target);
            if (current < 0) return;
            const next = nextEnabledIndex(current, buttons.length, event.key, () => false);
            if (next === null) return;
            event.preventDefault();
            buttons[next]?.focus();
          }}
        >
          {fields.length === 0 ? (
            <li className="px-3 py-2 text-[13px] text-[var(--fg-muted)]">No earlier step has a field yet.</li>
          ) : (
            fields.map((item, index) => {
              const selected = reference?.step === item.step && reference.field === item.field;
              const showStep = index === 0 || fields[index - 1]?.step !== item.step;
              return (
                <li key={`${item.step}:${item.field}`}>
                  {showStep && <p className="px-3 pt-2 pb-0.5 text-[11px] font-medium text-[var(--fg-muted)]">{item.step}</p>}
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={selected || (index === 0 && !reference) ? 0 : -1}
                    onClick={() => {
                      restoreFocus.current = true;
                      onReference(item);
                      onChoosing(false);
                    }}
                    className={`flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-[13px] ${selected ? "bg-[var(--agent)] text-[var(--bg)]" : "hover:bg-[var(--surface-2)]"}`}
                  >
                    <span className="font-medium">{item.field}</span>
                    <span className="sr-only">from {item.step}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
