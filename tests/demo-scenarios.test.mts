import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("demo scenario controls", () => {
  it("streaming text can show streaming, done and stopped without waiting for the timer", () => {
    const source = read("src/app/components/demos/streaming-text.tsx");
    assert.match(source, /<Segmented/);
    for (const status of ["streaming", "done", "stopped"]) {
      assert.match(source, new RegExp(`value: "${status}"`), status);
    }
  });

  it("human override can show both authorships from a scenario switch", () => {
    const source = read("src/app/components/demos/human-override.tsx");
    assert.match(source, /<Segmented/);
    assert.match(source, /value: "agent"/);
    assert.match(source, /value: "human"/);
    assert.match(source, /<HumanOverride/);
  });
});
