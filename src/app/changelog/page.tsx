import type { Metadata } from "next";
import { CHANGELOG, formatChangelogDate, pullRequestUrl } from "@/lib/changelog";
import { SITE_TITLE } from "@/lib/site";
import { CHANGELOG_DESCRIPTION, CHANGELOG_TITLE } from "./meta";

export const metadata: Metadata = {
  title: CHANGELOG_TITLE,
  description: CHANGELOG_DESCRIPTION,
  openGraph: { title: CHANGELOG_TITLE, description: CHANGELOG_DESCRIPTION, siteName: SITE_TITLE, type: "website" },
  twitter: { card: "summary_large_image", title: CHANGELOG_TITLE, description: CHANGELOG_DESCRIPTION },
};

const link =
  "rounded-sm text-[var(--accent)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export default function ChangelogPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col px-4 py-10 sm:py-14">
      <div className="flex max-w-2xl flex-col gap-12">
        <header className="flex flex-col gap-4">
          <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Changelog</h1>
          <p className="text-[17px] leading-relaxed text-[var(--fg-muted)]">
            What changed in the library and the docs, newest first. Each date is the day the pull request merged.
            A component shows <span className="text-[var(--fg)]">New</span> in the sidebar for 30 days after its
            source changes. A docs-only note does not reset that.
          </p>
        </header>

        <div className="flex flex-col gap-12">
          {CHANGELOG.map((entry) => (
            <article key={entry.id} id={entry.id} className="flex scroll-mt-16 flex-col gap-3">
              <time dateTime={entry.date} className="text-xs tabular-nums text-[var(--fg-muted)]">
                {formatChangelogDate(entry.date)}
              </time>
              <h2 className="text-[20px] font-semibold">{entry.title}</h2>
              <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">{entry.summary}</p>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] leading-relaxed">
                {entry.pulls.map((pull) => (
                  <li key={pull.number}>
                    <a href={pullRequestUrl(pull.number)} target="_blank" rel="noreferrer" className={link}>
                      {pull.title} (#{pull.number})
                      <span aria-hidden="true"> ↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
