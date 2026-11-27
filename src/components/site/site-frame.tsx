"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

/** Docs chrome. The recording route is the preview alone. */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/preview/")) return children;

  return (
    <div id="site-frame" className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="min-w-0 flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
