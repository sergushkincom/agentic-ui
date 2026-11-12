import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { COMPONENTS } from "../src/lib/registry.ts";
import { DEMO_SOURCE_FILES, demoFilename, demoSource } from "../src/lib/demo-source.ts";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const MARKER: Record<string, string> = {
  "streaming-text": "<StreamingText",
  "thinking-state": "<ThinkingState",
  "confidence-bar": "<ConfidenceBar",
  "human-override": "<HumanOverride",
  "tool-call-feed": "<ToolCallFeed",
  "agent-decision-card": "<AgentDecisionCard",
  "fallback-boundary": "<FallbackBoundary",
};

describe("demo source", () => {
  it("covers every component page and nothing else", () => {
    assert.deepEqual(Object.keys(DEMO_SOURCE_FILES).sort(), COMPONENTS.map((c) => c.slug).sort());
  });

  it("reads the file the live demo imports", () => {
    const registry = read("src/app/components/demos.tsx");
    for (const [slug, entry] of Object.entries(DEMO_SOURCE_FILES)) {
      const onDisk = read(entry.file);
      const shown = demoSource(slug);
      assert.equal(shown.code, onDisk, slug);
      assert.equal(shown.filename, demoFilename(entry.file));
      assert.match(onDisk, new RegExp(`export function ${entry.exportName}\\b`));
      assert.ok(onDisk.includes(MARKER[slug]), `${slug} source is missing ${MARKER[slug]}`);

      const modulePath = `./${entry.file.slice("src/app/components/".length).replace(/\.tsx$/, "")}`;
      assert.match(registry, new RegExp(`import \\{ ${entry.exportName} \\} from "${modulePath}";`));
      assert.match(registry, new RegExp(`"${slug}": ${entry.exportName},`));
      assert.doesNotMatch(registry, new RegExp(`function ${entry.exportName}\\b`));
    }
  });

  it("is what the component page renders, beside the unchanged usage snippet", () => {
    const page = read("src/app/components/[slug]/page.tsx");
    assert.match(page, /const source = demoSource\(c\.slug\);/);
    assert.match(page, /<DemoPanel slug=\{c\.slug\} filename=\{source\.filename\} code=\{source\.code\} \/>/);
    assert.match(
      page,
      /<CodeBlock code=\{`import \{ \$\{c\.name\} \} from "@\/components\/agentic"\\n\\n\$\{c\.usage\}`\} label=\{`\$\{c\.name\} usage`\} \/>/,
    );

    const panel = read("src/app/components/demo-panel.tsx");
    assert.match(panel, /label: "Preview"/);
    assert.match(panel, /label: "Code"/);
    assert.match(panel, /<Demo slug=\{slug\} \/>/);
    assert.match(panel, /<CodeBlock code=\{code\}/);
    assert.match(panel, /\{filename\}/);
  });
});
