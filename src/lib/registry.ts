/**
 * Every component's docs page renders from this list: the home grid, the sidebar and the page.
 * Order here is reading order on the site: from the smallest signal to the whole decision.
 */

export type PropRow = { name: string; type: string; note: string };

/** Index groups on /components, in reading order. */
export type MomentId = "while-it-works" | "how-sure" | "where-you-step-in" | "when-it-fails";

export const MOMENTS: { id: MomentId; label: string }[] = [
  { id: "while-it-works", label: "While it works" },
  { id: "how-sure", label: "How sure it is" },
  { id: "where-you-step-in", label: "Where you step in" },
  { id: "when-it-fails", label: "When it fails" },
];

export type ComponentDoc = {
  slug: string;
  name: string;
  /** Which agent moment this component belongs to on /components. */
  moment: MomentId;
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
    moment: "while-it-works",
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
      { name: "className", type: "string", note: "Optional. Extra class names on the root." },
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
    moment: "while-it-works",
    file: "thinking-state.tsx",
    summary: "What the agent is doing while you wait, folded into one line.",
    question: "What does a person need to see to decide whether to keep waiting?",
    decisions: [
      "The summary line names the current step and the elapsed time. \"Thinking…\" alone gives no reason to wait.",
      "The full step list is folded: most people need the line, auditors need the list.",
      "When it finishes, the line becomes a receipt: how long, how many steps.",
      "The spinner draws itself into a check, or into a warning if the work stopped. Reduced motion swaps the icon.",
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
    a11y: [
      "The toggle is a button with aria-expanded.",
      "Each step's status is spoken, not only shown as an icon.",
      "Completion is announced once through a polite live region.",
      "The status icon is decorative. Reduced motion swaps it instead of morphing.",
    ],
    notBuilt: ["Streaming the model's raw reasoning text. Steps are the agent's plan, written for people."],
  },
  {
    slug: "confidence-bar",
    name: "ConfidenceBar",
    moment: "how-sure",
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
    moment: "where-you-step-in",
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
    moment: "while-it-works",
    file: "tool-call-feed.tsx",
    summary: "What the agent touched, in order, readable by people and auditable by experts.",
    question: "How do you show what an agent did in other systems without dumping JSON on everyone?",
    decisions: [
      "Each row leads with a human summary. The tool name sits under it in small mono.",
      "Raw input and output are folded per row, for the person who has to audit it.",
      "Failures say what went wrong in plain words, in the row where it happened.",
      "A running action's spinner draws itself into a check, or into a warning if the call failed.",
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
    a11y: [
      "The list is a polite live region: new calls and status changes are announced.",
      "Status icons carry spoken labels. The icon itself is decorative, and reduced motion swaps it instead of morphing.",
    ],
    notBuilt: ["Cancelling a single call.", "Virtualisation for very long feeds."],
  },
  {
    slug: "step-inspector",
    name: "StepInspector",
    moment: "while-it-works",
    file: "step-inspector.tsx",
    summary: "One step, open: what came in, what it is set to, and what came out.",
    question: "When a step in the agent's work is wrong, where do you look?",
    decisions: [
      "Three panes in reading order: input, then parameters, then output. The output is what the next step will see.",
      "Parameters and settings are tabs. Parameters are the work. Settings are how the step behaves.",
      "An empty output says to run the step or pin mock data. It does not pretend there is a result.",
      "Pinned output is marked as yours. Live output is the step's own, from the last run.",
    ],
    usage: `<StepInspector
  title="Compare line items"
  step="erp.compare_lines"
  input={[{ id: "invoice", label: "Read invoice", fields: [{ name: "amount", value: "€12,518.00" }] }]}
  parameters={[{ name: "Tolerance", value: "€38.00 delivery" }]}
  settings={[{ name: "On mismatch", value: "Stop and ask" }]}
  tab="parameters"
  onTab={setTab}
  output={null}
  status="idle"
  onRun={runStep}
/>`,
    props: [
      { name: "title", type: "string", note: "What this step does, for people." },
      { name: "step", type: "string", note: "Machine name, shown small." },
      { name: "input", type: "StepItem[]", note: "Items from earlier steps: id, label, fields." },
      { name: "parameters", type: "StepParameter[]", note: "name, value, optional hint." },
      { name: "settings", type: "StepSetting[]", note: "name, value, optional hint. The Settings tab." },
      { name: "tab", type: '"parameters" | "settings"', note: "Which configuration tab is open." },
      { name: "onTab", type: "(tab) => void", note: "Switch tabs." },
      { name: "output", type: "StepOutput | null", note: "summary and fields. Null when there is nothing to show yet." },
      { name: "status", type: '"idle" | "running" | "done" | "failed"', note: "Drives the mark in the output pane." },
      { name: "source", type: '"pinned" | "live"', note: "Optional. Pinned: a person supplied this. Live: the step produced it." },
      { name: "error", type: "string", note: "Optional. Plain-words reason when status is failed." },
      { name: "onRun", type: "() => void", note: "Optional. Shows Run this step." },
    ],
    a11y: [
      "Parameters and Settings are tabs: arrow keys move between them, Home and End jump to the ends.",
      "The output mark is decorative. Running, done and failed are written, and a pinned output says pinned.",
      "When the step finishes or fails, the outcome is announced through a polite live region.",
    ],
    notBuilt: [
      "Editing the raw payload. The panes are for reading the step, not a JSON editor.",
      "Running the steps around this one. Run here runs this step. The parent decides what that calls.",
    ],
  },
  {
    slug: "expression-field",
    name: "ExpressionField",
    moment: "while-it-works",
    file: "expression-field.tsx",
    summary: "A value that is either typed, or taken from a field on a previous step.",
    question: "How do you point a step at an earlier field without hiding the link in syntax?",
    decisions: [
      "Fixed is a value you type. Expression is a field from a previous step, written as that step's name and the field.",
      "The reference is ordinary type. You can read it out loud. It is not a code token.",
      "It is not an override. Nothing here says the agent was wrong. It says where the value comes from.",
    ],
    usage: `<ExpressionField
  label="Supplier"
  mode="expression"
  fixedValue="Acme Fasteners"
  reference={{ step: "Read invoice", field: "supplier" }}
  fields={[
    { step: "Read invoice", field: "supplier" },
    { step: "Read invoice", field: "amount" },
  ]}
  onMode={setMode}
  onFixedValue={setFixedValue}
  onReference={setReference}
  choosing={choosing}
  onChoosing={setChoosing}
/>`,
    props: [
      { name: "label", type: "string", note: "Field name." },
      { name: "mode", type: '"fixed" | "expression"', note: "Typed value, or a reference to a previous step." },
      { name: "fixedValue", type: "string", note: "What you typed. Used while mode is fixed." },
      { name: "reference", type: "FieldReference | null", note: "step and field. Null until one is chosen." },
      { name: "fields", type: "FieldReference[]", note: "Previous-step fields a person can insert, in list order." },
      { name: "onMode", type: "(mode) => void", note: "Switch Fixed and Expression." },
      { name: "onFixedValue", type: "(value) => void", note: "Edit the typed value." },
      { name: "onReference", type: "(reference) => void", note: "Insert a previous step's field." },
      { name: "choosing", type: "boolean", note: "The list of previous fields is open." },
      { name: "onChoosing", type: "(choosing) => void", note: "Open or close that list." },
    ],
    a11y: [
      "Fixed and Expression are a radio group. Arrow keys move between them.",
      "The field list is a listbox. Arrows move, Home and End jump, Escape closes it and returns focus.",
      "A reference is spoken as the step's name and the field. Colour is not the only signal.",
    ],
    notBuilt: [
      "A code editor for arbitrary expressions. The field inserts one earlier field, which is the case a person can check.",
      "Brace syntax. A reference is the step's name and the field, in ordinary type.",
    ],
  },
  {
    slug: "pinned-output",
    name: "PinnedOutput",
    moment: "while-it-works",
    file: "pinned-output.tsx",
    summary: "Freeze a step's output so later steps can run without running this one again.",
    question: "How do later steps keep moving when you do not want to run this step again?",
    decisions: [
      "Pinned means a person supplied the output. Live means the step produced it. The badge says which.",
      "Later steps read the pinned output as if the step had just run.",
      "Using the live output drops the pin. The mock stays available to supply again.",
    ],
    usage: `<PinnedOutput
  step="Compare line items"
  summary="Amounts differ by the €38.00 delivery."
  source="live"
  onPin={pin}
  onUseLive={useLive}
  onSupplyMock={setMock}
/>`,
    props: [
      { name: "step", type: "string", note: "The step this output belongs to, for people." },
      { name: "summary", type: "string", note: "What later steps will read." },
      { name: "source", type: '"pinned" | "live"', note: "Who the output belongs to." },
      { name: "onPin", type: "() => void", note: "Keep the current summary and stop re-running this step." },
      { name: "onUseLive", type: "() => void", note: "Drop the pin and read the last run again." },
      { name: "onSupplyMock", type: "(summary) => void", note: "Replace the output with mock data, and pin that." },
      { name: "defaultEditing", type: "boolean", note: "Open the mock field on first render. Default false." },
    ],
    a11y: [
      "The badge is the word pinned or live, with the person or agent mark. Colour is not the only signal.",
      "Escape while supplying a mock cancels and returns focus to Supply mock.",
      "Enter in the mock field saves it. A change of source is announced through a polite live region.",
    ],
    notBuilt: [
      "Pinning several items. One step, one output.",
      "Re-running the step. Use live output reads the last run. Running again belongs to the step.",
    ],
  },
  {
    slug: "agent-decision-card",
    name: "AgentDecisionCard",
    moment: "where-you-step-in",
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
      { name: "onApprove", type: "() => void", note: "Required." },
      { name: "onReject", type: "() => void", note: "Required." },
      { name: "decidedBy", type: "string", note: "Name shown after a decision. Default \"You\"." },
    ],
    a11y: ["The outcome is announced through a polite live region.", "The fold is a button with aria-expanded."],
    notBuilt: ["Editing the decision before approving. Combine with HumanOverride for that."],
  },
  {
    slug: "fallback-boundary",
    name: "FallbackBoundary",
    moment: "when-it-fails",
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
      { name: "children", type: "ReactNode", note: "Agent output, shown when status is \"ok\"." },
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

/** Components in one moment, in registry order. That order is the index reading order. */
export function componentsIn(moment: MomentId) {
  return COMPONENTS.filter((c) => c.moment === moment);
}

export const REPO = "https://github.com/sergushkincom/agentic-ui";
