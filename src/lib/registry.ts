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
    slug: "agent-harness",
    name: "AgentHarness",
    moment: "while-it-works",
    file: "agent-harness.tsx",
    summary: "An agent step with sockets for a model, memory and tools. A missing required socket is a warning.",
    question: "What does this step need before it can run, and what is still unplugged?",
    decisions: [
      "The step is a harness: one socket for the model, one for memory, and one for each tool. What is plugged in is written in words.",
      "An empty required socket is a warning, and the step says it will not run. An empty optional socket stays quiet.",
      "A connected socket settles on a check. Filling the socket that was blocking the step draws that warning into the check.",
    ],
    usage: `<AgentHarness
  title="Match the invoice"
  task="Match INV-2041 to PO-7718 before anyone is paid."
  sockets={[
    { id: "model", kind: "model", required: true },
    { id: "memory", kind: "memory", value: "Last 6 invoices from Acme Fasteners" },
    { id: "invoice", kind: "tool", value: "Read invoice INV-2041" },
  ]}
/>`,
    props: [
      { name: "title", type: "string", note: "Name of the step." },
      { name: "task", type: "string", note: "What the step is trying to do." },
      { name: "sockets", type: "HarnessSocket[]", note: "id, kind (model, memory or tool), value, required. An empty value means the socket is open." },
    ],
    a11y: [
      "Each socket reads as text: the kind, what is connected or Not connected, and Required or Optional.",
      "The warning is a status, so a change is announced. Colour is not the only signal.",
      "The status icon is decorative. Reduced motion swaps it instead of morphing.",
    ],
    notBuilt: [
      "Picking a model or a tool from a catalogue. The parent passes what is already connected.",
      "Running the step. This is the harness, not the run.",
    ],
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
    slug: "wait-for-person",
    name: "WaitForPerson",
    moment: "where-you-step-in",
    file: "wait-for-person.tsx",
    summary: "A paused run that is waiting for you: the question, then a reply or an approval that lets it continue.",
    question: "When a run stops for a person, what do they need in front of them to let it continue?",
    decisions: [
      "The run is paused, and it says so. The agent is not still working, and this is not a scored proposal.",
      "The question comes first. A reply sends the words back. An approval is Approve or Send back. Either answer resumes the run.",
      "Until you answer, nothing continues. After you answer, the card is a receipt: what you said, and that the run continues.",
    ],
    usage: `<WaitForPerson
  task="The agent stopped while matching this invoice to PO-7718."
  prompt="Which cost centre takes the €38.00 delivery on INV-2041?"
  mode="reply"
  status={status}
  answer={answer}
  onRespond={(next) => { setAnswer(next); setStatus("resumed") }}
/>`,
    props: [
      { name: "task", type: "string", note: "What the run was doing when it stopped." },
      { name: "prompt", type: "string", note: "The question, in one sentence. Labels the reply field." },
      { name: "mode", type: '"reply" | "approval"', note: "A written reply, or Approve and Send back." },
      { name: "status", type: '"waiting" | "resumed"', note: "Waiting holds the run. Resumed shows the receipt." },
      { name: "answer", type: "string", note: "What the person sent. Shown once the run resumes." },
      { name: "onRespond", type: "(answer: string) => void", note: "The reply text, or \"Approved\", or \"Sent back\"." },
    ],
    a11y: [
      "The question labels the reply field.",
      "Pause and resume are announced through a polite live region.",
      "Escape clears an unsent reply and leaves focus in the field. The run stays paused.",
      "The waiting mark pulses, and holds still when reduced motion is on. The resume check morphs, or swaps.",
    ],
    notBuilt: [
      "A timer or a reminder. The run waits. It does not nag.",
      "Editing a value the agent already filled in. That is HumanOverride. Signing off a scored action is AgentDecisionCard.",
    ],
  },
  {
    slug: "connection-picker",
    name: "ConnectionPicker",
    moment: "where-you-step-in",
    file: "connection-picker.tsx",
    summary: "Pick a connected account, or sign in, or set one up by hand. A key is never shown.",
    question: "How does a person give the agent an account without the secret ever sitting on screen?",
    decisions: [
      "Existing accounts are a choice of name and who it belongs to. The key is not part of the account.",
      "The other path is written out: Sign in or set up manually. Sign-in never hands this component a token.",
      "A manual key is typed into a concealed field, passed on once, and dropped. Nothing here can reveal it.",
    ],
    usage: `<ConnectionPicker
  purpose="The agent needs the ERP to read INV-2041."
  accounts={accounts}
  selectedId={selectedId}
  mode={mode}
  onSelect={setSelectedId}
  onSignIn={signIn}
  onModeChange={setMode}
  onManual={({ name }) => saveAccount(name)}
/>`,
    props: [
      { name: "purpose", type: "string", note: "Why the agent needs an account." },
      { name: "accounts", type: "ConnectionAccount[]", note: "id, name, holder. Names and holders only. Never a key." },
      { name: "selectedId", type: "string", note: "The account chosen for this step, if one is connected." },
      { name: "onSelect", type: "(id: string) => void", note: "Chooses an existing account." },
      { name: "onSignIn", type: "() => void", note: "Starts sign-in. The component never receives a token." },
      { name: "mode", type: '"pick" | "manual"', note: "The account list, or the manual setup form." },
      { name: "onModeChange", type: "(mode) => void", note: "Switches between the list and manual setup." },
      { name: "onManual", type: "({ name, secret }) => void", note: "The key is passed once, then the field is cleared. Do not render secret." },
    ],
    a11y: [
      "Accounts are a radio group. Arrows move the selection. One account is in the tab order.",
      "The key field is labelled and concealed. Escape closes manual setup, drops the unsent key, and returns focus to Set up manually.",
      "Connected is a word and a check, not only a colour.",
    ],
    notBuilt: [
      "A control that reveals the key.",
      "Remembering the key, or testing that it works. The parent does that where the value is not rendered.",
    ],
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
