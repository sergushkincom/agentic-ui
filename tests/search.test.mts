import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { COMPONENTS } from "../src/lib/registry.ts";
import { SEARCH_ITEMS, filterSearch } from "../src/lib/search-index.ts";
import { sitePages } from "../src/lib/site-pages.ts";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

describe("search", () => {
  it("indexes every page and every prop", () => {
    for (const page of sitePages()) {
      assert.ok(SEARCH_ITEMS.some((item) => item.group === "Pages" && item.href === page.path), page.path);
    }
    for (const component of COMPONENTS) {
      for (const prop of component.props) {
        const hits = filterSearch(SEARCH_ITEMS, prop.name).filter((item) => item.href === `/components/${component.slug}#props`);
        assert.ok(hits.some((item) => item.title === prop.name), `${component.slug} ${prop.name}`);
      }
    }
  });

  it("filters pages and props, and an empty query returns the whole index", () => {
    assert.equal(filterSearch(SEARCH_ITEMS, "   ").length, SEARCH_ITEMS.length);
    const ask = filterSearch(SEARCH_ITEMS, "askBelow");
    assert.ok(ask.some((item) => item.href === "/components/confidence-bar#props"));
    const card = filterSearch(SEARCH_ITEMS, "AgentDecisionCard");
    assert.ok(card.some((item) => item.href === "/components/agent-decision-card"));
    assert.equal(filterSearch(SEARCH_ITEMS, "not-a-real-prop-zz").length, 0);
  });

  it("is a dialog the header can open from the keyboard", () => {
    const header = read("src/components/site/site-header.tsx");
    assert.match(header, /<CommandMenu \/>/);
    const menu = read("src/components/site/command-menu.tsx");
    assert.match(menu, /event\.metaKey \|\| event\.ctrlKey/);
    assert.match(menu, /Escape/);
    assert.match(menu, /role="dialog"/);
    assert.match(menu, /aria-modal="true"/);
    assert.match(menu, /aria-activedescendant/);
  });
});
