import { OG_CONTENT_TYPE, OG_SIZE, renderLinkPreview } from "@/lib/og";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderLinkPreview({ title: SITE_TITLE, description: SITE_DESCRIPTION });
}
