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
    slug: "run-node",
    name: "RunNode",
    moment: "while-it-works",
    file: "run-node.tsx",
    summary: "One step in a run: its name, what it is doing now, and how many items left it.",
    question: "What does a person need on a single step to see whether it is waiting, working, finished, or stuck?",
    decisions: [
      "The name is the step. The subtitle says what is happening now, in one line a person can read.",
      "Pending has not moved anything: a dashed port, and no count. A running step's spinner draws itself into a check, or into a warning if the step stops.",
      "The item count sits on the output port, in words: \"1 item\", \"5 items\". It lands there when items leave the step.",
      "A step a person carries wears the human mark. Every other step wears the agent mark.",
    ],
    usage: `<RunNode
  name="Compare the line items"
  subtitle="3 of 3 lines agree with PO-7718"
  status="ok"
  items={1}
/>`,
    props: [
      { name: "name", type: "string", note: "The step, short: \"Read INV-2041\"." },
      { name: "subtitle", type: "string", note: "What is happening now, in one line." },
      { name: "status", type: '"pending" | "running" | "ok" | "error"', note: "Pending, running, done or failed." },
      { name: "items", type: "number", note: "How many items left this step. Shown on the port once any have." },
      { name: "actor", type: '"agent" | "human"', note: "Who carries the step. Default \"agent\"." },
    ],
    a11y: [
      "The status is spoken: Pending, Running, Done or Failed. The icon is decorative, and reduced motion swaps it instead of morphing.",
      "The count on the port is text: \"1 item\" or \"5 items\".",
      "A step a person carries says You. Colour is not the only signal.",
    ],
    notBuilt: ["Opening the items. The count says how many left; reading them is another view.", "Dragging the step. It is a card, not something you place."],
  },
  {
    slug: "run-graph",
    name: "RunGraph",
    moment: "while-it-works",
    file: "run-graph.tsx",
    summary: "A short piece of a run: the steps, how many items moved between them, and whether you can start it.",
    question: "How do you show a few connected steps without pretending to be an editor?",
    decisions: [
      "It is a fragment. A dotted grid says these steps are connected. Nothing here is a canvas you build on.",
      "Each edge says how many items moved, in words: \"1 item\", \"5 items\". An edge with nothing on it stays dashed.",
      "One pill is the run. Execute starts it. Waiting means a person has the next move. Running means a step is in progress.",
      "The next step is added at the end of the chain, one button, not a palette living on the grid.",
    ],
    usage: `<RunGraph
  phase="waiting"
  steps={[
    { id: "read", name: "Read INV-2041", subtitle: "1 invoice",
      status: "ok", items: 1 },
    { id: "match", name: "Match open orders", subtitle: "5 open orders",
      status: "ok", items: 5 },
    { id: "confirm", name: "Confirm cost centre", subtitle: "Waiting for you",
      status: "pending", items: 0, actor: "human" },
  ]}
  onExecute={start}
  onAdd={addStep}
/>`,
    props: [
      { name: "steps", type: "RunGraphStep[]", note: "id, name, subtitle, status, items, actor. One chain, in order." },
      { name: "phase", type: '"execute" | "waiting" | "running"', note: "The pill. Execute can be pressed. Waiting and Running are status." },
      { name: "onExecute", type: "() => void", note: "Starts the run. Execute is disabled without it." },
      { name: "onAdd", type: "() => void", note: "Adds the next step. The add button is disabled without it." },
    ],
    a11y: [
      "The dotted grid is decorative.",
      "Execute and Add the next step are buttons. Waiting and Running are status, so a screen reader hears the run change.",
      "Each edge's label is text. A running edge draws itself; reduced motion shows the line in place and does not send a bead along it.",
    ],
    notBuilt: ["An editor: panning, zooming, wiring by hand, deleting a step.", "Branching. This fragment is one chain."],
  },
  {
    slug: "step-picker",
    name: "StepPicker",
    moment: "while-it-works",
    file: "step-picker.tsx",
    summary: "Search the steps that can come next, with the ones a person has to do kept in their own group.",
    question: "When someone adds a step, how do they find the one a person has to do, not only the ones the agent can run?",
    decisions: [
      "Search matches the name, the one-line detail, and the group. Groups that still have a match stay grouped.",
      "Human in the loop is its own group, in the human colour, with the human mark on each step. It is not buried under the ERP calls.",
      "A search that matches nothing says so. The list does not fill up with disabled rows.",
    ],
    usage: `<StepPicker
  steps={[
    { id: "po", name: "Find the purchase order",
      detail: "Open orders from this supplier",
      group: "Read the books", actor: "agent" },
    { id: "approve", name: "Approve the payment",
      detail: "€12,480.00 to Acme Fasteners",
      group: "Human in the loop", actor: "human" },
  ]}
  query={query}
  onQueryChange={setQuery}
  onSelect={addStep}
/>`,
    props: [
      { name: "steps", type: "StepChoice[]", note: "id, name, detail, group, actor." },
      { name: "query", type: "string", note: "The search text. The parent owns it." },
      { name: "onQueryChange", type: "(query: string) => void", note: "Called as the person types, and when Escape clears the field." },
      { name: "onSelect", type: "(id: string) => void", note: "The step the person chose." },
    ],
    a11y: [
      "The search field is a combobox. Arrows, Home and End move through the matching steps. Enter chooses the highlighted step. Escape clears the search.",
      "Steps a person has to do sit in their own group, and each one says You.",
      "The highlight follows the keyboard and the pointer. It is not colour alone: the row is selected in the listbox.",
    ],
    notBuilt: ["Inventing a new kind of step. You pick from the list the product gives you.", "Dragging a step onto the chain."],
  },
  {
    slug: "run-log",
    name: "RunLog",
    moment: "while-it-works",
    file: "run-log.tsx",
    summary: "A dock under a run: the steps and their durations, and the open step's data as a table or as JSON.",
    question: "How do you inspect one step's data without turning the whole run into a dump?",
    decisions: [
      "The steps sit in a tree, each with how long it took. The open step's data sits beside them.",
      "Input and Output are a switch. Most people want what came out. The input is there when the output looks wrong.",
      "The same payload is a table or JSON. The table is for reading. JSON is the exact value.",
      "A row that failed the check says Wrong. Colour is not the only mark.",
      "Clear forgets the log. An empty log says there is nothing to inspect.",
      "A running step's spinner draws itself into a check, or into a warning if that step failed. Reduced motion swaps the icon.",
    ],
    usage: `<RunLog
  steps={[{
    id: "compare",
    label: "Compare line items",
    status: "error",
    durationMs: 610,
    output: {
      columns: ["Item", "Order", "Invoice"],
      rows: [["Delivery", "—", "€38.00"]],
      marked: [0],
    },
  }]}
  onClear={clearLog}
/>`,
    props: [
      { name: "steps", type: "RunLogStep[]", note: "id, label, status, durationMs, children, input, output. A side has columns, rows, marked and json." },
      { name: "title", type: "string", note: "Dock title. Default \"Log\"." },
      { name: "onClear", type: "() => void", note: "Optional. Clears the log. The parent owns the data." },
    ],
    a11y: [
      "The steps are a tree. Arrows, Home and End move between them. The open step is selected.",
      "Status is written as well as drawn. The icon is decorative, and reduced motion swaps it instead of morphing.",
      "Input, Output, Table and JSON are toggle buttons.",
      "The table has a caption. A row that doesn't match says Wrong, not only by colour.",
    ],
    notBuilt: ["Editing a cell.", "Retrying a step from the dock. That is StepError.", "Virtualisation for very long logs."],
  },
  {
    slug: "run-history",
    name: "RunHistory",
    moment: "while-it-works",
    file: "run-history.tsx",
    summary: "Past runs: which succeeded, which errored, which were canceled, and which one is open.",
    question: "Which past run is this, and did it finish?",
    decisions: [
      "Each run is one row: what it was for, when it started, how it ended, and how long it took.",
      "Success, error and canceled are written. The mark repeats the word, it does not replace it.",
      "The selected run is highlighted. Selection belongs to the parent, so the rest of the screen can show that run.",
    ],
    usage: `<RunHistory
  runs={[
    { id: "r2", status: "error", at: "14 Nov, 11:02",
      durationMs: 610, label: "Match INV-2041" },
  ]}
  selectedId={selectedId}
  onSelect={setSelectedId}
/>`,
    props: [
      { name: "runs", type: "RunHistoryRun[]", note: "id, status (success, error, canceled), at, durationMs, label." },
      { name: "selectedId", type: "string", note: "The run that is highlighted." },
      { name: "onSelect", type: "(id: string) => void", note: "Called when a run is chosen." },
    ],
    a11y: [
      "The list is a listbox. The highlighted run is selected.",
      "Arrows, Home and End move the highlight.",
      "Success, error and canceled are written, not only coloured.",
      "The icon is decorative. Reduced motion swaps it instead of morphing.",
    ],
    notBuilt: ["Deleting a run.", "Comparing two runs side by side."],
  },
  {
    slug: "run-chat",
    name: "RunChat",
    moment: "while-it-works",
    file: "run-chat.tsx",
    summary: "A message starts the run. The thread is on one side, the live steps on the other.",
    question: "How does a person start a run and watch it work, in the same place they asked?",
    decisions: [
      "Sending a message is what starts the run. Until then, the other side says so.",
      "The answer can stream in the thread while the steps advance beside it. Waiting has a reason.",
      "Authorship stays marked: the person asked, the agent answers.",
      "A running step's spinner draws itself into a check, or into a warning if the step failed. Reduced motion swaps the icon.",
    ],
    usage: `<RunChat
  title="Match this invoice"
  messages={messages}
  steps={steps}
  draft={draft}
  onDraftChange={setDraft}
  onSend={startRun}
/>`,
    props: [
      { name: "title", type: "string", note: "Names the thread. The task, not a product name." },
      { name: "messages", type: "RunChatMessage[]", note: "id, role (human or agent), text." },
      { name: "steps", type: "RunChatStep[]", note: "id, label, status (pending, running, done, failed), durationMs." },
      { name: "draft", type: "string", note: "The message being written." },
      { name: "onDraftChange", type: "(draft: string) => void", note: "Keeps the field." },
      { name: "onSend", type: "() => void", note: "Sends the draft and starts the run." },
      { name: "stream", type: "ReactNode", note: "Optional. The answer still being written. The demo passes StreamingText." },
      { name: "plan", type: "ReactNode", note: "Optional. A one-line plan above the steps. The demo passes ThinkingState." },
      { name: "busy", type: "boolean", note: "Optional. While a run is in flight, Send waits." },
      { name: "placeholder", type: "string", note: "Optional field hint. Default \"Message the agent\"." },
    ],
    a11y: [
      "The message field has a label. Enter sends. Send is a button.",
      "Human and agent messages carry a mark with text, not only colour.",
      "Each step's status is written. The icon is decorative, and reduced motion swaps it instead of morphing.",
      "The step list is a polite live region.",
    ],
    notBuilt: ["Several threads.", "Attachments.", "Stopping a single step. Stop on a stream belongs to StreamingText."],
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
  {
    slug: "step-error",
    name: "StepError",
    moment: "when-it-fails",
    file: "step-error.tsx",
    summary: "One step failed: what broke, which value was wrong, and a retry for that step.",
    question: "When one step fails, what exactly was wrong with the data?",
    decisions: [
      "The step name, a plain-words reason, and the values that were involved are the whole message.",
      "The wrong value is labelled Wrong, and the neighbouring values stay so the mismatch can be read.",
      "Retry runs that step again. It does not offer another way to do the whole task.",
      "Nothing after this step ran. That is said in words.",
    ],
    usage: `<StepError
  step="Compare line items"
  message="The invoice total doesn't match the purchase order."
  facts={[
    { label: "Purchase order PO-7718", value: "€12,480.00" },
    { label: "Invoice INV-2041", value: "€12,518.00", wrong: true },
  ]}
  onRetry={retryStep}
/>`,
    props: [
      { name: "step", type: "string", note: "The step that failed, in words." },
      { name: "message", type: "string", note: "What broke, in plain words." },
      { name: "facts", type: "StepErrorFact[]", note: "label, value, and wrong on the value that failed the check." },
      { name: "onRetry", type: "() => void", note: "Runs this step again." },
    ],
    a11y: [
      "role=\"alert\", so the failure is announced.",
      "The wrong value says Wrong, not only by colour.",
      "Retry this step is a button.",
    ],
    notBuilt: ["A manual path for the whole task. That is FallbackBoundary.", "Editing the bad value in place. That is HumanOverride."],
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
