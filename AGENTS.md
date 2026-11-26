# Agents

How this repo is organized, and how to add a component.

## Layout

- `src/components/agentic/` — the library. One file per component. Shared pieces: `format.ts`, `marks.tsx`, `keyboard.ts`, `stroke-morph.ts`, `status-morph.tsx`. The barrel is `index.ts`.
- `src/lib/registry.ts` — `COMPONENTS`. The home grid, the sidebar, each docs page, the sitemap, search, `/llms.txt` and `/r/registry.json` read this list. Do not keep a second list of components.
- `src/app/components/demos/` — one live demo per component. `src/app/components/demos.tsx` maps a slug to that demo. `src/lib/demo-source.ts` is the file the Code tab reads. `src/app/previews.tsx` is the static card on the home page.
- `src/app/components/[slug]/page.tsx` — the docs page: header, demo, design question, anatomy, when to use, usage, files, props, accessibility, what was left out.
- `src/app/r/[name]/route.ts` — one shadcn registry item at `/r/<slug>.json`, built by `src/lib/registry-item.ts` from the component's imports.
- `src/app/r/registry.json/route.ts` — the registry index, built by `src/lib/registry-index.ts` from `COMPONENTS`.
- `src/lib/keyboard-interactions.ts`, `src/lib/when-to-use.ts`, `src/lib/anatomy.ts` — the tables and sections on the docs page. Keyboard and when-to-use cover every slug. Anatomy is omitted when a component has no entry.
- `COMPONENTS.md` — the slug list. `README.md` — the question table. `docs/PROJECT.md` — goals and status.

## Add a component

1. Add `src/components/agentic/<slug>.tsx`. Export the component and a `<Name>Props` type alias. Export both from `src/components/agentic/index.ts`.
2. Add a demo at `src/app/components/demos/<slug>.tsx`. Register it in `demos.tsx` and in `DEMO_SOURCE_FILES` (`src/lib/demo-source.ts`). Add a static preview in `src/app/previews.tsx`.
3. Add a `COMPONENTS` entry in `src/lib/registry.ts`: slug, name, moment, file, summary, question, decisions, usage, props, a11y, notBuilt. Prop names must match the Props type. `tests/props-sync.test.mts` checks that.
4. Add the slug to `src/lib/keyboard-interactions.ts` and `src/lib/when-to-use.ts`. Add anatomy in `src/lib/anatomy.ts` when the component has parts worth naming.
5. The registry item and `/r/registry.json` pick the new entry up from `COMPONENTS`. There is no second registry file to edit.
6. Docs: a row in `README.md` (the component and its design question) and a line in `COMPONENTS.md`.
7. Run `npm test`, `npm run typecheck` and `npm run lint`. `npm run test:e2e` covers the docs pages with axe.

The fake scenario on every page is an agent matching a supplier invoice to a purchase order. Keep new demos inside that story.
