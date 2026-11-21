import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { llmsTxt } from "../src/lib/llms.ts";
import { COMPONENTS } from "../src/lib/registry.ts";
import { SITE_ORIGIN } from "../src/lib/site.ts";
import { AGENT_RUN_DESCRIPTION, sitePages } from "../src/lib/site-pages.ts";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

describe("llms.txt", () => {
  it("covers every registry page and the other site pages", () => {
    const text = llmsTxt();
    assert.match(text, /^# agentic-ui\n/);
    for (const page of sitePages()) {
      const url = page.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${page.path}`;
      assert.ok(text.includes(url), url);
      assert.ok(text.includes(page.title), page.title);
    }
    for (const component of COMPONENTS) {
      assert.ok(text.includes(`${SITE_ORIGIN}/components/${component.slug}`), component.slug);
      assert.ok(text.includes(`${SITE_ORIGIN}/r/${component.slug}.json`), component.slug);
    }
    assert.equal(sitePages().filter((page) => page.path.startsWith("/components/")).length, COMPONENTS.length);
  });

  it("is what the /llms.txt route serves", () => {
    const route = read("src/app/llms.txt/route.ts");
    assert.match(route, /llmsTxt\(\)/);
    assert.match(route, /text\/plain/);
  });

  it("keeps the agent run description in step with its page", () => {
    const page = read("src/app/examples/agent-run/page.tsx");
    assert.ok(page.includes(AGENT_RUN_DESCRIPTION));
  });
});
