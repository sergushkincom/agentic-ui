import { AgentMark } from "./marks";
import { StatusMorph } from "./status-morph";

export type HarnessKind = "model" | "memory" | "tool";

export type HarnessSocket = {
  id: string;
  kind: HarnessKind;
  /** What is plugged in. Empty means the socket is open. */
  value?: string;
  /** An open required socket blocks the step. */
  required?: boolean;
};

export type AgentHarnessProps = {
  /** Name of the step. */
  title: string;
  /** What the step is trying to do. */
  task: string;
  sockets: HarnessSocket[];
};

/**
 * One agent step, seen as a harness: a model, memory, and tools, each a socket.
 * A socket that is required and empty is a warning. The step says it will not run.
 * Connected sockets settle on a check.
 */
export function AgentHarness({ title, task, sockets }: AgentHarnessProps) {
  const missing = sockets.filter((socket) => socket.required && isOpen(socket));

  return (
    <article
      className="flex flex-col gap-3 rounded-[var(--radius)] border bg-[var(--surface)] p-4"
      style={{ borderColor: missing.length > 0 ? "var(--warn)" : "var(--border)" }}
    >
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AgentMark label="Agent step" />
          <span className={`text-xs font-medium ${missing.length > 0 ? "text-[var(--warn)]" : "text-[var(--ok)]"}`}>
            {missing.length > 0 ? "Won't run" : "Ready"}
          </span>
        </div>
        <h3 className="text-[15px] leading-snug font-semibold">{title}</h3>
        <p className="text-[13px] text-[var(--fg-muted)]">{task}</p>
      </header>

      <SocketList sockets={sockets} />

      {missing.length > 0 && (
        <p role="status" className="rounded-lg bg-[var(--warn-soft)] px-2.5 py-2 text-[13px] leading-relaxed text-[var(--fg)]">
          <span className="font-medium">Warning. </span>
          {missingSentence(missing)}
        </p>
      )}
    </article>
  );
}

function SocketList({ sockets }: { sockets: HarnessSocket[] }) {
  return (
    <ul aria-label="Sockets" className="flex flex-col gap-1">
      {sockets.map((socket) => (
        <Socket key={socket.id} socket={socket} />
      ))}
    </ul>
  );
}

function Socket({ socket }: { socket: HarnessSocket }) {
  const open = isOpen(socket);
  const warn = Boolean(open && socket.required);
  const valueClass = open && !warn ? "text-[var(--fg-muted)]" : "text-[var(--fg)]";

  return (
    <li
      className={`grid grid-cols-[1rem_4.25rem_minmax(0,1fr)_auto] items-center gap-x-2.5 rounded-lg px-2 py-1.5 ${
        warn ? "bg-[var(--warn-soft)]" : ""
      }`}
    >
      <SocketMark open={open} warn={warn} />
      <span className={`font-[family-name:var(--mono)] text-[12px] ${warn ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"}`}>
        {kindLabel(socket.kind)}
      </span>
      <span className={`truncate text-[13px] ${valueClass}`}>{socket.value?.trim() ? socket.value : "Not connected"}</span>
      <span className={`text-[11px] font-medium ${warn ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"}`}>
        {socket.required ? "Required" : "Optional"}
      </span>
    </li>
  );
}

function SocketMark({ open, warn }: { open: boolean; warn: boolean }) {
  if (warn || !open) return <StatusMorph glyph={warn ? "alert" : "check"} />;
  return <span aria-hidden="true" className="size-3.5 rounded-full border border-dashed border-[var(--fg-muted)]" />;
}

function isOpen(socket: HarnessSocket) {
  return !socket.value?.trim();
}

function kindLabel(kind: HarnessKind) {
  if (kind === "model") return "Model";
  if (kind === "memory") return "Memory";
  return "Tool";
}

function missingSentence(missing: HarnessSocket[]): string {
  const counts: Record<HarnessKind, number> = { model: 0, memory: 0, tool: 0 };
  for (const socket of missing) counts[socket.kind] += 1;
  const parts: string[] = [];
  if (counts.model) parts.push(counts.model === 1 ? "Model" : `${counts.model} models`);
  if (counts.memory) parts.push(counts.memory === 1 ? "Memory" : `${counts.memory} memories`);
  if (counts.tool) parts.push(counts.tool === 1 ? "A tool" : `${counts.tool} tools`);
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  const verb = parts.length === 1 ? "is" : "are";
  const pronoun = parts.length === 1 ? "it is" : "they are";
  return `${list} ${verb} required. This step will not run until ${pronoun} connected.`;
}
