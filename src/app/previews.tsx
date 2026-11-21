"use client";


import {
  AgentDecisionCard,
  ConfidenceBar,
  FallbackBoundary,
  StepError,
  HumanOverride,
  StreamingText,
  ThinkingState,
  RunLog,
  RunHistory,
  RunChat,
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
  "run-log": (
    <RunLog
      steps={[
        { id: "1", label: "Read invoice INV-2041", status: "success", durationMs: 180 },
        { id: "2", label: "Find the purchase order", status: "success", durationMs: 420 },
        {
          id: "3",
          label: "Compare line items",
          status: "error",
          durationMs: 610,
          output: { columns: ["Item", "Invoice"], rows: [["Delivery", "€38.00"]], marked: [0] },
        },
      ]}
      onClear={noop}
    />
  ),
  "run-history": (
    <RunHistory
      selectedId="r2"
      onSelect={noop}
      runs={[
        { id: "r1", status: "success", at: "14:16", durationMs: 1450, label: "Match INV-2041" },
        { id: "r2", status: "error", at: "11:02", durationMs: 610, label: "Match INV-2041" },
        { id: "r3", status: "canceled", at: "18:41", durationMs: 3200, label: "Match INV-1988" },
      ]}
    />
  ),
  "run-chat": (
    <RunChat
      title="Match this invoice"
      draft=""
      onDraftChange={noop}
      onSend={noop}
      messages={[{ id: "1", role: "human", text: "Match INV-2041 to the open purchase order." }]}
      steps={[
        { id: "1", label: "Read invoice INV-2041", status: "done", durationMs: 180 },
        { id: "2", label: "Find the purchase order", status: "running" },
        { id: "3", label: "Compare line items", status: "pending" },
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
  "step-error": (
    <StepError
      step="Compare line items"
      message="The invoice total doesn't match the purchase order."
      facts={[
        { label: "Purchase order PO-7718", value: "€12,480.00" },
        { label: "Invoice INV-2041", value: "€12,518.00", wrong: true },
      ]}
      onRetry={noop}
    />
  ),
};

export function Preview({ slug }: { slug: string }) {
  return PREVIEWS[slug] ?? null;
}
