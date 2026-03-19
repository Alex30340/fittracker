"use client";
export const scoreColor = (s: number | null): string => {
  if (s == null) return "#64748b";
  if (s >= 9) return "#22c55e"; if (s >= 7) return "#3b82f6"; if (s >= 5) return "#f59e0b"; return "#ef4444";
};
export default function ScoreRing({ score, size = 52, sw = 3.5 }: { score: number | null; size?: number; sw?: number }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, pct = score != null ? score / 10 : 0, col = scoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(30,41,59,0.6)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize: size*0.28, fontWeight: 800, color: col }}>{score != null ? score.toFixed(1) : "—"}</span>
      </div>
    </div>
  );
}
