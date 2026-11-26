import { LICENSE_HREF, LICENSE_NAME, PLATFORMS, platformStatusLabel } from "@/lib/platforms";

const badge = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 whitespace-nowrap";

/** License and platforms for a component page. Soon platforms are text, not links. */
export function PlatformBadges() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ul aria-label="Platforms" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {PLATFORMS.map((platform) => {
          const soon = platform.status === "soon";
          return (
            <li key={platform.id}>
              <span className={soon ? `${badge} border-dashed border-[var(--border)] text-[var(--fg-muted)]` : `${badge} border-[var(--fg)] text-[var(--fg)]`}>
                <span className="font-medium">{platform.name}</span>
                <span aria-hidden="true">—</span>
                <span className={soon ? undefined : "text-[var(--fg-muted)]"}>{platformStatusLabel(platform.status)}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <a
        href={LICENSE_HREF}
        target="_blank"
        rel="noreferrer"
        aria-label={`${LICENSE_NAME} license`}
        className={`${badge} border-[var(--fg)] font-medium text-[var(--fg)] hover:bg-[var(--surface-2)]`}
      >
        {LICENSE_NAME}
      </a>
    </div>
  );
}
