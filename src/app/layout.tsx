import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteFrame } from "@/components/site/site-frame";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_TITLE_TEMPLATE, SITE_URL } from "@/lib/site";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const sans = localFont({
  src: "../fonts/ibm-plex-sans.woff2",
  weight: "100 700",
  variable: "--font-sans",
  display: "swap",
});

const mono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});

const display = localFont({
  src: "../fonts/instrument-serif.woff2",
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

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
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
