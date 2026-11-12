"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { StreamingText, type StreamStatus } from "@/components/agentic";
import { buttonClass } from "@/components/agentic/marks";

/*
 * One fake scenario runs through every demo: an agent matching a supplier invoice to a purchase
 * order in an ERP. All names and numbers are made up.
 */

const ANSWER =
  "INV-2041 from Acme Fasteners matches purchase order PO-7718. All three lines agree on quantity and price, and the goods receipt was posted on 6 November. The only difference is the delivery fee of €38.00, which the order allows. I suggest paying it on the due date, 14 November.";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function StreamingTextStoppable() {
  const [chars, setChars] = useState(0);
  const [status, setStatus] = useState<StreamStatus>("streaming");
  const [run, setRun] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stream = useRef<HTMLDivElement>(null);
  const focusStop = useRef(false);

  const start = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setChars(0);
    setStatus("streaming");
    // About eight seconds, so Stop can be reached from the keyboard before the answer finishes.
    timer.current = setInterval(() => {
      setChars((c) => {
        const next = Math.min(ANSWER.length, c + 2);
        if (next >= ANSWER.length) {
          if (timer.current) clearInterval(timer.current);
          setStatus("done");
        }
        return next;
      });
    }, 60);
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [run, start]);

  // Replay reveals Stop again. Put focus there so Enter, Space, or Escape can stop the answer.
  useEffect(() => {
    if (!focusStop.current || status !== "streaming") return;
    const stop = stream.current?.querySelector("button");
    if (!(stop instanceof HTMLButtonElement)) return;
    stop.focus();
    focusStop.current = false;
  }, [run, status]);

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <button
          type="button"
          className={buttonClass.secondary}
          onClick={() => {
            focusStop.current = true;
            setRun((r) => r + 1);
          }}
        >
          Replay
        </button>
      </Controls>
      <div ref={stream}>
        <StreamingText
          text={ANSWER.slice(0, chars)}
          status={status}
          onStop={() => {
            if (timer.current) clearInterval(timer.current);
            setStatus("stopped");
          }}
        />
      </div>
    </div>
  );
}
