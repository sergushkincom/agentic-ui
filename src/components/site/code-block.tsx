"use client";

import { useState } from "react";

export function CodeBlock({ code, label = "Code" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)]">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard blocked: nothing to do */
          }
        }}
        className="absolute top-2 right-2 rounded-md bg-[var(--surface)] px-2 py-1 text-[11px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
      <pre aria-label={label} className="overflow-x-auto p-4 pr-16 font-[family-name:var(--mono)] text-[12px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
