"use client";


import {
  AgentDecisionCard,
  ConfidenceBar,
  FallbackBoundary,
  HumanOverride,
  StreamingText,
  ThinkingState,
  ToolCallFeed,
} from "@/components/agentic";

/** Static states for the home grid. The live versions are on each component's page. */
const noop = () => {};

const PREVIEWS: Record<string, React.ReactNode> = {
  "streaming-text": (
    <StreamingText text="INV-2041 from Acme Fasteners matches purchase order PO-7718. All three lines agree on" status="streaming" onStop={noop} />
  ),
  "thinking-state": (
    <ThinkingState
      state="thinking"
      elapsedMs={4200}
      defaultOpen
      steps={[
        { label: "Read invoice INV-2041", status: "done" },
        { label: "Find the purchase order", status: "active" },
        { label: "Compare line items", status: "pending" },
      ]}
    />
  ),
  "confidence-bar": <ConfidenceBar value={0.78} basis="3 of 4 fields match" />,
  "human-override": (
    <HumanOverride label="Cost centre" agentValue="4100 · Production" value="4200 · Assembly" source="human" onChange={noop} />
  ),
  "tool-call-feed": (
    <ToolCallFeed
      calls={[
        { id: "1", tool: "erp.get_invoice", summary: "Read invoice INV-2041", status: "done", durationMs: 180 },
        { id: "2", tool: "erp.find_purchase_order", summary: "Find the purchase order", status: "running" },
      ]}
    />
  ),
  "agent-decision-card": (
    <div className="origin-top-left scale-[0.8] w-[125%]">
      <AgentDecisionCard
        decision={{
          title: "Pay INV-2041 against PO-7718",
          effect: "Schedules €12,518.00 to Acme Fasteners on 14 Nov.",
          confidence: 0.91,
          reasons: ["All three lines match the order"],
          reversible: { ok: true, until: "13 Nov, 18:00" },
        }}
        status="proposed"
        onApprove={noop}
        onReject={noop}
      />
    </div>
  ),
  "fallback-boundary": (
    <FallbackBoundary status="slow" task="match this invoice" manual={{ label: "Match it myself", onClick: noop }} onRetry={noop}>
      {null}
    </FallbackBoundary>
  ),
};

export function Preview({ slug }: { slug: string }) {
  return PREVIEWS[slug] ?? null;
}
