import { notFound } from "next/navigation";
import { OG_CONTENT_TYPE, OG_SIZE, renderLinkPreview } from "@/lib/og";
import { COMPONENTS, getComponent } from "@/lib/registry";

export const alt = "agentic-ui component";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const c = getComponent((await params).slug);
  if (!c) notFound();
  return renderLinkPreview({ title: c.name, description: c.summary });
}
