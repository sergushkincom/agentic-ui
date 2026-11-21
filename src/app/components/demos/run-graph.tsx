"use client";

import { useState } from "react";
import { RunGraph, type RunGraphPhase, type RunGraphStep } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

const READ: RunGraphStep = {
  id: "read",
  name: "Read INV-2041",
  subtitle: "Acme Fasteners",
  status: "pending",
  items: 0,
  actor: "agent",
};

const MATCH: RunGraphStep = {
  id: "match",
  name: "Match open orders",
  subtitle: "PO-7718 and four more",
  status: "pending",
  items: 0,
  actor: "agent",
};

const CONFIRM: RunGraphStep = {
  id: "confirm",
  name: "Confirm cost centre",
  subtitle: "4100 · Production",
  status: "pending",
  items: 0,
  actor: "human",
};

const DRAFT: RunGraphStep = {
  id: "draft",
  name: "Draft the payment",
  subtitle: "€12,480.00 on 14 Nov",
  status: "pending",
  items: 0,
  actor: "agent",
};

type Scenario = "execute" | "running" | "waiting";

function stepsFor(scenario: Scenario, added: boolean): RunGraphStep[] {
  if (scenario === "execute") {
    return added ? [READ, MATCH, CONFIRM, DRAFT] : [READ, MATCH, CONFIRM];
  }
  if (scenario === "running") {
    const chain: RunGraphStep[] = [
      { ...READ, status: "ok", items: 1, subtitle: "1 invoice" },
      { ...MATCH, status: "running", subtitle: "Looking through open orders" },
      CONFIRM,
    ];
    return added ? [...chain, DRAFT] : chain;
  }
  const chain: RunGraphStep[] = [
    { ...READ, status: "ok", items: 1, subtitle: "1 invoice" },
    { ...MATCH, status: "ok", items: 5, subtitle: "5 open orders" },
    { ...CONFIRM, subtitle: "Waiting for you" },
  ];
  return added ? [...chain, DRAFT] : chain;
}

export function RunGraphDemo() {
  const [scenario, setScenario] = useState<Scenario>("waiting");
  const [added, setAdded] = useState(false);
  const phase: RunGraphPhase = scenario;

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        label="Scenario"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "execute", label: "Execute" },
          { value: "running", label: "Running" },
          { value: "waiting", label: "Waiting" },
        ]}
      />
      <p className="text-xs text-[var(--fg-muted)]">
        A fragment of the run. The edge says how many items moved. Execute starts it. Waiting means the next move is yours.
      </p>
      <RunGraph
        key={scenario}
        phase={phase}
        steps={stepsFor(scenario, added)}
        onExecute={scenario === "execute" ? () => setScenario("running") : undefined}
        onAdd={added ? undefined : () => setAdded(true)}
      />
    </div>
  );
}
