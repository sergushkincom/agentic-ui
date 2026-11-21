"use client";

import { useState, type ReactNode } from "react";
import { ExpressionField, type FieldReference } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const FIELDS: FieldReference[] = [
  { step: "Read invoice", field: "supplier" },
  { step: "Read invoice", field: "amount" },
  { step: "Read invoice", field: "lines" },
  { step: "Find the purchase order", field: "order" },
  { step: "Find the purchase order", field: "amount" },
];

const SUPPLIER: FieldReference = { step: "Read invoice", field: "supplier" };

type Scenario = "fixed" | "expression" | "choose";

export function ExpressionFieldDemo() {
  const [scenario, setScenario] = useState<Scenario>("expression");
  const [fixedValue, setFixedValue] = useState("Acme Fasteners");
  const [reference, setReference] = useState<FieldReference | null>(SUPPLIER);
  const [choosing, setChoosing] = useState(false);

  const show = (next: Scenario) => {
    setScenario(next);
    if (next === "fixed") {
      setChoosing(false);
      return;
    }
    if (next === "expression") {
      setReference(SUPPLIER);
      setChoosing(false);
      return;
    }
    setReference(null);
    setChoosing(true);
  };

  const mode = scenario === "fixed" ? "fixed" : "expression";

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={show}
          options={[
            { value: "fixed", label: "Fixed" },
            { value: "expression", label: "Expression" },
            { value: "choose", label: "Choose a field" },
          ]}
        />
      </Controls>
      <p className="text-xs text-[var(--fg-muted)]">
        Fixed is a value you type. Expression names a field on a previous step. It is not a correction of the agent.
      </p>
      <ExpressionField
        label="Supplier"
        mode={mode}
        fixedValue={fixedValue}
        reference={reference}
        fields={FIELDS}
        onMode={(next) => {
          if (next === mode) return;
          show(next === "fixed" ? "fixed" : reference ? "expression" : "choose");
        }}
        onFixedValue={setFixedValue}
        onReference={(next) => {
          setReference(next);
          setScenario("expression");
        }}
        choosing={choosing}
        onChoosing={setChoosing}
      />
    </div>
  );
}
