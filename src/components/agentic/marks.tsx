/** Small shared marks. Authorship is always shown the same way across the library. */

export function AgentMark({ label = "Agent" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--agent-soft)] px-1.5 py-px text-[11px] font-medium text-[var(--agent)]">
      <svg viewBox="0 0 12 12" aria-hidden="true" className="size-2.5" fill="currentColor">
        <path d="M6 0l1.4 4.6L12 6l-4.6 1.4L6 12 4.6 7.4 0 6l4.6-1.4z" />
      </svg>
      {label}
    </span>
  );
}

export function HumanMark({ label = "You" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--human-soft)] px-1.5 py-px text-[11px] font-medium text-[var(--human)]">
      <svg viewBox="0 0 12 12" aria-hidden="true" className="size-2.5" fill="currentColor">
        <circle cx="6" cy="3.5" r="2.5" />
        <path d="M1 12a5 5 0 0 1 10 0z" />
      </svg>
      {label}
    </span>
  );
}

export function Spinner({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`aui-spin shrink-0 ${className}`} fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`size-3.5 shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

export const buttonClass = {
  primary:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[var(--fg)] px-3 text-[13px] font-medium text-[var(--bg)] hover:opacity-90 disabled:opacity-40",
  secondary:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--fg)] hover:bg-[var(--surface-2)] disabled:opacity-40",
  ghost:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]",
} as const;
