/**
 * Scripted invoice run for /examples/agent-run.
 * One made-up ERP case, the same one as the component demos. Time is a beat counter,
 * so the flow is deterministic and testable. No clocks, no network.
 */

export type Scenario = "match" | "erp-fails";

export type RunPhase =
  | "working"
  | "streaming"
  | "uncertain"
  | "decision"
  | "approved"
  | "rejected"
  | "failed"
  | "manual";

export type RunState = {
  scenario: Scenario;
  /** Script clock. Starts at 0 with the first action already running. */
  beat: number;
  streamStopped: boolean;
  /** Beat at which the person stopped the stream. */
  stoppedBeat: number | null;
  costCentre: string;
  costSource: "agent" | "human";
  decision: "approved" | "rejected" | null;
  /** Person took the manual path out of a failure. */
  manual: boolean;
  /** Bumps on restart so the page can remount components that keep their own state. */
  runId: number;
};

export type RunEvent =
  | { type: "tick" }
  | { type: "stop-stream" }
  | { type: "override"; value: string }
  | { type: "approve" }
  | { type: "reject" }
  | { type: "take-over" }
  | { type: "retry" }
  | { type: "restart" }
  | { type: "scenario"; scenario: Scenario };

export const TICK_MS = 100;
/** How many beats each tool spends running before the next one starts. */
export const TOOL_SPAN = 10;
export const STREAM_CHARS_PER_BEAT = 8;

export const AGENT_COST_CENTRE = "4100 · Production";
export const RECEIPT_COST_CENTRE = "4200 · Assembly";

export const FIELD_CONFIDENCE = 0.46;
export const DECISION_CONFIDENCE = 0.88;
export const ASK_BELOW = 0.7;

export const FIELD_BASIS =
  "The last 6 invoices use 4100 · Production, but this receipt was booked to 4200 · Assembly";

export const FIELD_REASON =
  "Same as the last 6 invoices from this supplier. This receipt was booked to 4200 · Assembly.";

export const TASK_PROMPT =
  "Match invoice INV-2041 from Acme Fasteners to purchase order PO-7718.";

export const MATCH_ANSWER =
  "INV-2041 from Acme Fasteners matches purchase order PO-7718. All three lines agree on quantity and price, and the goods receipt was posted on 6 November. The only difference is the delivery fee of €38.00, which the order allows. I'm not sure about the cost centre: the last 6 invoices used 4100 · Production, but this receipt was booked to 4200 · Assembly. Confirm the cost centre and I'll propose the payment for 14 November.";

export const ERP_FAILURE_REASON = "The ERP didn't answer within 10 seconds.";

export const MANUAL_RECEIPT = "You matched INV-2041 to PO-7718 yourself. Nothing was changed.";

/** The goods-receipt call is the one that fails on the ERP-fails path. */
export const FAIL_TOOL_INDEX = 2;

type ToolDef = {
  id: string;
  tool: string;
  summary: string;
  durationMs: number;
  input: Record<string, string | number | boolean>;
  output: string;
  error?: string;
};

const TOOLS: ToolDef[] = [
  {
    id: "1",
    tool: "erp.get_invoice",
    summary: "Read invoice INV-2041",
    durationMs: 180,
    input: { id: "INV-2041" },
    output: "Acme Fasteners · 3 lines · €12,518.00 incl. €38.00 delivery",
  },
  {
    id: "2",
    tool: "erp.find_purchase_order",
    summary: "Find the purchase order for this supplier",
    durationMs: 420,
    input: { supplier: "Acme Fasteners", open: true },
    output: "PO-7718 · 3 lines · €12,480.00",
  },
  {
    id: "3",
    tool: "erp.get_goods_receipt",
    summary: "Check the goods were received",
    durationMs: 610,
    input: { po: "PO-7718" },
    output: "GR-5530 · posted 6 Nov · 3 of 3 lines · cost centre 4200 · Assembly",
    error: "The ERP didn't answer within 10 seconds. Nothing was posted.",
  },
  {
    id: "4",
    tool: "erp.lookup_cost_centre",
    summary: "Check which cost centre this invoice belongs to",
    durationMs: 260,
    input: { supplier: "Acme Fasteners", invoice: "INV-2041" },
    output: "Unsure · 4100 · Production on 6 recent invoices · 4200 · Assembly on this receipt",
  },
];

