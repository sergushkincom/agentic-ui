"use client";

import { useId, type ReactNode } from "react";
import { formatLogTime } from "./format";
import { AgentMark, HumanMark, buttonClass } from "./marks";
import { StatusMorph } from "./status-morph";

export type RunChatMessage = {
  id: string;
  role: "human" | "agent";
  text: string;
};

export type RunChatStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "failed";
  durationMs?: number;
};

export type RunChatProps = {
  /** Names the thread. The task, not a product name. */
  title: string;
  messages: RunChatMessage[];
  /** Steps of the run this message started. Empty until the person sends. */
  steps: RunChatStep[];
  draft: string;
  onDraftChange: (draft: string) => void;
  /** Sending is what starts the run. */
  onSend: () => void;
  /** The answer still being written. The demo passes StreamingText. */
  stream?: ReactNode;
  /** A one-line plan above the steps. The demo passes ThinkingState. */
  plan?: ReactNode;
  /** True while a run is in flight. Send waits. */
  busy?: boolean;
  /** Field hint. Default "Message the agent". */
  placeholder?: string;
};

/**
 * A message starts the run. The thread stays on one side and the steps on the other,
 * so the person can read the answer and watch the work at the same time.
 */
export function RunChat({
  title,
  messages,
  steps,
  draft,
  onDraftChange,
  onSend,
  stream,
  plan,
  busy = false,
  placeholder = "Message the agent",
}: RunChatProps) {
  return (
    <section
      aria-label={title}
      className="@container overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="grid @md:grid-cols-[minmax(0,1.25fr)_minmax(13rem,0.75fr)]">
        <div className="flex min-h-80 flex-col @md:min-h-[24rem]">
          <header className="border-b border-[var(--border)] px-3 py-2">
            <h3 className="truncate text-[13px] font-medium">{title}</h3>
          </header>
          <div className="flex flex-1 flex-col gap-3 overflow-auto p-3">
            <ol className="flex flex-col gap-3">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </ol>
            {stream}
            {messages.length === 0 && !stream && (
              <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">Ask, and the run starts on the right.</p>
            )}
          </div>
          <Composer draft={draft} onDraftChange={onDraftChange} onSend={onSend} busy={busy} placeholder={placeholder} />
        </div>
        <Log plan={plan} steps={steps} />
      </div>
    </section>
  );
}

function Message({ message }: { message: RunChatMessage }) {
  const human = message.role === "human";
  return (
    <li className={`flex flex-col gap-1 ${human ? "items-end" : "items-start"}`}>
      {human ? <HumanMark /> : <AgentMark />}
      <p
        className={`max-w-[40ch] rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] leading-relaxed ${human ? "bg-[var(--human-soft)]" : "bg-[var(--agent-soft)]"}`}
      >
        {message.text}
      </p>
    </li>
  );
}

function Composer({
  draft,
  onDraftChange,
  onSend,
  busy,
  placeholder,
}: {
  draft: string;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
  busy: boolean;
  placeholder: string;
}) {
  const inputId = useId();
  const empty = draft.trim().length === 0;
  return (
    <form
      className="flex items-center gap-2 border-t border-[var(--border)] p-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (empty || busy) return;
        onSend();
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Message
      </label>
      <input
        id={inputId}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => onDraftChange(event.target.value)}
        className="h-8 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] outline-none focus:border-[var(--human)]"
      />
      <button type="submit" className={buttonClass.primary} disabled={empty || busy}>
        Send
      </button>
    </form>
  );
}

function Log({ plan, steps }: { plan?: ReactNode; steps: RunChatStep[] }) {
  const waiting = steps.length === 0 && !plan;
  return (
    <div role="region" className="flex min-h-48 flex-col border-t border-[var(--border)] bg-[var(--bg)] @md:border-t-0 @md:border-l" aria-label="This run">
      <h3 className="border-b border-[var(--border)] px-3 py-2 font-[family-name:var(--mono)] text-[11px] font-medium tracking-wide uppercase">
        This run
      </h3>
      <div className="flex flex-1 flex-col gap-3 overflow-auto p-3">
        {plan}
        {waiting ? (
          <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">Send a message to start the run.</p>
        ) : (
          <StepList steps={steps} />
        )}
      </div>
    </div>
  );
}

function StepList({ steps }: { steps: RunChatStep[] }) {
  return (
    <ol className="flex flex-col gap-1.5" aria-live="polite">
      {steps.map((step) => (
        <li key={step.id} className="flex items-center gap-2 text-[13px]">
          <StepMark status={step.status} />
          <span className={`min-w-0 flex-1 truncate ${step.status === "pending" ? "text-[var(--fg-muted)]" : step.status === "failed" ? "text-[var(--risk)]" : ""}`}>
            {step.label}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-[var(--fg-muted)]">
            {step.durationMs !== undefined ? formatLogTime(step.durationMs) : step.status === "running" ? "running" : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

function StepMark({ status }: { status: RunChatStep["status"] }) {
  const word = { pending: "Not started", running: "Running", done: "Done", failed: "Failed" }[status];
  const glyph = status === "running" ? "spinner" : status === "done" ? "check" : status === "failed" ? "alert" : null;
  return (
    <span className="flex size-4 shrink-0 items-center justify-center">
      <span className="sr-only">{word}: </span>
      {glyph ? (
        <StatusMorph glyph={glyph} />
      ) : (
        <span aria-hidden="true" className="size-1.5 rounded-[var(--radius-sm)] bg-[var(--fg-muted)] opacity-50" />
      )}
    </span>
  );
}
