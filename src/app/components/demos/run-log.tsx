"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RunLog, type RunLogStep } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const invoice = {
  columns: ["Field", "Value"],
  rows: [
    ["Supplier", "Acme Fasteners"],
    ["Invoice", "INV-2041"],
    ["Total", "€12,518.00"],
  ],
  json: { supplier: "Acme Fasteners", invoice: "INV-2041", total: 12518, currency: "EUR" },
};

const order = {
  columns: ["Field", "Value"],
  rows: [
    ["Purchase order", "PO-7718"],
    ["Supplier", "Acme Fasteners"],
    ["Total", "€12,480.00"],
  ],
  json: { purchaseOrder: "PO-7718", supplier: "Acme Fasteners", total: 12480, currency: "EUR" },
};

const linesIn = {
  columns: ["Source", "Line", "Item", "Amount"],
  rows: [
    ["PO-7718", "1", "M8 bolts", "€12,000.00"],
    ["PO-7718", "2", "Washers", "€480.00"],
    ["INV-2041", "1", "M8 bolts", "€12,000.00"],
    ["INV-2041", "2", "Washers", "€480.00"],
    ["INV-2041", "3", "Delivery", "€38.00"],
  ],
};

const linesOut = {
  columns: ["Line", "Item", "Order", "Invoice"],
  rows: [
    ["1", "M8 bolts", "€12,000.00", "€12,000.00"],
    ["2", "Washers", "€480.00", "€480.00"],
    ["3", "Delivery", "—", "€38.00"],
  ],
  marked: [2],
  json: [
    { line: 1, item: "M8 bolts", order: 12000, invoice: 12000, match: true },
    { line: 2, item: "Washers", order: 480, invoice: 480, match: true },
    { line: 3, item: "Delivery", order: null, invoice: 38, match: false },
  ],
};

const read: RunLogStep = {
  id: "read",
  label: "Read invoice INV-2041",
  status: "success",
  durationMs: 180,
  input: { columns: ["Field", "Value"], rows: [["Id", "INV-2041"]] },
  output: invoice,
};

const find: RunLogStep = {
  id: "find",
  label: "Find the purchase order",
  status: "success",
  durationMs: 420,
  input: { columns: ["Field", "Value"], rows: [["Supplier", "Acme Fasteners"], ["Open", "Yes"]] },
  output: order,
};

function liveSteps(beat: number): RunLogStep[] {
  const at = (index: number): RunLogStep["status"] => (beat > index ? "success" : "running");
  const steps: RunLogStep[] = [
    { ...read, status: at(0), durationMs: beat > 0 ? read.durationMs : undefined },
  ];
  if (beat >= 1) steps.push({ ...find, status: at(1), durationMs: beat > 1 ? find.durationMs : undefined });
  if (beat >= 2) {
    steps.push({
      id: "compare",
      label: "Compare line items",
      status: at(2),
      durationMs: beat > 2 ? 610 : undefined,
      input: linesIn,
      output: beat > 2 ? linesOut : undefined,
    });
  }
  return steps;
}

function failedSteps(): RunLogStep[] {
  return [
    read,
    find,
    {
      id: "compare",
      label: "Compare line items",
      status: "error",
      durationMs: 610,
      input: linesIn,
      output: linesOut,
      children: [
        { id: "bolts", label: "M8 bolts match", status: "success", durationMs: 40, output: { columns: ["Check", "Result"], rows: [["Amount", "€12,000.00 both"]] } },
        { id: "washers", label: "Washers match", status: "success", durationMs: 30, output: { columns: ["Check", "Result"], rows: [["Amount", "€480.00 both"]] } },
        {
          id: "delivery",
          label: "Delivery is not on the order",
          status: "error",
          durationMs: 80,
          output: linesOut,
        },
      ],
    },
  ];
}

export function RunLogDemo() {
  const [scenario, setScenario] = useState<"running" | "failed" | "cleared">("failed");
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (scenario !== "running") return;
    setBeat(0);
    const id = setInterval(() => {
      setBeat((value) => {
        if (value >= 3) {
          clearInterval(id);
          return value;
        }
        return value + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [scenario]);

  const steps = scenario === "cleared" ? [] : scenario === "running" ? liveSteps(beat) : failedSteps();

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={setScenario}
          options={[
            { value: "running", label: "Running" },
            { value: "failed", label: "One step failed" },
            { value: "cleared", label: "Cleared" },
          ]}
        />
      </Controls>
      <p className="text-xs text-[var(--fg-muted)]">
        Open a step. Switch Input and Output, or Table and JSON. Clear forgets the log. Running plays, and the spinner draws itself into a check.
      </p>
      <RunLog key={scenario} steps={steps} onClear={() => setScenario("cleared")} />
    </div>
  );
}
