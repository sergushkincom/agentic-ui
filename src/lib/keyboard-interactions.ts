/**
 * Key → action rows for every component docs page.
 * A key is listed only when that press does this in the live demo.
 * "None" means the component is not a control.
 */

export type KeyboardRow = {
  key: string;
  action: string;
};

export const KEYBOARD: Record<string, KeyboardRow[]> = {
  "streaming-text": [
    { key: "Enter", action: "While Stop is focused, stops the answer and keeps what arrived." },
    { key: "Space", action: "While Stop is focused, stops the answer and keeps what arrived." },
    { key: "Escape", action: "While Stop is focused, stops the answer and keeps what arrived." },
  ],
  "thinking-state": [
    { key: "Enter", action: "Expands or collapses the steps when the summary line is focused." },
    { key: "Space", action: "Expands or collapses the steps when the summary line is focused." },
  ],
  "run-log": [
    { key: "Enter", action: "Selects the focused step, or activates Clear, Input, Output, Table or JSON." },
    { key: "Space", action: "Selects the focused step, or activates Clear, Input, Output, Table or JSON." },
    { key: "Arrow Down", action: "Moves focus to the next step and opens it. From the last, moves to the first." },
    { key: "Arrow Up", action: "Moves focus to the previous step and opens it. From the first, moves to the last." },
    { key: "Home", action: "Moves focus to the first step and opens it." },
    { key: "End", action: "Moves focus to the last step and opens it." },
    { key: "Tab", action: "Moves into the tree onto the open step, then on to Clear and the switches." },
    { key: "Shift + Tab", action: "Moves back to the open step, then out of the log." },
  ],
  "run-history": [
    { key: "Enter", action: "Highlights the focused run." },
    { key: "Space", action: "Highlights the focused run." },
    { key: "Arrow Down", action: "Moves to the next run and highlights it. From the last, moves to the first." },
    { key: "Arrow Up", action: "Moves to the previous run and highlights it. From the first, moves to the last." },
    { key: "Home", action: "Moves to the first run and highlights it." },
    { key: "End", action: "Moves to the last run and highlights it." },
    { key: "Tab", action: "Moves into the list onto the highlighted run, then onward." },
    { key: "Shift + Tab", action: "Moves back to the highlighted run, then out of the list." },
  ],
  "run-chat": [
    { key: "Enter", action: "Sends the draft and starts the run, when the field or Send is focused and the field is not empty." },
    { key: "Space", action: "Activates Send when it is focused. In the field, types a space." },
  ],
  "confidence-bar": [
    { key: "None", action: "No keys. The bar is a meter, not a control, so it is not in the tab order." },
  ],
  "human-override": [
    { key: "Enter", action: "Activates the focused button. In the field, saves the edit and moves focus back to Change." },
    { key: "Space", action: "Activates the focused button. In the field, types a space." },
    { key: "Escape", action: "While editing, cancels and moves focus back to Change." },
  ],
  "tool-call-feed": [
    { key: "Enter", action: "Expands or collapses the focused action." },
    { key: "Space", action: "Expands or collapses the focused action." },
    { key: "Arrow Down", action: "Moves focus to the next action. From the last, moves to the first." },
    { key: "Arrow Up", action: "Moves focus to the previous action. From the first, moves to the last." },
    { key: "Home", action: "Moves focus to the first action." },
    { key: "End", action: "Moves focus to the last action." },
    { key: "Tab", action: "Moves into the feed onto the current action, then onward. It does not stop on every action." },
    { key: "Shift + Tab", action: "Moves back to the current action, then out of the feed." },
  ],
  "agent-decision-card": [
    { key: "Enter", action: "Activates the focused control: Approve, Reject, or the evidence disclosure." },
    { key: "Space", action: "Activates the focused control: Approve, Reject, or the evidence disclosure." },
  ],
  "fallback-boundary": [
    { key: "Enter", action: "Activates the focused action: the manual path when the agent is slow or has failed, and Try again after a failure." },
    { key: "Space", action: "Activates the focused action: the manual path when the agent is slow or has failed, and Try again after a failure." },
  ],
  "step-error": [
    { key: "Enter", action: "Activates Retry this step when that button is focused." },
    { key: "Space", action: "Activates Retry this step when that button is focused." },
  ],
};

export function keyboardFor(slug: string): KeyboardRow[] {
  const rows = KEYBOARD[slug];
  if (!rows?.length) throw new Error(`No keyboard interactions for ${slug}`);
  return rows;
}
