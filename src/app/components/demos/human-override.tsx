"use client";

import { useState, type ReactNode } from "react";
import { HumanOverride } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const AGENT_VALUE = "4100 · Production";
const HUMAN_VALUE = "4200 · Assembly";
const REASON =
  "Same as the last 6 invoices from this supplier. This receipt was booked to 4200 · Assembly.";

type Source = "agent" | "human";

const PRESET: Record<Source, string> = {
  agent: AGENT_VALUE,
  human: HUMAN_VALUE,
};

export function HumanOverrideDemo() {
  const [source, setSource] = useState<Source>("agent");
  const [value, setValue] = useState(AGENT_VALUE);
  const [editEpoch, setEditEpoch] = useState(0);

  const show = (next: Source) => {
    setSource(next);
    setValue(PRESET[next]);
    setEditEpoch((epoch) => epoch + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={source}
          onChange={show}
          options={[
            { value: "agent", label: "Filled by agent" },
            { value: "human", label: "Changed by you" },
          ]}
        />
      </Controls>
      <HumanOverride
        key={editEpoch}
        label="Cost centre"
        agentValue={AGENT_VALUE}
        value={value}
        source={source}
        onChange={(next, nextSource) => {
          setValue(next);
          setSource(nextSource);
        }}
        reason={REASON}
      />
    </div>
  );
}
