import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/registry";
import { sitemapUrls } from "@/lib/site";

/** Home, /why, /components, every /components/<slug> page, and /changelog. */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls(COMPONENTS.map((component) => component.slug)).map((url) => ({ url }));
}
