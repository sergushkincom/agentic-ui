import { LICENSE_HREF, LICENSE_NAME, PLATFORMS, platformStatusLabel } from "@/lib/platforms";

/** License and platforms for a component page. Soon platforms are text, not links. */
export function PlatformBadges() {
  return (
    <ul aria-label="Platforms" className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 font-[family-name:var(--mono)] text-[12px] leading-5">
      {PLATFORMS.map((platform) => {
        const soon = platform.status === "soon";
        return (
          <li key={platform.id} className={soon ? "text-[var(--fg-muted)]" : "text-[var(--fg)]"}>
            <span className="font-medium">{platform.name}</span>
            <span aria-hidden="true"> · </span>
            <span>{platformStatusLabel(platform.status)}</span>
          </li>
        );
      })}
      <li>
        <a
          href={LICENSE_HREF}
          target="_blank"
          rel="noreferrer"
          aria-label={`${LICENSE_NAME} license`}
          className="font-medium text-[var(--fg)] underline-offset-2 hover:underline"
        >
          {LICENSE_NAME}
        </a>
      </li>
    </ul>
  );
}
