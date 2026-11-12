import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COMPONENTS, MOMENTS, componentsIn } from "../src/lib/registry.ts";

describe("component moments", () => {
  it("puts every component in exactly one moment", () => {
    const grouped = MOMENTS.flatMap((m) => componentsIn(m.id).map((c) => c.slug));
    assert.deepEqual([...grouped].sort(), COMPONENTS.map((c) => c.slug).sort());
    assert.equal(new Set(grouped).size, grouped.length);
  });

  it("keeps the index reading order", () => {
    assert.deepEqual(
      MOMENTS.map((m) => [m.label, componentsIn(m.id).map((c) => c.name)]),
      [
        ["While it works", ["StreamingText", "ThinkingState", "ToolCallFeed"]],
        ["How sure it is", ["ConfidenceBar"]],
        ["Where you step in", ["HumanOverride", "AgentDecisionCard"]],
        ["When it fails", ["FallbackBoundary"]],
      ],
    );
  });
});
