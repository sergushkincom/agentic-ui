import { ImageResponse } from "next/og";

/**
 * Light site tokens. `next/og` cannot read CSS variables, so the values are copied
 * from the light theme in `src/app/tokens.css` (`--bg`, `--fg`, `--fg-muted`).
 */
const paper = "#fafafa";
const ink = "#1d1d1f";
const muted = "#6e6e73";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const padX = 96;
const padY = 84;

/**
 * Plain link preview: a title and one description, left aligned on the light background.
 * The bundled face only ships at weight 700, so hierarchy comes from size and colour.
 */
export function renderLinkPreview({ title, description }: { title: string; description: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: paper,
          padding: `${padY}px ${padX}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            color: ink,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            width: OG_SIZE.width - padX * 2,
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.4,
            color: muted,
          }}
        >
          {description}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
