"use client";

import { useState, type ReactNode } from "react";
import { FallbackBoundary, type AgentRunStatus } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
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
