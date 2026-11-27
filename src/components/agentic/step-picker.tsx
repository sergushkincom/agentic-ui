"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { nextEnabledIndex } from "./keyboard";
import { AgentMark, HumanMark } from "./marks";

export type StepChoice = {
  id: string;
  name: string;
  /** One line on what the step does. */
  detail: string;
  /** Group heading. "Human in the loop" is the group a person has to do. */
  group: string;
  actor: "agent" | "human";
};

export type StepPickerProps = {
  steps: StepChoice[];
  query: string;
  onQueryChange: (query: string) => void;
  /** The id of the step the person chose. */
  onSelect: (id: string) => void;
};

/**
 * What can come next. Search keeps the groups, and the steps a person has to do stay
 * in their own group instead of disappearing into the agent's calls.
 */
export function StepPicker({ steps, query, onQueryChange, onSelect }: StepPickerProps) {
  const uid = useId();
  const listId = `${uid}-steps`;
  const inputId = `${uid}-search`;
  const groups = groupSteps(steps, query);
  const visible = groups.flatMap((group) => group.steps);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  const index = visible.length === 0 ? -1 : Math.min(cursor, visible.length - 1);
  const current = index >= 0 ? visible[index] : undefined;

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (!query) return;
      event.preventDefault();
      onQueryChange("");
      return;
    }
    if (event.key === "Enter") {
      if (!current) return;
      event.preventDefault();
      onSelect(current.id);
      return;
    }
    if (visible.length === 0) return;
    const next = nextEnabledIndex(Math.max(index, 0), visible.length, event.key);
    if (next === null) return;
    event.preventDefault();
    setCursor(next);
  };

  return (
    <section aria-label="Choose the next step" className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-2.5">
      <label htmlFor={inputId} className="sr-only">
        Search next steps
      </label>
      <div className="relative">
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-[var(--fg-muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <circle cx="7" cy="7" r="4.25" />
          <path d="M10.5 10.5 13 13" />
        </svg>
        <input
          id={inputId}
          role="combobox"
          aria-expanded={visible.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={current ? optionId(uid, current.id) : undefined}
          value={query}
          placeholder="Search steps"
          autoComplete="off"
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] pr-2 pl-7 text-[13px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-muted)]"
        />
      </div>

      {visible.length === 0 ? (
        <p role="status" className="px-2 py-3 text-[13px] text-[var(--fg-muted)]">
          No step matches.
        </p>
      ) : (
        <div id={listId} role="listbox" aria-label="Next steps" className="flex flex-col">
          {groups.map((group) => {
            const people = group.steps.every((step) => step.actor === "human");
            return (
              <div key={group.label} role="group" aria-label={group.label} className="flex flex-col">
                <div
                  className={`px-2 pt-2.5 pb-1 text-[10px] font-medium tracking-[0.14em] uppercase ${
                    people ? "text-[var(--human)]" : "text-[var(--fg-muted)]"
                  }`}
                >
                  {group.label}
                </div>
                {group.steps.map((step) => {
                  const selected = step.id === current?.id;
                  return (
                    <button
                      key={step.id}
                      id={optionId(uid, step.id)}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
                      onMouseEnter={() => setCursor(visible.findIndex((item) => item.id === step.id))}
                      onClick={() => onSelect(step.id)}
                      className={`relative flex w-full items-start gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition-colors duration-150 motion-reduce:transition-none ${
                        selected ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-[var(--radius-sm)] transition-opacity duration-150 motion-reduce:transition-none ${
                          selected ? "opacity-100" : "opacity-0"
                        } ${step.actor === "human" ? "bg-[var(--human)]" : "bg-[var(--agent)]"}`}
                      />
                      <span className="rounded-[var(--radius-sm)] bg-[var(--surface)]">
                        {step.actor === "human" ? <HumanMark label="You" /> : <AgentMark label="Agent" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] leading-5">{step.name}</span>
                        <span className="block truncate text-[12px] leading-4 text-[var(--fg-muted)]">{step.detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function optionId(uid: string, id: string) {
  return `${uid}-step-${id}`;
}

function groupSteps(steps: StepChoice[], query: string): { label: string; steps: StepChoice[] }[] {
  const groups: { label: string; steps: StepChoice[] }[] = [];
  for (const step of steps) {
    if (!matches(step, query)) continue;
    const last = groups[groups.length - 1];
    if (last && last.label === step.group) last.steps.push(step);
    else groups.push({ label: step.group, steps: [step] });
  }
  return groups;
}

function matches(step: StepChoice, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [step.name, step.detail, step.group].some((part) => part.toLowerCase().includes(needle));
}
