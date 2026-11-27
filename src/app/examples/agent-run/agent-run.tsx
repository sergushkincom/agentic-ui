"use client";

import { useEffect, useReducer } from "react";
import {
  AgentDecisionCard,
  ConfidenceBar,
  FallbackBoundary,
  HumanOverride,
  StreamingText,
  ThinkingState,
  ToolCallFeed,
} from "@/components/agentic";
import { HumanMark, buttonClass } from "@/components/agentic/marks";
import { Segmented } from "@/components/site/segmented";
import {
  AGENT_COST_CENTRE,
  TICK_MS,
  TASK_PROMPT,
  freshRun,
  projectRun,
  runReducer,
  type ProgressState,
  type Scenario,
} from "@/lib/agent-run";

const PROGRESS_WORD: Record<ProgressState, string> = {
  done: "done",
  current: "current",
  upcoming: "not yet",
  failed: "failed",
};

/**
 * One scripted run of all seven components. The agent parts advance on a timer.
 * The run pauses for the cost-centre override and for approve or reject.
 */
export function AgentRun() {
  const [state, dispatch] = useReducer(runReducer, undefined, () => freshRun("match"));
  const view = projectRun(state);

  useEffect(() => {
    if (!view.playing) return;
    const id = setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    return () => clearInterval(id);
  }, [view.playing]);

  return (
    <div className="relative flex flex-col gap-4">
      {view.skip && (
        <a
          href={`#${view.skip.id}`}
          className="fixed top-16 left-4 z-30 -translate-y-40 rounded-[var(--radius-md)] bg-[var(--fg)] px-3 py-1.5 text-[13px] font-medium text-[var(--bg)] focus:translate-y-0"
        >
          {view.skip.label}
        </a>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Path"
          value={state.scenario}
          onChange={(scenario: Scenario) => dispatch({ type: "scenario", scenario })}
          options={[
            { value: "match", label: "Match" },
            { value: "erp-fails", label: "ERP fails" },
          ]}
        />
        <button type="button" className={buttonClass.secondary} onClick={() => dispatch({ type: "restart" })}>
          Restart
        </button>
      </div>

      <p aria-live="polite" className="text-[13px] leading-relaxed text-[var(--fg-muted)]">
        {view.announcement}
      </p>

      <RunProgress steps={view.progress} />

      <div
        key={state.runId}
        aria-busy={view.playing}
        className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg)] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-2">
          <HumanMark label="You" />
          <p className="text-[15px] leading-relaxed">{TASK_PROMPT}</p>
        </div>

        <ThinkingState state={view.thinking.state} steps={view.thinking.steps} elapsedMs={view.thinking.elapsedMs} defaultOpen />

        <ToolCallFeed calls={view.calls} />

        {view.stream && (
          <StreamingText
            text={view.stream.text}
            status={view.stream.status}
            onStop={view.stream.status === "streaming" ? () => dispatch({ type: "stop-stream" }) : undefined}
          />
        )}

        {view.confidence && view.override && (
          <div id="cost-centre" tabIndex={-1} className="flex scroll-mt-20 flex-col gap-3">
            <ConfidenceBar value={view.confidence.value} askBelow={view.confidence.askBelow} basis={view.confidence.basis} />
            <HumanOverride
              label="Cost centre"
              agentValue={AGENT_COST_CENTRE}
              value={view.override.value}
              source={view.override.source}
              reason={view.override.reason}
              onChange={(value) => dispatch({ type: "override", value })}
            />
          </div>
        )}

        {view.boundary?.status === "running" && (
          <FallbackBoundary
            status="running"
            task="match this invoice"
            manual={{ label: "Match it myself", onClick: () => dispatch({ type: "take-over" }) }}
            onRetry={() => dispatch({ type: "retry" })}
          >
            {null}
          </FallbackBoundary>
        )}

        {view.boundary?.status === "failed" && (
          <div id="outcome" tabIndex={-1} className="scroll-mt-20">
            <FallbackBoundary
              status="failed"
              task="match this invoice"
              reason={view.boundary.reason}
              manual={{ label: "Match it myself", onClick: () => dispatch({ type: "take-over" }) }}
              onRetry={() => dispatch({ type: "retry" })}
            >
              {null}
            </FallbackBoundary>
          </div>
        )}

        {view.decision && (
          <div id="decision" tabIndex={-1} className="scroll-mt-20">
            <FallbackBoundary
              status="ok"
              task="match this invoice"
              manual={{ label: "Match it myself", onClick: () => dispatch({ type: "take-over" }) }}
              onRetry={() => dispatch({ type: "retry" })}
            >
              <AgentDecisionCard
                decision={view.decision.data}
                status={view.decision.status}
                onApprove={() => dispatch({ type: "approve" })}
                onReject={() => dispatch({ type: "reject" })}
              />
            </FallbackBoundary>
          </div>
        )}

        {view.receipt && (
          <div id="outcome" tabIndex={-1} className="scroll-mt-20 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-col gap-2">
              <HumanMark label="You" />
              <p className="text-[15px] leading-relaxed">{view.receipt}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type ProgressStep = { id: string; label: string; state: ProgressState };

/**
 * Steps of the run, with the current one marked and earlier ones left lit.
 * The line between two steps fills once the run has moved past the earlier step.
 */
function RunProgress({ steps }: { steps: ProgressStep[] }) {
  return (
    <ol aria-label="Where this run is" className="flex w-full text-[13px]">
      {steps.map((step, i) => {
        const previous = steps[i - 1];
        const filled = previous?.state === "done" || previous?.state === "failed";
        return (
          <li key={step.id} className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
            {previous && (
              <span aria-hidden="true" className="absolute top-[3px] right-1/2 h-0.5 w-full">
                <span className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--fg-muted)] opacity-30" />
                <span
                  className={`aui-track-fill absolute inset-y-0 left-0 rounded-[var(--radius-sm)] ${
                    previous.state === "failed" ? "bg-[var(--risk)]" : "bg-[var(--fg)]"
                  }`}
                  style={{ width: filled ? "100%" : "0%" }}
                />
              </span>
            )}
            <span aria-hidden="true" className={stepDotClass(step.state)} />
            <span aria-current={step.state === "current" ? "step" : undefined} className={stepLabelClass(step.state)}>
              {step.label}
              {step.state === "failed" ? (
                <span> · failed</span>
              ) : (
                <span className="sr-only"> ({PROGRESS_WORD[step.state]})</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function stepLabelClass(state: ProgressState): string {
  const base = "block w-full px-1 leading-snug";
  if (state === "current") return `${base} font-medium`;
  if (state === "failed") return `${base} font-medium text-[var(--risk)]`;
  if (state === "done") return `${base} text-[var(--fg)]`;
  return `${base} text-[var(--fg-muted)]`;
}

function stepDotClass(state: ProgressState): string {
  const base = "relative z-10 size-2 shrink-0 rounded-[var(--radius-sm)]";
  if (state === "current") return `${base} bg-[var(--agent)] shadow-[0_0_0_3px_var(--agent-soft)]`;
  if (state === "done") return `${base} bg-[var(--fg)]`;
  if (state === "failed") return `${base} bg-[var(--risk)] shadow-[0_0_0_3px_var(--risk-soft)]`;
  return `${base} border border-[var(--fg-muted)] bg-[var(--bg)]`;
}
