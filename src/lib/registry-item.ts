import { readFileSync } from "node:fs";
import { join } from "node:path";
import { filesToCopy, type CopyManifest } from "./copy-files";
import { getComponent, type ComponentDoc } from "./registry";

/**
 * shadcn registry-item.json, built from the component's import closure.
 * File contents are read from disk. Nothing here is a hand-copied source.
 * https://ui.shadcn.com/schema/registry-item.json
 */

export const REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";

const ITEM_TYPES = new Set([
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:theme",
  "registry:page",
  "registry:file",
  "registry:style",
  "registry:base",
  "registry:font",
  "registry:item",
]);

/** File types. registry:font is an item type, not a file type. */
const FILE_TYPES = new Set([
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:theme",
  "registry:page",
  "registry:file",
  "registry:style",
  "registry:base",
  "registry:item",
]);

const TARGET_REQUIRED = new Set(["registry:file", "registry:page"]);

export type RegistryFileType =
  | "registry:lib"
  | "registry:component"
  | "registry:file";

export type RegistryItemFile = {
  path: string;
  type: RegistryFileType;
  content: string;
  target: string;
};

export type RegistryItem = {
  $schema: typeof REGISTRY_ITEM_SCHEMA;
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  files: RegistryItemFile[];
  docs: string;
  dependencies?: string[];
};

/** Problems against the registry-item schema. Empty means the item matches. */
export function registryItemSchemaProblems(item: unknown): string[] {
  const problems: string[] = [];
  if (typeof item !== "object" || item === null || Array.isArray(item)) return ["item is not an object"];
  const record = item as Record<string, unknown>;

  if ("$schema" in record && record.$schema !== REGISTRY_ITEM_SCHEMA) problems.push("$schema");
  if (typeof record.name !== "string" || record.name.length === 0) problems.push("name");
  if (typeof record.type !== "string" || !ITEM_TYPES.has(record.type)) problems.push("type");
  if ("title" in record && typeof record.title !== "string") problems.push("title");
  if ("description" in record && typeof record.description !== "string") problems.push("description");
  if ("docs" in record && typeof record.docs !== "string") problems.push("docs");
  if ("dependencies" in record) {
    if (!Array.isArray(record.dependencies) || record.dependencies.some((entry) => typeof entry !== "string")) {
      problems.push("dependencies");
    }
  }

  if (!("files" in record)) return problems;
  if (!Array.isArray(record.files)) {
    problems.push("files");
    return problems;
  }

  record.files.forEach((file, index) => {
    if (typeof file !== "object" || file === null || Array.isArray(file)) {
      problems.push(`files[${index}]`);
      return;
    }
    const entry = file as Record<string, unknown>;
    if (typeof entry.path !== "string" || entry.path.length === 0) problems.push(`files[${index}].path`);
    if (typeof entry.type !== "string" || !FILE_TYPES.has(entry.type)) problems.push(`files[${index}].type`);
    if ("content" in entry && typeof entry.content !== "string") problems.push(`files[${index}].content`);
    const needsTarget = typeof entry.type === "string" && TARGET_REQUIRED.has(entry.type);
    if (needsTarget && (typeof entry.target !== "string" || entry.target.length === 0)) {
      problems.push(`files[${index}].target`);
    } else if ("target" in entry && typeof entry.target !== "string") {
      problems.push(`files[${index}].target`);
    }
  });

  return problems;
}

export function registryItem(slug: string, root = process.cwd()): RegistryItem | null {
  const component = getComponent(slug);
  if (!component) return null;
  const manifest = filesToCopy(component.file, component.name, root);
  const files = manifest.files.map((path) => fileFromSource(root, path));
  if (manifest.motionCss) {
    files.push({
      path: "src/app/agentic-motion.css",
      type: "registry:file",
      content: manifest.motionCss,
      target: "src/app/agentic-motion.css",
    });
  }
  const extra = manifest.packages.filter((name) => name !== "react" && name !== "react-dom");
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: component.slug,
    type: "registry:component",
    title: component.name,
    description: component.summary,
    files,
    docs: registryDocs(component, manifest),
    ...(extra.length > 0 ? { dependencies: extra } : {}),
  };
}

function fileFromSource(root: string, path: string): RegistryItemFile {
  const content = readFileSync(join(root, path), "utf8");
  const base = path.slice(path.lastIndexOf("/") + 1);
  if (path.endsWith(".css")) {
    return { path, type: "registry:file", content, target: path };
  }
  return {
    path,
    type: path.endsWith(".tsx") ? "registry:component" : "registry:lib",
    content,
    target: `@components/agentic/${base}`,
  };
}

function registryDocs(component: ComponentDoc, manifest: CopyManifest): string {
  const modulePath = `@/components/agentic/${component.file.replace(/\.tsx$/, "")}`;
  const lines = [
    `Import { ${component.name} } from "${modulePath}".`,
    'In globals.css, next to Tailwind, add `@import "./tokens.css";`.',
  ];
  if (manifest.motionCss) {
    lines.push("Paste src/app/agentic-motion.css into that same file so the motion classes run.");
  }
  lines.push(manifest.packageNote);
  return lines.join(" ");
}
