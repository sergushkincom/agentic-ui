"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AgentDecisionCard,
  ConfidenceBar,
  FallbackBoundary,
  HumanOverride,
  StreamingText,
  ThinkingState,
  ToolCallFeed,
  type AgentDecision,
  type AgentRunStatus,
  type StreamStatus,
  type ThinkingStep,
  type ToolCall,
} from "@/components/agentic";
import { buttonClass } from "@/components/agentic/marks";
import { Segmented } from "@/components/site/segmented";

/*
 * One fake scenario runs through every demo: an agent matching a supplier invoice to a purchase
 * order in an ERP. All names and numbers are made up.
 */

const ANSWER =
  "INV-2041 from Acme Fasteners matches purchase order PO-7718. All three lines agree on quantity and price, and the goods receipt was posted on 6 November. The only difference is the delivery fee of €38.00, which the order allows. I suggest paying it on the due date, 14 November.";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function StreamingTextStoppable() {
  const [chars, setChars] = useState(0);
  const [status, setStatus] = useState<StreamStatus>("streaming");
  const [run, setRun] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stream = useRef<HTMLDivElement>(null);
  const focusStop = useRef(false);

  const start = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setChars(0);
    setStatus("streaming");
    // About eight seconds, so Stop can be reached from the keyboard before the answer finishes.
    timer.current = setInterval(() => {
      setChars((c) => {
        const next = Math.min(ANSWER.length, c + 2);
        if (next >= ANSWER.length) {
          if (timer.current) clearInterval(timer.current);
          setStatus("done");
        }
        return next;
      });
    }, 60);
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [run, start]);

  // Replay reveals Stop again. Put focus there so Enter, Space, or Escape can stop the answer.
  useEffect(() => {
    if (!focusStop.current || status !== "streaming") return;
    const stop = stream.current?.querySelector("button");
    if (!(stop instanceof HTMLButtonElement)) return;
    stop.focus();
    focusStop.current = false;
  }, [run, status]);

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <button
          type="button"
          className={buttonClass.secondary}
          onClick={() => {
            focusStop.current = true;
            setRun((r) => r + 1);
          }}
        >
          Replay
        </button>
      </Controls>
      <div ref={stream}>
        <StreamingText
          text={ANSWER.slice(0, chars)}
          status={status}
          onStop={() => {
            if (timer.current) clearInterval(timer.current);
            setStatus("stopped");
          }}
        />
      </div>
    </div>
  );
}

const STEPS = ["Read invoice INV-2041", "Find the purchase order", "Compare line items", "Check the goods receipt", "Draft a proposal"];

export function ThinkingStateDemo() {
  const [scenario, setScenario] = useState<"live" | "done" | "failed">("live");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (scenario !== "live") return;
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [scenario]);

  // Live: one step every 2 seconds, then loops.
  const liveMs = (tick * 100) % (STEPS.length * 2000 + 2000);
  const activeIndex = Math.floor(liveMs / 2000);
  const liveDone = activeIndex >= STEPS.length;

  let steps: ThinkingStep[];
  let state: "thinking" | "done" | "failed";
  let elapsed: number;
  if (scenario === "done" || (scenario === "live" && liveDone)) {
    steps = STEPS.map((label) => ({ label, status: "done" }));
    state = "done";
    elapsed = 9400;
  } else if (scenario === "failed") {
    steps = STEPS.map((label, i) => ({ label, status: i < 2 ? "done" : i === 2 ? "failed" : "pending" }));
    state = "failed";
    elapsed = 5100;
  } else {
    steps = STEPS.map((label, i) => ({ label, status: i < activeIndex ? "done" : i === activeIndex ? "active" : "pending" }));
    state = "thinking";
    elapsed = liveMs;
  }

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={setScenario}
          options={[
            { value: "live", label: "Live" },
            { value: "done", label: "Done" },
            { value: "failed", label: "Failed" },
          ]}
        />
      </Controls>
      <ThinkingState state={state} steps={steps} elapsedMs={elapsed} defaultOpen />
    </div>
  );
}

