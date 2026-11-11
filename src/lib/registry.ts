/**
 * Every component's docs page renders from this list: the home grid, the sidebar and the page.
 * Order here is reading order on the site: from the smallest signal to the whole decision.
 */

export type PropRow = { name: string; type: string; note: string };

export type ComponentDoc = {
  slug: string;
  name: string;
  file: string;
  /** One line, what it is. */
  summary: string;
  /** The design question it answers. */
  question: string;
  /** The choices that answer it. */
  decisions: string[];
  usage: string;
  props: PropRow[];
  a11y: string[];
  notBuilt: string[];
};

export const COMPONENTS: ComponentDoc[] = [
  {
    slug: "streaming-text",
    name: "StreamingText",
    file: "streaming-text.tsx",
    summary: "Agent text that arrives token by token, with a way to stop it.",
    question: "How do you show an answer that is still being written, without making people read a moving target?",
    decisions: [
      "The parent owns the stream; the component only shows text and status. It works with any SDK.",
      "A caret marks the writing edge. Text before it is final and safe to read.",
      "Stopping keeps what arrived and says so with a word count. A stop is a choice, not an error.",
    ],
    usage: `<StreamingText
  text={received}
  status={done ? "done" : "streaming"}
  onStop={() => controller.abort()}
/>`,
    props: [
      { name: "text", type: "string", note: "Text received so far." },
      { name: "status", type: '"streaming" | "done" | "stopped"', note: "Drives the caret, Stop button and the stopped note." },
      { name: "onStop", type: "() => void", note: "Optional. Shows Stop while streaming." },
    ],
    a11y: [
      "aria-busy while streaming, so screen readers read the answer once it is complete, not every token.",
      "The caret is decorative (aria-hidden) and stops blinking with reduced motion.",
    ],
    notBuilt: ["Markdown rendering: bring your own and pass the result as children of your own wrapper.", "Token-level animation or fade-in per word."],
  },
  {
    slug: "thinking-state",
    name: "ThinkingState",
    file: "thinking-state.tsx",
    summary: "What the agent is doing while you wait, folded into one line.",
    question: "What does a person need to see to decide whether to keep waiting?",
    decisions: [
      "The summary line names the current step and the elapsed time. \"Thinking…\" alone gives no reason to wait.",
      "The full step list is folded: most people need the line, auditors need the list.",
      "When it finishes, the line becomes a receipt: how long, how many steps.",
    ],
    usage: `<ThinkingState
  state="thinking"
  elapsedMs={6200}
  steps={[
    { label: "Read invoice INV-2041", status: "done" },
    { label: "Find the purchase order", status: "active" },
    { label: "Compare line items", status: "pending" },
  ]}
/>`,
    props: [
      { name: "state", type: '"thinking" | "done" | "failed"', note: "Overall state." },
      { name: "steps", type: "ThinkingStep[]", note: "label + status: done, active, pending or failed." },
      { name: "elapsedMs", type: "number", note: "Time since the agent started." },
      { name: "defaultOpen", type: "boolean", note: "Show the steps unfolded. Default false." },
    ],
    a11y: ["The toggle is a button with aria-expanded.", "Each step's status is spoken, not only shown as an icon.", "Completion is announced once through a polite live region."],
    notBuilt: ["Streaming the model's raw reasoning text. Steps are the agent's plan, written for people."],
  },
  {
    slug: "confidence-bar",
    name: "ConfidenceBar",
    file: "confidence-bar.tsx",
    summary: "How sure the agent is, in words first, and where it stops acting alone.",
    question: "What does 72% mean to someone who has to act on it?",
    decisions: [
      "Words lead (Sure, Fairly sure, Not sure), the percentage follows.",
      "A tick marks the threshold below which the agent asks a person. The gap between bar and tick is the message.",
      "A basis line says what the number rests on. Without it, a percentage is just a vibe.",
    ],
    usage: `<ConfidenceBar
  value={0.78}
  askBelow={0.7}
  basis="3 of 4 fields match the purchase order"
/>`,
    props: [
      { name: "value", type: "number", note: "0 to 1." },
      { name: "askBelow", type: "number", note: "Threshold for asking a person. Default 0.7." },
      { name: "basis", type: "string", note: "What the number is based on, in plain words." },
      { name: "compact", type: "boolean", note: "Thinner bar, no footnote. For use inside cards." },
    ],
    a11y: ["role=\"meter\" with aria-valuetext in words: \"Fairly sure, 78%\".", "Colour is never the only signal: the band is always written."],
    notBuilt: ["Calibration. The component shows a number; making the number honest is the model team's job."],
  },
  {
    slug: "human-override",
    name: "HumanOverride",
    file: "human-override.tsx",
    summary: "A field the agent filled in, that a person can take over in one step.",
    question: "When a person corrects the agent, how do they know the correction will stick?",
    decisions: [
      "Authorship is always visible: Filled by agent, or Changed by you.",
      "After an override the field keeps the agent's value in view and says the agent won't overwrite yours.",
      "Going back to the agent's value is one click, so overriding never feels risky.",
    ],
    usage: `<HumanOverride
  label="Cost centre"
  agentValue="4100 · Production"
  value={value}
  source={source}
  onChange={(v, s) => { setValue(v); setSource(s) }}
  reason="Same as the last 6 invoices from this supplier"
/>`,
    props: [
      { name: "label", type: "string", note: "Field name." },
      { name: "agentValue", type: "string", note: "What the agent filled in." },
      { name: "value", type: "string", note: "Current value." },
      { name: "source", type: '"agent" | "human"', note: "Whose value is shown." },
      { name: "onChange", type: "(value, source) => void", note: "Typing the agent's value back counts as the agent's." },
      { name: "reason", type: "string", note: "Why the agent chose its value." },
    ],
    a11y: ["Focus returns to Change after saving or cancelling.", "Escape cancels editing.", "Authorship is text, not only colour."],
    notBuilt: ["Telling the agent to learn from the override. That is a product decision, not a field's."],
  },
  {
    slug: "tool-call-feed",
    name: "ToolCallFeed",
    file: "tool-call-feed.tsx",
    summary: "What the agent touched, in order, readable by people and auditable by experts.",
    question: "How do you show what an agent did in other systems without dumping JSON on everyone?",
    decisions: [
      "Each row leads with a human summary. The tool name sits under it in small mono.",
      "Raw input and output are folded per row, for the person who has to audit it.",
      "Failures say what went wrong in plain words, in the row where it happened.",
    ],
    usage: `<ToolCallFeed calls={[
  { id: "1", tool: "erp.find_purchase_order",
    summary: "Find the purchase order for INV-2041",
    status: "done", durationMs: 420,
    input: { supplier: "Acme Fasteners" },
    output: "PO-7718 · 3 lines · €12,480.00" },
]} />`,
    props: [
      { name: "calls", type: "ToolCall[]", note: "id, tool, summary, status, durationMs, input, output, error." },
      { name: "title", type: "string", note: "Header. Default \"Actions\"." },
    ],
    a11y: ["The list is a polite live region: new calls and status changes are announced.", "Status icons carry spoken labels."],
    notBuilt: ["Cancelling a single call.", "Virtualisation for very long feeds."],
  },
  {
    slug: "agent-decision-card",
    name: "AgentDecisionCard",
    file: "agent-decision-card.tsx",
    summary: "A decision the agent proposes and a person signs off.",
    question: "What does a person need to read, in what order, to approve an agent's action responsibly?",
    decisions: [
      "Reading order: what happens, can I undo it, how sure is it, why.",
      "\"Can't be undone\" is marked in the risk colour, because it changes how carefully people read.",
      "Evidence and the alternatives the agent rejected are there, but folded.",
    ],
    usage: `<AgentDecisionCard
  decision={{
    title: "Pay INV-2041 against PO-7718",
    effect: "Schedules €12,480.00 to Acme Fasteners on 14 Nov.",
    confidence: 0.91,
    reasons: ["Amounts match to the cent", "Goods receipt posted on 6 Nov"],
    reversible: { ok: true, until: "13 Nov, 18:00" },
  }}
  status={status}
  onApprove={() => setStatus("approved")}
  onReject={() => setStatus("rejected")}
/>`,
    props: [
      { name: "decision", type: "AgentDecision", note: "title, effect, confidence, reasons, evidence, alternatives, reversible." },
      { name: "status", type: '"proposed" | "approved" | "rejected"', note: "Replaces the buttons with who decided." },
      { name: "onApprove / onReject", type: "() => void", note: "Required." },
      { name: "decidedBy", type: "string", note: "Name shown after a decision. Default \"You\"." },
    ],
    a11y: ["The outcome is announced through a polite live region.", "The fold is a button with aria-expanded."],
    notBuilt: ["Editing the decision before approving. Combine with HumanOverride for that."],
  },
  {
    slug: "fallback-boundary",
    name: "FallbackBoundary",
    file: "fallback-boundary.tsx",
    summary: "What a person sees when the agent is slow or fails: what happened and a way to do it themselves.",
    question: "What happens to the person's task when the agent doesn't come back?",
    decisions: [
      "Every state has an exit. The manual path is a primary button, not a footnote.",
      "Slow is its own state: keep waiting or take over, nothing changes until one of you finishes.",
      "Failure says nothing was changed. That is the first thing people worry about.",
      "It is also a React error boundary: a crash in the agent's output shows the same fallback.",
    ],
    usage: `<FallbackBoundary
  status={status}
  task="match this invoice"
  manual={{ label: "Match it myself", onClick: openManualMatch }}
  onRetry={rerun}
>
  <AgentDecisionCard … />
</FallbackBoundary>`,
    props: [
      { name: "status", type: '"running" | "slow" | "ok" | "failed"', note: "The parent decides when running becomes slow." },
      { name: "task", type: "string", note: "What the agent was asked to do, as a verb phrase." },
      { name: "manual", type: "{ label, onClick }", note: "The path without the agent." },
      { name: "onRetry", type: "() => void", note: "Shown on failure." },
      { name: "reason", type: "string", note: "Plain-words reason for a failure." },
    ],
    a11y: ["role=\"alert\" on failure, role=\"status\" while waiting."],
    notBuilt: ["Timers. When \"running\" becomes \"slow\" depends on the task; the parent decides."],
  },
];

export function getComponent(slug: string) {
  return COMPONENTS.find((c) => c.slug === slug);
}

export const REPO = "https://github.com/sergushkincom/agentic-ui";
