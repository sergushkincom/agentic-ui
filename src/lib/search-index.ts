import { COMPONENTS } from "./registry";
import { sitePages } from "./site-pages";

export type SearchGroup = "Pages" | "Props";

export type SearchItem = {
  id: string;
  group: SearchGroup;
  title: string;
  hint: string;
  href: string;
  /** Lowercase haystack: title, hint and path. */
  text: string;
};

function pageId(path: string): string {
  const cleaned = path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `page-${cleaned.length > 0 ? cleaned : "home"}`;
}

export const SEARCH_ITEMS: readonly SearchItem[] = [
  ...sitePages().map((page) => ({
    id: pageId(page.path),
    group: "Pages" as const,
    title: page.title,
    hint: page.description,
    href: page.path,
    text: `${page.title} ${page.description} ${page.path}`.toLowerCase(),
  })),
  ...COMPONENTS.flatMap((component) =>
    component.props.map((prop, index) => ({
      id: `prop-${component.slug}-${index}`,
      group: "Props" as const,
      title: prop.name,
      hint: `${component.name} · ${prop.type} · ${prop.note}`,
      href: `/components/${component.slug}#props`,
      text: `${prop.name} ${prop.type} ${prop.note} ${component.name} ${component.slug}`.toLowerCase(),
    })),
  ),
];

export function filterSearch(items: readonly SearchItem[], query: string): SearchItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];
  return items.filter((item) => item.text.includes(needle));
}
