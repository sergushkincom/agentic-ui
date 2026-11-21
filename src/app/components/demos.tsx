"use client";

import type { ReactNode } from "react";
import { AgentDecisionCardDemo } from "./demos/agent-decision-card";
import { ConfidenceBarDemo } from "./demos/confidence-bar";
import { ExpressionFieldDemo } from "./demos/expression-field";
import { PinnedOutputDemo } from "./demos/pinned-output";
import { StepInspectorDemo } from "./demos/step-inspector";
import { FallbackBoundaryDemo } from "./demos/fallback-boundary";
import { HumanOverrideDemo } from "./demos/human-override";
import { StreamingTextStoppable } from "./demos/streaming-text";
import { ThinkingStateDemo } from "./demos/thinking-state";
import { ToolCallFeedDemo } from "./demos/tool-call-feed";

export const DEMOS: Record<string, () => ReactNode> = {
  "streaming-text": StreamingTextStoppable,
  "thinking-state": ThinkingStateDemo,
  "confidence-bar": ConfidenceBarDemo,
  "step-inspector": StepInspectorDemo,
  "expression-field": ExpressionFieldDemo,
  "pinned-output": PinnedOutputDemo,
  "human-override": HumanOverrideDemo,
  "tool-call-feed": ToolCallFeedDemo,
  "agent-decision-card": AgentDecisionCardDemo,
  "fallback-boundary": FallbackBoundaryDemo,
};

export function Demo({ slug }: { slug: string }) {
  const D = DEMOS[slug];
  return D ? <D /> : null;
}
