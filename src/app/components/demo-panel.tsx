"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CodeBlock } from "@/components/site/code-block";
import { PreviewStage } from "@/components/site/preview-stage";
import { Segmented } from "@/components/site/segmented";
import { Demo } from "./demos";

function fullView() {
  return new URLSearchParams(window.location.search).get("view") === "full";
}

function writeView(open: boolean) {
  const url = new URL(window.location.href);
  if (open) url.searchParams.set("view", "full");
  else url.searchParams.delete("view");
  const search = url.searchParams.toString();
  window.history.pushState(null, "", url.pathname + (search ? `?${search}` : ""));
}

/** Preview shows the live demo. Code shows the source of that same demo. */
export function DemoPanel({ slug, name, filename, code }: { slug: string; name: string; filename: string; code: string }) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [open, setOpen] = useState(false);
  const expandRef = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);

  useLayoutEffect(() => {
    const full = fullView();
    if (full !== open) {
      setOpen(full);
      return;
    }
    if (open) opened.current = true;
    else if (opened.current) expandRef.current?.focus();
  }, [open]);

  useLayoutEffect(() => {
    function onPop() {
      setOpen(fullView());
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function openPreview() {
    if (!fullView()) writeView(true);
    setOpen(true);
  }

  function closePreview() {
    if (fullView()) writeView(false);
    setOpen(false);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Segmented
          label="Demo view"
          value={view}
          onChange={setView}
          options={[
            { value: "preview", label: "Preview" },
            { value: "code", label: "Code" },
          ]}
        />
        <button
          ref={expandRef}
          type="button"
          aria-label="Expand preview"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={openPreview}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 font-[family-name:var(--mono)] text-[12px] text-[var(--fg)] transition-[background-color,border-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[color-mix(in_srgb,var(--fg)_28%,var(--border))] hover:bg-[var(--surface-2)] motion-reduce:transition-none"
        >
          <ExpandIcon />
          Expand
        </button>
      </div>
      {view === "preview" ? (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg)] px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-xl">{open ? null : <Demo slug={slug} />}</div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-2">
          <p className="font-[family-name:var(--mono)] text-[12px] break-all text-[var(--fg-muted)]">{filename}</p>
          <CodeBlock code={code} label={`${filename} source`} />
        </div>
      )}
      {open ? <PreviewStage slug={slug} name={name} mode="dialog" onClose={closePreview} /> : null}
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M6 2.75H2.75V6M10 2.75h3.25V6M6 13.25H2.75V10M10 13.25h3.25V10" />
    </svg>
  );
}
