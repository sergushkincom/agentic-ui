"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RunChat, StreamingText, ThinkingState, type RunChatStep, type ThinkingStep } from "@/components/agentic";
import { Segmented } from "@/components/site/segmented";

function Controls({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

const ASK = "Match INV-2041 to the open purchase order.";
const ANSWER =
  "INV-2041 from Acme Fasteners is €38.00 over purchase order PO-7718. The bolts and washers match. The difference is a delivery line that is not on the order.";
const STOPPED_ANSWER = "I compared the lines and stopped. INV-2041 is €38.00 over PO-7718. That difference is a delivery line.";
const PLAN = ["Read invoice INV-2041", "Find the purchase order", "Compare line items"];
const WORDS = ANSWER.split(" ");

type Scene = "ask" | "running" | "answered" | "failed";

function phase(seen: number, total: number) {
  if (seen >= total) return 3;
  if (seen > 10) return 2;
  if (seen > 4) return 1;
  return 0;
}

export function RunChatDemo() {
  const [scenario, setScenario] = useState<Scene>("running");
  const [draft, setDraft] = useState("");
  const [asked, setAsked] = useState(ASK);
  const [tick, setTick] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (scenario !== "running" || stopped) return;
    setTick(0);
    const id = setInterval(() => {
      setTick((value) => {
        if (value >= WORDS.length) {
          clearInterval(id);
          return value;
        }
        return value + 1;
      });
    }, 80);
    return () => clearInterval(id);
  }, [scenario, stopped, run]);

  const seen = scenario === "answered" ? WORDS.length : scenario === "failed" ? 12 : Math.min(tick, WORDS.length);
  const doneStreaming = scenario === "answered" || scenario === "failed" || seen >= WORDS.length;
  const active = scenario === "failed" ? 2 : phase(seen, WORDS.length);
  const finished = scenario === "answered" || (scenario === "running" && doneStreaming && !stopped);
  const failed = scenario === "failed";

  const thinking: ThinkingStep[] = PLAN.map((label, index) => ({
    label,
    status: failed && index === 2 ? "failed" : finished || index < active ? "done" : index === active ? "active" : "pending",
  }));

  const steps: RunChatStep[] = PLAN.map((label, index) => {
    const status = failed && index === 2 ? "failed" : finished || index < active ? "done" : index === active ? "running" : "pending";
    const durationMs = status === "done" || status === "failed" ? [180, 420, 610][index] : undefined;
    return { id: String(index), label, status, durationMs };
  });

  const showThread = scenario !== "ask";
  const text = failed ? STOPPED_ANSWER : WORDS.slice(0, seen).join(" ");
  const streamStatus = stopped ? "stopped" : doneStreaming ? "done" : "streaming";
  const thinkingState = failed ? "failed" : finished ? "done" : "thinking";
  const elapsed = failed ? 5100 : finished ? 9400 : seen * 80;

  return (
    <div className="flex flex-col gap-5">
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(next) => {
            setScenario(next);
            setStopped(false);
            setTick(0);
            setDraft(next === "ask" ? ASK : "");
            if (next === "ask") setAsked(ASK);
          }}
          options={[
            { value: "ask", label: "Ask" },
            { value: "running", label: "Running" },
            { value: "answered", label: "Answered" },
            { value: "failed", label: "Failed" },
          ]}
        />
      </Controls>
      <p className="text-xs text-[var(--fg-muted)]">
        Send a message and the run starts. The answer is StreamingText. The line above the steps is ThinkingState. Running plays through.
      </p>
      <RunChat
        title="Match this invoice"
        messages={showThread ? [{ id: "ask", role: "human", text: asked }] : []}
        steps={showThread ? steps : []}
        draft={draft}
        onDraftChange={setDraft}
        busy={scenario === "running" && !doneStreaming && !stopped}
        placeholder="Ask the agent to match an invoice"
        onSend={() => {
          const textToSend = draft.trim();
          if (!textToSend) return;
          setAsked(textToSend);
          setDraft("");
          setStopped(false);
          setTick(0);
          setRun((value) => value + 1);
          setScenario("running");
        }}
        stream={
          showThread ? (
            <StreamingText text={text} status={streamStatus} onStop={streamStatus === "streaming" ? () => setStopped(true) : undefined} />
          ) : undefined
        }
        plan={
          showThread ? (
            <ThinkingState state={thinkingState} steps={thinking} elapsedMs={elapsed} />
          ) : undefined
        }
      />
    </div>
  );
}
