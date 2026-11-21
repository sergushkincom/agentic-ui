"use client";

import { useState, type ReactNode } from "react";
import { StepError, type StepErrorFact } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const CASES: Record<
  "amount" | "receipt" | "centre",
  { step: string; message: string; facts: StepErrorFact[] }
> = {
  amount: {
    step: "Compare line items",
    message: "The invoice total doesn't match the purchase order. The extra €38.00 is a delivery line that is not on the order.",
    facts: [
      { label: "Purchase order PO-7718", value: "€12,480.00" },
      { label: "Invoice INV-2041", value: "€12,518.00", wrong: true },
      { label: "The difference", value: "€38.00 delivery, not on the order" },
    ],
  },
  receipt: {
    step: "Check the goods receipt",
    message: "Nothing is posted for PO-7718, so the three lines can't be confirmed as received.",
    facts: [
      { label: "Purchase order", value: "PO-7718" },
      { label: "Goods receipt", value: "Not posted", wrong: true },
      { label: "Expected", value: "A receipt for 3 of 3 lines, like GR-5530" },
    ],
  },
  centre: {
    step: "Read invoice INV-2041",
    message: "The cost centre is blank, so a payment drafted from this invoice would have nowhere to land.",
    facts: [
      { label: "Field", value: "Cost centre" },
      { label: "On INV-2041", value: "Empty", wrong: true },
      { label: "Last invoices from Acme", value: "4100 · Production" },
    ],
  },
};

export function StepErrorDemo() {
  const [scenario, setScenario] = useState<keyof typeof CASES>("amount");
  const [note, setNote] = useState("");
  const item = CASES[scenario];

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(next) => {
            setScenario(next);
            setNote("");
          }}
          options={[
            { value: "amount", label: "Amount" },
            { value: "receipt", label: "No receipt" },
            { value: "centre", label: "Blank field" },
          ]}
        />
      </Controls>
      <p className="text-xs text-[var(--fg-muted)]">
        One step, the value that failed, and a retry for that step. Later steps have not run.
      </p>
      <StepError
        step={item.step}
        message={item.message}
        facts={item.facts}
        onRetry={() => setNote(`Retrying "${item.step}". Nothing else has run.`)}
      />
      {note && (
        <p className="text-xs text-[var(--fg-muted)]" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
