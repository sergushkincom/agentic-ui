# agentic-ui

React components for products where an agent does part of the work: streaming text, thinking states, confidence, human override, tool calls, decisions and fallbacks.

Every component answers one question people actually ask when software acts for them: **what is it doing, how sure is it, and where can I step in?**

**Live docs:** [agentic-ui-docs.vercel.app](https://agentic-ui-docs.vercel.app)

## Components

| Component | The design question |
|---|---|
| `StreamingText` | How do you show an answer that is still being written, without making people read a moving target? |
| `ThinkingState` | What does a person need to see to decide whether to keep waiting? |
| `ConfidenceBar` | What does 72% mean to someone who has to act on it? |
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

- `src/components/agentic/` — the library. One file per component, `format.ts` for pure logic, `marks.tsx` for shared marks and buttons.
- `src/lib/registry.ts` — every docs page renders from this list.
- `src/app/components/demos.tsx` — the live demos.
- `COMPONENTS.md` — the component list.

## License

MIT, see [LICENSE](LICENSE).
