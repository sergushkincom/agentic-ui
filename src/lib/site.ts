/** Production docs origin. Sitemap and robots.txt build absolute URLs from this. */
export const SITE_ORIGIN = "https://agentic-ui-docs.vercel.app";

export const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;

/** Home, the components index, then each component page, in registry order. */
export function sitemapUrls(slugs: readonly string[]): string[] {
  return [SITE_ORIGIN, `${SITE_ORIGIN}/components`, ...slugs.map((slug) => `${SITE_ORIGIN}/components/${slug}`)];
}
