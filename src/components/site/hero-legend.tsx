import { AgentMark, HumanMark } from "@/components/agentic";

/**
 * Colour legend for the home title. Same star and person as every component,
 * so violet and blue mean the same thing before the first card.
 */
export function HeroLegend() {
  return (
    <ul aria-label="Colour legend" className="flex flex-wrap items-center gap-2">
      <li className="relative flex items-center">
        <AgentMark label="agent" size="md" />
        <span className="sr-only">Violet. What the agent wrote.</span>
      </li>
      <li className="relative flex items-center">
        <HumanMark label="you" size="md" />
        <span className="sr-only">Blue. What you changed.</span>
      </li>
    </ul>
  );
}
