import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#05070d",
          color: "#ffffff",
          padding: "70px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, rgba(34,211,238,0.16), transparent 34%), radial-gradient(circle at 78% 28%, rgba(217,70,239,0.22), transparent 30%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 360,
            height: 360,
            borderRadius: 360,
            border: "2px solid rgba(217,70,239,0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 70,
            bottom: 88,
            width: 410,
            height: 220,
            border: "2px solid rgba(34,211,238,0.42)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div
              style={{
                width: 88,
                height: 88,
                border: "2px solid rgba(34,211,238,0.32)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 58,
                fontWeight: 800,
              }}
            >
              V
            </div>
            <div style={{ fontSize: 32, color: "#22d3ee", letterSpacing: 9 }}>
              VAEXIL.TV
            </div>
          </div>
          <div style={{ maxWidth: 820, fontSize: 80, lineHeight: 0.95, fontWeight: 700 }}>
            Stream hub, guides, and Recon maps.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, color: "#cbd5e1", fontSize: 28 }}>
          <span>Live</span>
          <span style={{ color: "#d946ef" }}>•</span>
          <span>Schedule</span>
          <span style={{ color: "#d946ef" }}>•</span>
          <span>Clips</span>
          <span style={{ color: "#d946ef" }}>•</span>
          <span>Guides</span>
          <span style={{ color: "#d946ef" }}>•</span>
          <span>VaexCore</span>
        </div>
      </div>
    ),
    size,
  );
}
