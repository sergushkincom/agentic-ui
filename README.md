# agentic-ui

[![CI](https://github.com/sergushkincom/agentic-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sergushkincom/agentic-ui/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live docs](https://img.shields.io/badge/Live-agentic--ui--docs.vercel.app-000000?logo=vercel)](https://agentic-ui-docs.vercel.app)

React components for products where an agent does part of the work: streaming text, thinking states, confidence, step inspection, expressions, pinned output, human override, tool calls, decisions and fallbacks.

Every component answers one question people actually ask when software acts for them: **what is it doing, how sure is it, and where can I step in?**

**Live docs:** [agentic-ui-docs.vercel.app](https://agentic-ui-docs.vercel.app)

![Agentic UI live docs homepage with component cards and implementation guidance](docs/agentic-ui-home.png)

## Components

| Component | The design question |
|---|---|
| `StreamingText` | How do you show an answer that is still being written, without making people read a moving target? |
| `ThinkingState` | What does a person need to see to decide whether to keep waiting? |
| `ConfidenceBar` | What does 72% mean to someone who has to act on it? |
| `StepInspector` | When a step in the agent's work is wrong, where do you look? |
| `ExpressionField` | How do you point a step at an earlier field without hiding the link in syntax? |
| `PinnedOutput` | How do later steps keep moving when you do not want to run this step again? |
| `HumanOverride` | When a person corrects the agent, how do they know the correction will stick? |
| `ToolCallFeed` | How do you show what an agent did in other systems without dumping JSON on everyone? |
| `AgentDecisionCard` | What does a person need to read, in what order, to approve an agent's action responsibly? |
| `FallbackBoundary` | What happens to the person's task when the agent doesn't come back? |

Each docs page has a live demo with scenarios, the design decisions, usage, props, accessibility notes and a "Deliberately not built" list.

## Use them

Not an npm package, on purpose: copy the code and own it.

```bash
cp -r agentic-ui/src/components/agentic  your-app/src/components/
cp agentic-ui/src/app/tokens.css          your-app/src/app/
```

Then import the tokens next to Tailwind (`@import "./tokens.css";`) and use `import { ConfidenceBar } from "@/components/agentic"`. Needs React 19 and Tailwind CSS 4. Components read colours from CSS variables in `tokens.css` (light and dark), so restyling is overriding tokens. Authorship has its own pair of tokens: `--agent` for what the agent wrote, `--human` for what a person changed.

## Run the docs site

```bash
npm ci
npm run dev        # http://localhost:3000
npm test           # confidence bands and formatters
npm run typecheck
npm run lint
npm run build
```

Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS 4. Fake data throughout: one made-up scenario, an agent matching a supplier invoice to a purchase order in an ERP. No backend, no model calls.

## Layout

- `src/components/agentic/` — the library. One file per component, `format.ts` for pure logic, `marks.tsx` for shared marks and buttons, `stroke-morph.ts` for the working-status stroke morph.
- `src/lib/registry.ts` — every docs page renders from this list.
- `src/app/components/demos.tsx` — the live demos.
- `COMPONENTS.md` — the component list.

## Credits

The spinner on `ThinkingState` and `ToolCallFeed` draws itself into a check or a warning. That stroke morph is adapted from [morphicons](https://github.com/guillermolg00/morphicons) by [Guillermo](https://guillermolg.com) (MIT): resample the stroke, align it with a closed-form rotation and scale, then interpolate. People who prefer reduced motion get an instant swap.

## License

MIT, see [LICENSE](LICENSE).
