"use client";

import { useState, type ReactNode } from "react";
import { ConnectionPicker, type ConnectionAccount, type ConnectionMode } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

type Scenario = "pick" | "empty" | "manual";

const SAVED: ConnectionAccount[] = [
  { id: "acme", name: "Acme ERP", holder: "ap@acme.example" },
  { id: "northwind", name: "Northwind purchasing", holder: "buyer@northwind.example" },
];

export function ConnectionPickerDemo() {
  const [accounts, setAccounts] = useState<ConnectionAccount[]>(SAVED);
  const [selectedId, setSelectedId] = useState<string | undefined>("acme");
  const [mode, setMode] = useState<ConnectionMode>("pick");
  const [added, setAdded] = useState(0);
  const scenario: Scenario = mode === "manual" ? "manual" : accounts.length === 0 ? "empty" : "pick";

  const show = (next: Scenario) => {
    if (next === "empty") {
      setAccounts([]);
      setSelectedId(undefined);
      setMode("pick");
      return;
    }
    if (next === "manual") {
      setMode("manual");
      return;
    }
    setAccounts(SAVED);
    setSelectedId("acme");
    setMode("pick");
  };

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={show}
          options={[
            { value: "pick", label: "Pick an account" },
            { value: "empty", label: "Nothing connected" },
            { value: "manual", label: "Set up manually" },
          ]}
        />
      </Controls>
      <ConnectionPicker
        purpose="The agent needs the ERP to read INV-2041."
        accounts={accounts}
        selectedId={selectedId}
        mode={mode}
        onSelect={setSelectedId}
        onSignIn={() => {
          const acme = SAVED[0];
          setAccounts((current) => (current.some((account) => account.id === "acme") || !acme ? current : [acme, ...current]));
          setSelectedId("acme");
          setMode("pick");
        }}
        onModeChange={setMode}
        onManual={({ name }) => {
          const id = `setup-${added + 1}`;
          setAdded((count) => count + 1);
          setAccounts((current) => [...current, { id, name, holder: "Set up on this screen" }]);
          setSelectedId(id);
        }}
      />
    </div>
  );
}
