import { CodeBlock } from "@/components/site/code-block";
import { REACT_TAILWIND_NOTE, type CopyManifest } from "@/lib/copy-files";

/** Manual install for one component: the file tree, the import, and the CSS it reads. */
export function FilesToCopy({ manifest, installCommand }: { manifest: CopyManifest; installCommand: string }) {
  return (
    <section aria-labelledby="files" className="flex min-w-0 flex-col gap-3 border-t border-[var(--border)] py-8">
      <h2 id="files" className="site-h2">
        Files to copy
      </h2>
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">
        Copy these files into a Next.js app at the same paths. {REACT_TAILWIND_NOTE}
      </p>
      <h3 className="text-[15px] font-semibold">Install with shadcn</h3>
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">
        Or add the same files with the shadcn CLI. The registry JSON is generated from the component sources.
      </p>
      <CodeBlock code={installCommand} label={`${manifest.exportName} shadcn install`} />
      <CodeBlock code={manifest.tree} label="Files to copy" />

      <h3 className="pt-3 text-[15px] font-semibold">Import</h3>
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">
        Import the component from its own file. That resolves with only the files above.
      </p>
      <CodeBlock code={manifest.importStatement} label={`${manifest.exportName} import`} />
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{manifest.packageNote}</p>
      {manifest.extraInstall ? <CodeBlock code={manifest.extraInstall} label="Package install" /> : null}

      <h3 className="pt-3 text-[15px] font-semibold">Styles</h3>
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">
        Import the tokens next to Tailwind in <code className="font-[family-name:var(--mono)] text-[13px]">globals.css</code>. The
        components read colours from these variables.
      </p>
      <CodeBlock code={manifest.tokenImport} label="Token import" />
      {manifest.motionCss ? (
        <>
          <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{manifest.motionNote}</p>
          <CodeBlock code={manifest.motionCss} label="Motion CSS" />
        </>
      ) : null}
    </section>
  );
}
