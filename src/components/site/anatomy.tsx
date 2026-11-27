import { anatomyFor, flattenAnatomy, type AnatomyNode } from "@/lib/anatomy";

/** Annotated diagram for a composed component. Renders nothing when the component has no anatomy. */
export function Anatomy({ slug }: { slug: string }) {
  const nodes = anatomyFor(slug);
  if (!nodes) return null;
  const parts = flattenAnatomy(nodes);

  return (
    <section aria-labelledby="anatomy" className="flex min-w-0 flex-col gap-3 border-t border-[var(--border)] py-8">
      <h2 id="anatomy" className="site-h2">
        Anatomy
      </h2>
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">
        Names are the names in the component source. Each one answers a question a person has while reading it.
      </p>
      <figure className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div aria-hidden="true" className="min-w-0">
          {nodes.map((node) => (
            <AnatomyRegion key={node.name} node={node} parts={parts} depth={0} />
          ))}
        </div>
        <figcaption className="min-w-0">
          <ol className="flex flex-col gap-2.5">
            {parts.map((part, index) => (
              <li key={part.name} className="flex min-w-0 gap-2 text-[13px] leading-relaxed">
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--fg)] text-[11px] font-medium text-[var(--bg)]">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <code className="font-[family-name:var(--mono)] text-[12px]">{part.name}</code>
                  <span className="text-[var(--fg-muted)]"> {part.answers}</span>
                </span>
              </li>
            ))}
          </ol>
        </figcaption>
      </figure>
    </section>
  );
}

function AnatomyRegion({
  node,
  parts,
  depth,
}: {
  node: AnatomyNode;
  parts: readonly AnatomyNode[];
  depth: number;
}) {
  const index = parts.findIndex((part) => part.name === node.name);
  const nested = Boolean(node.children?.length);
  return (
    <div
      className={
        depth === 0
          ? "min-w-0 border border-[var(--border)] bg-[var(--surface)] p-3"
          : "min-w-0 border-l border-[var(--border)] pl-2.5"
      }
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--fg)] text-[11px] font-medium text-[var(--bg)]">
          {index + 1}
        </span>
        <span className="min-w-0 font-[family-name:var(--mono)] text-[12px] break-words">{node.name}</span>
      </div>
      {nested ? (
        <div className="mt-2 flex min-w-0 flex-col gap-2">
          {node.children?.map((child) => (
            <AnatomyRegion key={child.name} node={child} parts={parts} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
