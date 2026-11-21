import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { COMPONENTS } from "../src/lib/registry.ts";
import {
  SETTLED,
  SMOOTH_DAMPING,
  SMOOTH_STIFFNESS,
  arcPath,
  glyphGeometry,
  lerpRgb,
  parseCssColor,
  planStatusMorph,
  sampleStatusMorph,
  smoothSpringProgress,
  type GlyphGeom,
  type StatusGlyph,
} from "../src/components/agentic/stroke-morph.ts";

const root = process.cwd();

function maxGap(a: Float64Array, b: Float64Array): number {
  let gap = 0;
  for (let i = 0; i < a.length; i++) gap = Math.max(gap, Math.abs(a[i] - b[i]));
  return gap;
}

/** Greatest distance from a point on A to the nearest point on B, and the reverse. */
function hausdorff(a: Float64Array, b: Float64Array): number {
  const n = a.length / 2;
  const m = b.length / 2;
  const directed = (from: Float64Array, fromN: number, to: Float64Array, toN: number) => {
    let worst = 0;
    for (let i = 0; i < fromN; i++) {
      let best = Infinity;
      for (let j = 0; j < toN; j++) {
        const dx = from[2 * i] - to[2 * j];
        const dy = from[2 * i + 1] - to[2 * j + 1];
        best = Math.min(best, dx * dx + dy * dy);
      }
      worst = Math.max(worst, best);
    }
    return Math.sqrt(worst);
  };
  return Math.max(directed(a, n, b, m), directed(b, m, a, n));
}

function endsMatch(geom: GlyphGeom, glyph: StatusGlyph) {
  const plan = planStatusMorph(geom, glyphGeometry(glyph));
  const start = sampleStatusMorph(plan, 0);
  const end = sampleStatusMorph(plan, 1);
  assert.ok(maxGap(start.body.points, geom.body.points) < 1e-6, `${geom.glyph} → ${glyph} start`);
  assert.ok(hausdorff(end.body.points, glyphGeometry(glyph).body.points) < 1e-4, `${geom.glyph} → ${glyph} end`);
  assert.ok(start.mark.opacity < 1e-6 || geom.mark.opacity > 0);
  assert.equal(end.track, glyph === "spinner" ? SETTLED.spinner.track : 0);
  for (const frame of [start, end]) {
    for (const stroke of [frame.body, frame.mark, frame.dot]) {
      for (let i = 0; i < stroke.points.length; i += 2) {
        assert.ok(stroke.points[i] > -12 && stroke.points[i] < 28, "x");
        assert.ok(stroke.points[i + 1] > -12 && stroke.points[i + 1] < 28, "y");
      }
    }
  }
  const mid = sampleStatusMorph(plan, 0.5);
  for (let i = 0; i < mid.body.points.length; i += 2) {
    assert.ok(mid.body.points[i] > -20 && mid.body.points[i] < 36, "mid x");
    assert.ok(mid.body.points[i + 1] > -20 && mid.body.points[i + 1] < 36, "mid y");
  }
}

describe("stroke morph", () => {
  it("uses the smooth spring, settled at rest and finished within a second", () => {
    assert.equal(SMOOTH_STIFFNESS, 170);
    assert.equal(SMOOTH_DAMPING, 26);
    assert.ok(SMOOTH_DAMPING < 2 * Math.sqrt(SMOOTH_STIFFNESS));
    assert.equal(smoothSpringProgress(0), 0);
    assert.ok(smoothSpringProgress(800) > 0.999);
    assert.equal(smoothSpringProgress(-10), 0);
  });

  it("draws the resting spinner arc from the right, the long way, to the bottom", () => {
    assert.equal(arcPath(0), "M14 8A6 6 0 1 0 8 14");
    assert.match(arcPath(0.4), /^M[\d.]+ [\d.]+A6 6 0 1 0 /);
    const spinner = glyphGeometry("spinner", 0);
    assert.ok(Math.hypot(spinner.body.points[0] - 14, spinner.body.points[1] - 8) < 1e-6);
    const last = spinner.body.points.length - 2;
    assert.ok(Math.hypot(spinner.body.points[last] - 8, spinner.body.points[last + 1] - 14) < 1e-6);
  });

  it("lands on the target stroke for every pair, including a spinner caught mid-turn", () => {
    const glyphs: StatusGlyph[] = ["spinner", "check", "alert"];
    for (const from of glyphs) {
      for (const to of glyphs) {
        if (from === to) continue;
        endsMatch(glyphGeometry(from, from === "spinner" ? 1.2 : 0), to);
      }
    }
  });

  it("keeps the warning mark hidden until the stroke is actually a warning", () => {
    const plan = planStatusMorph(glyphGeometry("spinner"), glyphGeometry("alert"));
    assert.equal(sampleStatusMorph(plan, 0).mark.opacity, 0);
    assert.equal(sampleStatusMorph(plan, 0.2).mark.opacity, 0);
    assert.equal(sampleStatusMorph(plan, 1).mark.opacity, 1);
    const back = planStatusMorph(glyphGeometry("alert"), glyphGeometry("check"));
    assert.equal(sampleStatusMorph(back, 1).mark.opacity, 0);
  });

  it("settles on the check, the warning and the spinner path", () => {
    assert.equal(SETTLED.check.body, "M3.5 8.5 6.5 11.5 12.5 4.5");
    assert.equal(SETTLED.check.token, "--ok");
    assert.match(SETTLED.alert.body, /Z$/);
    assert.equal(SETTLED.alert.token, "--risk");
    assert.equal(SETTLED.spinner.token, "--agent");
    assert.equal(SETTLED.spinner.track, 0.25);
  });

  it("reads the token colours it has to blend", () => {
    assert.deepEqual(parseCssColor("#6e56cf"), { r: 110, g: 86, b: 207 });
    assert.deepEqual(parseCssColor("rgb(26, 127, 55)"), { r: 26, g: 127, b: 55 });
    assert.equal(parseCssColor("nope"), null);
    const mid = lerpRgb({ r: 0, g: 0, b: 0 }, { r: 10, g: 20, b: 40 }, 0.5);
    assert.deepEqual(mid, { r: 5, g: 10, b: 20 });
  });
});

describe("status icon on the docs page", () => {
  it("documents the morph and follows reduced motion", () => {
    const thinking = COMPONENTS.find((component) => component.slug === "thinking-state");
    const feed = COMPONENTS.find((component) => component.slug === "tool-call-feed");
    assert.ok(thinking && feed);
    assert.match(thinking.decisions.join("\n"), /spinner draws itself into a check/);
    assert.match(thinking.decisions.join("\n"), /warning/);
    assert.match(thinking.a11y.join("\n"), /Reduced motion swaps it instead of morphing/);
    assert.match(feed.decisions.join("\n"), /spinner draws itself into a check/);
    const icon = readFileSync(join(root, "src/components/agentic/status-morph.tsx"), "utf8");
    assert.match(icon, /prefers-reduced-motion: reduce/);
    const readme = readFileSync(join(root, "README.md"), "utf8");
    assert.match(readme, /https:\/\/github\.com\/guillermolg00\/morphicons/);
    assert.match(readme, /MIT/);
  });
});
