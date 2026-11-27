"use client";

import { nextEnabledIndex } from "@/components/agentic/keyboard";
import { filterSearch, SEARCH_ITEMS, type SearchItem } from "@/lib/search-index";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

type Grouped = { label: SearchItem["group"]; items: { item: SearchItem; index: number }[] };

function groupResults(items: readonly SearchItem[]): Grouped[] {
  const groups: Grouped[] = [];
  items.forEach((item, index) => {
    const last = groups[groups.length - 1];
    if (!last || last.label !== item.group) groups.push({ label: item.group, items: [{ item, index }] });
    else last.items.push({ item, index });
  });
  return groups;
}

export function CommandMenu() {
  const router = useRouter();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  openRef.current = open;
  const results = filterSearch(SEARCH_ITEMS, query);
  const selectedIndex = results.length === 0 ? 0 : Math.min(active, results.length - 1);
  const selected = results[selectedIndex];
  const selectedId = selected?.id;

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (document.documentElement.hasAttribute("data-expanded-preview")) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      if (openRef.current) {
        setOpen(false);
        return;
      }
      setQuery("");
      setActive(0);
      setOpen(true);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !selectedId) return;
    document.getElementById(`search-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [open, selectedId]);

  function move(key: string) {
    const next = nextEnabledIndex(selectedIndex, results.length, key);
    if (next !== null) setActive(next);
  }

  function openSelected() {
    if (!selected) return;
    router.push(selected.href);
    setOpen(false);
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key);
      return;
    }
    if (event.key === "Enter" && event.target === inputRef.current) {
      event.preventDefault();
      openSelected();
      return;
    }
    if (event.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const items = [...root.querySelectorAll<HTMLElement>("button, input")].filter((element) => element.tabIndex >= 0);
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search ⌘K"
        aria-keyshortcuts="Control+K Meta+K"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          setQuery("");
          setActive(0);
          setOpen(true);
        }}
        className="group inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] text-[13px] text-[var(--fg-muted)] transition-[color,background-color,border-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[color-mix(in_srgb,var(--fg)_32%,var(--border))] hover:bg-[var(--surface-2)] hover:text-[var(--fg)] focus-visible:border-[var(--fg)] focus-visible:text-[var(--fg)] motion-reduce:transition-none sm:w-56 sm:justify-start sm:px-3 md:w-64"
      >
        <SearchIcon />
        <span className="hidden min-w-0 flex-1 truncate text-left sm:inline">Search</span>
        <kbd className="site-kbd pointer-events-none hidden sm:inline-flex">⌘K</kbd>
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[10vh]">
              <button type="button" aria-label="Close search" tabIndex={-1} className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-title"
                onKeyDown={onDialogKeyDown}
                className="relative z-10 flex max-h-[min(32rem,80dvh)] w-full max-w-xl flex-col overflow-hidden rounded-[4px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_48px_-28px_color-mix(in_srgb,var(--fg)_50%,transparent)]"
              >
                <h2 id="search-title" className="sr-only">
                  Search
                </h2>
                <p className="sr-only">Use the up and down arrow keys to move through results, Enter to open, and Escape to close.</p>
                <div className="flex items-center gap-2 border-b border-[var(--border)] px-3">
                  <SearchIcon />
                  <input
                    ref={inputRef}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={selected ? `search-${selected.id}` : undefined}
                    aria-label="Search pages and props"
                    placeholder="Pages and props"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActive(0);
                    }}
                    className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-muted)]"
                  />
                  <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="site-kbd inline-flex shrink-0 hover:bg-[var(--surface-2)]">
                    Esc
                  </button>
                </div>
                <div className="sr-only" aria-live="polite">
                  {results.length === 1 ? "1 result" : `${results.length} results`}
                </div>
                <div id={listId} role="listbox" aria-label="Search results" className="overflow-y-auto overscroll-contain py-1">
                  {results.length === 0 ? (
                    <p className="px-3 py-6 text-[13px] text-[var(--fg-muted)]">No matches.</p>
                  ) : (
                    groupResults(results).map((group) => (
                      <div key={group.label} role="presentation">
                        <div className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-[var(--fg-muted)] uppercase">{group.label}</div>
                        <ul role="group" aria-label={group.label}>
                          {group.items.map(({ item, index }) => {
                            const on = index === selectedIndex;
                            return (
                              <li key={item.id} role="option" id={`search-${item.id}`} aria-selected={on}>
                                <a
                                  href={item.href}
                                  tabIndex={-1}
                                  onMouseEnter={() => setActive(index)}
                                  onClick={() => setOpen(false)}
                                  className={`flex min-w-0 flex-col gap-0.5 px-3 py-2 ${on ? "bg-[var(--surface-2)]" : ""}`}
                                >
                                  <span className="truncate text-[13px]">{item.title}</span>
                                  <span className="truncate text-[12px] text-[var(--fg-muted)]">{item.hint}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}
