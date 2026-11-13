"use client";

import { useState } from "react";

/**
 * Copy during the click, including a click the browser fires for Space or Enter.
 * The async clipboard API drops that gesture when it rejects, so this path stays synchronous.
 */
function copyText(text: string): boolean {
  const active = document.activeElement;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  if (active instanceof HTMLElement) active.focus();
  return ok;
}

export function CodeBlock({ code, label = "Code" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function showCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative min-w-0 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)]">
      <button
        type="button"
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
        }}
        onKeyUp={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          event.currentTarget.click();
        }}
        onClick={() => {
          if (copyText(code)) {
            showCopied();
            return;
          }
          void navigator.clipboard?.writeText(code).then(showCopied).catch(() => {});
        }}
        className="absolute top-2 right-2 rounded-md bg-[var(--surface)] px-2 py-1 text-[11px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        <span className="sr-only"> {label}</span>
      </button>
      <pre aria-label={label} className="overflow-x-auto p-4 pr-16 font-[family-name:var(--mono)] text-[12px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
