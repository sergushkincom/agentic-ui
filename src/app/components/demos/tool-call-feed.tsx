"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ToolCallFeed, type ToolCall } from "@/components/agentic";
import { buttonClass } from "@/components/agentic/marks";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
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
