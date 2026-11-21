"use client";

import type { ReactNode } from "react";
import { AgentDecisionCardDemo } from "./demos/agent-decision-card";
import { AgentHarnessDemo } from "./demos/agent-harness";
import { ConfidenceBarDemo } from "./demos/confidence-bar";
import { ConnectionPickerDemo } from "./demos/connection-picker";
import { FallbackBoundaryDemo } from "./demos/fallback-boundary";
import { StepErrorDemo } from "./demos/step-error";
import { HumanOverrideDemo } from "./demos/human-override";
import { StreamingTextStoppable } from "./demos/streaming-text";
import { ThinkingStateDemo } from "./demos/thinking-state";
import { RunLogDemo } from "./demos/run-log";
import { RunHistoryDemo } from "./demos/run-history";
import { RunChatDemo } from "./demos/run-chat";
import { ToolCallFeedDemo } from "./demos/tool-call-feed";
import { RunNodeDemo } from "./demos/run-node";
import { RunGraphDemo } from "./demos/run-graph";
import { StepPickerDemo } from "./demos/step-picker";
import { WaitForPersonDemo } from "./demos/wait-for-person";

export const DEMOS: Record<string, () => ReactNode> = {
  "streaming-text": StreamingTextStoppable,
  "agent-harness": AgentHarnessDemo,
  "thinking-state": ThinkingStateDemo,
  "run-log": RunLogDemo,
  "run-history": RunHistoryDemo,
  "run-chat": RunChatDemo,
  "confidence-bar": ConfidenceBarDemo,
  "human-override": HumanOverrideDemo,
  "tool-call-feed": ToolCallFeedDemo,
  "run-node": RunNodeDemo,
  "run-graph": RunGraphDemo,
  "step-picker": StepPickerDemo,
  "agent-decision-card": AgentDecisionCardDemo,
  "wait-for-person": WaitForPersonDemo,
  "connection-picker": ConnectionPickerDemo,
  "fallback-boundary": FallbackBoundaryDemo,
  "step-error": StepErrorDemo,
};

export function Demo({ slug }: { slug: string }) {
  const D = DEMOS[slug];
  return D ? <D /> : null;
}
