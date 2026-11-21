import { OG_CONTENT_TYPE, OG_SIZE, renderLinkPreview } from "@/lib/og";
import { CHANGELOG_DESCRIPTION, CHANGELOG_TITLE } from "./meta";

export const alt = CHANGELOG_TITLE;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderLinkPreview({ title: CHANGELOG_TITLE, description: CHANGELOG_DESCRIPTION });
}
