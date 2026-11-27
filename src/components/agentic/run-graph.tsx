"use client";

import { useEffect, useRef } from "react";
import { HumanMark } from "./marks";
import { RunNode, itemLabel, type RunNodeStatus } from "./run-node";
import { StatusMorph } from "./status-morph";

export type RunGraphPhase = "execute" | "waiting" | "running";

export type RunGraphStep = {
  id: string;
  name: string;
  subtitle: string;
  status: RunNodeStatus;
  /** Items this step sent on. The edge after it is labelled from this. */
  items: number;
  actor?: "agent" | "human";
};

export type RunGraphProps = {
  steps: RunGraphStep[];
  /** Execute can be pressed. Waiting means a person holds the run. Running means a step is in progress. */
  phase: RunGraphPhase;
  /** Starts the run. The Execute pill is disabled without it. */
  onExecute?: () => void;
  /** Adds the next step at the end of the chain. The add button is disabled without it. */
  onAdd?: () => void;
};

/**
 * A short piece of a run, not an editor. Steps sit on a dotted grid, each edge says how
 * many items moved, and one pill says whether you can start it, whether it is running,
 * or whether it is waiting for a person.
 */
export function RunGraph({ steps, phase, onExecute, onAdd }: RunGraphProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const seen = useRef(steps.length);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || steps.length <= seen.current) {
      seen.current = steps.length;
      return;
    }
    seen.current = steps.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ left: scroller.scrollWidth, behavior: reduced ? "auto" : "smooth" });
  }, [steps.length]);

  return (
    <section
      aria-label="Run"
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--fg) 22%, transparent) 1px, transparent 1.15px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative flex flex-col gap-3 p-3">
        <PhasePill phase={phase} onExecute={onExecute} />
        <div className="flex min-w-0 items-stretch">
          <div ref={scrollerRef} className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
            {steps.map((step, index) => {
              const next = steps[index + 1];
              return (
                <div key={step.id} className="flex items-stretch">
                  <div className="flex w-[7.75rem] shrink-0">
                    <RunNode
                      name={step.name}
                      subtitle={step.subtitle}
                      status={step.status}
                      items={step.items}
                      actor={step.actor}
                    />
                  </div>
                  {next && (
                    <Edge
                      items={step.items}
                      active={phase === "running" && next.status === "running" && step.items > 0}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex shrink-0 items-end pb-0.5 pl-2">
            <AddStep onAdd={onAdd} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhasePill({ phase, onExecute }: { phase: RunGraphPhase; onExecute?: () => void }) {
  if (phase === "running") {
    return (
      <span
        role="status"
        className="inline-flex h-7 items-center gap-1.5 self-start rounded-[var(--radius-sm)] bg-[var(--agent-soft)] pr-2.5 pl-1.5 text-[13px] font-medium text-[var(--agent)]"
      >
        <StatusMorph glyph="spinner" className="size-3.5" />
        Running
      </span>
    );
  }
  if (phase === "waiting") {
    return (
      <span role="status" className="inline-flex h-7 items-center self-start">
        <HumanMark label="Waiting" size="md" />
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onExecute}
      disabled={!onExecute}
      className="inline-flex h-7 items-center self-start rounded-[var(--radius-md)] bg-[var(--fg)] px-3 text-[13px] font-medium text-[var(--bg)] hover:opacity-90 disabled:opacity-40"
    >
      Execute
    </button>
  );
}

function Edge({ items, active }: { items: number; active: boolean }) {
  const lineRef = useRef<HTMLSpanElement>(null);
  const beadRef = useRef<HTMLSpanElement>(null);
  const travelled = items > 0;
  const label = itemLabel(items);

  useEffect(() => {
    const line = lineRef.current;
    if (!line || !travelled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const draw = line.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: 460,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both",
    });
    return () => draw.cancel();
  }, [travelled, items]);

  useEffect(() => {
    const bead = beadRef.current;
    if (!bead || !active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const flow = bead.animate([{ left: "0%" }, { left: "100%" }], {
      duration: 1200,
      iterations: Infinity,
      easing: "linear",
    });
    return () => flow.cancel();
  }, [active]);

  return (
    <div className="relative w-14 shrink-0 self-stretch">
      <span
        ref={lineRef}
        aria-hidden="true"
        className={`absolute right-0 left-0 h-px origin-left ${travelled ? "" : "border-t border-dashed border-[var(--fg-muted)]"}`}
        style={{
          bottom: "15px",
          background: travelled ? (active ? "var(--agent)" : "var(--fg-muted)") : undefined,
        }}
      />
      {active && travelled && (
        <span
          ref={beadRef}
          aria-hidden="true"
          className="absolute size-1.5 -translate-x-1/2 rounded-[var(--radius-sm)] bg-[var(--agent)] motion-reduce:hidden"
          style={{ bottom: "12px", left: "0%" }}
        />
      )}
      {travelled && (
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-1.5 py-px text-[10px] leading-4 font-medium whitespace-nowrap text-[var(--fg)] tabular-nums"
          style={{ bottom: "24px" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function AddStep({ onAdd }: { onAdd?: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={!onAdd}
      aria-label="Add the next step"
      className="inline-flex size-7 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--fg-muted)] bg-[var(--surface)] text-[var(--fg)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:hover:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M8 3.25v9.5M3.25 8h9.5" />
      </svg>
    </button>
  );
}
