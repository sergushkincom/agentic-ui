"use client";

import { useId } from "react";
import { nextEnabledIndex } from "./keyboard";
import { AgentMark, HumanMark, buttonClass } from "./marks";
import { StatusMorph } from "./status-morph";

export type StepField = { name: string; value: string };

/** One item handed in from an earlier step. */
export type StepItem = {
  id: string;
  label: string;
  fields: StepField[];
};

export type StepParameter = {
  name: string;
  value: string;
  hint?: string;
};

export type StepSetting = {
  name: string;
  value: string;
  hint?: string;
};

/** What this step produced. Null until it has run, or until someone pins mock data. */
export type StepOutput = {
  summary: string;
  fields: StepField[];
};

export type StepInspectorProps = {
  /** What this step does, for people. */
  title: string;
  /** Machine name, shown small. */
  step: string;
  /** Items from earlier steps. */
  input: StepItem[];
  parameters: StepParameter[];
  settings: StepSetting[];
  /** Which configuration tab is open. */
  tab: "parameters" | "settings";
  onTab: (tab: "parameters" | "settings") => void;
  /** Null when there is nothing to show yet. */
  output: StepOutput | null;
  status: "idle" | "running" | "done" | "failed";
  /** Pinned: a person supplied this. Live: the step produced it. */
  source?: "pinned" | "live";
  /** Plain-words reason, when status is failed. */
  error?: string;
  /** Runs this step. Hidden when omitted. */
  onRun?: () => void;
};

const EMPTY_OUTPUT = "Run this step to see data, or pin mock data.";

/**
 * One step, open. Input from earlier steps, the parameters and settings it will use,
 * and the output the next step will see. An empty output says so, instead of inventing a result.
 */
export function StepInspector({
  title,
  step,
  input,
  parameters,
  settings,
  tab,
  onTab,
  output,
  status,
  source,
  error,
  onRun,
}: StepInspectorProps) {
  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-3 py-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <AgentMark label="Agent" />
            <h3 className="min-w-0 text-[15px] font-medium">{title}</h3>
          </div>
          <p className="truncate font-[family-name:var(--mono)] text-[11px] text-[var(--fg-muted)]">{step}</p>
        </div>
        {onRun && (
          <button type="button" className={`${buttonClass.primary} shrink-0 whitespace-nowrap`} onClick={onRun} disabled={status === "running"}>
            {status === "running" ? "Running" : "Run this step"}
          </button>
        )}
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
        <InputPane input={input} />
        <ParameterPane tab={tab} onTab={onTab} parameters={parameters} settings={settings} />
        <OutputPane output={output} status={status} source={source} error={error} />
      </div>
    </section>
  );
}

