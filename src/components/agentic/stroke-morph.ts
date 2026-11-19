/**
 * Stroke morph for the working status icon: a spinner draws itself into a check,
 * or into a warning when the work stops.
 *
 * Adapted from morphicons (MIT) by Guillermo — https://github.com/guillermolg00/morphicons
 * and the closed-form alignment in that repo's docs/how-it-works.md. Each stroke is
 * resampled to the same number of points. Both directions are tried and, for a closed
 * stroke, every starting point. The rotation θ and scale σ that best map one stroke
 * onto the other are
 *
 *   θ = atan2(Σ ax·by − ay·bx,  Σ ax·bx + ay·by)
 *   σ = [cos θ · (Σ ax·bx + ay·by) + sin θ · (Σ ax·by − ay·bx)] / Σ‖a‖²
 *
 * The frame keeps rotation, scale and shape apart so a turn does not collapse:
 *
 *   P(t) = c(t) + σ^t · R(t·θ) · [(1−t)·a + t·b̃]
 *
 * b̃ is the target brought into the source frame. On settle the icon uses its exact
 * path, not the resampled one. Motion is morphicons' smooth spring (stiffness 170,
 * damping 26, no overshoot) in closed form. prefers-reduced-motion snaps instead.
 */

export type StatusGlyph = "spinner" | "check" | "alert";

export const STATUS_POINT_COUNT = 48;

/** morphicons smooth preset: stiffness 170, damping 26. Just under critical (2√k ≈ 26.08), so it settles without overshoot. */
export const SMOOTH_STIFFNESS = 170;
export const SMOOTH_DAMPING = 26;

const CX = 8;
const CY = 8;
const RADIUS = 6;
/** Long enough that the moving stroke can become the result without a pop. */
const ARC_SWEEP = -Math.PI * 1.5;

const CHECK: readonly (readonly [number, number])[] = [
  [3.5, 8.5],
  [6.5, 11.5],
  [12.5, 4.5],
];

const ALERT: readonly (readonly [number, number])[] = [
  [8, 2.25],
  [13.75, 13.75],
  [2.25, 13.75],
];

const ALERT_MARK: readonly (readonly [number, number])[] = [
  [8, 6.4],
  [8, 9.35],
];

const ALERT_DOT: readonly (readonly [number, number])[] = [
  [8, 11.35],
  [8, 11.7],
];

export type SettledIcon = {
  body: string;
  mark: string;
  dot: string;
  /** Faint ring behind the spinner. 0 hides it. */
  track: number;
  /** Token the settled stroke reads. The morph lerps between computed colours. */
  token: "--agent" | "--ok" | "--risk";
};

export const SPINNER_ARC = "M14 8A6 6 0 1 0 8 14";

export const SETTLED: Record<StatusGlyph, SettledIcon> = {
  spinner: { body: SPINNER_ARC, mark: "", dot: "", track: 0.25, token: "--agent" },
  check: { body: "M3.5 8.5 6.5 11.5 12.5 4.5", mark: "", dot: "", track: 0, token: "--ok" },
  alert: { body: "M8 2.25 13.75 13.75 2.25 13.75Z", mark: "M8 6.4V9.35", dot: "M8 11.45v.01", track: 0, token: "--risk" },
};

export type StrokeGeom = {
  points: Float64Array;
  opacity: number;
  /** A closed stroke can start at any sample. An open one keeps its ends. */
  closed: boolean;
};

export type GlyphGeom = {
  glyph: StatusGlyph;
  track: number;
  body: StrokeGeom;
  mark: StrokeGeom;
  dot: StrokeGeom;
};

export type PlannedStroke = {
  from: Float64Array;
  to: Float64Array;
  fromOpacity: number;
  toOpacity: number;
  ca: [number, number];
  cb: [number, number];
  theta: number;
  sigma: number;
  /** Target samples in the source frame. Null means a plain coordinate blend. */
  intoSource: Float64Array | null;
  sourceCentered: Float64Array;
};

export type MorphPlan = {
  fromTrack: number;
  toTrack: number;
  body: PlannedStroke;
  mark: PlannedStroke;
  dot: PlannedStroke;
};

export type MorphFrame = {
  track: number;
  body: StrokeGeom;
  mark: StrokeGeom;
  dot: StrokeGeom;
};

type Rgb = { r: number; g: number; b: number };

