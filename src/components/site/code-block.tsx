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

function CopyButton({ code, label, className }: { code: string; label: string; className: string }) {
  const [copied, setCopied] = useState(false);
  function showCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
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
      className={className}
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      <span className="sr-only"> {label}</span>
    </button>
  );
}

const copyButtonClass =
  "rounded-[var(--radius-md)] bg-[var(--surface)] px-2 py-1 text-[12px] font-medium text-[var(--fg-muted)] transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--fg)] motion-reduce:transition-none";

export function CodeBlock({ code, label = "Code", layout = "block" }: { code: string; label?: string; layout?: "block" | "command" }) {
  if (layout === "command") {
    return (
      <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] py-1.5 pr-1.5 pl-3">
        <pre aria-label={label} className="min-w-0 flex-1 overflow-x-auto font-[family-name:var(--mono)] text-[12px] leading-5 break-all whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
        <CopyButton code={code} label={label} className={`shrink-0 ${copyButtonClass}`} />
      </div>
    );
  }
  return (
    <div className="relative min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)]">
      <CopyButton code={code} label={label} className={`absolute top-2 right-2 ${copyButtonClass}`} />
      <pre aria-label={label} className="overflow-x-auto p-4 pr-16 font-[family-name:var(--mono)] text-[12px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
