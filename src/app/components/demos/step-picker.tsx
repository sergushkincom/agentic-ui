"use client";

import { useState } from "react";
import { StepPicker, type StepChoice } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

const STEPS: StepChoice[] = [
  { id: "invoice", name: "Read the invoice", detail: "INV-2041 · Acme Fasteners", group: "Read the books", actor: "agent" },
  { id: "po", name: "Find the purchase order", detail: "Open orders from this supplier", group: "Read the books", actor: "agent" },
  { id: "receipt", name: "Check the goods receipt", detail: "GR-5530 · posted 6 Nov", group: "Read the books", actor: "agent" },
  { id: "lines", name: "Compare the line items", detail: "Invoice against PO-7718", group: "Decide", actor: "agent" },
  { id: "draft", name: "Draft the payment", detail: "€12,480.00 on 14 Nov", group: "Decide", actor: "agent" },
  { id: "centre", name: "Confirm the cost centre", detail: "4100 · Production, or change it", group: "Human in the loop", actor: "human" },
  { id: "approve", name: "Approve the payment", detail: "€12,480.00 to Acme Fasteners", group: "Human in the loop", actor: "human" },
];

type Scenario = "all" | "human" | "none";

const QUERY: Record<Scenario, string> = {
  all: "",
  human: "human",
  none: "payroll",
};

export function StepPickerDemo() {
  const [scenario, setScenario] = useState<Scenario>("all");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const choice = STEPS.find((step) => step.id === picked);

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        label="Scenario"
        value={scenario}
        onChange={(next) => {
          setScenario(next);
          setQuery(QUERY[next]);
        }}
        options={[
          { value: "all", label: "All steps" },
          { value: "human", label: "Human" },
          { value: "none", label: "No match" },
        ]}
      />
      <p className="text-xs text-[var(--fg-muted)]">
        Search, or use the arrows and Enter. Human in the loop stays its own group. Escape clears the search.
      </p>
      <StepPicker
        steps={STEPS}
        query={query}
        onQueryChange={(next) => {
          setQuery(next);
          const preset = (Object.entries(QUERY) as [Scenario, string][]).find(([, value]) => value === next);
          if (preset) setScenario(preset[0]);
        }}
        onSelect={setPicked}
      />
      {choice && (
        <p className="text-[13px] text-[var(--fg)]">
          Next step: <span className="font-medium">{choice.name}</span>
        </p>
      )}
    </div>
  );
}
