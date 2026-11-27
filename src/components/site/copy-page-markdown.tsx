"use client";

import { useEffect, useRef, useState } from "react";

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

export function CopyPageMarkdown({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function showCopied() {
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (copyText(markdown)) {
          showCopied();
          return;
        }
        void navigator.clipboard?.writeText(markdown).then(showCopied).catch(() => {});
      }}
      className="inline-flex h-9 shrink-0 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px] font-medium text-[var(--fg-muted)] transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[color-mix(in_srgb,var(--fg)_28%,var(--border))] hover:bg-[var(--surface-2)] hover:text-[var(--fg)] motion-reduce:transition-none"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy page as Markdown"}</span>
    </button>
  );
}