function InputPane({ input }: { input: StepItem[] }) {
  return (
    <section aria-label="Input" className="flex min-w-0 flex-col gap-2 overflow-hidden border-b border-[var(--border)] px-3 py-2.5 sm:border-b-0">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-[10px] font-medium tracking-wide text-[var(--fg-muted)] uppercase">Input</h4>
        <span className="text-[10px] tabular-nums text-[var(--fg-muted)]">
          {input.length === 0 ? "Nothing yet" : `${input.length} earlier`}
        </span>
      </div>
      {input.length === 0 ? (
        <p className="text-[13px] text-[var(--fg-muted)]">Nothing has come in from an earlier step.</p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {input.map((item) => (
            <li key={item.id} className="flex min-w-0 flex-col gap-1">
              <p className="truncate text-[13px] font-medium">{item.label}</p>
              <dl className="flex flex-col gap-0.5">{fieldRows(item.fields)}</dl>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ParameterPane({
  tab,
  onTab,
  parameters,
  settings,
}: {
  tab: "parameters" | "settings";
  onTab: (tab: "parameters" | "settings") => void;
  parameters: StepParameter[];
  settings: StepSetting[];
}) {
  const base = useId();
  const tabs = [
    { id: "parameters" as const, label: "Parameters" },
    { id: "settings" as const, label: "Settings" },
  ];
  const rows = tab === "parameters" ? parameters : settings;
  return (
    <section aria-label="Parameters and settings" className="flex min-w-0 flex-col gap-2 overflow-hidden border-b border-[var(--border)] px-3 py-2.5 sm:border-b-0">
      <div
        role="tablist"
        aria-label="Step configuration"
        className="flex gap-3 border-b border-[var(--border)]"
        onKeyDown={(event) => {
          const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
          const current = buttons.findIndex((button) => button === event.target);
          if (current < 0) return;
          const key = event.key === "ArrowRight" ? "ArrowDown" : event.key === "ArrowLeft" ? "ArrowUp" : event.key;
          const next = nextEnabledIndex(current, buttons.length, key, () => false);
          if (next === null) return;
          event.preventDefault();
          const id = buttons[next]?.dataset.tab;
          if (id === "parameters" || id === "settings") onTab(id);
          buttons[next]?.focus();
        }}
      >
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              id={`${base}-${item.id}`}
              type="button"
              role="tab"
              data-tab={item.id}
              aria-selected={selected}
              aria-controls={`${base}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onTab(item.id)}
              className={`-mb-px border-b-2 pb-1.5 text-[13px] font-medium ${selected ? "border-[var(--agent)] text-[var(--fg)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-${tab}`} className="flex flex-col gap-2.5">
        {rows.map((item) => (
          <div key={item.name} className="flex min-w-0 flex-col gap-0.5">
            <p className="text-[11px] text-[var(--fg-muted)]">{item.name}</p>
            <p className="truncate text-[13px]">{item.value}</p>
            {item.hint && <p className="text-[11px] text-[var(--fg-muted)]">{item.hint}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function OutputPane({
  output,
  status,
  source,
  error,
}: {
  output: StepOutput | null;
  status: StepInspectorProps["status"];
  source?: StepInspectorProps["source"];
  error?: string;
}) {
  const spoken = status === "running" ? "Running" : status === "failed" ? "Failed" : status === "done" ? "Done" : "Not run";
  const pinned = source === "pinned";
  const tone = status === "failed" ? "bg-[var(--risk-soft)]" : output ? "" : "bg-[var(--bg)]";
  return (
    <section aria-label="Output" className={`flex min-w-0 flex-col gap-2 overflow-hidden px-3 py-2.5 ${tone}`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] font-medium tracking-wide text-[var(--fg-muted)] uppercase">Output</h4>
        <span className="flex items-center gap-1.5">
          <span className="sr-only">{spoken}. </span>
          {pinned ? (
            <HumanMark label="pinned" />
          ) : status === "idle" ? (
            <span aria-hidden="true" className="size-3.5 rounded-full border border-dashed border-[var(--fg-muted)]" />
          ) : (
            <StatusMorph glyph={status === "running" ? "spinner" : status === "failed" ? "alert" : "check"} />
          )}
          {status === "done" && !pinned && <span className="text-[11px] font-medium text-[var(--ok)]">live</span>}
        </span>
      </div>
      {output ? (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium">{output.summary}</p>
          <dl className="flex flex-col gap-0.5">{fieldRows(output.fields)}</dl>
          {pinned && <p className="text-[11px] text-[var(--fg-muted)]">Later steps use this. This step will not run again.</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {status === "running" && <p className="text-[13px] font-medium">Running this step.</p>}
          {status === "failed" && error && <p className="text-[13px] text-[var(--risk)]">{error}</p>}
          <p className="text-[13px] text-[var(--fg-muted)]">{EMPTY_OUTPUT}</p>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {status === "running" ? "Running this step." : status === "done" && output ? `${pinned ? "Pinned" : "Live"}. ${output.summary}` : status === "failed" ? (error ?? "This step failed.") : ""}
      </p>
    </section>
  );
}

function fieldRows(fields: StepField[]) {
  return fields.map((field) => (
    <div key={field.name} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
      <dt className="text-[11px] text-[var(--fg-muted)]">{field.name}</dt>
      <dd className="min-w-0 truncate text-[12px] tabular-nums">{field.value}</dd>
    </div>
  ));
}
