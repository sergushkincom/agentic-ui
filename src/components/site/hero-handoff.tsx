"use client";

import { useLayoutEffect, useState } from "react";
import { ConfidenceBar, HumanOverride } from "@/components/agentic";

const AGENT_VALUE = "4100 · Production";
const ASK_BELOW = 0.7;
/** Under the ask line, so the card opens on the moment the agent hands the field over. */
const SETTLED = 0.64;
const START = 0.36;

const REASON =
  "Same as the last 6 invoices from this supplier. This receipt was booked to 4200 · Assembly.";

/**
 * Same smooth spring as the status morph (stiffness 170, damping 26).
 * Scaled so a bar, not an icon, is what travels.
 */
function spring(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const w = Math.sqrt(170) * ((elapsedMs * 0.5) / 1000);
  return 1 - Math.exp(-w) * (1 + w);
}

function ApproachingConfidence() {
  const [value, setValue] = useState(SETTLED);

  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const t0 = performance.now();
    let raf = 0;
    let stopped = false;

    const settle = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      setValue(SETTLED);
    };

    const step = (now: number) => {
      if (stopped) return;
      const p = spring(now - t0);
      if (p > 0.995 || now - t0 > 2000) {
        settle();
        return;
      }
      setValue(START + (SETTLED - START) * p);
      raf = requestAnimationFrame(step);
    };

    const onMotion = () => {
      if (media.matches) settle();
    };

    setValue(START);
    raf = requestAnimationFrame(step);
    media.addEventListener("change", onMotion);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      media.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <ConfidenceBar value={value} askBelow={ASK_BELOW} basis="3 of 4 fields match the purchase order" />
  );
}

/**
 * A live piece of the library: confidence stops short of the line, and the
 * cost centre can be taken over. Hidden below the large breakpoint.
 */
export function HeroHandoff() {
  const [field, setField] = useState(AGENT_VALUE);
  const [source, setSource] = useState<"agent" | "human">("agent");

  return (
    <aside aria-label="Live example of confidence and override" className="aui-hero-in relative hidden lg:block">
      <div className="relative flex flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-[family-name:var(--mono)] text-[12px] text-[var(--fg-muted)]">INV-2041 · Acme Fasteners</p>
        </div>

        <div className="aui-hero-meter flex flex-col gap-3">
            <p className="text-[12px] font-medium text-[var(--agent)]">How sure</p>
            <ApproachingConfidence />
            <div className="aui-seam" aria-hidden="true">
              <span className="aui-seam-line" />
              <span className="aui-seam-bead" />
            </div>
            <p className="text-[12px] font-medium text-[var(--human)]">Where you step in</p>
            <HumanOverride
              label="Cost centre"
              agentValue={AGENT_VALUE}
              value={field}
              source={source}
              reason={REASON}
              onChange={(next, nextSource) => {
                setField(next);
                setSource(nextSource);
              }}
            />
        </div>
        <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">Nothing is sent. A change stays in this card.</p>
      </div>
    </aside>
  );
}
