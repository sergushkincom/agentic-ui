import { CHANGELOG_DESCRIPTION, CHANGELOG_TITLE } from "../app/changelog/meta";
import { WHY_DESCRIPTION, WHY_TITLE } from "../app/why/meta";
import { COMPONENTS, MOMENTS } from "./registry";
import { SITE_DESCRIPTION } from "./site";

export type SitePage = {
  title: string;
  path: string;
  description: string;
};

/** Same sentence as the components index metadata. */
export function componentsIndexDescription(): string {
  return `All ${COMPONENTS.length} agentic-ui components, grouped by the moment they cover: ${MOMENTS.map((moment) => moment.label.toLowerCase()).join(", ")}.`;
}

/** The agent run page's metadata description. */
export const AGENT_RUN_DESCRIPTION =
  "One composed example: an agent matches a supplier invoice, asks you to confirm a low-confidence field, and waits for approval. A second path shows the run failing.";

/**
 * Pages a person can open. Home, why, the components index, each component, the composed run, then the changelog.
 * Order matches the way the site is read.
 */
export function sitePages(): SitePage[] {
  return [
    { title: "Home", path: "/", description: SITE_DESCRIPTION },
    { title: WHY_TITLE, path: "/why", description: WHY_DESCRIPTION },
    { title: "Components", path: "/components", description: componentsIndexDescription() },
    ...COMPONENTS.map((component) => ({
      title: component.name,
      path: `/components/${component.slug}`,
      description: component.summary,
    })),
    { title: "One agent run", path: "/examples/agent-run", description: AGENT_RUN_DESCRIPTION },
    { title: CHANGELOG_TITLE, path: "/changelog", description: CHANGELOG_DESCRIPTION },
  ];
}
