"use client";

import { useState, type ReactNode } from "react";
import { AgentHarness, type HarnessSocket } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

type Scenario = "ready" | "no-model" | "open-tool";

const BASE: HarnessSocket[] = [
  { id: "model", kind: "model", value: "Ledger model", required: true },
  { id: "memory", kind: "memory", value: "Last 6 invoices from Acme Fasteners" },
  { id: "invoice", kind: "tool", value: "Read invoice INV-2041" },
  { id: "order", kind: "tool", value: "Find purchase order PO-7718" },
];

function socketsFor(scenario: Scenario): HarnessSocket[] {
  if (scenario === "no-model") return BASE.map((socket) => (socket.id === "model" ? { ...socket, value: undefined } : socket));
  if (scenario === "open-tool") return [...BASE, { id: "receipt", kind: "tool" }];
  return BASE;
}

export function AgentHarnessDemo() {
  const [scenario, setScenario] = useState<Scenario>("no-model");

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={setScenario}
          options={[
            { value: "ready", label: "Ready" },
            { value: "no-model", label: "Model missing" },
            { value: "open-tool", label: "Tool open" },
          ]}
        />
      </Controls>
      <p className="text-xs text-[var(--fg-muted)]">
        Model missing keeps the step from running. An open tool does not. Connecting the model draws the warning into a check.
      </p>
      <AgentHarness title="Match the invoice" task="Match INV-2041 to PO-7718 before anyone is paid." sockets={socketsFor(scenario)} />
    </div>
  );
}
