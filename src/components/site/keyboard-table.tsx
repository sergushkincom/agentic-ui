import type { KeyboardRow } from "@/lib/keyboard-interactions";

/** Key → action table. Same chrome as the props table, so the docs pages stay one system. */
export function KeyboardTable({ rows }: { rows: KeyboardRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)]">
      <table aria-labelledby="keyboard" className="w-full text-left text-[13px]">
        <thead className="bg-[var(--surface-2)] text-xs text-[var(--fg-muted)]">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Key
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="w-px px-3 py-2 align-top text-left font-normal whitespace-nowrap">
                <KeyCaps label={row.key} />
              </th>
              <td className="px-3 py-2 align-top leading-relaxed text-[var(--fg-muted)]">{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyCaps({ label }: { label: string }) {
  if (label === "None") return <span className="text-[var(--fg-muted)]">None</span>;
  const parts = label.split(" + ");
  return (
    <span className="inline-flex items-center gap-1">
      {parts.map((part, index) => (
        <span key={part} className="inline-flex items-center gap-1">
          {index > 0 && <span className="text-[var(--fg-muted)]">+</span>}
          <kbd className="inline-flex rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 font-[family-name:var(--mono)] text-[12px] font-medium text-[var(--fg)]">
            {part}
          </kbd>
        </span>
      ))}
    </span>
  );
}
