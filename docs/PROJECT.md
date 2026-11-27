# Project

Docs site for the agentic-ui components. The pages come first. Colour and motion only where they say the same thing the components already say: what the agent did, how sure it is, and where a person steps in.

[DENYS: the goal, in your words. What should be true when this site is doing its job?]

## Audience

[DENYS: who this is for, in your words.]

## Done

- Home, from the large breakpoint up: a live card with confidence and an override. The bar settles short of the line where the agent asks you. Light and dark use the same tokens. Below that width the first screen is text. Motion stays still when the person asked for less of it. (#15)
- The second action on the home hero is "See an agent run". It opens the agent-run example. (#15)
- The line above the home title is the colour legend: `agent` and `you`, the same marks as the components. (#10)
- Each component page header shows the MIT license, React as available, and SwiftUI and React Native as soon. The shadcn install command sits in that header.
- The home page installs with `npx shadcn add` and opens on a Start here row: RunGraph, WaitForPerson, AgentDecisionCard, ThinkingState, ToolCallFeed, RunChat.
- `/r/registry.json` lists every component from `src/lib/registry.ts`.
- Each component page opens its live preview large, at `/preview/<slug>` or with `?view=full`, for a clean recording. Escape and Close leave it.

## Next

- SwiftUI, later. The badge says soon. There is no second site.
- React Native, later. Same badge, same constraint.

## Constraints

- One docs site. New platforms land here when they exist. They are not a separate catalog.
- React 19 and Tailwind CSS 4. The components are source you copy, through the shadcn registry, not an npm package.
- The scenario on every page is fake: an agent matching a supplier invoice to a purchase order. No backend, no model calls.
- Badges stay small and monochrome. A platform that is not ready is muted text, and it is not a link.
