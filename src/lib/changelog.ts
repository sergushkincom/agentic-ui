/**
 * Dated notes for the docs site. Dates are the UTC calendar day the pull request merged.
 * Titles match the merged pull requests. Nothing here is a version number: the library is copied, not released.
 *
 * `components` lists registry slugs whose library source changed in that entry.
 * Docs-only notes omit it. The sidebar "New" badge uses the latest such date per slug.
 */

export type ChangelogPull = {
  number: number;
  /** Title of the merged pull request. */
  title: string;
};

export type ChangelogEntry = {
  /** Stable fragment, unique on the page. */
  id: string;
  /** UTC merge day, YYYY-MM-DD. */
  date: string;
  title: string;
  summary: string;
  pulls: readonly ChangelogPull[];
  /** Slugs whose files under src/components/agentic changed. */
  components?: readonly string[];
};

/** How long a sidebar "New" badge stays up after the component's source changes, counting the change day. */
export const NEW_BADGE_DAYS = 30;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    id: "2026-11-13",
    date: "2026-11-13",
    title: "When to use, and files to copy",
    summary:
      "Each component page now says when to use that component and when a neighbour fits better, and lists the files to copy into an app.",
    pulls: [
      { number: 34, title: 'Add a "Files to copy" block on each component page' },
      { number: 33, title: "Add a when-to-use section on every component page" },
    ],
  },
  {
    id: "2026-11-12-docs",
    date: "2026-11-12",
    title: "Why, the demos, one run, and keyboard",
    summary:
      "A page for the design reasoning, Preview and Code on every demo, one composed agent run, and a keyboard table on every component. StreamingText, HumanOverride and ToolCallFeed changed so those keys work in the component.",
    pulls: [
      { number: 32, title: "Add keyboard interaction tables to every component page" },
      { number: 29, title: 'Add a "Why this exists" page' },
      { number: 30, title: "Add Preview and Code tabs on every demo" },
      { number: 31, title: "Add one composed agent run at /examples/agent-run" },
    ],
    components: ["streaming-text", "human-override", "tool-call-feed"],
  },
  {
    id: "2026-11-12-m1",
    date: "2026-11-12",
    title: "M1 · Share-ready",
    summary:
      "A shared link works. The site has a sitemap and robots.txt, a components index, and plain Open Graph and Twitter previews. The index was added to the sitemap the same day.",
    pulls: [
      { number: 28, title: "Add the components index to the sitemap" },
      { number: 27, title: "Add plain Open Graph and Twitter link previews" },
      { number: 26, title: "Add a components index at /components" },
      { number: 25, title: "Add sitemap.xml and robots.txt" },
    ],
  },
  {
    id: "2026-11-11",
    date: "2026-11-11",
    title: "Launch",
    summary:
      "The library and the docs site. Seven components, each live: StreamingText, ThinkingState, ConfidenceBar, HumanOverride, ToolCallFeed, AgentDecisionCard and FallbackBoundary.",
    pulls: [{ number: 4, title: "Docs site with the seven components, each live" }],
    components: [
      "streaming-text",
      "thinking-state",
      "confidence-bar",
      "human-override",
      "tool-call-feed",
      "agent-decision-card",
      "fallback-boundary",
    ],
  },
];

/** UTC midnight for a YYYY-MM-DD calendar day. Rejects impossible dates instead of rolling them over. */
export function utcMidnight(isoDate: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    throw new Error(`Expected YYYY-MM-DD, got ${isoDate}`);
  }
  const parsed = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed) || new Date(parsed).toISOString().slice(0, 10) !== isoDate) {
    throw new Error(`Expected a real calendar date, got ${isoDate}`);
  }
  return parsed;
}

/** "11 Nov 2026". The day has no leading zero. */
export function formatChangelogDate(isoDate: string): string {
  utcMidnight(isoDate);
  const monthIndex = Number(isoDate.slice(5, 7)) - 1;
  const day = Number(isoDate.slice(8, 10));
  return `${day} ${MONTHS[monthIndex]} ${isoDate.slice(0, 4)}`;
}

/** Whole UTC days from `changedOn` to `asOf`. Negative when `asOf` is earlier. */
export function daysAfter(changedOn: string, asOf: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((utcMidnight(asOf) - utcMidnight(changedOn)) / msPerDay);
}

/**
 * True on the change day and for the next `windowDays - 1` days.
 * A component that changes on 11 Nov is still new on 10 Dec and not on 11 Dec.
 */
export function isNew(changedOn: string, asOf: string, windowDays = NEW_BADGE_DAYS): boolean {
  const elapsed = daysAfter(changedOn, asOf);
  return elapsed >= 0 && elapsed < windowDays;
}

/** Latest UTC day a component's library source changed, or null when the changelog never lists it. */
export function componentChangedOn(slug: string, entries: readonly ChangelogEntry[] = CHANGELOG): string | null {
  let latest: string | null = null;
  for (const entry of entries) {
    if (!entry.components?.includes(slug)) continue;
    if (latest === null || entry.date > latest) latest = entry.date;
  }
  return latest;
}

/** Sidebar "New" badge: the component's source changed within the last 30 days of `asOf`. */
export function isNewComponent(slug: string, asOf: string): boolean {
  const changedOn = componentChangedOn(slug);
  if (!changedOn) return false;
  return isNew(changedOn, asOf);
}

/** UTC calendar day for `now`, matching the dates stored on changelog entries. */
export function utcToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

const REPO_URL = "https://github.com/sergushkincom/agentic-ui";

export function pullRequestUrl(number: number): string {
  return `${REPO_URL}/pull/${number}`;
}
