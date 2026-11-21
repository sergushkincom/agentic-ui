"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { StepInspector, type StepInspectorProps, type StepItem, type StepOutput, type StepParameter, type StepSetting } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const INPUT: StepItem[] = [
  {
    id: "invoice",
    label: "Read invoice",
    fields: [
      { name: "supplier", value: "Acme Fasteners" },
      { name: "invoice", value: "INV-2041" },
      { name: "amount", value: "€12,518.00" },
      { name: "lines", value: "3" },
    ],
  },
  {
    id: "order",
    label: "Find the purchase order",
    fields: [
      { name: "order", value: "PO-7718" },
      { name: "amount", value: "€12,480.00" },
      { name: "lines", value: "3" },
    ],
  },
];

const PARAMETERS: StepParameter[] = [
  { name: "Match on", value: "Supplier and amount", hint: "Line quantities are checked after the totals." },
  { name: "Tolerance", value: "€38.00 delivery", hint: "Allowed by the order terms." },
  { name: "Cost centre", value: "4100 · Production" },
];

const SETTINGS: StepSetting[] = [
  { name: "On mismatch", value: "Stop and ask" },
  { name: "Retry", value: "Once" },
  { name: "Note", value: "Delivery is the only difference expected." },
];

const DONE: StepOutput = {
  summary: "Amounts differ by the €38.00 delivery.",
  fields: [
    { name: "invoice", value: "€12,518.00" },
    { name: "order", value: "€12,480.00" },
    { name: "difference", value: "€38.00 delivery" },
  ],
};

const PINNED: StepOutput = {
  summary: "Treat as a match. Delivery of €38.00 is agreed.",
  fields: [
    { name: "invoice", value: "€12,518.00" },
    { name: "order", value: "€12,480.00" },
    { name: "decision", value: "Match" },
  ],
};

type Scenario = "idle" | "running" | "done" | "failed" | "pinned";

const FAILED = "The amounts differ by more than the delivery. Nothing was posted.";

export function StepInspectorDemo() {
  const [scenario, setScenario] = useState<Scenario>("idle");
  const [tab, setTab] = useState<StepInspectorProps["tab"]>("parameters");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const pick = (next: Scenario) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setScenario(next);
  };

  const run = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setScenario("running");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setScenario("done");
    }, reduce ? 0 : 900);
  };

  const status: StepInspectorProps["status"] = scenario === "pinned" ? "done" : scenario;
  const output = scenario === "done" ? DONE : scenario === "pinned" ? PINNED : null;
  const source = scenario === "pinned" ? "pinned" : scenario === "done" ? "live" : undefined;

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={pick}
          options={[
            { value: "idle", label: "Not run" },
            { value: "running", label: "Running" },
            { value: "done", label: "Done" },
            { value: "failed", label: "Failed" },
            { value: "pinned", label: "Pinned" },
          ]}
        />
      </Controls>
      <p className="text-xs text-[var(--fg-muted)]">
        Run this step, or switch the scenario. A running spinner draws itself into a check, or into a warning if the step fails.
      </p>
      <StepInspector
        title="Compare line items"
        step="erp.compare_lines"
        input={INPUT}
        parameters={PARAMETERS}
        settings={SETTINGS}
        tab={tab}
        onTab={setTab}
        output={output}
        status={status}
        source={source}
        error={scenario === "failed" ? FAILED : undefined}
        onRun={run}
      />
    </div>
  );
}
