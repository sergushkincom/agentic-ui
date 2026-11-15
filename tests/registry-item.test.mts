import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { filesToCopy } from "../src/lib/copy-files.ts";
import { COMPONENTS } from "../src/lib/registry.ts";
import { REGISTRY_ITEM_SCHEMA, registryItem, registryItemSchemaProblems } from "../src/lib/registry-item.ts";
import { shadcnInstallCommand } from "../src/lib/registry-url.ts";
import { SITE_ORIGIN } from "../src/lib/site.ts";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("shadcn registry item", () => {
  it("rejects an item that misses the schema", () => {
    const problems = registryItemSchemaProblems({ name: "", type: "registry:nope", files: [{ path: "", type: "registry:file" }] });
    assert.ok(problems.includes("name"));
    assert.ok(problems.includes("type"));
    assert.ok(problems.some((problem) => problem.includes("target")));
  });

  it("matches the registry-item schema and reads file contents from the component sources", () => {
    const globals = read("src/app/globals.css");
    for (const component of COMPONENTS) {
      const item = registryItem(component.slug);
      assert.ok(item);
      assert.deepEqual(registryItemSchemaProblems(item), [], component.slug);
      assert.equal(item.$schema, REGISTRY_ITEM_SCHEMA);
      assert.equal(item.name, component.slug);
      assert.equal(item.type, "registry:component");
      assert.equal(item.title, component.name);
      assert.equal(item.description, component.summary);

      const manifest = filesToCopy(component.file, component.name);
      const byPath = new Map(item.files.map((file) => [file.path, file]));
      for (const path of manifest.files) {
        const file = byPath.get(path);
        assert.ok(file, `${component.slug} missing ${path}`);
        assert.equal(file.content, read(path), path);
        if (path.endsWith(".css")) {
          assert.equal(file.type, "registry:file");
          assert.equal(file.target, path);
        } else {
          const base = path.slice(path.lastIndexOf("/") + 1);
          assert.equal(file.type, path.endsWith(".tsx") ? "registry:component" : "registry:lib");
          assert.equal(file.target, `@components/agentic/${base}`);
        }
      }

      const motion = byPath.get("src/app/agentic-motion.css");
      if (manifest.motionCss) {
        assert.ok(motion, component.slug);
        assert.equal(motion.content, manifest.motionCss);
        assert.equal(globals.includes(motion.content), true);
        assert.equal(motion.type, "registry:file");
        assert.equal(motion.target, "src/app/agentic-motion.css");
      } else {
        assert.equal(motion, undefined, component.slug);
      }

      assert.equal(item.files.some((file) => file.content.length === 0), false);
      assert.equal("dependencies" in item, false, component.slug);
      assert.equal(shadcnInstallCommand(component.slug), `npx shadcn add ${SITE_ORIGIN}/r/${component.slug}.json`);
    }
  });

  it("is what /r/[name].json serves, and the page shows the install line", () => {
    const route = read("src/app/r/[name]/route.ts");
    assert.match(route, /registryItem\(slug\)/);
    assert.match(route, /name\.endsWith\("\.json"\)/);
    const page = read("src/app/components/[slug]/page.tsx");
    assert.match(page, /installCommand=\{shadcnInstallCommand\(c\.slug\)\}/);
    const ui = read("src/components/site/files-to-copy.tsx");
    assert.match(ui, /Install with shadcn/);
    assert.match(ui, /installCommand/);
  });
});
