import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPONENTS, REPO, getComponent } from "@/lib/registry";
import { newBadgeSlugs, utcToday } from "@/lib/changelog";
import { demoSource } from "@/lib/demo-source";
import { filesToCopy } from "@/lib/copy-files";
import { keyboardFor } from "@/lib/keyboard-interactions";
import { componentMarkdown } from "@/lib/page-markdown";
import { shadcnInstallCommand } from "@/lib/registry-url";
import { SITE_TITLE } from "@/lib/site";
import { Anatomy } from "@/components/site/anatomy";
import { CodeBlock } from "@/components/site/code-block";
import { CopyPageMarkdown } from "@/components/site/copy-page-markdown";
import { PlatformBadges } from "@/components/site/platform-badges";
import { FilesToCopy } from "@/components/site/files-to-copy";
import { KeyboardTable } from "@/components/site/keyboard-table";
import { WhenToUse } from "@/components/site/when-to-use";
import { DemoPanel } from "../demo-panel";

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getComponent((await params).slug);
  if (!c) return {};
  const title = c.name;
  const description = c.summary;
  return {
    title,
    description,
    openGraph: { title, description, siteName: SITE_TITLE, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComponent(slug);
  if (!c) notFound();
  const index = COMPONENTS.indexOf(c);
  const prev = COMPONENTS[index - 1];
  const next = COMPONENTS[index + 1];
  const source = demoSource(c.slug);
  const copy = filesToCopy(c.file, c.name);
  const today = utcToday();
  const markdown = componentMarkdown(c);
  const newSlugs = newBadgeSlugs(
    COMPONENTS.map((item) => item.slug),
    today,
  );

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 md:py-10">
      <nav aria-label="Components" className="min-w-0 md:sticky md:top-16 md:self-start">
        <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] md:flex-col md:overflow-visible md:pb-0">
          {COMPONENTS.map((item) => {
            const on = item.slug === slug;
            const showNew = newSlugs.has(item.slug);
            return (
              <li key={item.slug} className="shrink-0">
                <Link
                  href={`/components/${item.slug}`}
                  aria-current={on ? "page" : undefined}
                  className={`relative flex items-center gap-3 py-1.5 pr-2 pl-3 font-[family-name:var(--mono)] text-[14px] leading-5 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:justify-between ${on ? "text-[var(--fg)] before:absolute before:top-2 before:bottom-2 before:left-0 before:w-px before:bg-[var(--fg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
                >
                  <span>{item.name}</span>
                  {showNew ? <NewBadge /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="flex min-w-0 flex-col">
        <header className="flex flex-col gap-4 pb-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="site-title">{c.name}</h1>
            <CopyPageMarkdown markdown={markdown} />
          </div>
          <p className="max-w-2xl text-[16px] leading-relaxed text-[var(--fg-muted)]">{c.summary}</p>
          <PlatformBadges />
          <CodeBlock layout="command" code={shadcnInstallCommand(c.slug)} label={`${c.name} install`} />
        </header>

        <section aria-labelledby="demo" className="flex min-w-0 flex-col gap-3 pb-8">
          <h2 id="demo" className="sr-only">
            Live demo
          </h2>
          <DemoPanel slug={c.slug} name={c.name} filename={source.filename} code={source.code} />
          <p className="font-[family-name:var(--mono)] text-[12px] leading-5 text-[var(--fg-muted)]">
            Live demo. Fake data: an agent matching a supplier invoice to a purchase order.
          </p>
        </section>

        <section aria-labelledby="question" className="flex flex-col gap-3 border-t border-[var(--border)] py-8">
          <h2 id="question" className="site-h2">
            The design question
          </h2>
          <p className="text-[15px] leading-relaxed">{c.question}</p>
          <ul className="flex flex-col gap-2 text-[14px] leading-relaxed text-[var(--fg-muted)]">
            {c.decisions.map((d) => (
              <li key={d} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[9px] size-1 shrink-0 rounded-[var(--radius-sm)] bg-[var(--agent)]" />
                {d}
              </li>
            ))}
          </ul>
        </section>

        <Anatomy slug={c.slug} />

        <WhenToUse slug={c.slug} />

        <section aria-labelledby="usage" className="flex flex-col gap-3 border-t border-[var(--border)] py-8">
          <h2 id="usage" className="site-h2">
            Usage
          </h2>
          <CodeBlock code={`import { ${c.name} } from "@/components/agentic"\n\n${c.usage}`} label={`${c.name} usage`} />
          <a
            href={`${REPO}/blob/main/src/components/agentic/${c.file}`}
            target="_blank"
            rel="noreferrer"
            className="self-start rounded-[var(--radius-sm)] text-[13px] text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Source: {c.file} ↗
          </a>
        </section>

        <FilesToCopy manifest={copy} installCommand={shadcnInstallCommand(c.slug)} />

        <section aria-labelledby="props" className="flex flex-col gap-3 border-t border-[var(--border)] py-8">
          <h2 id="props" className="site-h2">
            Props
          </h2>
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
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

        <section aria-labelledby="a11y" className="flex flex-col gap-3 border-t border-[var(--border)] py-8">
          <h2 id="a11y" className="site-h2">
            Accessibility
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] leading-relaxed text-[var(--fg-muted)]">
            {c.a11y.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <h3 id="keyboard" className="pt-3 text-[15px] font-semibold">
            Keyboard interactions
          </h3>
          <KeyboardTable rows={keyboardFor(c.slug)} />
        </section>

        <section aria-labelledby="not-built" className="flex flex-col gap-3 border-t border-[var(--border)] py-8">
          <h2 id="not-built" className="site-h2">
            Deliberately not built
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] leading-relaxed text-[var(--fg-muted)]">
            {c.notBuilt.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>

        <nav aria-label="Previous and next" className="flex justify-between gap-4 border-t border-[var(--border)] py-8 text-[13px]">
          {prev ? (
            <Link href={`/components/${prev.slug}`} className="flex flex-col gap-0.5 rounded-[var(--radius-sm)]">
              <span className="text-[var(--fg-muted)]">← Previous</span>
              <span className="font-[family-name:var(--mono)]">{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/components/${next.slug}`} className="flex flex-col items-end gap-0.5 rounded-[var(--radius-sm)]">
              <span className="text-[var(--fg-muted)]">Next →</span>
              <span className="font-[family-name:var(--mono)]">{next.name}</span>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}

/** On the two most recently changed components, for 30 days after their library source changes. Sits on the row's right edge. */
function NewBadge() {
  return (
    <span className="shrink-0 font-[family-name:var(--mono)] text-[11px] tracking-[-0.02em] text-[var(--fg-muted)]">New</span>
  );
}
