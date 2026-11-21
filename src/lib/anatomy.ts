/**
 * Anatomy of the composed components. Names are identifiers in the component source:
 * a function, a rendered mark, or a field. Children are drawn inside their parent.
 * ToolCallFeed nests Row, and Row's status icon nests StatusMorph, matching the source.
 * RunGraph nests the phase pill, each RunNode, the edge between them, and AddStep.
 * AgentDecisionCard keeps the disclosure and the decision footer as nested regions.
 */

export type AnatomyNode = {
  name: string;
  /** The question this part answers, as a person reading the component would ask it. */
  answers: string;
  children?: readonly AnatomyNode[];
};

export const ANATOMY: Record<string, readonly AnatomyNode[]> = {
  "run-log": [
    {
      name: "RunLog",
      answers: "What did this run do, and what data did the open step take in or send out?",
      children: [
        { name: "title", answers: "What is this log called?" },
        { name: "onClear", answers: "Can the person wipe the log?" },
        {
          name: "StepTree",
          answers: "Which steps ran, in what order, and which one is open?",
          children: [
            {
              name: "StepRow",
              answers: "What happened in this step, and how long did it take?",
              children: [
                {
                  name: "StatusIcon",
                  answers: "Did this step succeed, fail, get canceled, or is it still running?",
                  children: [{ name: "StatusMorph", answers: "Does the running mark turn into a check or a warning?" }],
                },
                { name: "label", answers: "What did this step do?" },
                { name: "durationMs", answers: "How long did this step take?" },
                { name: "Chevron", answers: "Does this step contain other steps?" },
              ],
            },
          ],
        },
        {
          name: "DataPane",
          answers: "What data did the open step receive, and what did it send on?",
          children: [
            { name: "input", answers: "Is the input of this step showing?" },
            { name: "output", answers: "Is the output of this step showing?" },
            { name: "DataTable", answers: "Can the rows be read as a table?" },
            { name: "DataJson", answers: "Can the same payload be read as JSON?" },
          ],
        },
      ],
    },
  ],
  "run-chat": [
    {
      name: "RunChat",
      answers: "What was asked, and what is the run doing beside that thread?",
      children: [
        { name: "title", answers: "What task is this thread for?" },
        {
          name: "Message",
          answers: "Who wrote this turn, the person or the agent?",
          children: [
            { name: "AgentMark", answers: "Is this turn from the agent?" },
            { name: "HumanMark", answers: "Is this turn from the person?" },
          ],
        },
        { name: "stream", answers: "Is an answer still being written in the thread?" },
        {
          name: "Composer",
          answers: "What will the next message say, and will sending it start the run?",
          children: [
            { name: "draft", answers: "What is in the field?" },
            { name: "onDraftChange", answers: "Did the field change?" },
            { name: "onSend", answers: "Did the person send, and so start the run?" },
          ],
        },
        {
          name: "Log",
          answers: "What is this run doing right now?",
          children: [
            { name: "plan", answers: "What is the one-line plan above the steps?" },
            {
              name: "StepList",
              answers: "Which steps have run, and how long did each take?",
              children: [
                {
                  name: "StepMark",
                  answers: "Is this step waiting, running, done, or failed?",
                  children: [{ name: "StatusMorph", answers: "Does the running mark turn into a check or a warning?" }],
                },
                { name: "label", answers: "What is this step called?" },
                { name: "durationMs", answers: "How long did a finished step take?" },
              ],
            },
          ],
        },
      ],
    },
  ],
  "tool-call-feed": [
    {
      name: "ToolCallFeed",
      answers: "What did the agent do, in order, and how many of those actions are finished?",
      children: [
        { name: "title", answers: "What is this list of actions called?" },
        {
          name: "Row",
          answers: "What happened in this one action?",
          children: [
            {
              name: "StatusIcon",
              answers: "Did this action succeed, fail, sit in the queue, or is it still running?",
              children: [{ name: "StatusMorph", answers: "Does the running mark turn into a check or a warning?" }],
            },
            { name: "summary", answers: "What did the agent do, in words a person can read?" },
            { name: "tool", answers: "Which system call was that?" },
            { name: "durationMs", answers: "How long did a finished action take?" },
            { name: "error", answers: "What went wrong, in plain words?" },
            { name: "Chevron", answers: "Is the raw input and output open?" },
            { name: "input", answers: "What was sent to the tool?" },
            { name: "output", answers: "What came back?" },
          ],
        },
      ],
    },
  ],
  "run-graph": [
    {
      name: "RunGraph",
      answers: "What is this piece of the run doing, and how do the steps connect?",
      children: [
        {
          name: "PhasePill",
          answers: "Can you start this run, is it moving, or is a person holding it?",
          children: [
            { name: "phase", answers: "Is the pill on Execute, Waiting, or Running?" },
            { name: "StatusMorph", answers: "Is the run still moving?" },
            { name: "HumanMark", answers: "Is a person the one holding it up?" },
          ],
        },
        { name: "RunNode", answers: "What is this step, and did it finish?" },
        {
          name: "Edge",
          answers: "How many items moved to the next step?",
          children: [{ name: "items", answers: "Was it one item, or more?" }],
        },
        { name: "AddStep", answers: "Where do you add the next step?" },
      ],
    },
  ],
  "agent-decision-card": [
    {
      name: "AgentDecisionCard",
      answers: "What is the person being asked to sign off?",
      children: [
        { name: "AgentMark", answers: "Who is proposing this action?" },
        { name: "reversible", answers: "Can this be undone, and until when?" },
        { name: "title", answers: "What action is proposed?" },
        { name: "effect", answers: "What changes in the world if it goes ahead?" },
        { name: "ConfidenceBar", answers: "How sure is the agent?" },
        { name: "reasons", answers: "Why does the agent think this?" },
        {
          name: "Chevron",
          answers: "Are the facts and the other options open?",
          children: [
            { name: "evidence", answers: "What facts can a person check without opening another system?" },
            { name: "alternatives", answers: "What else did the agent consider, and why not?" },
          ],
        },
        { name: "onApprove", answers: "Will the person let the agent go ahead?" },
        { name: "onReject", answers: "Will the person stop this action?" },
        {
          name: "status",
          answers: "Has the decision been approved or rejected?",
          children: [
            {
              name: "HumanMark",
              answers: "Who made the decision?",
              children: [{ name: "decidedBy", answers: "Whose name is shown after the decision?" }],
            },
          ],
        },
      ],
    },
  ],
  "agent-harness": [
    {
      name: "AgentHarness",
      answers: "What step is this, and can it run?",
      children: [
        { name: "AgentMark", answers: "Who is this step?" },
        { name: "title", answers: "What is the step called?" },
        { name: "task", answers: "What is the step trying to do?" },
        { name: "missing", answers: "Is a required socket still open?" },
        {
          name: "SocketList",
          answers: "Which sockets does this step expose?",
          children: [
            {
              name: "Socket",
              answers: "What is plugged into this socket?",
              children: [
                {
                  name: "SocketMark",
                  answers: "Is this socket connected, optional, or blocking the step?",
                  children: [
                    { name: "StatusMorph", answers: "Does a connected socket show a check, or a missing requirement show a warning?" },
                  ],
                },
                { name: "kind", answers: "Is this the model, the memory, or a tool?" },
                { name: "value", answers: "What is connected, in words a person can read?" },
                { name: "required", answers: "Will the step refuse to run without this?" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** Preorder list. Throws if a name is repeated, so the diagram and the legend cannot disagree. */
export function flattenAnatomy(nodes: readonly AnatomyNode[]): AnatomyNode[] {
  const flat: AnatomyNode[] = [];
  const seen = new Set<string>();
  const walk = (list: readonly AnatomyNode[]) => {
    for (const node of list) {
      if (seen.has(node.name)) throw new Error(`Duplicate anatomy part ${node.name}`);
      seen.add(node.name);
      flat.push(node);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return flat;
}

export function anatomyFor(slug: string): readonly AnatomyNode[] | null {
  return ANATOMY[slug] ?? null;
}