const STEP_LABELS = [
  "Read invoice INV-2041",
  "Find the purchase order",
  "Check the goods receipt",
  "Check the cost centre",
  "Draft a proposal",
];

export type StepStatus = "done" | "active" | "pending" | "failed";
export type CallStatus = "queued" | "running" | "done" | "failed";

export type CallView = {
  id: string;
  tool: string;
  summary: string;
  status: CallStatus;
  durationMs?: number;
  input?: Record<string, string | number | boolean>;
  output?: string;
  error?: string;
};

export type DecisionView = {
  title: string;
  effect: string;
  confidence: number;
  askBelow: number;
  reasons: string[];
  evidence: { label: string; value: string }[];
  alternatives: { label: string; whyNot: string }[];
  reversible: { ok: true; until: string };
};

export type ProgressState = "done" | "current" | "upcoming" | "failed";

export type RunView = {
  phase: RunPhase;
  playing: boolean;
  announcement: string;
  progress: { id: string; label: string; state: ProgressState }[];
  /** Where keyboard users can jump once the run is waiting on them. */
  skip: { id: string; label: string } | null;
  thinking: {
    state: "thinking" | "done" | "failed";
    steps: { label: string; status: StepStatus }[];
    elapsedMs: number;
  };
  calls: CallView[];
  stream: { text: string; status: "streaming" | "done" | "stopped" } | null;
  confidence: { value: number; askBelow: number; basis: string } | null;
  override: { value: string; source: "agent" | "human"; reason: string } | null;
  decision: { data: DecisionView; status: "proposed" | "approved" | "rejected" } | null;
  /** Outcome slot. "ok" wraps the decision or the manual receipt. */
  boundary: { status: "running" | "failed" | "ok"; reason?: string } | null;
  receipt: string | null;
};

export function freshRun(scenario: Scenario = "match", runId = 1): RunState {
  return {
    scenario,
    beat: 0,
    streamStopped: false,
    stoppedBeat: null,
    costCentre: AGENT_COST_CENTRE,
    costSource: "agent",
    decision: null,
    manual: false,
    runId,
  };
}

export function streamStartBeat(): number {
  return TOOLS.length * TOOL_SPAN;
}

function failEndBeat(): number {
  return (FAIL_TOOL_INDEX + 1) * TOOL_SPAN;
}

/** Characters of the answer revealed at this beat. Stopped runs freeze where the person stopped. */
export function streamedChars(state: RunState): number {
  if (state.scenario !== "match") return 0;
  const start = streamStartBeat();
  const beat = state.streamStopped && state.stoppedBeat !== null ? Math.min(state.beat, state.stoppedBeat) : state.beat;
  if (beat < start) return 0;
  const steps = beat - start + 1;
  return Math.min(MATCH_ANSWER.length, steps * STREAM_CHARS_PER_BEAT);
}

function answerReady(state: RunState): boolean {
  if (state.scenario !== "match") return false;
  if (state.beat < streamStartBeat()) return false;
  return state.streamStopped || streamedChars(state) >= MATCH_ANSWER.length;
}

export function phaseOf(state: RunState): RunPhase {
  if (state.scenario === "erp-fails") {
    if (state.manual) return "manual";
    if (state.beat >= failEndBeat()) return "failed";
    return "working";
  }
  if (state.decision === "approved") return "approved";
  if (state.decision === "rejected") return "rejected";
  if (answerReady(state)) return state.costSource === "human" ? "decision" : "uncertain";
  if (state.beat >= streamStartBeat()) return "streaming";
  return "working";
}

function isPlaying(state: RunState): boolean {
  const phase = phaseOf(state);
  return phase === "working" || phase === "streaming";
}

