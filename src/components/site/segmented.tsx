"use client";

/** Scenario switch for the demos. Radio group semantics, arrow keys move between options. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-0.5 rounded-lg bg-[var(--surface-2)] p-0.5">
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
              if (!step) return;
              e.preventDefault();
              const next = options[(i + step + options.length) % options.length];
              onChange(next.value);
              const group = e.currentTarget.parentElement;
              requestAnimationFrame(() => (group?.querySelector('[aria-checked="true"]') as HTMLElement | null)?.focus());
            }}
            className={`h-7 rounded-md px-2.5 text-xs font-medium ${on ? "bg-[var(--surface)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