/** Step response of the smooth spring, from rest. 0 at 0ms, about 1 by 800ms. */
export function smoothSpringProgress(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const omega = Math.sqrt(SMOOTH_STIFFNESS);
  const w = omega * (elapsedMs / 1000);
  return 1 - Math.exp(-w) * (1 + w);
}

export function arcPath(rotation: number): string {
  const turn = wrap(rotation);
  if (turn < 1e-4) return SPINNER_ARC;
  const end = turn + ARC_SWEEP;
  const large = Math.abs(ARC_SWEEP) > Math.PI ? 1 : 0;
  const [sx, sy] = circlePoint(turn);
  const [ex, ey] = circlePoint(end);
  return `M${fmt(sx)} ${fmt(sy)}A${RADIUS} ${RADIUS} 0 ${large} 0 ${fmt(ex)} ${fmt(ey)}`;
}

export function glyphGeometry(glyph: StatusGlyph, rotation = 0): GlyphGeom {
  if (glyph === "spinner") {
    return {
      glyph,
      track: SETTLED.spinner.track,
      body: { points: sampleArc(rotation), opacity: 1, closed: false },
      mark: hiddenStroke(),
      dot: hiddenStroke(),
    };
  }
  if (glyph === "check") {
    return {
      glyph,
      track: 0,
      body: { points: samplePolyline(CHECK, false), opacity: 1, closed: false },
      mark: hiddenStroke(),
      dot: hiddenStroke(),
    };
  }
  return {
    glyph,
    track: 0,
    body: { points: samplePolyline(ALERT, true), opacity: 1, closed: true },
    mark: { points: samplePolyline(ALERT_MARK, false), opacity: 1, closed: false },
    dot: { points: samplePolyline(ALERT_DOT, false), opacity: 1, closed: false },
  };
}

export function planStatusMorph(from: GlyphGeom, to: GlyphGeom): MorphPlan {
  return {
    fromTrack: from.track,
    toTrack: to.track,
    body: planStroke(from.body, to.body),
    mark: planStroke(from.mark, to.mark),
    dot: planStroke(from.dot, to.dot),
  };
}

export function sampleStatusMorph(plan: MorphPlan, t: number): MorphFrame {
  const clamped = clamp01(t);
  return {
    track: plan.fromTrack + (plan.toTrack - plan.fromTrack) * clamped,
    body: { ...sampleStroke(plan.body, clamped), closed: false },
    mark: { ...sampleStroke(plan.mark, clamped), closed: false },
    dot: { ...sampleStroke(plan.dot, clamped), closed: false },
  };
}

export function pointsToPath(points: Float64Array): string {
  const n = points.length / 2;
  if (n === 0) return "";
  let d = `M${fmt(points[0])} ${fmt(points[1])}`;
  for (let i = 1; i < n; i++) d += `L${fmt(points[2 * i])} ${fmt(points[2 * i + 1])}`;
  return d;
}

export function parseCssColor(input: string): Rgb | null {
  const hex = input.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const rgb = input.trim().match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (!rgb) return null;
  return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
}

export function lerpRgb(from: Rgb, to: Rgb, t: number): Rgb {
  const clamped = clamp01(t);
  return {
    r: from.r + (to.r - from.r) * clamped,
    g: from.g + (to.g - from.g) * clamped,
    b: from.b + (to.b - from.b) * clamped,
  };
}

export function rgbCss(color: Rgb): string {
  return `rgb(${Math.round(color.r)} ${Math.round(color.g)} ${Math.round(color.b)})`;
}

function planStroke(from: StrokeGeom, to: StrokeGeom): PlannedStroke {
  const collapsed = isCollapsed(from.points) || isCollapsed(to.points);
  if (collapsed) return linearPlan(from, to);
  let best: { score: number; points: Float64Array; theta: number; sigma: number } | null = null;
  const offsets = to.closed ? startOffsets(to.points.length / 2) : [0];
  for (const offset of offsets) {
    const turned = offset === 0 ? to.points : rotateStart(to.points, offset);
    for (const points of [turned, reversed(turned)]) {
      const fit = procrustes(from.points, points);
      if (!fit) continue;
      const score = fit.error + 0.05 * (Math.abs(fit.theta) / Math.PI);
      if (!best || score < best.score) best = { score, points, theta: fit.theta, sigma: fit.sigma };
    }
  }
  if (!best || best.sigma < 1e-6) return linearPlan(from, to);
  return alignedPlan(from, to, best.points, best.theta, best.sigma);
}

