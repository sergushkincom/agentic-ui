"use client";

import { useEffect, useRef } from "react";
import { AgentMark, HumanMark } from "./marks";
import { StatusMorph, type StatusGlyph } from "./status-morph";

export type RunNodeStatus = "pending" | "running" | "ok" | "error";

export type RunNodeProps = {
  /** What this step does, as a short name: "Read INV-2041". */
  name: string;
  /** What is happening now, in one line. */
  subtitle: string;
  status: RunNodeStatus;
  /** How many items left this step. Drawn on the output port once any have. */
  items: number;
  /** Who carries the step. A person uses the human mark. Default "agent". */
  actor?: "agent" | "human";
};

const STATUS_LABEL: Record<RunNodeStatus, string> = {
  pending: "Pending",
  running: "Running",
  ok: "Done",
  error: "Failed",
};

/** "1 item", "5 items". Zero is "0 items". */
export function itemLabel(count: number): string {
  const n = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
  return `${n} ${n === 1 ? "item" : "items"}`;
}

/**
 * One step in a run. The name says what it is, the subtitle says what it is doing now,
 * and the port carries how many items left it. Pending has not moved anything yet.
 */
export function RunNode({ name, subtitle, status, items, actor = "agent" }: RunNodeProps) {
  const human = actor === "human";
  const glyph: StatusGlyph | null =
    status === "running" ? "spinner" : status === "ok" ? "check" : status === "error" ? "alert" : null;
  const showCount = items > 0 && status !== "pending";
  const rail = status === "error" ? "bg-[var(--risk)]" : human ? "bg-[var(--human)]" : "bg-[var(--agent)]";

  return (
    <article className="relative flex h-full min-h-[6.75rem] w-full max-w-[18rem] min-w-0 flex-col gap-1 overflow-visible rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2">
      <span
        aria-hidden="true"
        className={`absolute top-2 bottom-2 left-0 w-[3px] rounded-[var(--radius-sm)] ${rail} ${status === "pending" ? "opacity-35" : ""} ${
          status === "running" ? "aui-pulse" : ""
        }`}
      />
      <div className="flex items-center justify-between gap-2 pl-1.5">
        {human ? <HumanMark label="You" /> : <AgentMark label="Agent" />}
        <StatusIcon status={status} glyph={glyph} />
      </div>
      <h3 className={`line-clamp-2 pl-1.5 text-[13px] leading-5 font-medium ${status === "pending" ? "text-[var(--fg-muted)]" : ""}`}>
        {name}
      </h3>
      <div className="mt-auto flex flex-col gap-1 pl-1.5">
        <p className="line-clamp-2 text-[12px] leading-4 text-[var(--fg-muted)]">{subtitle}</p>
        <span className="flex h-4 items-center justify-end gap-1">
          {showCount && <PortCount label={itemLabel(items)} />}
          <PortDot status={status} />
        </span>
      </div>
    </article>
  );
}

function StatusIcon({ status, glyph }: { status: RunNodeStatus; glyph: StatusGlyph | null }) {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center">
      <span className="sr-only">{STATUS_LABEL[status]}</span>
      {glyph ? (
        <StatusMorph glyph={glyph} className="size-3.5" />
      ) : (
        <span aria-hidden="true" className="size-3 rounded-[var(--radius-sm)] border border-dashed border-[var(--fg-muted)]" />
      )}
    </span>
  );
}

function PortDot({ status }: { status: RunNodeStatus }) {
  const live = status === "running";
  const tone = status === "ok" ? "bg-[var(--ok)]" : status === "error" ? "bg-[var(--risk)]" : "bg-[var(--agent)]";
  return (
    <span
      aria-hidden="true"
      className={`size-2.5 translate-x-1/2 rounded-[var(--radius-sm)] ${
        status === "pending"
          ? "border border-dashed border-[var(--fg-muted)] bg-[var(--surface)]"
          : `border-2 border-[var(--surface)] ${tone}`
      } ${live ? "aui-pulse shadow-[0_0_0_3px_var(--agent-soft)]" : ""}`}
    />
  );
}

/** The count lands on the port when items leave the step. Reduced motion just shows it. */
function PortCount({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const anim = el.animate(
      [
        { opacity: 0, transform: "translateY(5px) scale(0.86)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
    return () => anim.cancel();
  }, [label]);

  return (
    <span
      ref={ref}
      className="rounded-[var(--radius-sm)] bg-[var(--fg)] px-1.5 py-px text-[10px] leading-4 font-medium whitespace-nowrap text-[var(--bg)] tabular-nums"
    >
      {label}
    </span>
  );
}
