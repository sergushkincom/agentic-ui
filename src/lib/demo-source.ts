import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The file that implements each live demo. The docs page reads these bytes at
 * build time, so the Code tab is the module the Preview tab actually runs.
 * Tests check this map against the files and against the demo registry.
 */
export const DEMO_SOURCE_FILES: Record<string, { file: string; exportName: string }> = {
  "streaming-text": { file: "src/app/components/demos/streaming-text.tsx", exportName: "StreamingTextStoppable" },
  "thinking-state": { file: "src/app/components/demos/thinking-state.tsx", exportName: "ThinkingStateDemo" },
  "confidence-bar": { file: "src/app/components/demos/confidence-bar.tsx", exportName: "ConfidenceBarDemo" },
  "human-override": { file: "src/app/components/demos/human-override.tsx", exportName: "HumanOverrideDemo" },
  "tool-call-feed": { file: "src/app/components/demos/tool-call-feed.tsx", exportName: "ToolCallFeedDemo" },
  "agent-decision-card": { file: "src/app/components/demos/agent-decision-card.tsx", exportName: "AgentDecisionCardDemo" },
  "fallback-boundary": { file: "src/app/components/demos/fallback-boundary.tsx", exportName: "FallbackBoundaryDemo" },
};

/** File name shown above the code, relative to `src/app/components`. */
export function demoFilename(file: string): string {
  const prefix = "src/app/components/";
  return file.startsWith(prefix) ? file.slice(prefix.length) : file.slice(file.lastIndexOf("/") + 1);
}

export function demoSource(slug: string): { filename: string; code: string } {
  const entry = DEMO_SOURCE_FILES[slug];
  if (!entry) throw new Error(`No demo source for ${slug}`);
  return {
    filename: demoFilename(entry.file),
    code: readFileSync(join(process.cwd(), entry.file), "utf8"),
  };
}
