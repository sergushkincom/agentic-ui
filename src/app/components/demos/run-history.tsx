"use client";

import { useState, type ReactNode } from "react";
import { RunHistory, type RunHistoryRun } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const RUNS: RunHistoryRun[] = [
  { id: "r1", status: "success", at: "14 Nov, 14:16", durationMs: 1450, label: "Match INV-2041" },
  { id: "r2", status: "error", at: "14 Nov, 11:02", durationMs: 610, label: "Match INV-2041" },
  { id: "r3", status: "canceled", at: "13 Nov, 18:41", durationMs: 3200, label: "Match INV-1988" },
  { id: "r4", status: "success", at: "13 Nov, 09:12", durationMs: 980, label: "Match INV-1980" },
  { id: "r5", status: "error", at: "12 Nov, 16:05", durationMs: 2400, label: "Match INV-1972" },
];

const FOCUS = { error: "r2", success: "r1", canceled: "r3" } as const;

export function RunHistoryDemo() {
  const [scenario, setScenario] = useState<keyof typeof FOCUS>("error");
  const [selectedId, setSelectedId] = useState<string>(FOCUS.error);
  const selected = RUNS.find((run) => run.id === selectedId) ?? RUNS[0];

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(next) => {
            setScenario(next);
            setSelectedId(FOCUS[next]);
          }}
          options={[
            { value: "error", label: "Error" },
            { value: "success", label: "Succeeded" },
            { value: "canceled", label: "Canceled" },
          ]}
        />
      </Controls>
      <p className="text-xs text-[var(--fg-muted)]">
        Pick a run. The highlight is that run, so the rest of a screen can show it. {selected.label} · {selected.at}.
      </p>
      <div className="max-w-md">
        <RunHistory runs={RUNS} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );
}
