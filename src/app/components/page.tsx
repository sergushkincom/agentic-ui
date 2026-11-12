import type { Metadata } from "next";
import Link from "next/link";
import { COMPONENTS, MOMENTS, componentsIn } from "@/lib/registry";
import { Preview } from "../previews";

export const metadata: Metadata = {
  title: "Components",
  description: `All ${COMPONENTS.length} agentic-ui components, grouped by the moment they cover: ${MOMENTS.map((m) => m.label.toLowerCase()).join(", ")}.`,
};

export default function ComponentsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-14 sm:gap-16 sm:py-20">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Components</h1>
        <p className="text-[17px] leading-relaxed text-[var(--fg-muted)]">
          {COMPONENTS.length} pieces, grouped by the moment they belong to: {MOMENTS.map((m) => m.label.toLowerCase()).join(" · ")}.
        </p>
      </header>

      {MOMENTS.map((moment) => {
        const items = componentsIn(moment.id);
        if (items.length === 0) return null;
        return (
          <section key={moment.id} aria-labelledby={moment.id} className="flex min-w-0 flex-col gap-5">
            <h2 id={moment.id} className="text-[20px] font-semibold">
              {moment.label}
            </h2>
            <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <li key={c.slug} className="min-w-0">
                  <Link
                    href={`/components/${c.slug}`}
                    aria-label={`${c.name}. ${c.summary}`}
                    className="flex h-full min-w-0 scroll-mt-16 scroll-mb-12 flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <div
                      aria-hidden="true"
                      inert
                      className={`pointer-events-none flex h-44 overflow-hidden bg-[var(--bg)] p-4 ${c.slug === "agent-decision-card" ? "items-start" : "items-center"}`}
                    >
                      <div className="w-full min-w-0">
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
        );
      })}
    </main>
  );
}
