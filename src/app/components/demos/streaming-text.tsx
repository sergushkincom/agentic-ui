"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { StreamingText, type StreamStatus } from "@/components/agentic";
import { buttonClass } from "@/components/agentic/marks";
import { Segmented } from "@/components/site/segmented";

/*
 * One fake scenario runs through every demo: an agent matching a supplier invoice to a purchase
 * order in an ERP. All names and numbers are made up.
 */

const ANSWER =
  "INV-2041 from Acme Fasteners matches purchase order PO-7718. All three lines agree on quantity and price, and the goods receipt was posted on 6 November. The only difference is the delivery fee of €38.00, which the order allows. I suggest paying it on the due date, 14 November.";

/** First sentence. Stopped shows this at once, so the word count does not depend on the timer. */
const STOPPED_PREVIEW = ANSWER.slice(0, ANSWER.indexOf(". ") + 1);

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function StreamingTextStoppable() {
  const [scenario, setScenario] = useState<StreamStatus>("streaming");
  const [chars, setChars] = useState(0);
  /** Set when Stop is pressed. Otherwise Stopped uses the fixed preview. */
  const [kept, setKept] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stream = useRef<HTMLDivElement>(null);
  const focusStop = useRef(false);

  const stopTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const start = useCallback(() => {
    stopTimer();
    setChars(0);
    setKept(null);
    // About eight seconds, so Stop can be reached from the keyboard before the answer finishes.
    timer.current = setInterval(() => {
      setChars((c) => Math.min(ANSWER.length, c + 2));
    }, 60);
  }, [stopTimer]);

  useEffect(() => {
    if (scenario !== "streaming") {
      stopTimer();
      return;
    }
    start();
    return stopTimer;
  }, [run, scenario, start, stopTimer]);

  useEffect(() => {
    if (scenario !== "streaming" || chars < ANSWER.length) return;
    stopTimer();
    setScenario("done");
  }, [scenario, chars, stopTimer]);

  // Replay reveals Stop again. Put focus there so Enter, Space, or Escape can stop the answer.
  useEffect(() => {
    if (!focusStop.current || scenario !== "streaming") return;
    const stop = stream.current?.querySelector("button");
    if (!(stop instanceof HTMLButtonElement)) return;
    stop.focus();
    focusStop.current = false;
  }, [run, scenario]);

  const restart = (focus: boolean) => {
    focusStop.current = focus;
    setChars(0);
    setKept(null);
    setScenario("streaming");
    setRun((r) => r + 1);
  };

  const text =
    scenario === "done"
      ? ANSWER
      : scenario === "stopped"
        ? ANSWER.slice(0, kept ?? STOPPED_PREVIEW.length)
        : ANSWER.slice(0, chars);

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(next) => {
            if (next === "streaming") {
              restart(false);
              return;
            }
            stopTimer();
            setKept(null);
            setScenario(next);
          }}
          options={[
            { value: "streaming", label: "Streaming" },
            { value: "done", label: "Done" },
            { value: "stopped", label: "Stopped" },
          ]}
        />
        <button type="button" className={buttonClass.secondary} onClick={() => restart(true)}>
          Replay
        </button>
      </Controls>
      <div ref={stream}>
        <StreamingText
          text={text}
          status={scenario}
          onStop={() => {
            stopTimer();
            setKept(chars);
            setScenario("stopped");
          }}
        />
      </div>
    </div>
  );
}
