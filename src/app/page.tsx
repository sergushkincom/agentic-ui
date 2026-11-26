import Link from "next/link";
import { COMPONENTS, startHere, type ComponentDoc } from "@/lib/registry";
import { shadcnInstallCommand } from "@/lib/registry-url";
import { CodeBlock } from "@/components/site/code-block";
import { HeroHandoff } from "@/components/site/hero-handoff";
import { HeroLegend } from "@/components/site/hero-legend";
import { Preview } from "./previews";

const TOP_ALIGNED = new Set(["agent-decision-card", "agent-harness", "wait-for-person", "connection-picker", "step-inspector"]);

function ComponentCard({ component }: { component: ComponentDoc }) {
  const align = TOP_ALIGNED.has(component.slug) ? "items-start" : "items-center";
  return (
    <Link
      href={`/components/${component.slug}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-muted)]"
    >
      <div aria-hidden="true" inert className={`pointer-events-none flex h-44 overflow-hidden bg-[var(--bg)] p-4 ${align}`}>
        <div className="w-full min-w-0">
          <Preview slug={component.slug} />
        </div>
      </div>
      <div className="flex flex-col gap-1 border-t border-[var(--border)] p-4">
        <h3 className="font-[family-name:var(--mono)] text-[13px] font-medium">{component.name}</h3>
        <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{component.summary}</p>
      </div>
    </Link>
  );
}

const PRINCIPLES = [
  { title: "Show what it's doing", body: "Steps, actions and elapsed time, so waiting has a reason and the work can be audited." },
  { title: "Say how sure it is, in words", body: "Confidence leads with a word and shows where the agent stops acting alone." },
  { title: "Always leave a way in", body: "Every agent output can be overridden, rejected or done by hand. Corrections stick." },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-16 px-4 py-14 sm:py-20">
      <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:gap-14">
        <div className="flex max-w-2xl flex-col gap-5">
          <HeroLegend />
          <h1 className="text-[32px] leading-tight font-semibold tracking-tight sm:text-[44px]">
            Components for products where an agent does part of the work.
          </h1>
          <p className="text-[17px] leading-relaxed text-[var(--fg-muted)]">
            {COMPONENTS.length} pieces of UI for the moments people actually worry about: what is the agent doing, how sure is it,
            and where can I step in. Every one is live on this site. Copy them into your project.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/components"
              className="inline-flex h-9 items-center rounded-lg bg-[var(--fg)] px-4 text-[14px] font-medium text-[var(--bg)] hover:opacity-90"
            >
              Browse components
            </Link>
            <Link
              href="/examples/agent-run"
              className="group inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] font-medium hover:bg-[var(--surface-2)]"
            >
              See an agent run
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="aui-nudge size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4.5 12.5 8 9 11.5" />
              </svg>
            </Link>
          </div>
        </div>
        <HeroHandoff />
      </section>

      <section aria-labelledby="principles" className="flex flex-col gap-3">
        <h2 id="principles" className="sr-only">
          Principles
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="flex flex-col gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <span className="text-xs tabular-nums text-[var(--fg-muted)]">0{i + 1}</span>
              <h3 className="text-[15px] font-semibold">{p.title}</h3>
              <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{p.body}</p>
            </div>
          ))}
        </div>
        <Link href="/why" className="self-start rounded-sm text-[13px] text-[var(--accent)] underline-offset-2 hover:underline">
          Why this exists
        </Link>
      </section>

      <section aria-labelledby="start-here" className="flex flex-col gap-5">
        <h2 id="start-here" className="text-[20px] font-semibold">
          Start here
        </h2>
        <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {startHere().map((component) => (
            <li key={component.slug} className="min-w-0">
              <ComponentCard component={component} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="components" className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="components" className="text-[20px] font-semibold">
            Components
          </h2>
          <span className="text-[13px] text-[var(--fg-muted)]">{COMPONENTS.length} components</span>
        </div>
        <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPONENTS.map((component) => (
            <li key={component.slug} className="min-w-0">
              <ComponentCard component={component} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="use" className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="flex flex-col gap-3">
          <h2 id="use" className="text-[20px] font-semibold">
            How to use it
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">
            It isn&apos;t an npm package on purpose. The shadcn CLI copies the source into your project, and you change it like your own
            code. The command below adds ConfidenceBar. Every component page has the command for that component. Needs React 19 and
            Tailwind CSS 4. The components read colours from CSS variables, so restyling is overriding a few tokens.
          </p>
        </div>
        <CodeBlock layout="command" label="Install with shadcn" code={shadcnInstallCommand("confidence-bar")} />
      </section>
    </main>
  );
}
