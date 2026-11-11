"use client";

import { useState } from "react";
import { formatDuration } from "./format";
import { Chevron, Spinner } from "./marks";

export type ToolCall = {
  id: string;
  /** Machine name, shown small: `erp.find_purchase_order`. */
  tool: string;
  /** What the call does, for people: "Find the purchase order for INV-2041". */
  summary: string;
  status: "queued" | "running" | "done" | "failed";
  durationMs?: number;
  input?: Record<string, string | number | boolean>;
  output?: string;
  /** For failed calls: what went wrong, in plain words. */
  error?: string;
};

export type ToolCallFeedProps = { calls: ToolCall[]; title?: string };

/**
 * What the agent touched, in order. The human summary leads; the tool name and raw input/output
 * are folded underneath for the people who need to audit it.
 */
export function ToolCallFeed({ calls, title = "Actions" }: ToolCallFeedProps) {
  const done = calls.filter((c) => c.status === "done").length;
  return (
    <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2 text-xs text-[var(--fg-muted)]">
        <h3 className="font-medium text-[var(--fg)]">{title}</h3>
        <span className="tabular-nums">
          {done} of {calls.length} done
        </span>
      </header>
      <ol aria-live="polite" className="divide-y divide-[var(--border)]">
        {calls.map((c) => (
          <Row key={c.id} call={c} />
        ))}
      </ol>
    </section>
  );
}

function Row({ call }: { call: ToolCall }) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(call.input || call.output || call.error);
  return (
    <li>
      <button
        type="button"
        disabled={!hasDetail}
        aria-expanded={hasDetail ? open : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left disabled:cursor-default"
      >
        <StatusIcon status={call.status} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={`text-[13px] ${call.status === "queued" ? "text-[var(--fg-muted)]" : ""}`}>{call.summary}</span>
          <span className="truncate font-[family-name:var(--mono)] text-[11px] text-[var(--fg-muted)]">{call.tool}</span>
          {call.status === "failed" && call.error && <span className="text-xs text-[var(--risk)]">{call.error}</span>}
        </span>
        <span className="shrink-0 pt-px text-xs tabular-nums text-[var(--fg-muted)]">
          {call.status === "done" || call.status === "failed"
            ? call.durationMs !== undefined && formatDuration(call.durationMs)
            : call.status === "running"
              ? "running"
              : "queued"}
        </span>
        {hasDetail && (
          <span className="pt-0.5 text-[var(--fg-muted)]">
            <Chevron open={open} />
          </span>
        )}
      </button>
      {open && hasDetail && (
        <div className="mx-3 mb-3 flex flex-col gap-2 rounded-lg bg-[var(--surface-2)] p-2.5 font-[family-name:var(--mono)] text-[11px] leading-relaxed">
          {call.input && (
            <div>
              <div className="mb-0.5 font-sans text-[10px] tracking-wide text-[var(--fg-muted)] uppercase">Input</div>
              <pre className="whitespace-pre-wrap">{JSON.stringify(call.input, null, 2)}</pre>
            </div>
          )}
          {call.output && (
            <div>
              <div className="mb-0.5 font-sans text-[10px] tracking-wide text-[var(--fg-muted)] uppercase">Output</div>
              <pre className="whitespace-pre-wrap">{call.output}</pre>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function StatusIcon({ status }: { status: ToolCall["status"] }) {
  const label = { queued: "Queued", running: "Running", done: "Done", failed: "Failed" }[status];
  return (
    <span className="flex size-4 shrink-0 items-center justify-center pt-0.5">
      <span className="sr-only">{label}: </span>
      {status === "running" ? (
        <span className="text-[var(--agent)]">
          <Spinner className="size-3.5" />
        </span>
      ) : status === "done" ? (
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 text-[var(--ok)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3.5 8.5 3 3 6-7" />
        </svg>
      ) : status === "failed" ? (
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 text-[var(--risk)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m4.5 4.5 7 7m0-7-7 7" />
        </svg>
      ) : (
        <span aria-hidden="true" className="size-3 rounded-full border border-dashed border-[var(--fg-muted)]" />
      )}
    </span>
  );
}
