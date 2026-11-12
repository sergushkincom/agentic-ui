import Link from "next/link";
import { COMPONENTS, REPO } from "@/lib/registry";
import { CodeBlock } from "@/components/site/code-block";
import { Preview } from "./previews";

const PRINCIPLES = [
  { title: "Show what it's doing", body: "Steps, actions and elapsed time, so waiting has a reason and the work can be audited." },
  { title: "Say how sure it is, in words", body: "Confidence leads with a word and shows where the agent stops acting alone." },
  { title: "Always leave a way in", body: "Every agent output can be overridden, rejected or done by hand. Corrections stick." },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-14 sm:py-20">
      <section className="flex max-w-2xl flex-col gap-5">
        <p className="text-[13px] font-medium text-[var(--agent)]">React components · MIT</p>
        <h1 className="text-[32px] leading-tight font-semibold tracking-tight sm:text-[44px]">
          Components for products where an agent does part of the work.
        </h1>
        <p className="text-[17px] leading-relaxed text-[var(--fg-muted)]">
          Seven pieces of UI for the moments people actually worry about: what is the agent doing, how sure is it,
          and where can I step in. Every one is live on this site. Copy them into your project.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/components"
            className="inline-flex h-9 items-center rounded-lg bg-[var(--fg)] px-4 text-[14px] font-medium text-[var(--bg)] hover:opacity-90"
          >
            Browse components
          </Link>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] font-medium hover:bg-[var(--surface-2)]"
          >
            View on GitHub
          </a>
        </div>
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

      <section aria-labelledby="components" className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="components" className="text-[20px] font-semibold">
            Components
          </h2>
          <span className="text-[13px] text-[var(--fg-muted)]">{COMPONENTS.length} components</span>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPONENTS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/components/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-muted)]"
              >
                <div aria-hidden="true" inert className={`pointer-events-none flex h-44 overflow-hidden bg-[var(--bg)] p-4 ${c.slug === "agent-decision-card" ? "items-start" : "items-center"}`}>
                  <div className="w-full">
                    <Preview slug={c.slug} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 border-t border-[var(--border)] p-4">
                  <h3 className="font-[family-name:var(--mono)] text-[13px] font-medium">{c.name}</h3>
                  <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{c.summary}</p>
                </div>
              </Link>
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
            It isn&apos;t an npm package on purpose. Copy <code className="font-[family-name:var(--mono)] text-[13px]">src/components/agentic</code>{" "}
            and the tokens into your project and change them like your own code. Needs React 19 and Tailwind CSS 4. The components read
            colours from CSS variables, so restyling is overriding a few tokens.
          </p>
        </div>
        <CodeBlock
          label="Install"
          code={`# 1. Copy the components and tokens
cp -r agentic-ui/src/components/agentic  your-app/src/components/
cp agentic-ui/src/app/tokens.css          your-app/src/app/

# 2. Import the tokens next to Tailwind in globals.css
@import "tailwindcss";
@import "./tokens.css";

# 3. Use them
import { ConfidenceBar } from "@/components/agentic"`}
        />
      </section>
    </main>
  );
}
