"use client";


import {
  AgentDecisionCard,
  ConfidenceBar,
  FallbackBoundary,
  HumanOverride,
  StreamingText,
  ThinkingState,
  ToolCallFeed,
  RunNode,
  RunGraph,
  StepPicker,
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
  "run-node": (
    <RunNode name="Compare the line items" subtitle="3 of 3 lines agree with PO-7718" status="ok" items={1} />
  ),
  "run-graph": (
    <div className="origin-top-left scale-[0.82] w-[122%]">
      <RunGraph
        phase="running"
        steps={[
          { id: "read", name: "Read INV-2041", subtitle: "1 invoice", status: "ok", items: 1 },
          { id: "match", name: "Match orders", subtitle: "PO-7718", status: "running", items: 0 },
        ]}
        onExecute={noop}
        onAdd={noop}
      />
    </div>
  ),
  "step-picker": (
    <StepPicker
      query=""
      onQueryChange={noop}
      onSelect={noop}
      steps={[
        { id: "invoice", name: "Read the invoice", detail: "INV-2041 · Acme Fasteners", group: "Read the books", actor: "agent" },
        { id: "centre", name: "Confirm the cost centre", detail: "4100 · Production", group: "Human in the loop", actor: "human" },
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
