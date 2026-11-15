import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { THEME_BOOT_SCRIPT, THEME_STORAGE_KEY, parseThemeChoice, themeDataset } from "../src/lib/theme.ts";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

function ruleBody(css: string, selectorAt: number): string {
  const open = css.indexOf("{", selectorAt);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error("unbalanced css");
}

function variables(block: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const match of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) map.set(match[1], match[2].trim());
  return map;
}

describe("theme", () => {
  it("parses the stored choice and maps it to a document attribute", () => {
    assert.equal(parseThemeChoice(null), "system");
    assert.equal(parseThemeChoice("nope"), "system");
    assert.equal(parseThemeChoice("light"), "light");
    assert.equal(parseThemeChoice("dark"), "dark");
    assert.equal(parseThemeChoice("system"), "system");
    assert.equal(themeDataset("system"), null);
    assert.equal(themeDataset("light"), "light");
    assert.equal(themeDataset("dark"), "dark");
    assert.match(THEME_BOOT_SCRIPT, new RegExp(THEME_STORAGE_KEY));
    assert.match(THEME_BOOT_SCRIPT, /t==="light"\|\|t==="dark"/);
    assert.doesNotMatch(THEME_BOOT_SCRIPT, /data-theme",\s*"system"/);
  });

  it("makes an explicit choice win over the system palette with the same tokens", () => {
    const css = read("src/app/tokens.css");
    const light = variables(ruleBody(css, css.indexOf(":root {")));
    const mediaBody = ruleBody(css, css.indexOf("@media (prefers-color-scheme: dark)"));
    const dark = variables(ruleBody(mediaBody, mediaBody.indexOf(":root {")));
    const explicitLightBody = ruleBody(css, css.indexOf(':root[data-theme="light"]'));
    const explicitDarkBody = ruleBody(css, css.indexOf(':root[data-theme="dark"]'));
    const explicitLight = variables(explicitLightBody);
    const explicitDark = variables(explicitDarkBody);

    assert.match(explicitLightBody, /color-scheme:\s*light/);
    assert.match(explicitDarkBody, /color-scheme:\s*dark/);

    for (const [name, darkValue] of dark) {
      const lightValue = light.get(name);
      assert.ok(lightValue, name);
      if (lightValue === darkValue) continue;
      assert.equal(explicitLight.get(name), lightValue, name);
      assert.equal(explicitDark.get(name), darkValue, name);
    }
  });

  it("boots from the root layout and the header renders the toggle", () => {
    const layout = read("src/app/layout.tsx");
    assert.match(layout, /suppressHydrationWarning/);
    assert.match(layout, /dangerouslySetInnerHTML=\{\{ __html: THEME_BOOT_SCRIPT \}\}/);
    const scriptAt = layout.indexOf("THEME_BOOT_SCRIPT");
    const headerAt = layout.indexOf("<SiteHeader />");
    assert.ok(scriptAt > -1 && scriptAt < headerAt);
    const header = read("src/components/site/site-header.tsx");
    assert.match(header, /<ThemeToggle \/>/);
    const toggle = read("src/components/site/theme-toggle.tsx");
    assert.match(toggle, /aria-label="Theme"/);
    assert.match(toggle, /localStorage/);
  });
});
