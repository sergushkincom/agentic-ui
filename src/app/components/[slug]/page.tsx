import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPONENTS, REPO, getComponent } from "@/lib/registry";
import { demoSource } from "@/lib/demo-source";
import { CodeBlock } from "@/components/site/code-block";
import { DemoPanel } from "../demo-panel";

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getComponent((await params).slug);
  return c ? { title: c.name, description: c.summary } : {};
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComponent(slug);
  if (!c) notFound();
  const index = COMPONENTS.indexOf(c);
  const prev = COMPONENTS[index - 1];
  const next = COMPONENTS[index + 1];
  const source = demoSource(c.slug);

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-10 md:grid-cols-[180px_minmax(0,1fr)] md:gap-12">
      <nav aria-label="Components" className="min-w-0 md:sticky md:top-20 md:self-start">
        <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] md:flex-col md:overflow-visible md:pb-0">
          {COMPONENTS.map((item) => {
            const on = item.slug === slug;
            return (
              <li key={item.slug} className="shrink-0">
                <Link
                  href={`/components/${item.slug}`}
                  aria-current={on ? "page" : undefined}
                  className={`block rounded-md px-2.5 py-1.5 font-[family-name:var(--mono)] text-[12.5px] ${on ? "bg-[var(--surface-2)] text-[var(--fg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="flex min-w-0 flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="font-[family-name:var(--mono)] text-[28px] font-semibold tracking-tight">{c.name}</h1>
          <p className="text-[17px] leading-relaxed text-[var(--fg-muted)]">{c.summary}</p>
        </header>

        <section aria-labelledby="demo" className="flex min-w-0 flex-col gap-3">
          <h2 id="demo" className="sr-only">
            Live demo
          </h2>
          <DemoPanel slug={c.slug} filename={source.filename} code={source.code} />
          <p className="text-xs text-[var(--fg-muted)]">Live demo. Fake data: an agent matching a supplier invoice to a purchase order.</p>
        </section>

        <section aria-labelledby="question" className="flex flex-col gap-3">
          <h2 id="question" className="text-[18px] font-semibold">
            The design question
          </h2>
          <p className="text-[15px] leading-relaxed">{c.question}</p>
          <ul className="flex flex-col gap-2 text-[14px] leading-relaxed text-[var(--fg-muted)]">
            {c.decisions.map((d) => (
              <li key={d} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[9px] size-1 shrink-0 rounded-full bg-[var(--agent)]" />
                {d}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="usage" className="flex flex-col gap-3">
          <h2 id="usage" className="text-[18px] font-semibold">
            Usage
          </h2>
          <CodeBlock code={`import { ${c.name} } from "@/components/agentic"\n\n${c.usage}`} label={`${c.name} usage`} />
          <a
            href={`${REPO}/blob/main/src/components/agentic/${c.file}`}
            target="_blank"
            rel="noreferrer"
            className="self-start rounded-sm text-[13px] text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Source: {c.file} ↗
          </a>
        </section>

        <section aria-labelledby="props" className="flex flex-col gap-3">
          <h2 id="props" className="text-[18px] font-semibold">
            Props
          </h2>
          <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)]">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[var(--surface-2)] text-xs text-[var(--fg-muted)]">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Prop</th>
                  <th scope="col" className="px-3 py-2 font-medium">Type</th>
                  <th scope="col" className="px-3 py-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                {c.props.map((p) => (
                  <tr key={p.name}>
                    <td className="px-3 py-2 align-top font-[family-name:var(--mono)] text-[12px] whitespace-nowrap">{p.name}</td>
                    <td className="px-3 py-2 align-top font-[family-name:var(--mono)] text-[12px] text-[var(--agent)]">{p.type}</td>
                    <td className="px-3 py-2 align-top text-[var(--fg-muted)]">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-8 sm:grid-cols-2">
          <section aria-labelledby="a11y" className="flex flex-col gap-3">
            <h2 id="a11y" className="text-[18px] font-semibold">
              Accessibility
            </h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] leading-relaxed text-[var(--fg-muted)]">
              {c.a11y.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="not-built" className="flex flex-col gap-3">
            <h2 id="not-built" className="text-[18px] font-semibold">
              Deliberately not built
            </h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] leading-relaxed text-[var(--fg-muted)]">
              {c.notBuilt.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>
        </div>

        <nav aria-label="Previous and next" className="flex justify-between gap-4 border-t border-[var(--border)] pt-6 text-[13px]">
          {prev ? (
            <Link href={`/components/${prev.slug}`} className="flex flex-col gap-0.5 rounded-sm">
              <span className="text-[var(--fg-muted)]">← Previous</span>
              <span className="font-[family-name:var(--mono)]">{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/components/${next.slug}`} className="flex flex-col items-end gap-0.5 rounded-sm">
              <span className="text-[var(--fg-muted)]">Next →</span>
              <span className="font-[family-name:var(--mono)]">{next.name}</span>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
