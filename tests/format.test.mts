import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clamp01, confidenceBand, countWords, formatDuration, formatPercent } from "../src/components/agentic/format.ts";

describe("confidenceBand", () => {
  it("asks a person below the threshold", () => {
    assert.equal(confidenceBand(0.69, 0.7), "unsure");
    assert.equal(confidenceBand(0.7, 0.7), "fairly-sure");
  });
  it("is sure from 0.85", () => {
    assert.equal(confidenceBand(0.84), "fairly-sure");
    assert.equal(confidenceBand(0.85), "sure");
  });
  it("never says sure below a high threshold", () => {
    assert.equal(confidenceBand(0.88, 0.9), "unsure");
    assert.equal(confidenceBand(0.9, 0.9), "sure");
  });
  it("clamps odd input", () => {
    assert.equal(confidenceBand(-1), "unsure");
    assert.equal(confidenceBand(4), "sure");
    assert.equal(confidenceBand(Number.NaN), "unsure");
  });
});

describe("formatters", () => {
  it("formats percent", () => {
    assert.equal(formatPercent(0.784), "78%");
    assert.equal(clamp01(2), 1);
  });
  it("formats durations", () => {
    assert.equal(formatDuration(420), "0.4s");
    assert.equal(formatDuration(-5), "0.0s");
    assert.equal(formatDuration(6200), "6s");
    assert.equal(formatDuration(65_000), "1m 05s");
  });
  it("counts words", () => {
    assert.equal(countWords("  "), 0);
    assert.equal(countWords("INV-2041 matches PO-7718."), 3);
  });
});
