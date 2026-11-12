"use client";

import { useState, type ReactNode } from "react";
import { AgentDecisionCard, type AgentDecision } from "@/components/agentic";
import { buttonClass } from "@/components/agentic/marks";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const DECISIONS: Record<"pay" | "close", AgentDecision> = {
  pay: {
    title: "Pay INV-2041 against PO-7718",
    effect: "Schedules €12,518.00 to Acme Fasteners on 14 Nov.",
    confidence: 0.91,
    reasons: ["All three lines match the order on quantity and price", "Goods receipt GR-5530 was posted on 6 Nov", "The €38.00 delivery fee is allowed by the order terms"],
    evidence: [
      { label: "Invoice", value: "€12,518.00" },
      { label: "Order", value: "€12,480.00" },
      { label: "Difference", value: "€38.00 delivery" },
      { label: "Due", value: "14 Nov 2026" },
    ],
    alternatives: [
      { label: "Hold for review", whyNot: "the only difference is covered by the order terms" },
      { label: "Pay now", whyNot: "no early-payment discount on this supplier" },
    ],
    reversible: { ok: true, until: "13 Nov, 18:00" },
  },
  close: {
    title: "Close PO-7718",
    effect: "Marks the order complete. No more invoices can be booked against it.",
    confidence: 0.74,
    askBelow: 0.7,
    reasons: ["All ordered lines are received and invoiced", "No open returns for this order"],
    evidence: [
      { label: "Received", value: "3 of 3 lines" },
      { label: "Invoiced", value: "3 of 3 lines" },
    ],
    alternatives: [{ label: "Leave it open", whyNot: "nothing more is expected on it, and an open order keeps budget reserved" }],
    reversible: { ok: false },
  },
};

export function AgentDecisionCardDemo() {
  const [scenario, setScenario] = useState<"pay" | "close">("pay");
  const [status, setStatus] = useState<"proposed" | "approved" | "rejected">("proposed");
  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(s) => {
            setScenario(s);
            setStatus("proposed");
          }}
          options={[
            { value: "pay", label: "Can be undone" },
            { value: "close", label: "Can't be undone" },
          ]}
        />
        {status !== "proposed" && (
          <button type="button" className={buttonClass.secondary} onClick={() => setStatus("proposed")}>
            Reset
          </button>
        )}
      </Controls>
      <AgentDecisionCard
        decision={DECISIONS[scenario]}
        status={status}
        onApprove={() => setStatus("approved")}
        onReject={() => setStatus("rejected")}
      />
    </div>
  );
}