export function runReducer(state: RunState, event: RunEvent): RunState {
  switch (event.type) {
    case "tick":
      return isPlaying(state) ? { ...state, beat: state.beat + 1 } : state;
    case "stop-stream": {
      if (phaseOf(state) !== "streaming") return state;
      return { ...state, streamStopped: true, stoppedBeat: state.beat };
    }
    case "override": {
      if (state.scenario !== "match" || !answerReady(state)) return state;
      const value = event.value.trim();
      if (!value) return state;
      const costSource = value === AGENT_COST_CENTRE ? "agent" : "human";
      if (value === state.costCentre && costSource === state.costSource) return state;
      return { ...state, costCentre: value, costSource };
    }
    case "approve":
      if (phaseOf(state) !== "decision") return state;
      return { ...state, decision: "approved" };
    case "reject":
      if (phaseOf(state) !== "decision") return state;
      return { ...state, decision: "rejected" };
    case "take-over":
      if (phaseOf(state) !== "failed") return state;
      return { ...state, manual: true };
    case "retry":
    case "restart":
      return freshRun(state.scenario, state.runId + 1);
    case "scenario":
      if (event.scenario === state.scenario) return state;
      return freshRun(event.scenario, state.runId + 1);
  }
}

function callStatus(index: number, beat: number, scenario: Scenario): CallStatus {
  const start = index * TOOL_SPAN;
  const end = start + TOOL_SPAN;
  if (scenario === "erp-fails" && index > FAIL_TOOL_INDEX) return "queued";
  if (beat < start) return "queued";
  if (beat < end) return "running";
  if (scenario === "erp-fails" && index === FAIL_TOOL_INDEX) return "failed";
  return "done";
}

function stepStatus(index: number, state: RunState, ready: boolean): StepStatus {
  if (index === TOOLS.length) {
    if (state.scenario === "erp-fails") return "pending";
    if (ready) return "done";
    if (state.beat >= streamStartBeat()) return "active";
    return "pending";
  }
  const status = callStatus(index, state.beat, state.scenario);
  if (status === "failed") return "failed";
  if (status === "done") return "done";
  if (status === "running") return "active";
  return "pending";
}

function progressFor(phase: RunPhase, scenario: Scenario): RunView["progress"] {
  if (scenario === "erp-fails") {
    const hand: ProgressState = phase === "manual" ? "done" : phase === "failed" ? "current" : "upcoming";
    return [
      { id: "working", label: "Working", state: phase === "working" ? "current" : "failed" },
      { id: "hand-back", label: "Hand the task back", state: hand },
    ];
  }
  const at = phase === "working" || phase === "streaming" ? 0 : phase === "uncertain" ? 1 : phase === "decision" ? 2 : 3;
  const labels = [
    { id: "working", label: "Working" },
    { id: "confirm", label: "Confirm a field" },
    { id: "decide", label: "Decide" },
  ];
  return labels.map((step, i) => ({
    ...step,
    state: i < at ? "done" : i === at ? "current" : "upcoming",
  }));
}

function announcementFor(phase: RunPhase): string {
  switch (phase) {
    case "working":
      return "The agent is matching invoice INV-2041.";
    case "streaming":
      return "The agent is writing what it found.";
    case "uncertain":
      return "The agent is not sure about the cost centre. Change the field to continue.";
    case "decision":
      return "Proposal ready. Approve the payment or reject it.";
    case "approved":
      return "You approved the payment.";
    case "rejected":
      return "You rejected the payment.";
    case "failed":
      return "The run stopped at the goods receipt.";
    case "manual":
      return "You matched the invoice yourself.";
  }
}

function skipFor(phase: RunPhase): RunView["skip"] {
  switch (phase) {
    case "uncertain":
      return { id: "cost-centre", label: "Skip to the cost centre" };
    case "decision":
    case "approved":
    case "rejected":
      return { id: "decision", label: "Skip to the decision" };
    case "failed":
    case "manual":
      return { id: "outcome", label: "Skip to what you can do" };
    default:
      return null;
  }
}

