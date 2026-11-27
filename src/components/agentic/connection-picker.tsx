"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { nextEnabledIndex } from "./keyboard";
import { AgentMark, HumanMark, buttonClass } from "./marks";
import { StatusMorph } from "./status-morph";

export type ConnectionAccount = {
  id: string;
  /** A name a person recognises. Never a secret. */
  name: string;
  /** Who the account belongs to, such as an email. Never a key. */
  holder: string;
};

export type ConnectionMode = "pick" | "manual";

export type ConnectionPickerProps = {
  /** Why the agent needs an account. */
  purpose: string;
  accounts: ConnectionAccount[];
  /** The account chosen for this step, if one is connected. */
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Starts sign-in. This component never receives a token. */
  onSignIn: () => void;
  mode: ConnectionMode;
  onModeChange: (mode: ConnectionMode) => void;
  /**
   * Manual setup. `secret` is handed over once. The field is cleared in the same turn,
   * and nothing in this component renders it.
   */
  onManual: (setup: { name: string; secret: string }) => void;
};

/**
 * Pick an account the agent may use, or sign in, or set one up by hand.
 * The screen shows a name and who it belongs to. A key is typed into a concealed field,
 * passed on once, and dropped. There is no way to reveal it.
 */
export function ConnectionPicker({
  purpose,
  accounts,
  selectedId,
  onSelect,
  onSignIn,
  mode,
  onModeChange,
  onManual,
}: ConnectionPickerProps) {
  const manualButton = useRef<HTMLButtonElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<"button" | "account" | null>(null);
  const selected = accounts.find((account) => account.id === selectedId);

  useEffect(() => {
    if (mode !== "pick") return;
    const where = restoreFocus.current;
    if (!where) return;
    restoreFocus.current = null;
    if (where === "button") {
      manualButton.current?.focus();
      return;
    }
    groupRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
  }, [mode, selectedId, accounts]);

  const cancelManual = () => {
    restoreFocus.current = "button";
    onModeChange("pick");
  };

  const saveManual = (setup: { name: string; secret: string }) => {
    restoreFocus.current = "account";
    onManual(setup);
    onModeChange("pick");
  };

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3">
      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {mode === "manual" ? (
            <HumanMark label="Set up by you" />
          ) : selected ? (
            <HumanMark label="Your account" />
          ) : (
            <AgentMark label="Needs an account" />
          )}
        </div>
        <p className="text-[15px] leading-snug font-medium">{purpose}</p>
      </header>

      {mode === "manual" ? (
        <ManualSetup onSave={saveManual} onCancel={cancelManual} />
      ) : (
        <>
          {accounts.length > 0 ? (
            <AccountList
              accounts={accounts}
              selectedId={selectedId}
              onSelect={onSelect}
              groupRef={groupRef}
            />
          ) : (
            <p className="text-[13px] text-[var(--fg-muted)]">No account connected yet.</p>
          )}
          <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
            <p className="text-[13px] font-medium">Sign in or set up manually</p>
            <p className="text-xs text-[var(--fg-muted)]">A key or token is never shown here.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onSignIn} className={buttonClass.primary}>
                Sign in
              </button>
              <button ref={manualButton} type="button" onClick={() => onModeChange("manual")} className={buttonClass.secondary}>
                Set up manually
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function AccountList({
  accounts,
  selectedId,
  onSelect,
  groupRef,
}: {
  accounts: ConnectionAccount[];
  selectedId?: string;
  onSelect: (id: string) => void;
  groupRef: RefObject<HTMLDivElement | null>;
}) {
  const selectedIndex = accounts.findIndex((account) => account.id === selectedId);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Accounts"
      className="flex flex-col gap-1"
      onKeyDown={(event) => {
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
        const current = buttons.findIndex((button) => button === event.target);
        if (current < 0) return;
        const next = nextEnabledIndex(current, buttons.length, event.key);
        if (next === null) return;
        event.preventDefault();
        const account = accounts[next];
        if (!account) return;
        onSelect(account.id);
        requestAnimationFrame(() => buttons[next]?.focus());
      }}
    >
      {accounts.map((account, index) => {
        const on = index === selectedIndex;
        return (
          <button
            key={account.id}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => onSelect(account.id)}
            className={`flex w-full items-center gap-2.5 rounded-[var(--radius-md)] border px-2.5 py-2 text-left ${
              on ? "border-[var(--ok)] bg-[var(--surface)]" : "border-transparent bg-[var(--surface-2)] hover:border-[var(--border)]"
            }`}
          >
            <span className="flex size-4 shrink-0 items-center justify-center">
              {on ? (
                <StatusMorph glyph="check" />
              ) : (
                <span aria-hidden="true" className="size-3.5 rounded-[var(--radius-sm)] border border-[var(--border)]" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{account.name}</span>
              <span className="block truncate text-[12px] text-[var(--fg-muted)]">{account.holder}</span>
            </span>
            {on && <span className="shrink-0 text-[11px] font-medium text-[var(--ok)]">Connected</span>}
          </button>
        );
      })}
    </div>
  );
}

function ManualSetup({
  onSave,
  onCancel,
}: {
  onSave: (setup: { name: string; secret: string }) => void;
  onCancel: () => void;
}) {
  const nameId = useId();
  const keyId = useId();
  const hintId = useId();
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");

  const save = () => {
    const nextName = name.trim();
    if (!nextName || secret === "") return;
    const handed = secret;
    setSecret("");
    setName("");
    onSave({ name: nextName, secret: handed });
  };

  return (
    <form
      autoComplete="off"
      className="flex flex-col gap-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || event.repeat) return;
        event.preventDefault();
        setSecret("");
        onCancel();
      }}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor={nameId} className="text-xs font-medium text-[var(--fg-muted)]">
          Account name
        </label>
        <input
          id={nameId}
          autoFocus
          value={name}
          autoComplete="off"
          onChange={(event) => setName(event.target.value)}
          className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[14px] outline-none focus:border-[var(--human)]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={keyId} className="text-xs font-medium text-[var(--fg-muted)]">
          Access key
        </label>
        <input
          id={keyId}
          type="password"
          value={secret}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby={hintId}
          onChange={(event) => setSecret(event.target.value)}
          className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[14px] outline-none focus:border-[var(--human)]"
        />
        <p id={hintId} className="text-xs text-[var(--fg-muted)]">
          Concealed while you type. Passed on once, then dropped. Never shown.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={buttonClass.primary}>
          Save
        </button>
        <button type="button" onClick={onCancel} className={buttonClass.ghost}>
          Cancel
        </button>
      </div>
    </form>
  );
}
