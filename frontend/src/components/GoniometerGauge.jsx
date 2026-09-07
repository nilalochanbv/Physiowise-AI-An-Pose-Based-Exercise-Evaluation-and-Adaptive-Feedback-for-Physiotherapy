import React from "react";

export default function GoniometerGauge({
  exerciseTitle = "Joint Angle",
  measuredAngle = 0,
  targetRange = [0, 180],
  verdict = 1,
  score = 100,
  stage = 1,
}) {
  const [minTarget, maxTarget] = targetRange && targetRange.length === 2 ? targetRange : [0, 180];
  const isCorrect = verdict === 1;
  const statusColor = isCorrect ? "#4C7A73" : "#B34B3C"; // sage-teal vs rust-red

  // Gauge Dimensions
  const width = 280;
  const height = 175;
  const cx = 140;
  const cy = 135;
  const radius = 95;

  // Convert physical angle (0 to 180 deg) to SVG (x, y) coordinates
  const getCoords = (angleDeg, r = radius) => {
    const clamped = Math.max(0, Math.min(180, angleDeg));
    const rad = (clamped * Math.PI) / 180;
    // 0 deg is left (-r, 0), 90 deg is top (0, -r), 180 deg is right (+r, 0)
    const x = cx - r * Math.cos(rad);
    const y = cy - r * Math.sin(rad);
    return { x, y };
  };

  // Base Arc (0 to 180 deg)
  const baseStart = getCoords(0);
  const baseEnd = getCoords(180);
  const baseArcPath = `M ${baseStart.x} ${baseStart.y} A ${radius} ${radius} 0 0 1 ${baseEnd.x} ${baseEnd.y}`;

  // Target Arc Band
  const targetStart = getCoords(minTarget);
  const targetEnd = getCoords(maxTarget);
  const largeArcFlag = maxTarget - minTarget > 180 ? 1 : 0;
  const targetArcPath = `M ${targetStart.x} ${targetStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${targetEnd.x} ${targetEnd.y}`;

  // Needle Coords
  const needleCoords = getCoords(measuredAngle, radius - 12);

  // Tick Marks (0, 30, 60, 90, 120, 150, 180)
  const ticks = [0, 30, 60, 90, 120, 150, 180];

  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "20px",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
        <span style={{ fontWeight: "600", fontSize: "15px", color: "var(--ink-navy)" }}>
          {exerciseTitle} {stage ? `(Stage ${stage})` : ""}
        </span>
        <span
          className="badge"
          style={{
            backgroundColor: isCorrect ? "#E8F5E9" : "#FFEBEE",
            color: statusColor,
            border: `1px solid ${statusColor}`,
          }}
        >
          {isCorrect ? "CORRECT" : "ADJUST"}
        </span>
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background Track Arc */}
        <path d={baseArcPath} fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" />

        {/* Shaded Target Range Band */}
        <path d={targetArcPath} fill="none" stroke="#C9A227" strokeWidth="14" strokeOpacity="0.85" strokeLinecap="round" />

        {/* Tick Marks & Labels */}
        {ticks.map((t) => {
          const inner = getCoords(t, radius - 18);
          const outer = getCoords(t, radius - 8);
          const labelPos = getCoords(t, radius - 30);
          return (
            <g key={t}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9CA3AF" strokeWidth="1.5" />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fill="#6B7280"
                fontSize="9"
                fontFamily="IBM Plex Mono, monospace"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {t}°
              </text>
            </g>
          );
        })}

        {/* Needle Line */}
        <line x1={cx} y1={cy} x2={needleCoords.x} y2={needleCoords.y} stroke={statusColor} strokeWidth="3.5" strokeLinecap="round" />

        {/* Needle Pivot Center */}
        <circle cx={cx} cy={cy} r="7" fill={statusColor} />
        <circle cx={cx} cy={cy} r="3" fill="#FFFFFF" />
      </svg>

      {/* Numerical Readouts */}
      <div style={{ marginTop: "4px", width: "100%" }}>
        <div className="mono-num" style={{ fontSize: "26px", color: statusColor, fontWeight: "700" }}>
          {measuredAngle}°
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "8px", fontSize: "12px" }}>
          <div>
            <span style={{ color: "var(--text-muted)" }}>Target: </span>
            <span className="mono-num" style={{ color: "var(--muted-gold)" }}>
              {minTarget}° - {maxTarget}°
            </span>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>Score: </span>
            <span className="mono-num" style={{ color: "var(--ink-navy)" }}>
              {score}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
