"use client";

import { useState } from "react";
import { formatLogTime } from "./format";
import { nextEnabledIndex } from "./keyboard";
import { Chevron, buttonClass } from "./marks";
import { StatusMorph } from "./status-morph";

export type RunLogCell = string | number | boolean | null;

export type RunLogSide = {
  columns: string[];
  rows: RunLogCell[][];
  /** Row indexes that failed a check. The row says so, not only by colour. */
  marked?: number[];
  /** Exact payload for the JSON view. The table is used when this is omitted. */
  json?: unknown;
};

export type RunLogStatus = "running" | "success" | "error" | "canceled";

export type RunLogStep = {
  id: string;
  /** What this step did, for a person. */
  label: string;
  status: RunLogStatus;
  durationMs?: number;
  children?: RunLogStep[];
  input?: RunLogSide;
  output?: RunLogSide;
};

export type RunLogProps = {
  steps: RunLogStep[];
  /** Dock title. Default "Log". */
  title?: string;
  /** Wipes the log. The parent owns the data, so clearing is its job. */
  onClear?: () => void;
};

type FlatStep = { step: RunLogStep; depth: number };

const STATUS_WORD: Record<RunLogStatus, string> = {
  running: "Running",
  success: "Succeeded",
  error: "Error",
  canceled: "Canceled",
};

const STATUS_BAR: Record<RunLogStatus, string> = {
  running: "var(--agent)",
  success: "var(--ok)",
  error: "var(--risk)",
  canceled: "var(--fg-muted)",
};

/**
 * A dock under a run. The steps, with durations, sit on one side. The open step's
 * input or output sits on the other, as a table or as JSON. Clear forgets the log.
 */
export function RunLog({ steps, title = "Log", onClear }: RunLogProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [pane, setPane] = useState<"input" | "output">("output");
  const [view, setView] = useState<"table" | "json">("table");
  const flat = flatten(steps);
  const selected = flat.some((row) => row.step.id === picked) ? picked : pickId(steps);
  const step = flat.find((row) => row.step.id === selected)?.step ?? null;
  const summary = summaryOf(steps);

  return (
    <section
      aria-label={title}
      className="@container flex flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]"
    >
      <header className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5">
        <h3 className="font-[family-name:var(--mono)] text-[11px] font-medium tracking-wide text-[var(--fg)] uppercase">{title}</h3>
        <p className="flex min-w-0 items-center gap-1.5 text-[12px] text-[var(--fg-muted)]" aria-live="polite">
          {summary.status === "canceled" ? (
            <span aria-hidden="true" className="size-2 shrink-0 rounded-[2px] border border-[var(--fg-muted)]" />
          ) : summary.status ? (
            <StatusMorph glyph={summary.status === "running" ? "spinner" : summary.status === "error" ? "alert" : "check"} />
          ) : null}
          <span className="truncate tabular-nums">{summary.text}</span>
        </p>
        <button
          type="button"
          onClick={onClear}
          disabled={!onClear || steps.length === 0}
          className={`${buttonClass.ghost} ml-auto h-7 px-2 text-[12px]`}
        >
          Clear
        </button>
      </header>
      <div className="grid min-h-64 @md:min-h-72 @md:grid-cols-[minmax(0,14.5rem)_minmax(0,1fr)]">
        <StepTree steps={steps} selectedId={selected} onSelect={setPicked} />
        <DataPane step={step} pane={pane} view={view} onPane={setPane} onView={setView} />
      </div>
    </section>
  );
}

function summaryOf(steps: RunLogStep[]): { status: RunLogStatus | null; text: string } {
  if (steps.length === 0) return { status: null, text: "Nothing in the log" };
  const ms = steps.reduce((sum, step) => sum + (step.durationMs ?? 0), 0);
  const time = formatLogTime(ms);
  if (hasStatus(steps, "running")) return { status: "running", text: "Running" };
  if (hasStatus(steps, "error")) return { status: "error", text: `Error in ${time}` };
  if (steps.every((step) => step.status === "canceled")) return { status: "canceled", text: `Canceled in ${time}` };
  return { status: "success", text: `Succeeded in ${time}` };
}

