"use client";

import { Demo } from "@/app/components/demos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";

function focusable(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])")].filter(
    (element) => element.tabIndex >= 0 && !element.hasAttribute("disabled"),
  );
}

function copyText(text: string) {
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

const action =
  "inline-flex h-8 items-center rounded-[var(--radius-md)] px-2 font-[family-name:var(--mono)] text-[12px] transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--surface-2)] motion-reduce:transition-none";
const quiet = `${action} text-[var(--fg-muted)] hover:text-[var(--fg)]`;
const closeAction = `${action} text-[var(--fg)]`;

export function PreviewStage({
  slug,
  name,
  mode,
  onClose,
}: {
  slug: string;
  name: string;
  mode: "dialog" | "page";
  onClose?: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [take, setTake] = useState(0);
  const [notice, setNotice] = useState("");

  function leave() {
    if (closeRef.current) closeRef.current();
    else router.push(`/components/${slug}`);
  }

  useLayoutEffect(() => {
    if (mode !== "dialog") return;
    const frame = document.getElementById("site-frame");
    frame?.setAttribute("inert", "");
    document.documentElement.setAttribute("data-expanded-preview", "");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      frame?.removeAttribute("inert");
      document.documentElement.removeAttribute("data-expanded-preview");
      document.body.style.overflow = previousOverflow;
    };
  }, [mode]);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (closeRef.current) closeRef.current();
        else router.push(`/components/${slug}`);
        return;
      }
      if (mode !== "dialog" || event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = focusable(dialog);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode, router, slug]);

  function replay() {
    setTake((value) => value + 1);
    setNotice("Demo restarted");
  }

  function copyLink() {
    const url = `${window.location.origin}/preview/${slug}`;
    const done = () => setNotice("Link copied");
    if (copyText(url)) {
      done();
      return;
    }
    void navigator.clipboard?.writeText(url).then(done).catch(() => {});
  }

  function onStageKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (mode !== "dialog" || event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const items = focusable(dialog);
    if (items.length === 0) {
      event.preventDefault();
    }
  }

  const title = mode === "page" ? (
    <h1 id={titleId} className="min-w-0 truncate font-[family-name:var(--mono)] text-[13px] font-medium tracking-[-0.03em]">
      {name}
    </h1>
  ) : (
    <p id={titleId} className="min-w-0 truncate font-[family-name:var(--mono)] text-[13px] font-medium tracking-[-0.03em]">
      {name}
    </p>
  );

  const stage = (
    <div
      ref={mode === "dialog" ? dialogRef : undefined}
      role={mode === "dialog" ? "dialog" : undefined}
      aria-modal={mode === "dialog" ? true : undefined}
      aria-labelledby={titleId}
      tabIndex={mode === "dialog" ? -1 : undefined}
      onKeyDown={onStageKeyDown}
      className="preview-in relative z-10 flex h-[90vh] w-[90vw] max-w-[100%] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg)]"
    >
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-3 sm:px-4">
        {title}
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={replay} className={quiet}>
            Replay
          </button>
          <button type="button" onClick={copyLink} className={quiet}>
            Copy link
          </button>
          {mode === "page" ? (
            <Link href={`/components/${slug}`} className={closeAction}>
              Close
            </Link>
          ) : (
            <button type="button" onClick={leave} className={closeAction}>
              Close
            </button>
          )}
        </div>
      </div>
      <p className="sr-only">Escape closes this view. Replay restarts the demo.</p>
      <p className="sr-only" aria-live="polite">
        {notice}
      </p>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto px-6 py-10 sm:px-16 sm:py-14">
        <div key={take} className="m-auto w-full max-w-2xl">
          <Demo slug={slug} />
        </div>
      </div>
    </div>
  );

  if (mode === "page") {
    return <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)]">{stage}</div>;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]">
      <button type="button" aria-label="Close preview" tabIndex={-1} className="absolute inset-0 cursor-default" onClick={leave} />
      {stage}
    </div>,
    document.body,
  );
}
