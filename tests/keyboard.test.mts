import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextEnabledIndex } from "../src/components/agentic/keyboard.ts";
import { KEYBOARD, keyboardFor } from "../src/lib/keyboard-interactions.ts";
import { COMPONENTS } from "../src/lib/registry.ts";

const open = () => false;

describe("nextEnabledIndex", () => {
  it("moves down and wraps to the first", () => {
    assert.equal(nextEnabledIndex(0, 4, "ArrowDown", open), 1);
    assert.equal(nextEnabledIndex(3, 4, "ArrowDown", open), 0);
  });

  it("moves up and wraps to the last", () => {
    assert.equal(nextEnabledIndex(2, 4, "ArrowUp", open), 1);
    assert.equal(nextEnabledIndex(0, 4, "ArrowUp", open), 3);
  });

  it("jumps to the ends", () => {
    assert.equal(nextEnabledIndex(2, 4, "Home", open), 0);
    assert.equal(nextEnabledIndex(1, 4, "End", open), 3);
  });

  it("skips disabled rows, including across the wrap", () => {
    const disabled = (index: number) => index === 1 || index === 2;
    assert.equal(nextEnabledIndex(0, 4, "ArrowDown", disabled), 3);
    assert.equal(nextEnabledIndex(3, 4, "ArrowDown", disabled), 0);
    assert.equal(nextEnabledIndex(3, 4, "ArrowUp", disabled), 0);
    assert.equal(nextEnabledIndex(2, 4, "Home", disabled), 0);
    assert.equal(nextEnabledIndex(0, 4, "End", disabled), 3);
  });

  it("stays on the only enabled row", () => {
    assert.equal(nextEnabledIndex(1, 3, "ArrowDown", (index) => index !== 1), 1);
    assert.equal(nextEnabledIndex(1, 3, "Home", (index) => index !== 1), 1);
  });

  it("returns null when the key is not list navigation, or nothing can be focused", () => {
    assert.equal(nextEnabledIndex(0, 4, "Enter", open), null);
    assert.equal(nextEnabledIndex(0, 4, " ", open), null);
    assert.equal(nextEnabledIndex(0, 4, "Escape", open), null);
    assert.equal(nextEnabledIndex(0, 4, "ArrowLeft", open), null);
    assert.equal(nextEnabledIndex(0, 4, "Tab", open), null);
    assert.equal(nextEnabledIndex(0, 0, "ArrowDown", open), null);
    assert.equal(nextEnabledIndex(0, 3, "ArrowDown", () => true), null);
    assert.equal(nextEnabledIndex(0, 3, "Home", () => true), null);
    assert.equal(nextEnabledIndex(0, 3, "End", () => true), null);
  });
});

const KEYS = new Set(["Enter", "Space", "Escape", "Arrow Up", "Arrow Down", "Home", "End", "Tab", "Shift + Tab", "None"]);

/** Keys the demo actually performs. A listed key that is not here is a docs bug. */
const HANDLED: Record<string, string[]> = {
  "streaming-text": ["Enter", "Space", "Escape"],
  "agent-harness": ["None"],
  "thinking-state": ["Enter", "Space"],
  "run-log": ["Enter", "Space", "Arrow Down", "Arrow Up", "Home", "End", "Tab", "Shift + Tab"],
  "run-history": ["Enter", "Space", "Arrow Down", "Arrow Up", "Home", "End", "Tab", "Shift + Tab"],
  "run-chat": ["Enter", "Space"],
  "confidence-bar": ["None"],
  "human-override": ["Enter", "Space", "Escape"],
  "tool-call-feed": ["Enter", "Space", "Arrow Down", "Arrow Up", "Home", "End", "Tab", "Shift + Tab"],
  "run-node": ["None"],
  "run-graph": ["Enter", "Space"],
  "step-picker": ["Arrow Down", "Arrow Up", "Home", "End", "Enter", "Escape"],
  "agent-decision-card": ["Enter", "Space"],
  "wait-for-person": ["Enter", "Space", "Escape"],
  "connection-picker": ["Enter", "Space", "Escape", "Arrow Down", "Arrow Up", "Home", "End", "Tab", "Shift + Tab"],
  "fallback-boundary": ["Enter", "Space"],
  "step-error": ["Enter", "Space"],
};

describe("keyboard interactions table", () => {
  it("has one table per component and no extra slugs", () => {
    assert.deepEqual(Object.keys(KEYBOARD).sort(), COMPONENTS.map((component) => component.slug).sort());
    for (const component of COMPONENTS) {
      const rows = keyboardFor(component.slug);
      assert.deepEqual(
        rows.map((row) => row.key),
        HANDLED[component.slug],
        component.slug,
      );
      const seen = new Set<string>();
      for (const row of rows) {
        assert.ok(KEYS.has(row.key), row.key);
        assert.equal(seen.has(row.key), false, `${component.slug} lists ${row.key} twice`);
        seen.add(row.key);
        assert.ok(row.action.trim().length > 10, `${component.slug} ${row.key}`);
      }
    }
  });

  it("refuses a component with no table", () => {
    assert.throws(() => keyboardFor("not-a-component"), /not-a-component/);
  });
});
