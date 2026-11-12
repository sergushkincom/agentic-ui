import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_TITLE_TEMPLATE, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: SITE_TITLE_TEMPLATE },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: { default: SITE_TITLE, template: SITE_TITLE_TEMPLATE },
    description: SITE_DESCRIPTION,
    siteName: SITE_TITLE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: { default: SITE_TITLE, template: SITE_TITLE_TEMPLATE },
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
