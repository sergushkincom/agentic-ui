import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { COMPONENTS, getComponent } from "../src/lib/registry.ts";
import { WHEN_TO_USE, insteadSentence, whenFor } from "../src/lib/when-to-use.ts";

/** Pairs the docs call out. Each page points at the other. */
const PAIRS = [
  ["thinking-state", "streaming-text"],
  ["agent-decision-card", "human-override"],
  ["tool-call-feed", "thinking-state"],
] as const;

describe("when to use", () => {
  it("covers every component page and no extra slugs", () => {
    assert.equal(COMPONENTS.length, 7);
    assert.deepEqual(Object.keys(WHEN_TO_USE).sort(), COMPONENTS.map((component) => component.slug).sort());
  });

  it("gives each page Use when guidance and at least one Use X instead when", () => {
    for (const component of COMPONENTS) {
      const guide = whenFor(component.slug);
      assert.ok(guide.useWhen.length >= 1 && guide.useWhen.length <= 3, component.slug);
      assert.ok(guide.instead.length >= 1 && guide.instead.length <= 3, component.slug);

      for (const item of guide.useWhen) {
        assert.ok(item.trim().length > 20, `${component.slug} use when`);
        assert.match(item, /\.$/, `${component.slug} use when ends with a period`);
      }

      const seen = new Set<string>();
      for (const item of guide.instead) {
        assert.equal(seen.has(item.slug), false, `${component.slug} lists ${item.slug} twice`);
        seen.add(item.slug);
        assert.notEqual(item.slug, component.slug, component.slug);
        const alt = getComponent(item.slug);
        assert.ok(alt, item.slug);
        assert.match(item.when, /^[a-z]/, `${component.slug} → ${item.slug}`);
        assert.match(item.when, /\.$/, `${component.slug} → ${item.slug}`);
        assert.match(insteadSentence(alt.name, item.when), /^Use \S+ instead when .+\.$/);
      }
    }
  });

  it("compares the close pairs in both directions", () => {
    for (const [left, right] of PAIRS) {
      assert.ok(
        whenFor(left).instead.some((item) => item.slug === right),
        `${left} → ${right}`,
      );
      assert.ok(
        whenFor(right).instead.some((item) => item.slug === left),
        `${right} → ${left}`,
      );
    }
  });

  it("is rendered on the shared component page", () => {
    const page = readFileSync(new URL("../src/app/components/[slug]/page.tsx", import.meta.url), "utf8");
    const section = readFileSync(new URL("../src/components/site/when-to-use.tsx", import.meta.url), "utf8");
    assert.match(page, /<WhenToUse slug=\{c\.slug\} \/>/);
    assert.match(section, /When to use/);
    assert.match(section, /Use when/);
    assert.match(section, /instead when/);
  });
});
