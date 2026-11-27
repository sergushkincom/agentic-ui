"use client";

import { parseThemeChoice, THEME_STORAGE_KEY, themeDataset, type ThemeChoice } from "@/lib/theme";
import { useLayoutEffect, useState, type ReactNode } from "react";

function storedChoice(): ThemeChoice {
  try {
    return parseThemeChoice(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

function applyTheme(choice: ThemeChoice) {
  const value = themeDataset(choice);
  if (value) document.documentElement.setAttribute("data-theme", value);
  else document.documentElement.removeAttribute("data-theme");
}

const GLYPH: Record<ThemeChoice, () => ReactNode> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useLayoutEffect(() => {
    const stored = storedChoice();
    applyTheme(stored);
    setChoice(stored);
  }, []);

  const Glyph = GLYPH[choice];

  return (
    <label className="inline-flex h-9 shrink-0 items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] pr-1 pl-1.5 text-[13px] text-[var(--fg)] transition-[background-color,border-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[color-mix(in_srgb,var(--fg)_32%,var(--border))] hover:bg-[var(--surface-2)] motion-reduce:transition-none sm:gap-1.5 sm:pr-1.5 sm:pl-2">
      <span className="sr-only">Theme</span>
      <Glyph />
      <select
        aria-label="Theme"
        value={choice}
        onChange={(event) => {
          const next = parseThemeChoice(event.target.value);
          try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch {
            // The choice still applies for this view when storage is blocked.
          }
          applyTheme(next);
          setChoice(next);
        }}
        className="max-w-[5.5rem] cursor-pointer bg-transparent text-[13px] text-[var(--fg)] outline-none"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.25" />
      <path d="M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M13.2 10.4A5.25 5.25 0 0 1 5.6 2.8 5.25 5.25 0 1 0 13.2 10.4z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="8" rx="1.25" />
      <path d="M6 13.25h4M8 11v2.25" />
    </svg>
  );
}
