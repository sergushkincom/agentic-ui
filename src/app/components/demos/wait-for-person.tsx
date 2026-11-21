"use client";

import { useState, type ReactNode } from "react";
import { WaitForPerson, type WaitMode } from "@/components/agentic";
import { buttonClass } from "@/components/agentic/marks";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const ASKS: Record<WaitMode, { prompt: string; task: string }> = {
  reply: {
    prompt: "Which cost centre takes the €38.00 delivery on INV-2041?",
    task: "The agent stopped while matching this invoice to PO-7718.",
  },
  approval: {
    prompt: "Schedule €12,518.00 to Acme Fasteners on 14 Nov?",
    task: "The agent matched INV-2041 to PO-7718 and will not pay until you approve.",
  },
};

export function WaitForPersonDemo() {
  const [scenario, setScenario] = useState<WaitMode>("reply");
  const [status, setStatus] = useState<"waiting" | "resumed">("waiting");
  const [answer, setAnswer] = useState<string | undefined>();
  const ask = ASKS[scenario];

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(next) => {
            setScenario(next);
            setStatus("waiting");
            setAnswer(undefined);
          }}
          options={[
            { value: "reply", label: "Reply" },
            { value: "approval", label: "Approval" },
          ]}
        />
        {status === "resumed" && (
          <button
            type="button"
            className={buttonClass.secondary}
            onClick={() => {
              setStatus("waiting");
              setAnswer(undefined);
            }}
          >
            Reset
          </button>
        )}
      </Controls>
      <WaitForPerson
        key={scenario}
        task={ask.task}
        prompt={ask.prompt}
        mode={scenario}
        status={status}
        answer={answer}
        onRespond={(next) => {
          setAnswer(next);
          setStatus("resumed");
        }}
      />
    </div>
  );
}
