import { OG_CONTENT_TYPE, OG_SIZE, renderLinkPreview } from "@/lib/og";
import { WHY_DESCRIPTION, WHY_TITLE } from "./meta";

export const alt = WHY_TITLE;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderLinkPreview({ title: WHY_TITLE, description: WHY_DESCRIPTION });
}
