import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { llmsTxt } from "../src/lib/llms.ts";
import { LICENSE_HREF, LICENSE_NAME, PLATFORMS, platformStatusLabel } from "../src/lib/platforms.ts";
import { COMPONENTS, REPO, startHere } from "../src/lib/registry.ts";
import { REGISTRY_SCHEMA, registryIndex, registryIndexSchemaProblems } from "../src/lib/registry-index.ts";
import { shadcnInstallCommand } from "../src/lib/registry-url.ts";
import { SITE_ORIGIN } from "../src/lib/site.ts";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

describe("shadcn registry index", () => {
  it("rejects an index that misses the schema", () => {
    const problems = registryIndexSchemaProblems({ name: "", homepage: "", items: [{ name: "", type: "registry:nope" }] });
    assert.ok(problems.includes("name"));
    assert.ok(problems.includes("homepage"));
    assert.ok(problems.some((problem) => problem.includes("type")));
  });

  it("lists every component from the registry, in that order, with no file contents", () => {
    const index = registryIndex();
    assert.deepEqual(registryIndexSchemaProblems(index), []);
    assert.equal(index.$schema, REGISTRY_SCHEMA);
    assert.equal(index.name, "agentic-ui");
    assert.equal(index.homepage, SITE_ORIGIN);
    assert.equal(index.items.length, COMPONENTS.length);
    assert.equal(index.items.length, 20);
    index.items.forEach((item, position) => {
      const component = COMPONENTS[position];
      assert.equal(item.name, component.slug);
      assert.equal(item.type, "registry:component");
      assert.equal(item.title, component.name);
      assert.equal(item.description, component.summary);
      assert.deepEqual(item.files, [
        { path: `src/components/agentic/${component.file}`, type: "registry:component" },
      ]);
      assert.equal("content" in item.files[0], false);
    });
  });

  it("is what /r/registry.json serves", () => {
    const route = read("src/app/r/registry.json/route.ts");
    assert.match(route, /registryIndex\(\)/);
    assert.match(route, /Response\.json/);
    const text = llmsTxt();
    assert.ok(text.includes(`${SITE_ORIGIN}/r/registry.json`));
  });
});

describe("component page header", () => {
  it("names React as available and the other platforms as soon, with no links on soon", () => {
    assert.deepEqual(
      PLATFORMS.map((platform) => [platform.name, platformStatusLabel(platform.status)]),
      [
        ["React", "Available"],
        ["SwiftUI", "Soon"],
        ["React Native", "Soon"],
      ],
    );
    assert.equal(PLATFORMS.filter((platform) => platform.status === "available").length, 1);
    for (const platform of PLATFORMS) assert.equal("href" in platform, false);

    assert.equal(LICENSE_NAME, "MIT");
    assert.equal(LICENSE_HREF, `${REPO}/blob/main/LICENSE`);

    const badges = read("src/components/site/platform-badges.tsx");
    assert.equal(badges.includes("next/link"), false);
    assert.match(badges, /PLATFORMS\.map/);
    assert.match(badges, /LICENSE_HREF/);
    assert.match(badges, /aria-label="Platforms"/);
    assert.match(badges, /aria-label=\{`\$\{LICENSE_NAME\} license`\}/);

    const page = read("src/app/components/[slug]/page.tsx");
    const badgesAt = page.indexOf("<PlatformBadges />");
    const commandAt = page.indexOf('layout="command"');
    const demoAt = page.indexOf('id="demo"');
    assert.ok(badgesAt > -1 && commandAt > badgesAt && demoAt > commandAt);
    assert.equal(page.match(/shadcnInstallCommand\(c\.slug\)/g)?.length, 2);
  });
});

describe("home and readme", () => {
  it("starts with the six featured components and installs with shadcn", () => {
    assert.deepEqual(
      startHere().map((component) => component.name),
      ["RunGraph", "WaitForPerson", "AgentDecisionCard", "ThinkingState", "ToolCallFeed", "RunChat"],
    );
    const home = read("src/app/page.tsx");
    assert.match(home, /startHere\(\)/);
    assert.match(home, /id="start-here"/);
    assert.match(home, /shadcnInstallCommand\("confidence-bar"\)/);
    assert.equal(home.includes("cp -r"), false);

    const readme = read("README.md");
    for (const component of COMPONENTS) {
      assert.ok(readme.includes(`\`${component.name}\``), component.name);
      assert.ok(readme.includes(component.question), component.slug);
    }
    assert.ok(readme.includes(shadcnInstallCommand("confidence-bar")));
    assert.ok(readme.includes("https://github.com/guillermolg00/morphicons"));
    assert.equal(readme.includes("cp -r"), false);
  });
});
