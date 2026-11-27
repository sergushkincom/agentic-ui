"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandMenu } from "@/components/site/command-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { REPO } from "@/lib/registry";

const NAV = [
  { href: "/why", label: "Why this exists", short: "Why" },
  { href: "/components", label: "Components", short: "Components" },
  { href: "/changelog", label: "Changelog", short: "Changelog" },
] as const;

function current(pathname: string, href: string) {
  if (href === "/components") return pathname === href || pathname.startsWith("/components/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-5 sm:px-4">
        <Link
          href="/"
          className="shrink-0 rounded-sm font-[family-name:var(--mono)] text-[14px] font-medium tracking-[-0.04em] text-[var(--fg)] sm:text-[15px]"
        >
          agentic-ui
        </Link>
        <nav aria-label="Main" className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto text-[14px] [scrollbar-width:none]">
          {NAV.map((item) => {
            const on = current(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={`shrink-0 rounded-sm px-1.5 py-1.5 whitespace-nowrap transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:px-2 ${
                  on ? "font-medium text-[var(--fg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                }`}
              >
                {item.href === "/why" ? (
                  <>
                    <span className="sm:hidden">{item.short}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </Link>
            );
          })}
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-sm px-1.5 py-1.5 whitespace-nowrap text-[var(--fg-muted)] transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--fg)] motion-reduce:transition-none sm:px-2"
          >
            GitHub
          </a>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <CommandMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
