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

  it("thinking state reaches the spinner, the check and the warning from the scenario switch", () => {
    const source = read("src/app/components/demos/thinking-state.tsx");
    assert.match(source, /<Segmented/);
    for (const scenario of ["live", "done", "failed"]) {
      assert.match(source, new RegExp(`value: "${scenario}"`), scenario);
    }
    const component = read("src/components/agentic/thinking-state.tsx");
    assert.match(component, /glyph=\{state === "thinking" \? "spinner" : state === "failed" \? "alert" : "check"\}/);
    assert.match(component, /<StatusMorph glyph=\{glyph\}/);
  });

  it("tool call feed reaches the spinner, the check and the warning from its scenario switch", () => {
    const source = read("src/app/components/demos/tool-call-feed.tsx");
    assert.match(source, /<Segmented/);
    assert.match(source, /value: "ok"/);
    assert.match(source, /value: "fail"/);
    const component = read("src/components/agentic/tool-call-feed.tsx");
    assert.match(component, /status === "running" \? "spinner" : status === "done" \? "check" : status === "failed" \? "alert"/);
    assert.match(component, /<StatusMorph glyph=\{glyph\}/);
  });

  it("human override can show both authorships from a scenario switch", () => {
    const source = read("src/app/components/demos/human-override.tsx");
    assert.match(source, /<Segmented/);
    assert.match(source, /value: "agent"/);
    assert.match(source, /value: "human"/);
    assert.match(source, /<HumanOverride/);
  });
});
