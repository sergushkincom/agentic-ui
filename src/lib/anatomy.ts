/**
 * Anatomy of the composed components. Names are identifiers in the component source:
 * a function, a rendered mark, or a field. Children are drawn inside their parent.
 * ToolCallFeed nests Row, and Row's status icon nests StatusMorph, matching the source.
 * AgentDecisionCard keeps the disclosure and the decision footer as nested regions.
 * StepInspector nests InputPane, ParameterPane and OutputPane.
 */

export type AnatomyNode = {
  name: string;
  /** The question this part answers, as a person reading the component would ask it. */
  answers: string;
  children?: readonly AnatomyNode[];
};

export const ANATOMY: Record<string, readonly AnatomyNode[]> = {
  "step-inspector": [
    {
      name: "StepInspector",
      answers: "What is this step, and where does its data sit?",
      children: [
        { name: "AgentMark", answers: "Who is running this step?" },
        { name: "title", answers: "What is this step called?" },
        { name: "step", answers: "Which call is it?" },
        { name: "onRun", answers: "Can you run this step now?" },
        {
          name: "InputPane",
          answers: "What came in from earlier steps?",
          children: [{ name: "input", answers: "Which items and fields arrived?" }],
        },
        {
          name: "ParameterPane",
          answers: "What is the step set to, and how does it behave?",
          children: [
            { name: "tab", answers: "Are parameters or settings open?" },
            { name: "parameters", answers: "What values does the step use?" },
            { name: "settings", answers: "How should the step behave when it runs?" },
          ],
        },
        {
          name: "OutputPane",
          answers: "What will the next step see?",
          children: [
            { name: "status", answers: "Has the step run, or is it still going?" },
            { name: "StatusMorph", answers: "Does the running mark turn into a check or a warning?" },
            { name: "output", answers: "What did the step produce?" },
            { name: "source", answers: "Is this output from the run, or pinned by you?" },
            { name: "HumanMark", answers: "Who pinned the mock data?" },
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
