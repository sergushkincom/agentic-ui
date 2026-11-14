import Link from "next/link";
import { REPO } from "@/lib/registry";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-3 sm:gap-4 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-sm text-[14px] font-semibold whitespace-nowrap">
          <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3.5 text-[var(--agent)]" fill="currentColor">
            <path d="M6 0l1.4 4.6L12 6l-4.6 1.4L6 12 4.6 7.4 0 6l4.6-1.4z" />
          </svg>
          agentic-ui
        </Link>
        <nav
          aria-label="Main"
          className="flex min-w-0 items-center gap-2.5 overflow-x-auto text-[13px] text-[var(--fg-muted)] [scrollbar-width:none] sm:gap-4"
        >
          <Link href="/why" aria-label="Why this exists" className="shrink-0 whitespace-nowrap rounded-sm hover:text-[var(--fg)]">
            <span className="sm:hidden">Why</span>
            <span className="hidden sm:inline">Why this exists</span>
          </Link>
          <Link href="/components" className="shrink-0 whitespace-nowrap rounded-sm hover:text-[var(--fg)]">
            Components
          </Link>
          <Link href="/changelog" className="shrink-0 whitespace-nowrap rounded-sm hover:text-[var(--fg)]">
            Changelog
          </Link>
          <a href={REPO} target="_blank" rel="noreferrer" className="shrink-0 whitespace-nowrap rounded-sm hover:text-[var(--fg)]">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