export function ConfidenceBarDemo() {
  const [value, setValue] = useState(0.78);
  const [askBelow, setAskBelow] = useState(0.7);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Confidence" value={value} onChange={setValue} />
        <Slider label="Asks you below" value={askBelow} onChange={setAskBelow} />
      </div>
      <ConfidenceBar value={value} askBelow={askBelow} basis="3 of 4 fields match the purchase order" />
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-[var(--fg-muted)]">
      <span className="flex justify-between">
        {label}
        <span className="tabular-nums text-[var(--fg)]">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="accent-[var(--accent)]"
      />
    </label>
  );
}

export function HumanOverrideDemo() {
  const [centre, setCentre] = useState({ value: "4100 · Production", source: "agent" as "agent" | "human" });
  const [account, setAccount] = useState({ value: "3400 · Raw materials", source: "human" as "agent" | "human" });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <HumanOverride
        label="Cost centre"
        agentValue="4100 · Production"
        value={centre.value}
        source={centre.source}
        onChange={(value, source) => setCentre({ value, source })}
        reason="Same as the last 6 invoices from this supplier."
      />
      <HumanOverride
        label="G/L account"
        agentValue="3300 · Consumables"
        value={account.value}
        source={account.source}
        onChange={(value, source) => setAccount({ value, source })}
        reason="Fasteners are usually booked as consumables."
      />
    </div>
  );
}

const CALLS: Omit<ToolCall, "status">[] = [
  { id: "1", tool: "erp.get_invoice", summary: "Read invoice INV-2041", durationMs: 180, input: { id: "INV-2041" }, output: "Acme Fasteners · 3 lines · €12,518.00 incl. €38.00 delivery" },
  { id: "2", tool: "erp.find_purchase_order", summary: "Find the purchase order for this supplier", durationMs: 420, input: { supplier: "Acme Fasteners", open: true }, output: "PO-7718 · 3 lines · €12,480.00" },
  { id: "3", tool: "erp.get_goods_receipt", summary: "Check the goods were received", durationMs: 610, input: { po: "PO-7718" }, output: "GR-5530 · posted 6 Nov · 3 of 3 lines" },
  { id: "4", tool: "erp.draft_payment", summary: "Draft the payment for 14 Nov", durationMs: 240, input: { invoice: "INV-2041", date: "2026-11-14" }, output: "Draft PAY-9912 · not sent" },
];

export function ToolCallFeedDemo() {
  const [scenario, setScenario] = useState<"ok" | "fail">("ok");
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setStep(0);
    const id = setInterval(() => setStep((s) => (s >= CALLS.length * 2 ? s : s + 1)), 700);
    return () => clearInterval(id);
  }, [run, scenario]);

  // Each call: running for one beat, then done. In "fail", call 3 fails and the rest never start.
  const calls: ToolCall[] = CALLS.map((c, i) => {
    const failAt = scenario === "fail" ? 2 : -1;
    const startBeat = i * 2;
    let status: ToolCall["status"] = step < startBeat ? "queued" : step === startBeat ? "running" : "done";
    if (failAt >= 0 && i === failAt && step > startBeat) status = "failed";
    if (failAt >= 0 && i > failAt) status = "queued";
    return status === "failed"
      ? { ...c, status, output: undefined, error: "The ERP didn't answer within 10 seconds. Nothing was posted." }
      : { ...c, status };
  });

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(s) => {
            setScenario(s);
            setRun((r) => r + 1);
          }}
          options={[
            { value: "ok", label: "All good" },
            { value: "fail", label: "One fails" },
          ]}
        />
        <button type="button" className={buttonClass.secondary} onClick={() => setRun((r) => r + 1)}>
          Replay
        </button>
      </Controls>
      <ToolCallFeed calls={calls} />
    </div>
  );
}

