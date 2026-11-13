import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { COMPONENTS } from "../src/lib/registry.ts";
import {
  REACT_TAILWIND_NOTE,
  TOKEN_IMPORT,
  extractMotionCss,
  filesToCopy,
  importSpecifiers,
  renderTree,
} from "../src/lib/copy-files.ts";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const TOKENS = "src/app/tokens.css";

/**
 * Expected closure, written out so a review can see the list.
 * The tests below also re-walk the sources and require this table to match.
 */
const EXPECTED: Record<string, { files: string[]; packages: string[] }> = {
  "streaming-text": {
    files: [
      TOKENS,
      "src/components/agentic/format.ts",
      "src/components/agentic/marks.tsx",
      "src/components/agentic/streaming-text.tsx",
    ],
    packages: [],
  },
  "thinking-state": {
    files: [
      TOKENS,
      "src/components/agentic/format.ts",
      "src/components/agentic/marks.tsx",
      "src/components/agentic/thinking-state.tsx",
    ],
    packages: ["react"],
  },
  "confidence-bar": {
    files: [TOKENS, "src/components/agentic/confidence-bar.tsx", "src/components/agentic/format.ts"],
    packages: [],
  },
  "human-override": {
    files: [TOKENS, "src/components/agentic/human-override.tsx", "src/components/agentic/marks.tsx"],
    packages: ["react"],
  },
  "tool-call-feed": {
    files: [
      TOKENS,
      "src/components/agentic/format.ts",
      "src/components/agentic/keyboard.ts",
      "src/components/agentic/marks.tsx",
      "src/components/agentic/tool-call-feed.tsx",
    ],
    packages: ["react"],
  },
  "agent-decision-card": {
    files: [
      TOKENS,
      "src/components/agentic/agent-decision-card.tsx",
      "src/components/agentic/confidence-bar.tsx",
      "src/components/agentic/format.ts",
      "src/components/agentic/marks.tsx",
    ],
    packages: ["react"],
  },
  "fallback-boundary": {
    files: [TOKENS, "src/components/agentic/fallback-boundary.tsx", "src/components/agentic/marks.tsx"],
    packages: ["react"],
  },
};

function specifiersIn(source: string): string[] {
  return [...source.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map((match) => match[1]);
}

function resolveImport(fromRel: string, spec: string): string {
  if (spec.startsWith(".")) {
    const base = join(dirname(fromRel), spec);
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.css`]) {
      if (existsSync(join(root, candidate))) return candidate;
    }
  }
  if (spec.startsWith("@/")) {
    const base = join("src", spec.slice(2));
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.css`]) {
      if (existsSync(join(root, candidate))) return candidate;
    }
  }
  throw new Error(`test walker cannot resolve "${spec}" from ${fromRel}`);
}

function packageName(spec: string): string {
  if (spec.startsWith("@")) {
    const [scope, name] = spec.split("/");
    return `${scope}/${name}`;
  }
  return spec.split("/")[0];
}

/** Independent walk: every `from "..."` in the closure, not the docs parser. */
function walk(entry: string): { files: string[]; packages: string[] } {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const rel = queue.pop();
    if (!rel || files.has(rel)) continue;
    files.add(rel);
    for (const spec of specifiersIn(read(rel))) {
      if (spec.startsWith(".") || spec.startsWith("@/")) queue.push(resolveImport(rel, spec));
      else if (!spec.startsWith("node:")) packages.add(packageName(spec));
    }
  }
  return {
    files: [...files].sort((a, b) => a.localeCompare(b)),
    packages: [...packages].sort((a, b) => a.localeCompare(b)),
  };
}

