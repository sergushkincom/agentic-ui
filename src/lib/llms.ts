import { COMPONENTS, REPO } from "./registry";
import { SITE_DESCRIPTION, SITE_ORIGIN } from "./site";
import { sitePages } from "./site-pages";

function pageUrl(path: string): string {
  if (path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path}`;
}

/** Plain-text index for assistants. Served at /llms.txt. */
export function llmsTxt(): string {
  const pages = sitePages()
    .map((page) => `- [${page.title}](${pageUrl(page.path)}): ${page.description}`)
    .join("\n");
  const registry = COMPONENTS.map(
    (component) =>
      `- [${component.name}](${SITE_ORIGIN}/r/${component.slug}.json): shadcn registry item. ${component.summary}`,
  ).join("\n");

  return [
    "# agentic-ui",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Copy a component into a React 19 and Tailwind CSS 4 app, or install it with the shadcn CLI from the registry URL on its docs page. Each component page has usage, props and accessibility.",
    "",
    "## Pages",
    "",
    pages,
    "",
    "## Registry",
    "",
    registry,
    "",
    "## Optional",
    "",
    `- [GitHub](${REPO}): Source for the components and this site.`,
    "",
  ].join("\n");
}