const DECISIONS: Record<"pay" | "close", AgentDecision> = {
  pay: {
    title: "Pay INV-2041 against PO-7718",
    effect: "Schedules €12,518.00 to Acme Fasteners on 14 Nov.",
    confidence: 0.91,
    reasons: ["All three lines match the order on quantity and price", "Goods receipt GR-5530 was posted on 6 Nov", "The €38.00 delivery fee is allowed by the order terms"],
    evidence: [
      { label: "Invoice", value: "€12,518.00" },
      { label: "Order", value: "€12,480.00" },
      { label: "Difference", value: "€38.00 delivery" },
      { label: "Due", value: "14 Nov 2026" },
    ],
    alternatives: [
      { label: "Hold for review", whyNot: "the only difference is covered by the order terms" },
      { label: "Pay now", whyNot: "no early-payment discount on this supplier" },
    ],
    reversible: { ok: true, until: "13 Nov, 18:00" },
  },
  close: {
    title: "Close PO-7718",
    effect: "Marks the order complete. No more invoices can be booked against it.",
    confidence: 0.74,
    askBelow: 0.7,
    reasons: ["All ordered lines are received and invoiced", "No open returns for this order"],
    evidence: [
      { label: "Received", value: "3 of 3 lines" },
      { label: "Invoiced", value: "3 of 3 lines" },
    ],
    alternatives: [{ label: "Leave it open", whyNot: "nothing more is expected on it, and an open order keeps budget reserved" }],
    reversible: { ok: false },
  },
};

export function AgentDecisionCardDemo() {
  const [scenario, setScenario] = useState<"pay" | "close">("pay");
  const [status, setStatus] = useState<"proposed" | "approved" | "rejected">("proposed");
  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(s) => {
            setScenario(s);
            setStatus("proposed");
          }}
          options={[
            { value: "pay", label: "Can be undone" },
            { value: "close", label: "Can't be undone" },
          ]}
        />
        {status !== "proposed" && (
          <button type="button" className={buttonClass.secondary} onClick={() => setStatus("proposed")}>
            Reset
          </button>
        )}
      </Controls>
      <AgentDecisionCard
        decision={DECISIONS[scenario]}
        status={status}
        onApprove={() => setStatus("approved")}
        onReject={() => setStatus("rejected")}
      />
    </div>
  );
}

function Crash(): ReactNode {
  throw new Error("Demo: the agent's output failed to render");
}

export function FallbackBoundaryDemo() {
  const [scenario, setScenario] = useState<AgentRunStatus | "crash">("slow");
  const [note, setNote] = useState("");
  const status: AgentRunStatus = scenario === "crash" ? "ok" : scenario;

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(s) => {
            setScenario(s);
            setNote("");
          }}
          options={[
            { value: "running", label: "Running" },
            { value: "slow", label: "Slow" },
            { value: "failed", label: "Failed" },
            { value: "ok", label: "Answered" },
            { value: "crash", label: "Render crash" },
          ]}
        />
      </Controls>
      <FallbackBoundary
        key={scenario}
        status={status}
        task="match this invoice"
        reason={scenario === "failed" ? "The ERP didn't answer within 10 seconds." : undefined}
        manual={{ label: "Match it myself", onClick: () => setNote("Opens the manual matching screen (not part of this demo).") }}
        onRetry={() => setScenario("running")}
      >
        {scenario === "crash" ? (
          <Crash />
        ) : (
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 text-[14px]">
            INV-2041 matches PO-7718. Suggest paying on 14 Nov.
          </div>
        )}
      </FallbackBoundary>
      {note && <p className="text-xs text-[var(--fg-muted)]">{note}</p>}
    </div>
  );
}

export const DEMOS: Record<string, () => ReactNode> = {
  "streaming-text": StreamingTextStoppable,
  "thinking-state": ThinkingStateDemo,
  "confidence-bar": ConfidenceBarDemo,
  "human-override": HumanOverrideDemo,
  "tool-call-feed": ToolCallFeedDemo,
  "agent-decision-card": AgentDecisionCardDemo,
  "fallback-boundary": FallbackBoundaryDemo,
};

export function Demo({ slug }: { slug: string }) {
  const D = DEMOS[slug];
  return D ? <D /> : null;
}
