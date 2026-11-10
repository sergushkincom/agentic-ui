const REPO = "https://github.com/sergushkincom/agentic-ui";

const LINKS = [
  { label: "GitHub", href: REPO, icon: <GitHubIcon /> },
  { label: "README", href: `${REPO}#readme`, icon: <BookIcon /> },
];

const link =
  "rounded-sm underline-offset-2 hover:text-[var(--fg)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

/** Who made this and where the code is. One thin row under the site. */
export function SiteFooter() {
  return (
    <footer className="flex h-[var(--footer-h)] shrink-0 items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-strong)] px-4 text-xs text-[var(--fg-muted)]">
      <p className="truncate max-sm:hidden">MIT licensed · Copy, adapt, ship</p>
      <nav
        aria-label="About this project"
        className="flex items-center gap-4 max-sm:w-full max-sm:justify-between"
      >
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className={`${link} flex items-center gap-1`}
          >
            {l.icon}
            {l.label}
          </a>
        ))}
        <a href="https://sergushkin.com" target="_blank" rel="noreferrer" className={link}>
          Built by <span className="text-[var(--fg)]">Denys Sergushkin</span>
          <span aria-hidden="true"> ↗</span>
        </a>
      </nav>
    </footer>
  );
}

// GitHub's mark (Octicons, MIT)
function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

// Open book, drawn to match lucide's book-open weight
function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}
