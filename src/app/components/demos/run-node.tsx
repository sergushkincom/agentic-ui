"use client";

import { useState } from "react";
import { RunNode, type RunNodeProps } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

type Scenario = "pending" | "running" | "ok" | "error" | "human";

const SCENARIOS: Record<Scenario, RunNodeProps> = {
  pending: {
    name: "Read INV-2041",
    subtitle: "Acme Fasteners · not started",
    status: "pending",
    items: 0,
    actor: "agent",
  },
  running: {
    name: "Find the purchase order",
    subtitle: "Open orders from Acme Fasteners",
    status: "running",
    items: 0,
    actor: "agent",
  },
  ok: {
    name: "Compare the line items",
    subtitle: "3 of 3 lines agree with PO-7718",
    status: "ok",
    items: 1,
    actor: "agent",
  },
  error: {
    name: "Check the goods receipt",
    subtitle: "The ERP didn't answer. Nothing was posted.",
    status: "error",
    items: 0,
    actor: "agent",
  },
  human: {
    name: "Confirm the cost centre",
    subtitle: "You kept 4100 · Production",
    status: "ok",
    items: 1,
    actor: "human",
  },
};

export function RunNodeDemo() {
  const [scenario, setScenario] = useState<Scenario>("ok");
  const step = SCENARIOS[scenario];

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        label="Scenario"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "pending", label: "Pending" },
          { value: "running", label: "Running" },
          { value: "ok", label: "Done" },
          { value: "error", label: "Failed" },
          { value: "human", label: "You" },
        ]}
      />
      <p className="text-xs text-[var(--fg-muted)]">
        The count sits on the port. A running rail settles into a check, or into a warning if the step stops.
      </p>
      <RunNode name={step.name} subtitle={step.subtitle} status={step.status} items={step.items} actor={step.actor} />
    </div>
  );
}
