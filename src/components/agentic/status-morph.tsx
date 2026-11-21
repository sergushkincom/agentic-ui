"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  SETTLED,
  arcPath,
  glyphGeometry,
  lerpRgb,
  parseCssColor,
  planStatusMorph,
  pointsToPath,
  rgbCss,
  sampleStatusMorph,
  smoothSpringProgress,
  type GlyphGeom,
  type MorphFrame,
  type StatusGlyph,
} from "./stroke-morph";

export type { StatusGlyph };

type Paint = {
  body: string;
  mark: string;
  dot: string;
  markOpacity: number;
  dotOpacity: number;
  trackOpacity: number;
  stroke: string;
  glyph: StatusGlyph;
  settled: boolean;
};

type Rgb = { r: number; g: number; b: number };

type Morph = {
  plan: ReturnType<typeof planStatusMorph>;
  started: number;
  from: Rgb;
  to: Rgb;
  target: StatusGlyph;
};

type Motion = {
  rotation: number;
  showing: StatusGlyph;
  morph: Morph | null;
};

/**
 * Spinner, check and warning drawn as one stroke. Changing `glyph` morphs the mark
 * from whatever is on screen. The first paint is the settled icon, so a server
 * render does not flash. Reduced motion snaps to that icon and does not spin.
 */
export function StatusMorph({ glyph, className = "size-3.5" }: { glyph: StatusGlyph; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGCircleElement>(null);
  const bodyRef = useRef<SVGPathElement>(null);
  const markRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGPathElement>(null);
  const glyphRef = useRef(glyph);
  const paintRef = useRef<Paint | null>(null);
  const startRef = useRef<() => void>(() => {});
  glyphRef.current = glyph;

  useLayoutEffect(() => {
    const paint = paintRef.current;
    const nodes = nodesOf(svgRef.current, trackRef.current, bodyRef.current, markRef.current, dotRef.current);
    if (paint && nodes) writePaint(nodes, paint);
  });

  useEffect(() => {
    const nodes = nodesOf(svgRef.current, trackRef.current, bodyRef.current, markRef.current, dotRef.current);
    if (!nodes) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion: Motion = { rotation: 0, showing: glyphRef.current, morph: null };
    let frame = 0;
    let running = false;
    let last = performance.now();

    const paint = (next: Paint) => {
      paintRef.current = next;
      writePaint(nodes, next);
    };

    const begin = (from: GlyphGeom, target: StatusGlyph, fromColor: Rgb, now: number) => {
      motion.morph = {
        plan: planStatusMorph(from, glyphGeometry(target, 0)),
        started: now,
        from: fromColor,
        to: readToken(nodes.svg, SETTLED[target].token),
        target,
      };
      motion.rotation = 0;
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = glyphRef.current;

      if (media.matches) {
        motion.morph = null;
        motion.rotation = 0;
        motion.showing = target;
        paint(settledPaint(target, 0));
        running = false;
        return;
      }

      if (motion.morph && motion.morph.target !== target) {
        const t = Math.min(1, smoothSpringProgress(now - motion.morph.started));
        const sample = sampleStatusMorph(motion.morph.plan, t);
        begin(frameGeometry(sample, motion.showing), target, lerpRgb(motion.morph.from, motion.morph.to, t), now);
      } else if (!motion.morph && target !== motion.showing) {
        begin(glyphGeometry(motion.showing, motion.rotation), target, readToken(nodes.svg, SETTLED[motion.showing].token), now);
      }

      if (motion.morph) {
        const t = smoothSpringProgress(now - motion.morph.started);
        if (t >= 0.997) {
          motion.showing = motion.morph.target;
          motion.morph = null;
          motion.rotation = 0;
          paint(settledPaint(motion.showing, 0));
        } else {
          const sample = sampleStatusMorph(motion.morph.plan, t);
          paint({
            body: pointsToPath(sample.body.points),
            mark: pointsToPath(sample.mark.points),
            dot: pointsToPath(sample.dot.points),
            markOpacity: sample.mark.opacity,
            dotOpacity: sample.dot.opacity,
            trackOpacity: sample.track,
            stroke: rgbCss(lerpRgb(motion.morph.from, motion.morph.to, t)),
            glyph: motion.morph.target,
            settled: false,
          });
        }
      } else if (motion.showing === "spinner") {
        motion.rotation = (motion.rotation + dt * ((Math.PI * 2) / 0.9)) % (Math.PI * 2);
        paint(settledPaint("spinner", motion.rotation));
      }

      if (motion.morph || motion.showing === "spinner" || glyphRef.current !== motion.showing) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    startRef.current = start;
    start();
    media.addEventListener("change", start);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      media.removeEventListener("change", start);
      startRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    startRef.current();
  }, [glyph]);

  const settled = SETTLED[glyph];
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 16 16"
      aria-hidden="true"
      data-glyph={glyph}
      data-settled="true"
      fill="none"
      stroke={`var(${settled.token})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <circle ref={trackRef} cx="8" cy="8" r="6" opacity={settled.track} />
      <path ref={bodyRef} d={settled.body} />
      <path ref={markRef} d={settled.mark || "M8 8"} opacity={settled.mark ? 1 : 0} />
      <path ref={dotRef} d={settled.dot || "M8 8"} opacity={settled.dot ? 1 : 0} />
    </svg>
  );
}

function settledPaint(glyph: StatusGlyph, rotation: number): Paint {
  const settled = SETTLED[glyph];
  return {
    body: glyph === "spinner" ? arcPath(rotation) : settled.body,
    mark: settled.mark,
    dot: settled.dot,
    markOpacity: settled.mark ? 1 : 0,
    dotOpacity: settled.dot ? 1 : 0,
    trackOpacity: settled.track,
    stroke: `var(${settled.token})`,
    glyph,
    settled: true,
  };
}

function frameGeometry(frame: MorphFrame, glyph: StatusGlyph): GlyphGeom {
  return { glyph, track: frame.track, body: frame.body, mark: frame.mark, dot: frame.dot };
}

type Nodes = {
  svg: SVGSVGElement;
  track: SVGCircleElement;
  body: SVGPathElement;
  mark: SVGPathElement;
  dot: SVGPathElement;
};

function nodesOf(
  svg: SVGSVGElement | null,
  track: SVGCircleElement | null,
  body: SVGPathElement | null,
  mark: SVGPathElement | null,
  dot: SVGPathElement | null,
): Nodes | null {
  if (!svg || !track || !body || !mark || !dot) return null;
  return { svg, track, body, mark, dot };
}

function writePaint(nodes: Nodes, paint: Paint) {
  nodes.svg.setAttribute("stroke", paint.stroke);
  nodes.svg.setAttribute("data-glyph", paint.glyph);
  nodes.svg.setAttribute("data-settled", paint.settled ? "true" : "false");
  nodes.track.setAttribute("opacity", String(paint.trackOpacity));
  nodes.body.setAttribute("d", paint.body);
  nodes.mark.setAttribute("d", paint.mark || "M8 8");
  nodes.mark.setAttribute("opacity", String(paint.markOpacity));
  nodes.dot.setAttribute("d", paint.dot || "M8 8");
  nodes.dot.setAttribute("opacity", String(paint.dotOpacity));
}

function readToken(svg: SVGSVGElement, token: "--agent" | "--ok" | "--risk"): Rgb {
  const previous = svg.style.color;
  svg.style.color = `var(${token})`;
  const parsed = parseCssColor(getComputedStyle(svg).color);
  svg.style.color = previous;
  return parsed ?? { r: 0, g: 0, b: 0 };
}
