"use client";

export default function CyberpunkOverlay({
  grid = true,
  scanlines = true,
  hudCorners = true,
}: {
  grid?: boolean;
  scanlines?: boolean;
  hudCorners?: boolean;
}) {
  return (
    <div className="cyberpunk-overlay" aria-hidden="true">
      {grid && <div className="cyber-grid" />}
      {scanlines && <div className="cyber-scanlines" />}
      <div className="cyber-vignette" />
      {hudCorners && (
        <div className="cyber-hud">
          <span className="cyber-corner cyber-corner-tl" />
          <span className="cyber-corner cyber-corner-tr" />
          <span className="cyber-corner cyber-corner-bl" />
          <span className="cyber-corner cyber-corner-br" />
        </div>
      )}
    </div>
  );
}
