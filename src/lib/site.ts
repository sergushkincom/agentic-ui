/** Production docs origin. Metadata, the sitemap, and robots.txt build absolute URLs from this. */
export const SITE_ORIGIN = "https://agentic-ui-docs.vercel.app";
export const SITE_URL = SITE_ORIGIN;

export const SITE_TITLE = "agentic-ui";
export const SITE_DESCRIPTION =
  "React components for products where an agent does part of the work: streaming text, thinking states, confidence, human override, tool calls, decisions and fallbacks.";

export const SITE_TITLE_TEMPLATE = `%s · ${SITE_TITLE}`;

export const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;

/** Home, /why, the components index, then each component page, in registry order. */
export function sitemapUrls(slugs: readonly string[]): string[] {
  return [
    SITE_ORIGIN,
    `${SITE_ORIGIN}/why`,
    `${SITE_ORIGIN}/components`,
    ...slugs.map((slug) => `${SITE_ORIGIN}/components/${slug}`),
  ];
}
