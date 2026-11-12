import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COMPONENTS } from "../src/lib/registry.ts";
import { SITE_ORIGIN, SITEMAP_URL, sitemapUrls } from "../src/lib/site.ts";

const origin = "https://agentic-ui-docs.vercel.app";

describe("sitemap", () => {
  it("lists the home page, why, and every registry slug", () => {
    assert.equal(SITE_ORIGIN, origin);
    assert.deepEqual(
      sitemapUrls(COMPONENTS.map((component) => component.slug)),
      [origin, `${origin}/why`, ...COMPONENTS.map((component) => `${origin}/components/${component.slug}`)],
    );
  });

  it("points robots at the sitemap on that origin", () => {
    assert.equal(SITEMAP_URL, `${origin}/sitemap.xml`);
  });
});
