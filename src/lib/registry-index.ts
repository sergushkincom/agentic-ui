import { COMPONENTS } from "./registry";
import { registryItemSchemaProblems } from "./registry-item";
import { SITE_ORIGIN } from "./site";

/**
 * shadcn registry index. Lists every component from COMPONENTS.
 * File contents stay on /r/<slug>.json. The index is the catalog.
 * https://ui.shadcn.com/schema/registry.json
 */

export const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";

export type RegistryIndexFile = {
  path: string;
  type: "registry:component";
};

export type RegistryIndexItem = {
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  files: RegistryIndexFile[];
};

export type RegistryIndex = {
  $schema: typeof REGISTRY_SCHEMA;
  name: string;
  homepage: string;
  items: RegistryIndexItem[];
};

export function registryIndex(): RegistryIndex {
  return {
    $schema: REGISTRY_SCHEMA,
    name: "agentic-ui",
    homepage: SITE_ORIGIN,
    items: COMPONENTS.map((component) => ({
      name: component.slug,
      type: "registry:component",
      title: component.name,
      description: component.summary,
      files: [
        {
          path: `src/components/agentic/${component.file}`,
          type: "registry:component",
        },
      ],
    })),
  };
}

/** Problems against the registry schema. Empty means the index matches. */
export function registryIndexSchemaProblems(index: unknown): string[] {
  const problems: string[] = [];
  if (typeof index !== "object" || index === null || Array.isArray(index)) return ["index is not an object"];
  const record = index as Record<string, unknown>;

  if (record.$schema !== REGISTRY_SCHEMA) problems.push("$schema");
  if (typeof record.name !== "string" || record.name.length === 0) problems.push("name");
  if (typeof record.homepage !== "string" || record.homepage.length === 0) problems.push("homepage");
  if (!Array.isArray(record.items)) return [...problems, "items"];

  record.items.forEach((item, itemIndex) => {
    for (const problem of registryItemSchemaProblems(item)) {
      problems.push(`items[${itemIndex}].${problem}`);
    }
    if (typeof item !== "object" || item === null || Array.isArray(item)) return;
    const files = (item as { files?: unknown }).files;
    if (!Array.isArray(files) || files.length === 0) {
      problems.push(`items[${itemIndex}].files`);
      return;
    }
    files.forEach((file, fileIndex) => {
      if (typeof file === "object" && file !== null && "content" in file) {
        problems.push(`items[${itemIndex}].files[${fileIndex}].content`);
      }
    });
  });

  return problems;
}
