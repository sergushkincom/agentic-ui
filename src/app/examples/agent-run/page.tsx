import type { Metadata } from "next";
import Link from "next/link";
import { AgentRun } from "./agent-run";

export const metadata: Metadata = {
  title: "Agent run",
  description:
    "One composed example: an agent matches a supplier invoice, asks you to confirm a low-confidence field, and waits for approval. A second path shows the run failing.",
};

const USED: { slug: string; name: string }[] = [
  { slug: "thinking-state", name: "ThinkingState" },
  { slug: "tool-call-feed", name: "ToolCallFeed" },
  { slug: "streaming-text", name: "StreamingText" },
  { slug: "confidence-bar", name: "ConfidenceBar" },
  { slug: "human-override", name: "HumanOverride" },
  { slug: "agent-decision-card", name: "AgentDecisionCard" },
  { slug: "fallback-boundary", name: "FallbackBoundary" },
];

export default function AgentRunPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:py-14">
      <header className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <p className="text-[13px] font-medium text-[var(--agent)]">Example</p>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight sm:text-[32px]">One agent run</h1>
        <p className="text-[15px] leading-relaxed text-[var(--fg-muted)] sm:text-[17px]">
          An agent matches supplier invoice INV-2041 to purchase order PO-7718. It shows its work, stops where it is
          unsure, and waits for you to approve the payment. Switch to ERP fails to see the same run stop and hand the
          task back.
        </p>
      </header>

      <div className="mx-auto w-full max-w-xl">
        <AgentRun />
      </div>

      <p className="mx-auto w-full max-w-xl text-xs text-[var(--fg-muted)]">
        Fake data, the same invoice as the component demos. Nothing is sent and no model is called. Restart runs the
        path again.
      </p>
      <p className="mx-auto w-full max-w-xl text-[13px] leading-relaxed text-[var(--fg-muted)]">
        {USED.map((c, i) => (
          <span key={c.slug}>
            {i > 0 && ", "}
            <Link
              href={`/components/${c.slug}`}
              className="rounded-sm text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {c.name}
            </Link>
          </span>
        ))}
        .
      </p>
    </main>
  );
}
