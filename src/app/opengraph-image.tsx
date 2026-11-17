import { ImageResponse } from "next/og";

export const alt = "Panthera Properties — Luxury real estate in Colombo, Sri Lanka";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#090909",
          color: "#F4F0E8",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, letterSpacing: 18 }}>PANTHERA</div>
          <div style={{ fontSize: 16, letterSpacing: 14, color: "#C5A46D", marginTop: 8, fontFamily: "Arial" }}>PROPERTIES</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, lineHeight: 1, fontWeight: 300 }}>EXCEPTIONAL SPACES.</div>
          <div style={{ fontSize: 82, lineHeight: 1, fontWeight: 300 }}>EXTRAORDINARY LIVING.</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 36, fontSize: 22, color: "#A5A5A5", fontFamily: "Arial" }}>
            <div style={{ width: 80, height: 1, background: "#C5A46D", marginRight: 20 }} />
            Luxury real estate · Colombo, Sri Lanka
          </div>
        </div>
      </div>
    ),
    size,
  );
}
