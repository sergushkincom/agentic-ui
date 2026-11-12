import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/registry";
import { sitemapUrls } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls(COMPONENTS.map((component) => component.slug)).map((url) => ({ url }));
}