function hasStatus(steps: readonly RunLogStep[], status: RunLogStatus): boolean {
  return steps.some((step) => step.status === status || (step.children ? hasStatus(step.children, status) : false));
}

function flatten(steps: readonly RunLogStep[], depth = 0): FlatStep[] {
  const out: FlatStep[] = [];
  for (const step of steps) {
    out.push({ step, depth });
    if (step.children?.length) out.push(...flatten(step.children, depth + 1));
  }
  return out;
}

function pickId(steps: readonly RunLogStep[]): string | null {
  const flat = flatten(steps);
  return (
    flat.find((row) => row.step.status === "error")?.step.id ??
    flat.find((row) => row.step.status === "running")?.step.id ??
    flat.at(-1)?.step.id ??
    null
  );
}

function StepTree({
  steps,
  selectedId,
  onSelect,
}: {
  steps: RunLogStep[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const flat = flatten(steps);
  const selectedIndex = Math.max(
    0,
    flat.findIndex((row) => row.step.id === selectedId),
  );
  if (flat.length === 0) {
    return <p className="px-3 py-6 text-[13px] leading-relaxed text-[var(--fg-muted)]">No steps yet.</p>;
  }
  return (
    <div
      role="tree"
      aria-label="Steps"
      className="min-h-0 overflow-auto border-b border-[var(--border)] @md:border-r @md:border-b-0"
      onKeyDown={(event) => {
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="treeitem"]')];
        const current = buttons.findIndex((button) => button === event.target || button.contains(event.target as Node));
        if (current < 0) return;
        const next = nextEnabledIndex(current, buttons.length, event.key);
        if (next === null) return;
        event.preventDefault();
        buttons[next]?.focus();
        const id = buttons[next]?.getAttribute("data-step-id");
        if (id) onSelect(id);
      }}
    >
      {flat.map((row, index) => (
        <StepRow
          key={row.step.id}
          step={row.step}
          depth={row.depth}
          selected={row.step.id === selectedId}
          tabIndex={index === selectedIndex ? 0 : -1}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function StepRow({
  step,
  depth,
  selected,
  tabIndex,
  onSelect,
}: {
  step: RunLogStep;
  depth: number;
  selected: boolean;
  tabIndex: number;
  onSelect: (id: string) => void;
}) {
  const branched = Boolean(step.children?.length);
  return (
    <button
      type="button"
      role="treeitem"
      data-step-id={step.id}
      aria-selected={selected}
      aria-level={depth + 1}
      tabIndex={tabIndex}
      onClick={() => onSelect(step.id)}
      className={`flex w-full items-center gap-2 py-1.5 pr-2.5 text-left text-[13px] ${selected ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]"}`}
      style={{
        paddingLeft: `${10 + depth * 14}px`,
        boxShadow: selected ? `inset 2px 0 0 ${STATUS_BAR[step.status]}` : undefined,
      }}
    >
      <StatusIcon status={step.status} />
      <span className={`min-w-0 flex-1 truncate ${step.status === "error" ? "text-[var(--risk)]" : ""}`}>{step.label}</span>
      <span className="shrink-0 text-[11px] tabular-nums text-[var(--fg-muted)]">
        {step.durationMs !== undefined ? formatLogTime(step.durationMs) : ""}
      </span>
      {branched && (
        <span className="text-[var(--fg-muted)]">
          <Chevron open />
        </span>
      )}
    </button>
  );
}

function StatusIcon({ status }: { status: RunLogStatus }) {
  const word = STATUS_WORD[status];
  const glyph = status === "running" ? "spinner" : status === "success" ? "check" : status === "error" ? "alert" : null;
  return (
    <span className="flex size-4 shrink-0 items-center justify-center">
      <span className="sr-only">{word}: </span>
      {glyph ? (
        <StatusMorph glyph={glyph} />
      ) : (
        <span aria-hidden="true" className="size-2 rounded-[2px] border border-[var(--fg-muted)]" />
      )}
    </span>
  );
}

function DataPane({
  step,
  pane,
  view,
  onPane,
  onView,
}: {
  step: RunLogStep | null;
  pane: "input" | "output";
  view: "table" | "json";
  onPane: (pane: "input" | "output") => void;
  onView: (view: "table" | "json") => void;
}) {
  const side = pane === "input" ? step?.input : step?.output;
  const empty = !side || side.rows.length === 0;
  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-2.5 py-1.5">
        <p className="mr-auto min-w-0 truncate text-[12px] text-[var(--fg-muted)]">
          {step ? step.label : "No step open"}
          {side && !empty ? <span className="tabular-nums"> · {side.rows.length === 1 ? "1 row" : `${side.rows.length} rows`}</span> : null}
        </p>
        <div className="inline-flex gap-0.5 rounded-lg bg-[var(--surface-2)] p-0.5">
          <button type="button" aria-pressed={pane === "input"} onClick={() => onPane("input")} className={pill(pane === "input")}>
            Input
          </button>
          <button type="button" aria-pressed={pane === "output"} onClick={() => onPane("output")} className={pill(pane === "output")}>
            Output
          </button>
        </div>
        <div className="inline-flex gap-0.5 rounded-lg bg-[var(--surface-2)] p-0.5">
          <button type="button" aria-pressed={view === "table"} onClick={() => onView("table")} className={pill(view === "table")}>
            Table
          </button>
          <button type="button" aria-pressed={view === "json"} onClick={() => onView("json")} className={pill(view === "json")}>
            JSON
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2.5">
        {!step ? (
          <p className="px-1 py-4 text-[13px] leading-relaxed text-[var(--fg-muted)]">Nothing to inspect.</p>
        ) : empty ? (
          <p className="px-1 py-4 text-[13px] leading-relaxed text-[var(--fg-muted)]">This step has no {pane}.</p>
        ) : view === "table" ? (
          <DataTable side={side} caption={`${step.label}, ${pane}`} />
        ) : (
          <DataJson side={side} />
        )}
      </div>
    </div>
  );
}

function pill(on: boolean) {
  return `h-6 rounded-md px-2 text-[11px] font-medium ${on ? "bg-[var(--surface)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`;
}

function DataTable({ side, caption }: { side: RunLogSide; caption: string }) {
  const marked = new Set(side.marked ?? []);
  return (
    <table className="w-full border-collapse text-left text-[12.5px]">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="text-[10px] tracking-wide text-[var(--fg-muted)] uppercase">
          {side.columns.map((column) => (
            <th key={column} scope="col" className="border-b border-[var(--border)] px-2 py-1.5 font-medium">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {side.rows.map((row, index) => (
          <tr key={`${index}-${String(row[0])}`} className={marked.has(index) ? "bg-[var(--risk-soft)] text-[var(--risk)]" : ""}>
            {side.columns.map((column, cell) => (
              <td key={column} className="border-b border-[var(--border)] px-2 py-1.5 align-top tabular-nums">
                {formatCell(row[cell])}
                {cell === 0 && marked.has(index) ? (
                  <span className="ml-1.5 font-sans text-[10px] font-medium tracking-wide uppercase">Wrong</span>
                ) : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DataJson({ side }: { side: RunLogSide }) {
  return (
    <pre className="font-[family-name:var(--mono)] text-[11px] leading-relaxed whitespace-pre-wrap">{toJson(side)}</pre>
  );
}

function formatCell(value: RunLogCell | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function toJson(side: RunLogSide): string {
  if (side.json !== undefined) return JSON.stringify(side.json, null, 2);
  const objects = side.rows.map((row) => Object.fromEntries(side.columns.map((column, index) => [column, row[index] ?? null])));
  return JSON.stringify(objects, null, 2);
}
