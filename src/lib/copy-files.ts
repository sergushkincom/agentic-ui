import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

/**
 * What to copy for one component, read from its source import graph.
 * Docs render this. Tests re-walk the same files, so a new import cannot
 * drift out of the list.
 */

const AGENTIC_DIR = "src/components/agentic";
const TOKENS_FILE = "src/app/tokens.css";
const GLOBALS_FILE = "src/app/globals.css";

/** Shown on every component page. Next.js apps already ship React. */
export const REACT_TAILWIND_NOTE = "Needs React 19 and Tailwind CSS 4.";

/** Paste next to Tailwind. tokens.css lives beside globals.css. */
export const TOKEN_IMPORT = `@import "tailwindcss";\n@import "./tokens.css";`;

const MOTION_LABEL: Record<string, string> = {
  "aui-caret": "caret",
  "aui-spin": "spinner",
  "aui-pulse": "pulse",
};

/** Present in a fresh Next.js app. Listed, but not an extra install. */
const RUNTIME_PACKAGES = new Set(["react", "react-dom"]);

export type CopyManifest = {
  exportName: string;
  /** Repo-relative paths, sorted. The JS closure, plus tokens.css. */
  files: string[];
  tree: string;
  importStatement: string;
  /** npm package names the closure imports, sorted. */
  packages: string[];
  packageNote: string;
  /** `npm install …` for packages other than React, or null. */
  extraInstall: string | null;
  tokenImport: string;
  /** Verbatim motion rules from globals.css, when the closure uses them. */
  motionCss: string | null;
  motionNote: string | null;
};

export function filesToCopy(file: string, exportName: string, root = process.cwd()): CopyManifest {
  if (!/^[A-Za-z0-9._-]+$/.test(file)) throw new Error(`Unexpected component file: ${file}`);
  if (!/^[A-Za-z0-9_]+$/.test(exportName)) throw new Error(`Unexpected export name: ${exportName}`);

  const entry = `${AGENTIC_DIR}/${file}`;
  const seen = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];

  while (queue.length > 0) {
    const rel = queue.pop();
    if (!rel || seen.has(rel)) continue;
    seen.add(rel);
    const source = readFileSync(join(root, rel), "utf8");
    if (rel === entry && !new RegExp(`export (?:async )?(?:function|class) ${exportName}\\b`).test(source)) {
      throw new Error(`${entry} does not export ${exportName}`);
    }
    if (!rel.endsWith(".ts") && !rel.endsWith(".tsx")) continue;
    for (const spec of importSpecifiers(source)) {
      const resolved = resolveSpecifier(rel, spec, root);
      if (resolved.kind === "file") queue.push(resolved.file);
      else packages.add(resolved.name);
    }
  }

  const files = [...new Set([...seen, TOKENS_FILE])].sort((a, b) => a.localeCompare(b));
  const packageList = [...packages].sort((a, b) => a.localeCompare(b));
  const extra = packageList.filter((name) => !RUNTIME_PACKAGES.has(name));
  const modulePath = `@/${entry.replace(/^src\//, "").replace(/\.tsx?$/, "")}`;
  const motion = motionFor(root, files);

  return {
    exportName,
    files,
    tree: renderTree(files),
    importStatement: `import { ${exportName} } from "${modulePath}"`,
    packages: packageList,
    packageNote: packageNote(packageList, extra.length > 0),
    extraInstall: extra.length > 0 ? `npm install ${extra.join(" ")}` : null,
    tokenImport: TOKEN_IMPORT,
    motionCss: motion.css,
    motionNote: motion.note,
  };
}

function packageNote(packages: string[], hasExtra: boolean): string {
  if (packages.length === 0) return "The source has no package imports. Nothing else to install.";
  const named = `The source imports ${formatList(packages)}.`;
  return hasExtra ? named : `${named} Nothing else to install.`;
}

function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function motionFor(root: string, files: string[]): { css: string | null; note: string | null } {
  const used = new Set<string>();
  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
    for (const match of readFileSync(join(root, file), "utf8").matchAll(/\baui-[a-z0-9-]+\b/g)) {
      used.add(match[0]);
    }
  }
  if (used.size === 0) return { css: null, note: null };

  const css = extractMotionCss(readFileSync(join(root, GLOBALS_FILE), "utf8"));
  const classes = [...used].sort((a, b) => css.indexOf(`.${a}`) - css.indexOf(`.${b}`));
  for (const cls of classes) {
    if (!css.includes(`.${cls}`)) throw new Error(`${GLOBALS_FILE} has no rule for ${cls}`);
  }
  const labels = classes.map((cls) => MOTION_LABEL[cls] ?? cls);
  const verb = labels.length === 1 ? "runs" : "run";
  return { css, note: `Paste these rules into the same file so the ${formatList(labels)} ${verb}.` };
}

