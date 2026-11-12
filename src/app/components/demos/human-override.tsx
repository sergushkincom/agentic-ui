"use client";

import { useState } from "react";
import { HumanOverride } from "@/components/agentic";

export function HumanOverrideDemo() {
  const [centre, setCentre] = useState({ value: "4100 · Production", source: "agent" as "agent" | "human" });
  const [account, setAccount] = useState({ value: "3400 · Raw materials", source: "human" as "agent" | "human" });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <HumanOverride
        label="Cost centre"
        agentValue="4100 · Production"
        value={centre.value}
        source={centre.source}
        onChange={(value, source) => setCentre({ value, source })}
        reason="Same as the last 6 invoices from this supplier."
      />
      <HumanOverride
        label="G/L account"
        agentValue="3300 · Consumables"
        value={account.value}
        source={account.source}
        onChange={(value, source) => setAccount({ value, source })}
        reason="Fasteners are usually booked as consumables."
      />
    </div>
  );
}