function linearPlan(from: StrokeGeom, to: StrokeGeom): PlannedStroke {
  const ca = centroid(from.points);
  const cb = centroid(to.points);
  return {
    from: from.points,
    to: to.points,
    fromOpacity: from.opacity,
    toOpacity: to.opacity,
    ca,
    cb,
    theta: 0,
    sigma: 1,
    intoSource: null,
    sourceCentered: center(from.points, ca),
  };
}

function alignedPlan(from: StrokeGeom, to: StrokeGeom, toPoints: Float64Array, theta: number, sigma: number): PlannedStroke {
  const ca = centroid(from.points);
  const cb = centroid(toPoints);
  const n = from.points.length / 2;
  const intoSource = new Float64Array(from.points.length);
  const inv = 1 / sigma;
  const cos = Math.cos(-theta);
  const sin = Math.sin(-theta);
  for (let i = 0; i < n; i++) {
    const bx = toPoints[2 * i] - cb[0];
    const by = toPoints[2 * i + 1] - cb[1];
    intoSource[2 * i] = (bx * cos - by * sin) * inv;
    intoSource[2 * i + 1] = (bx * sin + by * cos) * inv;
  }
  return {
    from: from.points,
    to: toPoints,
    fromOpacity: from.opacity,
    toOpacity: to.opacity,
    ca,
    cb,
    theta,
    sigma,
    intoSource,
    sourceCentered: center(from.points, ca),
  };
}

function sampleStroke(stroke: PlannedStroke, t: number): { points: Float64Array; opacity: number } {
  const n = stroke.from.length / 2;
  const out = new Float64Array(stroke.from.length);
  if (!stroke.intoSource) {
    for (let i = 0; i < n; i++) {
      out[2 * i] = stroke.from[2 * i] + (stroke.to[2 * i] - stroke.from[2 * i]) * t;
      out[2 * i + 1] = stroke.from[2 * i + 1] + (stroke.to[2 * i + 1] - stroke.from[2 * i + 1]) * t;
    }
  } else {
    const scale = Math.pow(stroke.sigma, t);
    const ang = stroke.theta * t;
    const cos = Math.cos(ang) * scale;
    const sin = Math.sin(ang) * scale;
    const cx = stroke.ca[0] + (stroke.cb[0] - stroke.ca[0]) * t;
    const cy = stroke.ca[1] + (stroke.cb[1] - stroke.ca[1]) * t;
    for (let i = 0; i < n; i++) {
      const px = stroke.sourceCentered[2 * i] + (stroke.intoSource[2 * i] - stroke.sourceCentered[2 * i]) * t;
      const py = stroke.sourceCentered[2 * i + 1] + (stroke.intoSource[2 * i + 1] - stroke.sourceCentered[2 * i + 1]) * t;
      out[2 * i] = cx + px * cos - py * sin;
      out[2 * i + 1] = cy + px * sin + py * cos;
    }
  }
  return { points: out, opacity: blendOpacity(stroke.fromOpacity, stroke.toOpacity, t) };
}

/**
 * A mark that appears (the warning's exclamation) waits until the outline has
 * a shape, so it does not flash as a dot in the middle of the spinner.
 * A mark that leaves fades out before the outline turns into the next icon.
 */
function blendOpacity(from: number, to: number, t: number): number {
  if (from === to) return from;
  if (from === 0) {
    const u = clamp01((t - 0.42) / 0.48);
    return to * u * u * (3 - 2 * u);
  }
  if (to === 0) {
    const u = clamp01(t / 0.4);
    const eased = u * u * (3 - 2 * u);
    return from * (1 - eased);
  }
  return from + (to - from) * t;
}

/** θ*, σ* and the mean squared miss. σ is non-negative: the angle absorbs the turn. */
function procrustes(a: Float64Array, b: Float64Array): { theta: number; sigma: number; error: number } | null {
  const ca = centroid(a);
  const cb = centroid(b);
  const n = a.length / 2;
  let num = 0;
  let den = 0;
  let aa = 0;
  for (let i = 0; i < n; i++) {
    const ax = a[2 * i] - ca[0];
    const ay = a[2 * i + 1] - ca[1];
    const bx = b[2 * i] - cb[0];
    const by = b[2 * i + 1] - cb[1];
    num += ax * by - ay * bx;
    den += ax * bx + ay * by;
    aa += ax * ax + ay * ay;
  }
  if (aa < 1e-8) return null;
  const theta = Math.atan2(num, den);
  const sigma = (Math.cos(theta) * den + Math.sin(theta) * num) / aa;
  const cos = Math.cos(theta) * sigma;
  const sin = Math.sin(theta) * sigma;
  let error = 0;
  for (let i = 0; i < n; i++) {
    const ax = a[2 * i] - ca[0];
    const ay = a[2 * i + 1] - ca[1];
    const mx = cb[0] + ax * cos - ay * sin;
    const my = cb[1] + ax * sin + ay * cos;
    const dx = mx - b[2 * i];
    const dy = my - b[2 * i + 1];
    error += dx * dx + dy * dy;
  }
  return { theta, sigma, error: error / n };
}

