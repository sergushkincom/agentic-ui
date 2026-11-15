import { SITE_ORIGIN } from "./site";

/** Path the site serves for one component's registry item. */
export function registryItemPath(slug: string): string {
  return `/r/${slug}.json`;
}

export function registryItemUrl(slug: string): string {
  return `${SITE_ORIGIN}${registryItemPath(slug)}`;
}

/** Install line shown beside the copy instructions. */
export function shadcnInstallCommand(slug: string): string {
  return `npx shadcn add ${registryItemUrl(slug)}`;
}
