"use client";

import { useState } from "react";
import { ConfidenceBar } from "@/components/agentic";

export function ConfidenceBarDemo() {
  const [value, setValue] = useState(0.78);
  const [askBelow, setAskBelow] = useState(0.7);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Confidence" value={value} onChange={setValue} />
        <Slider label="Asks you below" value={askBelow} onChange={setAskBelow} />
      </div>
      <ConfidenceBar value={value} askBelow={askBelow} basis="3 of 4 fields match the purchase order" />
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-[var(--fg-muted)]">
      <span className="flex justify-between">
        {label}
        <span className="tabular-nums text-[var(--fg)]">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="accent-[var(--accent)]"
      />
    </label>
  );
}
