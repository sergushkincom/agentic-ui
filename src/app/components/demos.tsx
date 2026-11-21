"use client";

import type { ReactNode } from "react";
import { AgentDecisionCardDemo } from "./demos/agent-decision-card";
import { AgentHarnessDemo } from "./demos/agent-harness";
import { ConfidenceBarDemo } from "./demos/confidence-bar";
import { ConnectionPickerDemo } from "./demos/connection-picker";
import { FallbackBoundaryDemo } from "./demos/fallback-boundary";
import { HumanOverrideDemo } from "./demos/human-override";
import { StreamingTextStoppable } from "./demos/streaming-text";
import { ThinkingStateDemo } from "./demos/thinking-state";
import { ToolCallFeedDemo } from "./demos/tool-call-feed";
import { WaitForPersonDemo } from "./demos/wait-for-person";

export const DEMOS: Record<string, () => ReactNode> = {
  "streaming-text": StreamingTextStoppable,
  "agent-harness": AgentHarnessDemo,
  "thinking-state": ThinkingStateDemo,
  "confidence-bar": ConfidenceBarDemo,
  "human-override": HumanOverrideDemo,
  "tool-call-feed": ToolCallFeedDemo,
  "agent-decision-card": AgentDecisionCardDemo,
  "wait-for-person": WaitForPersonDemo,
  "connection-picker": ConnectionPickerDemo,
  "fallback-boundary": FallbackBoundaryDemo,
};

export function Demo({ slug }: { slug: string }) {
  const D = DEMOS[slug];
  return D ? <D /> : null;
}
