"use client";

import { useState } from "react";
import { ConfidenceBar } from "./confidence-bar";
import { AgentMark, Chevron, HumanMark, buttonClass } from "./marks";

export type AgentDecision = {
  /** The action in one line, as a verb: "Pay INV-2041 against PO-7718". */
  title: string;
  /** What changes in the world if this goes ahead. */
  effect: string;
  confidence: number;
  askBelow?: number;
  /** Why the agent thinks this, most important first. Three at most reads well. */
  reasons: string[];
  /** Facts the reasons rest on, so a person can check them without opening another system. */
  evidence?: { label: string; value: string }[];
  /** What else it considered and why not. Shows the agent did not just take the first option. */
  alternatives?: { label: string; whyNot: string }[];
  /** Whether the action can be undone, and until when. Changes how carefully people read. */
  reversible: { ok: true; until: string } | { ok: false };
};

export type AgentDecisionCardProps = {
  decision: AgentDecision;
  status: "proposed" | "approved" | "rejected";
  onApprove: () => void;
  onReject: () => void;
  /** Who acted, shown after the decision is made. */
  decidedBy?: string;
};

/**
 * A decision the agent proposes and a person signs off. Order of reading: what happens, can I
 * undo it, how sure is it, why. Evidence and alternatives are there, but folded.
 */
export function AgentDecisionCard({ decision, status, onApprove, onReject, decidedBy = "You" }: AgentDecisionCardProps) {
  const [showMore, setShowMore] = useState(false);
  const d = decision;
  const final = status !== "proposed";

  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <AgentMark label="Agent proposes" />
          <span
            className="rounded-full px-1.5 py-px text-[11px] font-medium"
            style={
              d.reversible.ok
                ? { background: "var(--surface-2)", color: "var(--fg-muted)" }
                : { background: "var(--risk-soft)", color: "var(--risk)" }
            }
          >
            {d.reversible.ok ? `Undo until ${d.reversible.until}` : "Can't be undone"}
          </span>
        </div>
        <h3 className="text-[17px] leading-snug font-semibold">{d.title}</h3>
        <p className="text-[13px] text-[var(--fg-muted)]">{d.effect}</p>
      </header>

      <ConfidenceBar value={d.confidence} askBelow={d.askBelow} compact />

      <section>
        <h4 className="mb-1.5 text-xs font-medium text-[var(--fg-muted)]">Why</h4>
        <ul className="flex flex-col gap-1 text-[13px]">
          {d.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-[var(--agent)]" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      {(d.evidence?.length || d.alternatives?.length) && (
        <div>
          <button
            type="button"
            aria-expanded={showMore}
            onClick={() => setShowMore((s) => !s)}
            className="flex items-center gap-1 rounded-sm text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <Chevron open={showMore} />
            Evidence and what else it considered
          </button>
          {showMore && (
            <div className="mt-2 flex flex-col gap-3">
              {d.evidence && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-[var(--surface-2)] p-2.5 text-[13px]">
                  {d.evidence.map((e) => (
                    <div key={e.label} className="contents">
                      <dt className="text-[var(--fg-muted)]">{e.label}</dt>
                      <dd className="tabular-nums">{e.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {d.alternatives && (
                <ul className="flex flex-col gap-1.5 text-[13px]">
                  {d.alternatives.map((a) => (
                    <li key={a.label}>
                      <span className="font-medium">{a.label}</span>
                      <span className="text-[var(--fg-muted)]">: {a.whyNot}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3" aria-live="polite">
        {final ? (
          <p className="flex items-center gap-2 text-[13px]">
            <HumanMark label={decidedBy} />
            {status === "approved" ? "Approved. The agent goes ahead." : "Rejected. The agent won't do this."}
          </p>
        ) : (
          <>
            <button type="button" onClick={onApprove} className={buttonClass.primary}>
              Approve
            </button>
            <button type="button" onClick={onReject} className={buttonClass.secondary}>
              Reject
            </button>
          </>
        )}
      </footer>
    </article>
  );
}
