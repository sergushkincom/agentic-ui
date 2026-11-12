import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { confidenceBand } from "../src/components/agentic/format.ts";
import {
  AGENT_COST_CENTRE,
  ASK_BELOW,
  DECISION_CONFIDENCE,
  FIELD_CONFIDENCE,
  MANUAL_RECEIPT,
  MATCH_ANSWER,
  RECEIPT_COST_CENTRE,
  freshRun,
  phaseOf,
  projectRun,
  runReducer,
  type RunState,
  type RunView,
} from "../src/lib/agent-run.ts";

function playUntil(state: RunState, pred: (view: RunView) => boolean): RunState {
  let current = state;
  for (let i = 0; i < 500; i++) {
    if (pred(projectRun(current))) return current;
    const next = runReducer(current, { type: "tick" });
    if (next === current) break;
    current = next;
  }
  return current;
}

describe("agent run, match path", () => {
  it("opens on the invoice, with the first tool running", () => {
    const view = projectRun(freshRun("match"));
    assert.equal(view.phase, "working");
    assert.equal(view.playing, true);
    assert.equal(view.thinking.state, "thinking");
    assert.equal(view.thinking.steps[0]?.status, "active");
    assert.equal(view.calls[0]?.status, "running");
    assert.equal(view.calls[1]?.status, "queued");
    assert.equal(view.boundary, null);
    assert.equal(view.stream, null);
    assert.equal(view.decision, null);
    assert.equal(view.confidence, null);
  });

  it("reaches a low-confidence field, then a decision only after an override", () => {
    const waiting = playUntil(freshRun("match"), (view) => view.phase === "uncertain");
    const ask = projectRun(waiting);
    assert.equal(ask.playing, false);
    assert.equal(ask.stream?.status, "done");
    assert.equal(ask.stream?.text, MATCH_ANSWER);
    assert.ok(ask.calls.every((call) => call.status === "done"));
    assert.equal(ask.calls[2]?.durationMs, 610);
    assert.equal(ask.thinking.state, "done");
    assert.equal(ask.confidence?.value, FIELD_CONFIDENCE);
    assert.equal(confidenceBand(FIELD_CONFIDENCE, ASK_BELOW), "unsure");
    assert.ok(FIELD_CONFIDENCE < ASK_BELOW);
    assert.equal(ask.override?.source, "agent");
    assert.equal(ask.override?.value, AGENT_COST_CENTRE);
    assert.equal(ask.decision, null);
    assert.equal(ask.boundary, null);

    const same = runReducer(waiting, { type: "override", value: AGENT_COST_CENTRE });
    assert.equal(phaseOf(same), "uncertain");

    const ignored = runReducer(waiting, { type: "approve" });
    assert.equal(ignored, waiting);

    const overridden = runReducer(waiting, { type: "override", value: `  ${RECEIPT_COST_CENTRE}  ` });
    const proposal = projectRun(overridden);
    assert.equal(proposal.phase, "decision");
    assert.equal(proposal.override?.source, "human");
    assert.equal(proposal.override?.value, RECEIPT_COST_CENTRE);
    assert.equal(proposal.decision?.status, "proposed");
    assert.equal(proposal.decision?.data.confidence, DECISION_CONFIDENCE);
    assert.equal(confidenceBand(DECISION_CONFIDENCE, ASK_BELOW), "sure");
    assert.ok(proposal.decision?.data.effect.includes(RECEIPT_COST_CENTRE));
    assert.equal(proposal.boundary?.status, "ok");
    assert.equal(proposal.skip?.id, "decision");

    const reverted = runReducer(overridden, { type: "override", value: AGENT_COST_CENTRE });
    assert.equal(phaseOf(reverted), "uncertain");
    assert.equal(projectRun(reverted).decision, null);
  });

  it("approves and rejects only from the proposal, and a later edit keeps the outcome", () => {
    const waiting = playUntil(freshRun("match"), (view) => view.phase === "uncertain");
    const proposed = runReducer(waiting, { type: "override", value: RECEIPT_COST_CENTRE });

    const approved = runReducer(proposed, { type: "approve" });
    assert.equal(projectRun(approved).phase, "approved");
    assert.equal(projectRun(approved).decision?.status, "approved");
    assert.equal(runReducer(approved, { type: "reject" }), approved);

    const edited = runReducer(approved, { type: "override", value: "4300 · Stores" });
    const editedView = projectRun(edited);
    assert.equal(editedView.phase, "approved");
    assert.ok(editedView.decision?.data.effect.includes("4300 · Stores"));

    const rejected = runReducer(proposed, { type: "reject" });
    assert.equal(projectRun(rejected).phase, "rejected");
    assert.equal(projectRun(rejected).announcement, "You rejected the payment.");
  });

  it("stops the stream early and still lets the person finish", () => {
    const streaming = playUntil(freshRun("match"), (view) => view.phase === "streaming");
    const partial = projectRun(streaming).stream?.text ?? "";
    assert.ok(partial.length > 0);
    assert.ok(partial.length < MATCH_ANSWER.length);
    assert.ok(MATCH_ANSWER.startsWith(partial));

    const stopped = runReducer(streaming, { type: "stop-stream" });
    const view = projectRun(stopped);
    assert.equal(view.phase, "uncertain");
    assert.equal(view.playing, false);
    assert.equal(view.stream?.status, "stopped");
    assert.equal(view.stream?.text, partial);
    assert.equal(runReducer(stopped, { type: "tick" }).beat, stopped.beat);

    const done = runReducer(stopped, { type: "override", value: RECEIPT_COST_CENTRE });
    assert.equal(phaseOf(done), "decision");
  });

  it("ignores ticks once the run is waiting", () => {
    const waiting = playUntil(freshRun("match"), (view) => view.phase === "uncertain");
    assert.equal(runReducer(waiting, { type: "tick" }), waiting);
  });

  it("restarts the same path from the first beat", () => {
    const waiting = playUntil(freshRun("match"), (view) => view.phase === "uncertain");
    const proposed = runReducer(waiting, { type: "override", value: RECEIPT_COST_CENTRE });
    const restarted = runReducer(proposed, { type: "restart" });
    assert.equal(restarted.scenario, "match");
    assert.equal(restarted.beat, 0);
    assert.equal(restarted.costSource, "agent");
    assert.equal(restarted.decision, null);
    assert.ok(restarted.runId > proposed.runId);
    assert.equal(projectRun(restarted).phase, "working");
  });
});

