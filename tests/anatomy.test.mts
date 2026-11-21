import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { ANATOMY, flattenAnatomy, type AnatomyNode } from "../src/lib/anatomy.ts";
import { COMPONENTS } from "../src/lib/registry.ts";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

function declaredComponents(source: string): string[] {
  return [...source.matchAll(/(?:^|\n)(?:export )?function ([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]);
}

function renderedComponents(source: string): string[] {
  // JSX only. A generic such as querySelectorAll<HTMLButtonElement> is preceded by a word character.
  return [...new Set([...source.matchAll(/(?<![A-Za-z0-9])<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]))];
}

/** Body of `function Name`, after its parameter list. Skips braces inside strings or comments. */
function functionBody(source: string, name: string): string {
  const start = source.search(new RegExp(`function ${name}\\b`));
  if (start < 0) throw new Error(`no function ${name}`);
  const paren = source.indexOf("(", start);
  let parenDepth = 0;
  let cursor = paren;
  while (cursor < source.length) {
    const c = source[cursor];
    if (c === '"' || c === "'" || c === "`") {
      cursor++;
      while (cursor < source.length && source[cursor] !== c) {
        if (source[cursor] === "\\") cursor += 2;
        else cursor++;
      }
      cursor++;
      continue;
    }
    if (c === "(") parenDepth++;
    else if (c === ")") {
      parenDepth--;
      if (parenDepth === 0) break;
    }
    cursor++;
  }
  const open = source.indexOf("{", cursor);
  let depth = 0;
  let i = open;
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
      i++;
      while (i < source.length && source[i] !== c) {
        if (source[i] === "\\") i += 2;
        else i++;
      }
      i++;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
    i++;
  }
  throw new Error(`unbalanced function ${name}`);
}

function isDeclared(source: string, name: string): boolean {
  return new RegExp(`function ${name}\\b`).test(source);
}

function walk(nodes: readonly AnatomyNode[], ancestors: string[], visit: (node: AnatomyNode, ancestors: string[]) => void) {
  for (const node of nodes) {
    visit(node, ancestors);
    if (node.children?.length) walk(node.children, [...ancestors, node.name], visit);
  }
}

describe("anatomy", () => {
  it("covers the composed components and nothing else", () => {
    assert.deepEqual(Object.keys(ANATOMY).sort(), ["agent-decision-card", "run-chat", "run-log", "tool-call-feed"]);
    for (const slug of Object.keys(ANATOMY)) {
      assert.ok(COMPONENTS.some((component) => component.slug === slug));
    }
  });

  it("uses part names the source declares or renders, in the function that draws them", () => {
    for (const [slug, nodes] of Object.entries(ANATOMY)) {
      const component = COMPONENTS.find((item) => item.slug === slug);
      assert.ok(component);
      const file = `src/components/agentic/${component.file}`;
      const source = read(file);
      const parts = flattenAnatomy(nodes);
      const names = new Set(parts.map((part) => part.name));

      for (const name of [...declaredComponents(source), ...renderedComponents(source)]) {
        assert.ok(names.has(name), `${slug} anatomy is missing ${name}`);
      }

      for (const part of parts) {
        assert.match(part.answers, /\?$/, `${slug} ${part.name}`);
        assert.match(source, new RegExp(`\\b${part.name}\\b`), part.name);
      }

      walk(nodes, [], (node, ancestors) => {
        const owner = [...ancestors, node.name].reverse().find((name) => isDeclared(source, name));
        assert.ok(owner, `${node.name} has no function in ${file}`);
        if (node.name === owner) return;
        const body = functionBody(source, owner);
        const pattern = /^[A-Z]/.test(node.name) ? `<${node.name}\\b` : `\\b${node.name}\\b`;
        assert.match(body, new RegExp(pattern), `${node.name} is not drawn by ${owner}`);
      });
    }
  });

  it("is a section on the component page, between the design question and when to use", () => {
    const page = read("src/app/components/[slug]/page.tsx");
    const question = page.indexOf('id="question"');
    const anatomy = page.indexOf("<Anatomy slug={c.slug} />");
    const when = page.indexOf("<WhenToUse slug={c.slug} />");
    assert.ok(question > -1 && anatomy > question && when > anatomy);
    const ui = read("src/components/site/anatomy.tsx");
    assert.match(ui, /if \(!nodes\) return null/);
    assert.match(ui, /id="anatomy"/);
  });
});
