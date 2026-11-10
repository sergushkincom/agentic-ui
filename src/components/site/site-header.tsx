import Link from "next/link";
import { REPO } from "@/lib/registry";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 rounded-sm text-[14px] font-semibold">
          <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3.5 text-[var(--agent)]" fill="currentColor">
            <path d="M6 0l1.4 4.6L12 6l-4.6 1.4L6 12 4.6 7.4 0 6l4.6-1.4z" />
          </svg>
          agentic-ui
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4 text-[13px] text-[var(--fg-muted)]">
          <Link href="/components/streaming-text" className="rounded-sm hover:text-[var(--fg)]">
            Components
          </Link>
          <a href={REPO} target="_blank" rel="noreferrer" className="rounded-sm hover:text-[var(--fg)]">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
