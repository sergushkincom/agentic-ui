"use client";


import {
  AgentDecisionCard,
  AgentHarness,
  ConfidenceBar,
  ConnectionPicker,
  ExpressionField,
  FallbackBoundary,
  PinnedOutput,
  StepError,
  StepInspector,
  HumanOverride,
  StreamingText,
  ThinkingState,
  RunLog,
  RunHistory,
  RunChat,
  ToolCallFeed,
  RunNode,
  RunGraph,
  StepPicker,
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
  "step-inspector": (
    <div className="origin-top-left scale-[0.55] w-[182%]">
      <StepInspector
        title="Compare line items"
        step="erp.compare_lines"
        input={[
          { id: "invoice", label: "Read invoice", fields: [{ name: "amount", value: "€12,518.00" }] },
          { id: "order", label: "Find the purchase order", fields: [{ name: "amount", value: "€12,480.00" }] },
        ]}
        parameters={[{ name: "Tolerance", value: "€38.00 delivery" }]}
        settings={[{ name: "On mismatch", value: "Stop and ask" }]}
        tab="parameters"
        onTab={noop}
        output={{
          summary: "Amounts differ by the €38.00 delivery.",
          fields: [{ name: "difference", value: "€38.00" }],
        }}
        status="done"
        source="live"
        onRun={noop}
      />
    </div>
  ),
  "expression-field": (
    <ExpressionField
      label="Supplier"
      mode="expression"
      fixedValue="Acme Fasteners"
      reference={{ step: "Read invoice", field: "supplier" }}
      fields={[{ step: "Read invoice", field: "supplier" }]}
      onMode={noop}
      onFixedValue={noop}
      onReference={noop}
      choosing={false}
      onChoosing={noop}
    />
  ),
  "pinned-output": (
    <PinnedOutput
      step="Compare line items"
      summary="Treat as a match. Delivery of €38.00 is agreed."
      source="pinned"
      onPin={noop}
      onUseLive={noop}
      onSupplyMock={noop}
    />
  ),
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
