/** Production docs origin. Sitemap and robots.txt build absolute URLs from this. */
export const SITE_ORIGIN = "https://agentic-ui-docs.vercel.app";

export const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;

/**
 * Home, then each component page, in registry order.
 * Add /components when that index route exists.
 */
export function sitemapUrls(slugs: readonly string[]): string[] {
  return [SITE_ORIGIN, ...slugs.map((slug) => `${SITE_ORIGIN}/components/${slug}`)];
}