/** The caret, spinner and pulse rules, verbatim from globals.css. */
export function extractMotionCss(globals: string): string {
  const start = globals.indexOf("/* Caret while text streams");
  if (start < 0) throw new Error("motion comment missing from globals.css");
  const media = globals.indexOf("@media (prefers-reduced-motion: reduce)", start);
  if (media < 0) throw new Error("reduced-motion block missing from globals.css");
  const open = globals.indexOf("{", media);
  const end = matchingBrace(globals, open);
  return globals.slice(start, end + 1).trim();
}

function matchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error("unbalanced braces in globals.css");
}

type Dir = { dirs: Map<string, Dir>; files: string[] };

/** Box-drawing tree. A single top directory is the header, then its children. */
export function renderTree(paths: string[]): string {
  const root: Dir = { dirs: new Map(), files: [] };
  for (const path of paths) {
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) continue;
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      let next = node.dirs.get(parts[i]);
      if (!next) {
        next = { dirs: new Map(), files: [] };
        node.dirs.set(parts[i], next);
      }
      node = next;
    }
    const file = parts[parts.length - 1];
    if (!node.files.includes(file)) node.files.push(file);
  }

  const top = [...root.dirs.keys()];
  if (top.length === 1 && root.files.length === 0) {
    const name = top[0];
    const child = root.dirs.get(name);
    return [`${name}/`, ...renderChildren(child ?? { dirs: new Map(), files: [] }, "")].join("\n");
  }
  return renderChildren(root, "").join("\n");
}

function renderChildren(node: Dir, prefix: string): string[] {
  const items = [
    ...[...node.dirs.entries()].map(([name, child]) => ({ label: `${name}/`, child, key: name })),
    ...node.files.map((name) => ({ label: name, child: null as Dir | null, key: name })),
  ].sort((a, b) => a.key.localeCompare(b.key) || a.label.localeCompare(b.label));

  const lines: string[] = [];
  items.forEach((item, index) => {
    const last = index === items.length - 1;
    lines.push(`${prefix}${last ? "└── " : "├── "}${item.label}`);
    if (item.child) lines.push(...renderChildren(item.child, `${prefix}${last ? "    " : "│   "}`));
  });
  return lines;
}

/**
 * Static import and re-export specifiers. Comments are ignored. Strings are kept,
 * so a sentence that mentions "from" is not an import.
 */
export function importSpecifiers(source: string): string[] {
  const clean = stripComments(source);
  const specs: string[] = [];
  const statement = /(?:^|\n)\s*(import|export)\b([\s\S]*?);/g;
  for (const match of clean.matchAll(statement)) {
    const body = match[2];
    const from = body.match(/\bfrom\s*["']([^"']+)["']\s*$/);
    if (from) {
      specs.push(from[1]);
      continue;
    }
    const side = body.match(/^\s*["']([^"']+)["']\s*$/);
    if (match[1] === "import" && side) specs.push(side[1]);
  }
  return specs;
}

function stripComments(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (c === "/" && next === "/") {
      i += 2;
      while (i < source.length && source[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      out += c;
      i++;
      while (i < source.length && source[i] !== c) {
        if (source[i] === "\\") {
          out += source[i] + (source[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += source[i];
        i++;
      }
      out += source[i] ?? "";
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function resolveSpecifier(fromRel: string, spec: string, root: string): { kind: "file"; file: string } | { kind: "package"; name: string } {
  if (spec.startsWith(".")) return { kind: "file", file: resolveExisting(join(root, dirname(fromRel), spec), root, spec, fromRel) };
  if (spec.startsWith("@/")) return { kind: "file", file: resolveExisting(join(root, "src", spec.slice(2)), root, spec, fromRel) };
  if (spec.startsWith("node:")) return { kind: "package", name: spec };
  return { kind: "package", name: packageName(spec) };
}

function resolveExisting(absBase: string, root: string, spec: string, fromRel: string): string {
  const candidates = [
    absBase,
    `${absBase}.ts`,
    `${absBase}.tsx`,
    `${absBase}.js`,
    `${absBase}.jsx`,
    `${absBase}.css`,
    join(absBase, "index.ts"),
    join(absBase, "index.tsx"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return repoRelative(root, candidate);
  }
  throw new Error(`Cannot resolve "${spec}" from ${fromRel}`);
}

function repoRelative(root: string, abs: string): string {
  const rel = relative(root, abs);
  if (rel.startsWith("..") || rel.startsWith("/")) throw new Error(`Import resolves outside the repo: ${abs}`);
  return rel.split(sep).join("/");
}

function packageName(spec: string): string {
  if (spec.startsWith("@")) {
    const [scope, name] = spec.split("/");
    if (!scope || !name) throw new Error(`Unexpected package specifier: ${spec}`);
    return `${scope}/${name}`;
  }
  const name = spec.split("/")[0];
  if (!name) throw new Error(`Unexpected package specifier: ${spec}`);
  return name;
}