describe("agent run, failure path", () => {
  it("fails the goods receipt and leaves later calls queued", () => {
    const failed = playUntil(freshRun("erp-fails"), (view) => view.phase === "failed");
    const view = projectRun(failed);
    assert.equal(view.playing, false);
    assert.equal(view.thinking.state, "failed");
    assert.equal(view.thinking.steps[2]?.status, "failed");
    assert.equal(view.calls[0]?.status, "done");
    assert.equal(view.calls[1]?.status, "done");
    assert.equal(projectRun(freshRun("erp-fails")).boundary?.status, "running");
    assert.equal(view.calls[2]?.status, "failed");
    assert.equal(view.calls[2]?.durationMs, 10_000);
    assert.match(view.calls[2]?.error ?? "", /Nothing was posted/);
    assert.equal(view.calls[3]?.status, "queued");
    assert.equal(view.boundary?.status, "failed");
    assert.match(view.boundary?.reason ?? "", /didn't answer/);
    assert.equal(view.stream, null);
    assert.equal(view.decision, null);
    assert.equal(view.confidence, null);
    assert.equal(runReducer(failed, { type: "approve" }), failed);
  });

  it("hands the task back, then a retry starts the failure path over", () => {
    const failed = playUntil(freshRun("erp-fails"), (view) => view.phase === "failed");
    assert.equal(runReducer(freshRun("match"), { type: "take-over" }).manual, false);

    const manual = runReducer(failed, { type: "take-over" });
    const done = projectRun(manual);
    assert.equal(done.phase, "manual");
    assert.equal(done.receipt, MANUAL_RECEIPT);
    assert.equal(done.boundary?.status, "ok");
    assert.equal(done.progress.find((step) => step.id === "hand-back")?.state, "done");

    const retried = runReducer(manual, { type: "retry" });
    assert.equal(retried.scenario, "erp-fails");
    assert.equal(retried.beat, 0);
    assert.equal(retried.manual, false);
    assert.equal(projectRun(retried).phase, "working");
    assert.equal(projectRun(retried).boundary?.status, "running");
  });

  it("switching path resets the run", () => {
    const failed = playUntil(freshRun("erp-fails"), (view) => view.phase === "failed");
    const same = runReducer(failed, { type: "scenario", scenario: "erp-fails" });
    assert.equal(same, failed);

    const match = runReducer(failed, { type: "scenario", scenario: "match" });
    assert.equal(match.scenario, "match");
    assert.equal(match.beat, 0);
    assert.equal(projectRun(match).phase, "working");
  });
});
