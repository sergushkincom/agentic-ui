import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewStage } from "@/components/site/preview-stage";
import { COMPONENTS, getComponent } from "@/lib/registry";
import { SITE_TITLE } from "@/lib/site";

export function generateStaticParams() {
  return COMPONENTS.map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const component = getComponent((await params).slug);
  if (!component) return {};
  const title = `${component.name} preview`;
  const description = component.summary;
  return {
    title,
    description,
    openGraph: { title, description, siteName: SITE_TITLE, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) notFound();

  return (
    <main>
      <PreviewStage slug={component.slug} name={component.name} mode="page" />
    </main>
  );
}
