"use client";

import { countWords } from "./format";
import { AgentMark, buttonClass } from "./marks";

export type StreamStatus = "streaming" | "done" | "stopped";

export type StreamingTextProps = {
  /** The text received so far. The parent owns the stream; this component only shows it. */
  text: string;
  status: StreamStatus;
  /** Shows a Stop button while streaming. */
  onStop?: () => void;
  className?: string;
};

/**
 * Agent text that arrives token by token.
 * Screen readers get the answer once, when it is complete (`aria-busy` while streaming),
 * instead of every token. A stopped answer says so and keeps what arrived.
 */
export function StreamingText({ text, status, onStop, className = "" }: StreamingTextProps) {
  const streaming = status === "streaming";
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <AgentMark />
        {streaming && onStop && (
          <button type="button" onClick={onStop} className={buttonClass.ghost}>
            <svg viewBox="0 0 12 12" aria-hidden="true" className="size-2.5" fill="currentColor">
              <rect x="1" y="1" width="10" height="10" rx="2" />
            </svg>
            Stop
          </button>
        )}
      </div>
      <p aria-live="polite" aria-busy={streaming} className="text-[15px] leading-relaxed whitespace-pre-wrap">
        {text}
        {streaming && (
          <span
            aria-hidden="true"
            className="aui-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-[var(--agent)]"
          />
        )}
      </p>
      {status === "stopped" && (
        <p className="text-xs text-[var(--fg-muted)]">
          Stopped by you after {countWords(text)} words. What arrived is kept.
        </p>
      )}
    </div>
  );
}
