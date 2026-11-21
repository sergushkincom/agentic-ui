"use client";


import {
  AgentDecisionCard,
  AgentHarness,
  ConfidenceBar,
  ConnectionPicker,
  FallbackBoundary,
  HumanOverride,
  StreamingText,
  ThinkingState,
  ToolCallFeed,
  WaitForPerson,
} from "@/components/agentic";

/** Static states for the home grid. The live versions are on each component's page. */
const noop = () => {};

const PREVIEWS: Record<string, React.ReactNode> = {
  "streaming-text": (
    <StreamingText text="INV-2041 from Acme Fasteners matches purchase order PO-7718. All three lines agree on" status="streaming" onStop={noop} />
  ),
  "agent-harness": (
    <AgentHarness
      title="Match the invoice"
      task="Match INV-2041 to PO-7718 before anyone is paid."
      sockets={[
        { id: "model", kind: "model", required: true },
        { id: "memory", kind: "memory", value: "Last 6 Acme invoices" },
        { id: "invoice", kind: "tool", value: "Read invoice INV-2041" },
      ]}
    />
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
  "wait-for-person": (
    <WaitForPerson
      task="The agent stopped while matching this invoice to PO-7718."
      prompt="Which cost centre takes the €38.00 delivery on INV-2041?"
      mode="reply"
      status="waiting"
      onRespond={noop}
    />
  ),
  "connection-picker": (
    <ConnectionPicker
      purpose="The agent needs the ERP to read INV-2041."
      accounts={[
        { id: "acme", name: "Acme ERP", holder: "ap@acme.example" },
        { id: "northwind", name: "Northwind purchasing", holder: "buyer@northwind.example" },
      ]}
      selectedId="acme"
      mode="pick"
      onSelect={noop}
      onSignIn={noop}
      onModeChange={noop}
      onManual={noop}
    />
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
