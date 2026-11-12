import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why this exists",
  description:
    "The three principles in full, what this library deliberately does not build, and how that differs from a coverage-led kit.",
};

const PRINCIPLES = [
  {
    n: "01",
    title: "Show what it's doing",
    lead: "Steps, actions and elapsed time, so waiting has a reason and the work can be audited.",
    body: "Thinking… on its own gives no reason to wait. Name the current step and how long it has taken. While an answer is still arriving, a caret marks the writing edge, and the text before it is final and safe to read. Stopping keeps what arrived and says how much: a stop is a choice, not an error. Work in other systems leads with a sentence a person can read. The tool name and the raw input stay folded under it, for the person who has to audit them. When the run finishes, the line becomes a receipt: how long, and how many steps.",
  },
  {
    n: "02",
    title: "Say how sure it is, in words",
    lead: "Confidence leads with a word and shows where the agent stops acting alone.",
    body: "A percentage asks the reader to already know what is good enough. Words lead (Sure, Fairly sure, Not sure, asks you) and the number follows. A tick marks the threshold below which the agent asks a person, and the gap between the bar and that tick is the message. A basis line says what the number rests on. Without it, a percentage is just a vibe. Colour never carries this alone. The band is written out, and a decision that can't be undone is named, because that changes how carefully people read.",
  },
  {
    n: "03",
    title: "Always leave a way in",
    lead: "Every agent output can be overridden, rejected or done by hand. Corrections stick.",
    body: "Authorship stays on the field: Filled by agent, or Changed by you. After an override the field keeps the agent's value in view and says the agent won't overwrite yours. Going back to that value is one click, so overriding never feels risky. Approve and reject are the same kind of door, and the outcome says who decided. When the agent is slow, or doesn't come back, the way to do the task yourself is a primary button, not a footnote. Failure says nothing was changed. That is the first thing people worry about.",
  },
] as const;

const NOT_BUILT: { slug: string; name: string; note: string }[] = [
  {
    slug: "streaming-text",
    name: "StreamingText",
    note: "does not render Markdown, and it does not fade words in. Bring your own rendering.",
  },
  {
    slug: "thinking-state",
    name: "ThinkingState",
    note: "does not stream the model's raw reasoning. Steps are the agent's plan, written for people.",
  },
  {
    slug: "confidence-bar",
    name: "ConfidenceBar",
    note: "does not calibrate the number. It shows one; making the number honest is the model team's job.",
  },
  {
    slug: "human-override",
    name: "HumanOverride",
    note: "does not tell the agent to learn from a correction. That is a product decision, not a field's.",
  },
  {
    slug: "tool-call-feed",
    name: "ToolCallFeed",
    note: "does not cancel a single call, and it does not virtualise a very long feed.",
  },
  {
    slug: "agent-decision-card",
    name: "AgentDecisionCard",
    note: "does not edit the decision before approval. Combine it with HumanOverride for that.",
  },
  {
    slug: "fallback-boundary",
    name: "FallbackBoundary",
    note: "does not keep a timer. When running becomes slow depends on the task; the parent decides.",
  },
];

const link = "rounded-sm text-[var(--accent)] underline-offset-2 hover:underline";

export default function WhyPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col px-4 py-10 sm:py-14">
      <div className="flex max-w-2xl flex-col gap-14">
        <header className="flex flex-col gap-4">
          <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Why this exists</h1>
          <p className="text-[17px] leading-relaxed text-[var(--fg-muted)]">
            The library&apos;s edge is its design reasoning. Seven components, for the moments people actually worry
            about when software acts for them: what is it doing, how sure is it, and where can I step in.
          </p>
        </header>

        <section aria-labelledby="principles" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 id="principles" className="text-[20px] font-semibold">
              Three principles
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
              The home page states each one in a line. This is the full version.
            </p>
          </div>
          <ol className="flex flex-col gap-8">
            {PRINCIPLES.map((p) => (
              <li key={p.n} className="flex flex-col gap-2">
                <span className="text-xs tabular-nums text-[var(--fg-muted)]">{p.n}</span>
                <h3 className="text-[17px] font-semibold">{p.title}</h3>
                <p className="text-[15px] leading-relaxed">{p.lead}</p>
                <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">{p.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="not-built" className="flex flex-col gap-3">
          <h2 id="not-built" className="text-[20px] font-semibold">
            Deliberately not built
          </h2>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
            Every component page ends with what that component refuses to do. Those lists are the stance, not a
            backlog. A component answers one design question and stops. If a behaviour belongs to the product, the
            model or the SDK, it stays out.
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] leading-relaxed text-[var(--fg-muted)]">
            {NOT_BUILT.map((item) => (
              <li key={item.slug}>
                <Link href={`/components/${item.slug}`} className={`${link} font-[family-name:var(--mono)] text-[13px]`}>
                  {item.name}
                </Link>{" "}
                {item.note}
              </li>
            ))}
          </ul>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
            The same stance is why this is not an npm package. Copy{" "}
            <code className="font-[family-name:var(--mono)] text-[13px] text-[var(--fg)]">src/components/agentic</code>{" "}
            and the tokens, and change them like your own code.
          </p>
        </section>

        <section aria-labelledby="coverage" className="flex flex-col gap-3">
          <h2 id="coverage" className="text-[20px] font-semibold">
            Different from a coverage-led kit
          </h2>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
            A coverage-led kit wins by having a component for every pattern. Pieces with these names already exist
            elsewhere. This library has seven, and it does not compete on that count.
          </p>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
            The difference is that the reasoning is part of the component. Each page opens with the design question,
            the choices that answer it, and what was left out on purpose. Accessibility sits in the component: status
            is spoken, colour is never the only signal, and after an edit, focus returns to where the person was.
          </p>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
            There is no theme to install. The components read colour from CSS variables, so restyling is overriding a
            few tokens. Two of them are authorship:{" "}
            <code className="font-[family-name:var(--mono)] text-[13px] text-[var(--agent)]">--agent</code> for what the
            agent wrote, <code className="font-[family-name:var(--mono)] text-[13px] text-[var(--human)]">--human</code>{" "}
            for what a person changed.
          </p>
        </section>

        <section aria-labelledby="author" className="flex flex-col gap-3 border-t border-[var(--border)] pt-8">
          <h2 id="author" className="text-[20px] font-semibold">
            Author
          </h2>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
            Written by{" "}
            <a href="https://sergushkin.com" target="_blank" rel="noreferrer" className={link}>
              Denys Sergushkin
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            , a principal product designer working on agentic UX: where a model acts on its own, and where a person has
            to sign off.
          </p>
        </section>
      </div>
    </main>
  );
}
