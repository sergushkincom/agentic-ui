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
  "confidence-bar": [
    { key: "None", action: "No keys. The bar is a meter, not a control, so it is not in the tab order." },
  ],
  "step-inspector": [
    { key: "Enter", action: "Activates the focused control: Run this step, Parameters, or Settings." },
    { key: "Space", action: "Activates the focused control: Run this step, Parameters, or Settings." },
    { key: "Arrow Down", action: "Moves from Parameters to Settings. From Settings, moves to Parameters." },
    { key: "Arrow Up", action: "Moves from Settings to Parameters. From Parameters, moves to Settings." },
    { key: "Home", action: "Moves to Parameters." },
    { key: "End", action: "Moves to Settings." },
  ],
  "expression-field": [
    { key: "Enter", action: "Activates the focused control: Fixed, Expression, Change, or a field in the list." },
    { key: "Space", action: "Activates the focused control. In the fixed value, types a space." },
    { key: "Escape", action: "While the field list is open, closes it and moves focus back to the value." },
    { key: "Arrow Down", action: "Moves from Fixed to Expression. In the field list, moves to the next field." },
    { key: "Arrow Up", action: "Moves from Expression to Fixed. In the field list, moves to the previous field." },
    { key: "Home", action: "Moves to Fixed. In the field list, moves to the first field." },
    { key: "End", action: "Moves to Expression. In the field list, moves to the last field." },
  ],
  "pinned-output": [
    { key: "Enter", action: "Activates the focused button. In the mock field, saves the mock and moves focus back to Supply mock." },
    { key: "Space", action: "Activates the focused button. In the mock field, types a space." },
    { key: "Escape", action: "While supplying a mock, cancels and moves focus back to Supply mock." },
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
};

export function keyboardFor(slug: string): KeyboardRow[] {
  const rows = KEYBOARD[slug];
  if (!rows?.length) throw new Error(`No keyboard interactions for ${slug}`);
  return rows;
}
