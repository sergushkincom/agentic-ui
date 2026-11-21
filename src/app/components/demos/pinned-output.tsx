"use client";

import { useState, type ReactNode } from "react";
import { PinnedOutput } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const LIVE = "Amounts differ by the €38.00 delivery.";
const MOCK = "Treat as a match. Delivery of €38.00 is agreed.";

type Scenario = "live" | "pinned" | "mock";

export function PinnedOutputDemo() {
  const [scenario, setScenario] = useState<Scenario>("live");
  const [mock, setMock] = useState(MOCK);

  const summary = scenario === "live" ? LIVE : mock;
  const source = scenario === "live" ? "live" : "pinned";

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={setScenario}
          options={[
            { value: "live", label: "Live" },
            { value: "pinned", label: "Pinned" },
            { value: "mock", label: "Supply mock" },
          ]}
        />
      </Controls>
      <p className="text-xs text-[var(--fg-muted)]">
        Pin the last run, or supply a mock, so later steps can run without running this one again.
      </p>
      <PinnedOutput
        key={scenario}
        step="Compare line items"
        summary={summary}
        source={source}
        onPin={() => {
          setMock(LIVE);
          setScenario("pinned");
        }}
        onUseLive={() => setScenario("live")}
        onSupplyMock={(next) => {
          setMock(next);
          setScenario("pinned");
        }}
        defaultEditing={scenario === "mock"}
      />
    </div>
  );
}