describe("import specifiers", () => {
  it("reads multiline, type and re-export specifiers, and ignores the word from in code", () => {
    const source = `
import { useState } from "react";
import {
  AgentMark,
  type HumanMark,
} from "./marks";
import type { ReactNode } from "react";
export { ConfidenceBar } from "./confidence-bar";
import "./theme.css";
export function Example() {
  const label = "shipped from \\"react\\"";
  return label;
}
`;
    assert.deepEqual(importSpecifiers(source), ["react", "./marks", "react", "./confidence-bar", "./theme.css"]);
  });

  it("matches a plain from-scan on every library file", () => {
    const dir = join(root, "src/components/agentic");
    for (const name of readdirSync(dir)) {
      const source = read(`src/components/agentic/${name}`);
      assert.deepEqual(importSpecifiers(source), specifiersIn(source), name);
      assert.doesNotMatch(source, /\bimport\s*\(/, name);
    }
  });
});

describe("files to copy", () => {
  it("covers every component and nothing else", () => {
    assert.deepEqual(Object.keys(EXPECTED).sort(), COMPONENTS.map((c) => c.slug).sort());
  });

  it("is the import closure plus tokens.css", () => {
    for (const component of COMPONENTS) {
      const manifest = filesToCopy(component.file, component.name);
      const expected = EXPECTED[component.slug];
      const closure = walk(`${"src/components/agentic"}/${component.file}`);

      assert.deepEqual(manifest.files, expected.files, component.slug);
      assert.deepEqual(manifest.packages, expected.packages, component.slug);
      assert.deepEqual(
        manifest.files.filter((file) => file !== TOKENS),
        closure.files,
        component.slug,
      );
      assert.deepEqual(manifest.packages, closure.packages, component.slug);
      assert.equal(manifest.files.includes(TOKENS), true);
      assert.equal(manifest.files.includes("src/components/agentic/index.ts"), false);

      for (const file of manifest.files) assert.equal(existsSync(join(root, file)), true, file);
      assert.match(read(`src/components/agentic/${component.file}`), new RegExp(`export (?:function|class) ${component.name}\\b`));
      assert.equal(manifest.importStatement, `import { ${component.name} } from "@/components/agentic/${component.file.replace(/\.tsx$/, "")}"`);
      assert.equal(manifest.tokenImport, TOKEN_IMPORT);
      assert.equal(manifest.extraInstall, null, component.slug);
      assert.match(manifest.tree, /^src\/\n├── app\/\n│   └── tokens\.css\n└── components\/\n {4}└── agentic\/\n/);
      for (const file of manifest.files) {
        assert.ok(manifest.tree.includes(file.slice(file.lastIndexOf("/") + 1)), `${component.slug} tree missing ${file}`);
      }
    }
  });

  it("names the packages the source actually imports", () => {
    const bar = filesToCopy("confidence-bar.tsx", "ConfidenceBar");
    assert.equal(bar.packageNote, "The source has no package imports. Nothing else to install.");
    assert.equal(bar.motionCss, null);
    assert.equal(bar.motionNote, null);

    const card = filesToCopy("agent-decision-card.tsx", "AgentDecisionCard");
    assert.equal(card.packageNote, "The source imports react. Nothing else to install.");
    assert.match(card.motionNote ?? "", /spinner/);
    assert.ok(card.files.includes("src/components/agentic/confidence-bar.tsx"));

    const feed = filesToCopy("tool-call-feed.tsx", "ToolCallFeed");
    assert.ok(feed.files.includes("src/components/agentic/keyboard.ts"));
  });

  it("pastes motion rules only when the copied files use them, verbatim from globals.css", () => {
    const globals = read("src/app/globals.css");
    const motion = extractMotionCss(globals);
    assert.equal(globals.includes(motion), true);
    assert.match(motion, /^\s*\/\* Caret while text streams/);
    assert.match(motion, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.aui-caret/);

    for (const component of COMPONENTS) {
      const manifest = filesToCopy(component.file, component.name);
      const classes = new Set<string>();
      for (const file of manifest.files) {
        if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
        for (const match of read(file).matchAll(/\baui-[a-z0-9-]+\b/g)) classes.add(match[0]);
      }
      if (classes.size === 0) {
        assert.equal(manifest.motionCss, null, component.slug);
        continue;
      }
      assert.equal(manifest.motionCss, motion, component.slug);
      for (const cls of classes) assert.match(manifest.motionCss ?? "", new RegExp(`\\.${cls}\\b`), cls);
    }
  });

  it("only uses CSS variables defined in tokens.css", () => {
    const defined = new Set([...read(TOKENS).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
    for (const component of COMPONENTS) {
      for (const file of filesToCopy(component.file, component.name).files) {
        if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
        for (const match of read(file).matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
          assert.ok(defined.has(match[1]), `${file} uses ${match[1]}`);
        }
      }
    }
  });

  it("prints a directory tree", () => {
    assert.equal(
      renderTree([
        "src/components/agentic/marks.tsx",
        "src/app/tokens.css",
        "src/components/agentic/format.ts",
        "src/components/agentic/streaming-text.tsx",
      ]),
      [
        "src/",
        "├── app/",
        "│   └── tokens.css",
        "└── components/",
        "    └── agentic/",
        "        ├── format.ts",
        "        ├── marks.tsx",
        "        └── streaming-text.tsx",
      ].join("\n"),
    );
  });
});

describe("component page", () => {
  it("renders the computed manifest between usage and props", () => {
    const page = read("src/app/components/[slug]/page.tsx");
    const usage = page.indexOf('id="usage"');
    const files = page.indexOf("<FilesToCopy manifest={copy} />");
    const props = page.indexOf('id="props"');
    assert.ok(usage > -1 && files > usage && props > files);
    assert.match(page, /const copy = filesToCopy\(c\.file, c\.name\);/);

    const ui = read("src/components/site/files-to-copy.tsx");
    assert.match(ui, /REACT_TAILWIND_NOTE/);
    assert.equal(REACT_TAILWIND_NOTE, "Needs React 19 and Tailwind CSS 4.");
    assert.match(ui, /manifest\.tree/);
    assert.match(ui, /manifest\.importStatement/);
    assert.match(ui, /manifest\.packageNote/);
    assert.match(ui, /manifest\.extraInstall/);
    assert.match(ui, /manifest\.tokenImport/);
    assert.match(ui, /manifest\.motionCss/);
    assert.match(ui, /aria-labelledby="files"/);
  });
});
