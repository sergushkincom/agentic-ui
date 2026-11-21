import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { flattenAnatomy, anatomyFor } from "../src/lib/anatomy.ts";
import { componentMarkdown } from "../src/lib/page-markdown.ts";
import { COMPONENTS } from "../src/lib/registry.ts";
import { shadcnInstallCommand } from "../src/lib/registry-url.ts";

const page = readFileSync(join(process.cwd(), "src/app/components/[slug]/page.tsx"), "utf8");

describe("copy page as markdown", () => {
  it("includes usage, props and accessibility for every component", () => {
    for (const component of COMPONENTS) {
      const markdown = componentMarkdown(component);
      assert.match(markdown, new RegExp(`^# ${component.name}\\n`));
      assert.ok(markdown.includes("## Usage"), component.slug);
      assert.ok(markdown.includes("## Props"), component.slug);
      assert.ok(markdown.includes("## Accessibility"), component.slug);
      assert.ok(markdown.includes(component.usage), component.slug);
      for (const prop of component.props) assert.ok(markdown.includes(`\`${prop.name}\``), `${component.slug} ${prop.name}`);
      for (const note of component.a11y) assert.ok(markdown.includes(note), `${component.slug} a11y`);
      assert.ok(markdown.includes(shadcnInstallCommand(component.slug)), component.slug);

      const anatomy = anatomyFor(component.slug);
      if (anatomy) {
        assert.ok(markdown.includes("## Anatomy"), component.slug);
        for (const part of flattenAnatomy(anatomy)) assert.ok(markdown.includes(`\`${part.name}\``), part.name);
      } else {
        assert.equal(markdown.includes("## Anatomy"), false, component.slug);
      }
    }
  });

  it("is what the copy button on the component page copies", () => {
    assert.match(page, /const markdown = componentMarkdown\(c\);/);
    assert.match(page, /<CopyPageMarkdown markdown=\{markdown\} \/>/);
    const button = readFileSync(join(process.cwd(), "src/components/site/copy-page-markdown.tsx"), "utf8");
    assert.match(button, /Copy page as Markdown/);
  });
});