function sampleArc(rotation: number): Float64Array {
  const out = new Float64Array(STATUS_POINT_COUNT * 2);
  const start = wrap(rotation);
  for (let i = 0; i < STATUS_POINT_COUNT; i++) {
    const theta = start + ARC_SWEEP * (i / (STATUS_POINT_COUNT - 1));
    const [x, y] = circlePoint(theta);
    out[2 * i] = x;
    out[2 * i + 1] = y;
  }
  return out;
}

function samplePolyline(vertices: readonly (readonly [number, number])[], closed: boolean): Float64Array {
  const pts = vertices.map((p) => [p[0], p[1]] as [number, number]);
  if (closed) pts.push([pts[0][0], pts[0][1]]);
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lengths.push(len);
    total += len;
  }
  const out = new Float64Array(STATUS_POINT_COUNT * 2);
  const steps = closed ? STATUS_POINT_COUNT : STATUS_POINT_COUNT - 1;
  for (let i = 0; i < STATUS_POINT_COUNT; i++) {
    let dist = total === 0 ? 0 : (i / steps) * total;
    let seg = 0;
    while (seg < lengths.length - 1 && dist > lengths[seg]) {
      dist -= lengths[seg];
      seg++;
    }
    const len = lengths[seg] || 1;
    const u = len === 0 ? 0 : dist / len;
    out[2 * i] = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * u;
    out[2 * i + 1] = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * u;
  }
  return out;
}

function hiddenStroke(): StrokeGeom {
  const points = new Float64Array(STATUS_POINT_COUNT * 2);
  for (let i = 0; i < STATUS_POINT_COUNT; i++) {
    points[2 * i] = CX;
    points[2 * i + 1] = CY;
  }
  return { points, opacity: 0, closed: false };
}

function isCollapsed(points: Float64Array): boolean {
  const [x, y] = centroid(points);
  let spread = 0;
  const n = points.length / 2;
  for (let i = 0; i < n; i++) {
    const dx = points[2 * i] - x;
    const dy = points[2 * i + 1] - y;
    spread += dx * dx + dy * dy;
  }
  return spread / n < 1e-6;
}

function centroid(points: Float64Array): [number, number] {
  const n = points.length / 2;
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    x += points[2 * i];
    y += points[2 * i + 1];
  }
  return [x / n, y / n];
}

function center(points: Float64Array, origin: [number, number]): Float64Array {
  const out = new Float64Array(points.length);
  for (let i = 0; i < points.length; i += 2) {
    out[i] = points[i] - origin[0];
    out[i + 1] = points[i + 1] - origin[1];
  }
  return out;
}

function reversed(points: Float64Array): Float64Array {
  const n = points.length / 2;
  const out = new Float64Array(points.length);
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i;
    out[2 * i] = points[2 * j];
    out[2 * i + 1] = points[2 * j + 1];
  }
  return out;
}

function rotateStart(points: Float64Array, offset: number): Float64Array {
  const n = points.length / 2;
  const shift = ((offset % n) + n) % n;
  if (shift === 0) return points;
  const out = new Float64Array(points.length);
  for (let i = 0; i < n; i++) {
    const j = (i + shift) % n;
    out[2 * i] = points[2 * j];
    out[2 * i + 1] = points[2 * j + 1];
  }
  return out;
}

function startOffsets(count: number): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < count; i++) offsets.push(i);
  return offsets;
}

function circlePoint(theta: number): [number, number] {
  return [CX + RADIUS * Math.cos(theta), CY + RADIUS * Math.sin(theta)];
}

function wrap(rotation: number): number {
  const tau = Math.PI * 2;
  return ((rotation % tau) + tau) % tau;
}

function fmt(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  if (rounded === 0) return "0";
  return String(rounded);
}

function clamp01(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}
