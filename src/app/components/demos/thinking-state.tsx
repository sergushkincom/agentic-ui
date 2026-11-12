"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ThinkingState, type ThinkingStep } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
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
