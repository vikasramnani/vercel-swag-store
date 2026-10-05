import { ImageResponse } from "next/og";

export const alt = "Vercel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// public/vercel.svg is a white triangle. Drawn on black so the mark shows in a share card.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="280" height="242" viewBox="0 0 1155 1000">
          <path d="m577.3 0 577.4 1000H0z" fill="#fff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