function decisionFor(costCentre: string): DecisionView {
  return {
    title: "Pay INV-2041 against PO-7718",
    effect: `Schedules €12,518.00 to Acme Fasteners on 14 Nov, booked to ${costCentre}.`,
    confidence: DECISION_CONFIDENCE,
    askBelow: ASK_BELOW,
    reasons: [
      "All three lines match the order on quantity and price",
      "Goods receipt GR-5530 was posted on 6 Nov",
      `You set the cost centre to ${costCentre}. The agent will leave that value in place.`,
    ],
    evidence: [
      { label: "Invoice", value: "€12,518.00" },
      { label: "Order", value: "€12,480.00" },
      { label: "Difference", value: "€38.00 delivery" },
      { label: "Cost centre", value: costCentre },
      { label: "Due", value: "14 Nov 2026" },
    ],
    alternatives: [
      { label: "Hold for review", whyNot: "the delivery fee is allowed by the order, and you confirmed the cost centre" },
      { label: "Pay now", whyNot: "there is no early-payment discount on this supplier" },
    ],
    reversible: { ok: true, until: "13 Nov, 18:00" },
  };
}

export function projectRun(state: RunState): RunView {
  const phase = phaseOf(state);
  const ready = answerReady(state);
  const steps = STEP_LABELS.map((label, i) => ({ label, status: stepStatus(i, state, ready) }));
  const thinkingState: RunView["thinking"]["state"] = steps.some((s) => s.status === "failed")
    ? "failed"
    : steps.every((s) => s.status === "done")
      ? "done"
      : "thinking";

  const calls: CallView[] = TOOLS.map((def, index) => {
    const status = callStatus(index, state.beat, state.scenario);
    const settled = status === "done" || status === "failed";
    return {
      id: def.id,
      tool: def.tool,
      summary: def.summary,
      status,
      durationMs: settled ? (status === "failed" ? 10_000 : def.durationMs) : undefined,
      input: def.input,
      output: status === "done" ? def.output : undefined,
      error: status === "failed" ? def.error : undefined,
    };
  });

  const showPerson = phase === "uncertain" || phase === "decision" || phase === "approved" || phase === "rejected";
  const showStream = state.scenario === "match" && state.beat >= streamStartBeat();
  const chars = streamedChars(state);
  const streamStatus = state.streamStopped ? "stopped" : chars >= MATCH_ANSWER.length ? "done" : "streaming";

  const showDecision = phase === "decision" || phase === "approved" || phase === "rejected";
  // The waiting fallback is the failure path. On a match it only wraps the decision, so a crash
  // still lands in the same boundary without a second "working" panel next to the trace.
  const boundary: RunView["boundary"] =
    phase === "failed"
      ? { status: "failed", reason: ERP_FAILURE_REASON }
      : phase === "manual" || showDecision
        ? { status: "ok" }
        : phase === "working" && state.scenario === "erp-fails"
          ? { status: "running" }
          : null;

  return {
    phase,
    playing: isPlaying(state),
    announcement: announcementFor(phase),
    progress: progressFor(phase, state.scenario),
    skip: skipFor(phase),
    thinking: { state: thinkingState, steps, elapsedMs: Math.floor(state.beat / TOOL_SPAN) * TOOL_SPAN * TICK_MS },
    calls,
    stream: showStream ? { text: MATCH_ANSWER.slice(0, chars), status: streamStatus } : null,
    confidence: showPerson
      ? { value: FIELD_CONFIDENCE, askBelow: ASK_BELOW, basis: FIELD_BASIS }
      : null,
    override: showPerson
      ? { value: state.costCentre, source: state.costSource, reason: FIELD_REASON }
      : null,
    decision: showDecision
      ? { data: decisionFor(state.costCentre), status: state.decision ?? "proposed" }
      : null,
    boundary,
    receipt: phase === "manual" ? MANUAL_RECEIPT : null,
  };
}
