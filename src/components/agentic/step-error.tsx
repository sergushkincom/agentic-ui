"use client";

import { buttonClass } from "./marks";
import { StatusMorph } from "./status-morph";

export type StepErrorFact = {
  /** What this value is. "Invoice INV-2041". */
  label: string;
  value: string;
  /** This is the value that failed the check. */
  wrong?: boolean;
};

export type StepErrorProps = {
  /** The step that failed, in words a person can read. */
  step: string;
  /** What broke, in plain words. */
  message: string;
  /** The values involved. Mark the one that is wrong. */
  facts: StepErrorFact[];
  /** Runs this step again. Later steps have not run. */
  onRetry: () => void;
};

/**
 * One step failed. Names the step, says what broke, and puts the wrong value
 * next to the ones that were fine. Retry runs that step again. It is not a
 * second way to do the whole task.
 */
export function StepError({ step, message, facts, onRetry }: StepErrorProps) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--risk)] bg-[var(--risk-soft)] p-4">
      <div className="flex items-start gap-2.5">
        <span className="pt-0.5">
          <StatusMorph glyph="alert" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[14px] font-medium">{step} failed</p>
          <p className="text-[13px] leading-relaxed">{message}</p>
          <p className="text-[12px] text-[var(--fg)]">Nothing after this step ran.</p>
        </div>
      </div>
      <dl className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="grid grid-cols-1 gap-0.5 border-b border-[var(--border)] px-3 py-2 last:border-b-0 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] sm:items-baseline sm:gap-3"
          >
            <dt className="text-[12px] text-[var(--fg-muted)]">{fact.label}</dt>
            <dd className={`text-[13px] tabular-nums ${fact.wrong ? "font-medium text-[var(--risk)]" : "text-[var(--fg)]"}`}>
              {fact.value}
              {fact.wrong ? <span className="ml-2 font-sans text-[10px] font-medium tracking-wide uppercase">Wrong</span> : null}
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <button type="button" onClick={onRetry} className={buttonClass.primary}>
          Retry this step
        </button>
      </div>
    </div>
  );
}
