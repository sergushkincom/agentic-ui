import Link from "next/link";
import { getComponent } from "@/lib/registry";
import { whenFor } from "@/lib/when-to-use";

const linkClass =
  "rounded-sm font-[family-name:var(--mono)] text-[13px] text-[var(--accent)] underline-offset-2 hover:underline";

/** "Use when" and "Use {Name} instead when…" for one component page. */
export function WhenToUse({ slug }: { slug: string }) {
  const guide = whenFor(slug);

  return (
    <section aria-labelledby="when-to-use" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 id="when-to-use" className="text-[18px] font-semibold">
          When to use
        </h2>
        <h3 className="text-[15px] font-semibold">Use when</h3>
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] leading-relaxed text-[var(--fg-muted)]">
          {guide.useWhen.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-[15px] font-semibold">Use another component when</h3>
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] leading-relaxed text-[var(--fg-muted)]">
          {guide.instead.map((item) => {
            const alt = getComponent(item.slug);
            if (!alt) throw new Error(`When-to-use for ${slug} points at unknown component ${item.slug}`);
            return (
              <li key={item.slug}>
                Use{" "}
                <Link href={`/components/${alt.slug}`} className={linkClass}>
                  {alt.name}
                </Link>{" "}
                instead when {item.when}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
