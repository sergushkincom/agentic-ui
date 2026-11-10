"use client";

import { Component, type ReactNode } from "react";
import { Spinner, buttonClass } from "./marks";

export type AgentRunStatus = "running" | "slow" | "ok" | "failed";

export type FallbackBoundaryProps = {
  status: AgentRunStatus;
  /** The agent's output, shown when status is "ok". */
  children: ReactNode;
  /** What the person can do without the agent. The agent is a shortcut, never the only door. */
  manual: { label: string; onClick: () => void };
  onRetry: () => void;
  /** Plain-words reason for a failure, if known. */
  reason?: string;
  /** What the agent was asked to do, for the waiting and failure copy. */
  task: string;
};

type BoundaryState = { crashed: boolean };

/**
 * Wraps agent output. While the agent is slow or has failed, the person sees what happened and
 * a manual path, instead of a spinner with no exit. Also catches render errors in the output.
 */
export class FallbackBoundary extends Component<FallbackBoundaryProps, BoundaryState> {
  state: BoundaryState = { crashed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { crashed: true };
  }

  componentDidUpdate(prev: FallbackBoundaryProps) {
    // A new run (status back to running) clears a previous crash.
    if (this.state.crashed && prev.status !== "running" && this.props.status === "running") {
      this.setState({ crashed: false });
    }
  }

  render() {
    const { status, children, manual, onRetry, reason, task } = this.props;
    const failed = status === "failed" || this.state.crashed;

    if (status === "ok" && !failed) return children;

    return (
      <div
        role={failed ? "alert" : "status"}
        className="flex flex-col gap-3 rounded-[var(--radius)] border p-4"
        style={{
          borderColor: failed ? "var(--risk)" : status === "slow" ? "var(--warn)" : "var(--border)",
          background: failed ? "var(--risk-soft)" : status === "slow" ? "var(--warn-soft)" : "var(--surface)",
        }}
      >
        <div className="flex items-start gap-2.5">
          {!failed && (
            <span className="pt-0.5 text-[var(--agent)]">
              <Spinner />
            </span>
          )}
          <div className="flex flex-col gap-0.5">
            <p className="text-[14px] font-medium">
              {failed
                ? `The agent couldn't ${task}.`
                : status === "slow"
                  ? `Still working on it. This is taking longer than usual.`
                  : `The agent is working on it.`}
            </p>
            <p className="text-[13px] text-[var(--fg-muted)]">
              {failed
                ? (reason ?? (this.state.crashed ? "Its answer couldn't be shown." : "Something went wrong on its side.")) +
                  " Nothing was changed."
                : status === "slow"
                  ? "You can keep waiting, or do it yourself. Nothing changes until one of you finishes."
                  : `Task: ${task}.`}
            </p>
          </div>
        </div>
        {(failed || status === "slow") && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={manual.onClick} className={buttonClass.primary}>
              {manual.label}
            </button>
            {failed && (
              <button type="button" onClick={onRetry} className={buttonClass.secondary}>
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}
