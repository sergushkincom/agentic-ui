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
