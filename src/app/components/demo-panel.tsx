"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/site/code-block";
import { Segmented } from "@/components/site/segmented";
import { Demo } from "./demos";

/** Preview shows the live demo. Code shows the source of that same demo. */
export function DemoPanel({ slug, filename, code }: { slug: string; filename: string; code: string }) {
  const [view, setView] = useState<"preview" | "code">("preview");

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Segmented
        label="Demo view"
        value={view}
        onChange={setView}
        options={[
          { value: "preview", label: "Preview" },
          { value: "code", label: "Code" },
        ]}
      />
      {view === "preview" ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-5 sm:p-8">
          <div className="mx-auto max-w-xl">
            <Demo slug={slug} />
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-2">
          <p className="font-[family-name:var(--mono)] text-[12px] break-all text-[var(--fg-muted)]">{filename}</p>
          <CodeBlock code={code} label={`${filename} source`} />
        </div>
      )}
    </div>
  );
}
