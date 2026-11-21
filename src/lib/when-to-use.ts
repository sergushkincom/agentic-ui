/**
 * Choosing guidance for every component docs page.
 * Each entry is rendered as "Use when" plus at least one "Use {Name} instead when…".
 * The alternative is another component in this registry, linked from the page.
 */

export type InsteadChoice = {
  /** Slug of the component to use instead. */
  slug: string;
  /**
   * Completes "Use {Name} instead when …".
   * A lowercase clause, ending with a period.
   */
  when: string;
};

export type WhenToUse = {
  /** Situations this component is the right choice. */
  useWhen: string[];
  /** Neighbours to pick instead. At least one. */
  instead: InsteadChoice[];
};

export const WHEN_TO_USE: Record<string, WhenToUse> = {
  "streaming-text": {
    useWhen: [
      "The agent is writing an answer the person will read, and the text is still arriving.",
      "You need a caret at the writing edge. Pass onStop for a Stop control. A stopped answer keeps what arrived and says how many words.",
    ],
    instead: [
      {
        slug: "thinking-state",
        when: "the person is waiting on a plan: the current step, the elapsed time, and a folded list of steps. It does not stream the model's reasoning.",
      },
      {
        slug: "tool-call-feed",
        when: "you are showing calls into other systems. Each row leads with a sentence a person can read, and the tool name and raw input stay folded.",
      },
    ],
  },
  "agent-harness": {
    useWhen: [
      "You are showing one agent step as a harness: which model, which memory, and which tools are plugged in.",
      "A required socket can be missing. That should read as a warning that the step will not run, not as a failed call.",
    ],
    instead: [
      {
        slug: "thinking-state",
        when: "the person is waiting on the current step and a folded plan. You do not need to show what the step is plugged into.",
      },
      {
        slug: "tool-call-feed",
        when: "the agent has already called other systems, and you are showing those calls in order, with what went out and what came back.",
      },
    ],
  },
  "thinking-state": {
    useWhen: [
      "The person is waiting and needs a reason to keep waiting: the current step and how long it has taken. If a step fails, the line names where it stopped. When it finishes, the line is a receipt: how long, and how many steps.",
      "The full plan can stay folded. Most people need the line. The list is there for anyone checking the work.",
    ],
    instead: [
      {
        slug: "streaming-text",
        when: "what is arriving is the answer itself, token by token, and the person may stop it. A stop keeps what arrived.",
      },
      {
        slug: "tool-call-feed",
        when: "the record is tool calls, with a name, a status, a duration, and raw input and output, not steps written for people.",
      },
    ],
  },
  "run-log": {
    useWhen: [
      "A person is inside one run and needs the steps, how long each took, and the input or output of the step they open.",
      "That data should be a table, with the same payload as JSON, and a row that failed the check should say so. Clear removes the log.",
    ],
    instead: [
      {
        slug: "tool-call-feed",
        when: "the record is a list of actions in sentences, with the tool name and the raw input folded under each row, and you do not need a table and JSON side by side.",
      },
      {
        slug: "thinking-state",
        when: "the person only needs the current step, the elapsed time, and a folded plan. They do not need the data that moved.",
      },
    ],
  },
  "run-history": {
    useWhen: [
      "Someone is choosing among past runs and needs to see which succeeded, which errored, which were canceled, and how long each took.",
      "Selecting a row should highlight that run, so the rest of the screen can show it.",
    ],
    instead: [
      {
        slug: "run-log",
        when: "they are already inside one run and need its steps and data, not the list of runs.",
      },
      {
        slug: "tool-call-feed",
        when: "the subject is the actions inside a run, in sentences, not which run this is.",
      },
    ],
  },
  "run-chat": {
    useWhen: [
      "A person starts the work by sending a message, and should see the answer and the live steps at the same time.",
      "The answer can still be arriving while the steps advance. Sending is what starts the run.",
    ],
    instead: [
      {
        slug: "streaming-text",
        when: "you only need the answer as it arrives, with a way to stop it, and not the steps beside the thread.",
      },
      {
        slug: "run-log",
        when: "the run is already going or finished, and someone is inspecting one step's table or JSON rather than talking to the agent.",
      },
      {
        slug: "thinking-state",
        when: "there is no thread. The person is only waiting on the current step and a folded plan.",
      },
    ],
  },
  "confidence-bar": {
    useWhen: [
      "A person needs to read how sure the agent is: the words the bar uses (Sure, Fairly sure, Not sure, asks you), then the percentage.",
      "You want the line where the agent stops acting alone, drawn as a tick, and a basis for what the number rests on.",
    ],
    instead: [
      {
        slug: "agent-decision-card",
        when: "that confidence belongs to an action the person must approve or reject. The card already includes a compact bar, plus what happens, whether it can be undone, and why.",
      },
      {
        slug: "human-override",
        when: "the person should change a value the agent filled in, not only read a score. A bar does not take a correction.",
      },
    ],
  },
  "step-inspector": {
    useWhen: [
      "You are looking at one step: what came in from earlier steps, what it is set to, and what it produced.",
      "The output may be empty. The pane says to run the step or pin mock data, instead of showing a result that is not there.",
    ],
    instead: [
      {
        slug: "tool-call-feed",
        when: "you want the whole run as a list of actions, each as a sentence, and not one step open in three panes.",
      },
      {
        slug: "pinned-output",
        when: "you only need to freeze this step's output so later steps can run. You do not need the input or the parameters.",
      },
      {
        slug: "expression-field",
        when: "you are setting one value to a field from a previous step, not inspecting the whole step.",
      },
    ],
  },
  "expression-field": {
    useWhen: [
      "A parameter is either a value someone types, or a field from a previous step.",
      "The link should be readable as the step's name and the field. It is not a correction, and it is not code syntax.",
    ],
    instead: [
      {
        slug: "human-override",
        when: "the person is correcting a value the agent filled in, and that correction has to stick. An expression says where a value comes from. It does not say the agent was wrong.",
      },
      {
        slug: "step-inspector",
        when: "you need the step's input, parameters and output together, not a single value.",
      },
    ],
  },
  "pinned-output": {
    useWhen: [
      "Later steps should keep moving without running this step again.",
      "A person may pin the last output, or supply mock data. The badge says pinned or live, so it is clear which one later steps will read.",
    ],
    instead: [
      {
        slug: "step-inspector",
        when: "you need to see what came in and what the step is set to, not only the output you are freezing.",
      },
      {
        slug: "tool-call-feed",
        when: "the output belongs in the log of the run, in order with the other actions, rather than as a pin on one step.",
      },
    ],
  },
  "human-override": {
    useWhen: [
      "The agent filled in one field, and a person may take it over in a single step.",
      "Authorship has to stay visible: Filled by agent, or Changed by you. After a change, the agent's value stays one click away, and the field says the agent will not overwrite it.",
    ],
    instead: [
      {
        slug: "agent-decision-card",
        when: "the person is approving or rejecting a whole action, not correcting one field.",
      },
      {
        slug: "confidence-bar",
        when: "you are showing how sure the agent is, in words and a percentage, not offering a value to change.",
      },
      {
        slug: "expression-field",
        when: "the value should point at a field from a previous step, not replace something the agent filled in.",
      },
    ],
  },
  "tool-call-feed": {
    useWhen: [
      "The agent touched other systems, and a person should see those actions in order, each as a sentence.",
      "Someone may need the tool name, the duration, and the raw input and output, folded under that sentence. A failure says what went wrong in the row where it happened.",
    ],
    instead: [
      {
        slug: "thinking-state",
        when: "you only need the current step, the elapsed time, and a folded plan. You do not need tool names or payloads.",
      },
      {
        slug: "streaming-text",
        when: "the output is prose the person reads as it arrives, not a log of actions.",
      },
      {
        slug: "step-inspector",
        when: "you are opening one step to see its input, parameters and output, not the whole run as a list.",
      },
    ],
  },
  "run-node": {
    useWhen: [
      "You are showing one step of a run: its name, what it is doing now, and whether it is pending, running, done or failed.",
      "The number of items that left the step matters, and it belongs on the output port, as \"1 item\" or \"5 items\".",
    ],
    instead: [
      {
        slug: "run-graph",
        when: "those steps are a chain, and the person needs the edges between them plus a way to start the run or add the next step.",
      },
      {
        slug: "tool-call-feed",
        when: "the record is calls into other systems, with a tool name and raw input and output folded under each sentence.",
      },
    ],
  },
  "run-graph": {
    useWhen: [
      "A person should see a short chain of steps, how many items moved along each edge, and whether the run can start, is running, or is waiting on them.",
      "You want the shape of the run without an editor. Adding the next step is one button at the end of the chain.",
    ],
    instead: [
      {
        slug: "run-node",
        when: "one step is the whole story, and a chain, an edge label, or a start pill would be extra.",
      },
      {
        slug: "step-picker",
        when: "the person is choosing what comes next. The graph shows the chain they already have.",
      },
    ],
  },
  "step-picker": {
    useWhen: [
      "The person is adding a step and needs to search a grouped list, including a group of steps only a person can do.",
      "Human in the loop has to stay visible as its own group, not turn up as one more row among the agent's calls.",
    ],
    instead: [
      {
        slug: "run-graph",
        when: "the chain is already chosen and you are showing the run: the steps, the items that moved, and whether it is waiting.",
      },
      {
        slug: "human-override",
        when: "the person should correct one field the agent filled in, not choose the next step in a run.",
      },
    ],
  },
  "agent-decision-card": {
    useWhen: [
      "The agent proposes one action and a person has to approve or reject it.",
      "The person should read, in order, what happens, whether it can be undone, how sure the agent is, and why. Evidence and the alternatives it rejected stay folded.",
    ],
    instead: [
      {
        slug: "human-override",
        when: "the person should correct a single field the agent filled in. This card does not edit the decision. Use both when the action includes a value someone may change.",
      },
      {
        slug: "confidence-bar",
        when: "you only need how sure the agent is, without approve and reject.",
      },
    ],
  },
  "wait-for-person": {
    useWhen: [
      "A run has stopped and will not continue until a person replies or approves. The screen should say it is waiting for you, and show the question.",
      "After the answer, the same place should become a receipt: what was said, and that the run continues.",
    ],
    instead: [
      {
        slug: "agent-decision-card",
        when: "the person is signing off one proposed action, with what happens, whether it can be undone, how sure the agent is, and why. This pause does not score a decision.",
      },
      {
        slug: "human-override",
        when: "the person is correcting a single field the agent already filled in. The run is not paused on a question.",
      },
    ],
  },
  "connection-picker": {
    useWhen: [
      "The agent needs an account before it can act, and the person should pick one that is already connected, sign in, or set one up manually.",
      "A key or token must not be rendered. Manual setup takes the secret once, and then the screen only knows the account name.",
    ],
    instead: [
      {
        slug: "human-override",
        when: "the person is changing a value the agent filled in, such as a cost centre, not choosing which account the agent may use.",
      },
      {
        slug: "wait-for-person",
        when: "the run is paused on a question or an approval, and an account is not what it is waiting for.",
      },
    ],
  },
  "fallback-boundary": {
    useWhen: [
      "The agent's output can run long, fail, or crash, and the person's task still needs a way out.",
      "Failure says nothing was changed. The way to do the task yourself is a primary button, and Try again is there too. A crash while rendering the agent's output shows the same fallback.",
    ],
    instead: [
      {
        slug: "thinking-state",
        when: "the agent is working through named steps and you want the current step and a folded plan, not a shell around other output.",
      },
      {
        slug: "tool-call-feed",
        when: "one call failed and that failure belongs in the row, in plain words, rather than a boundary around the whole task.",
      },
    ],
  },
  "step-error": {
    useWhen: [
      "One step failed, and the person needs the step name, what broke, and which value was wrong.",
      "Retry should run that step again. Later steps did not run, and there is no second path for the whole task.",
    ],
    instead: [
      {
        slug: "fallback-boundary",
        when: "the whole task ran long, failed, or crashed, and the person needs a way to do it themselves. This is not one bad value inside a step.",
      },
      {
        slug: "run-log",
        when: "the failure is one step in a log they are inspecting, and they need the surrounding steps and payloads rather than a retry for this step.",
      },
    ],
  },
};

export function whenFor(slug: string): WhenToUse {
  const guide = WHEN_TO_USE[slug];
  if (!guide?.useWhen.length || !guide.instead.length) {
    throw new Error(`No when-to-use guidance for ${slug}`);
  }
  return guide;
}

/** The sentence the page shows, with the other component's name in the middle. */
export function insteadSentence(name: string, when: string): string {
  return `Use ${name} instead when ${when}`;
}
