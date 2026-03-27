export function scoreToGrade(s: number | null | undefined): string {
  if (s == null) return "?";
  if (s >= 9) return "A+"; if (s >= 8) return "A"; if (s >= 7) return "B+";
  if (s >= 6) return "B"; if (s >= 5) return "C"; if (s >= 4) return "D"; return "F";
}

export function gradeColor(g: string): string {
  if (g.startsWith("A")) return "#22c55e";
  if (g.startsWith("B")) return "#3b82f6";
  if (g === "C") return "#f59e0b";
  return "#ef4444";
}

export function scoreColor(s: number): string {
  if (s >= 8) return "#22c55e"; if (s >= 6) return "#3b82f6";
  if (s >= 4) return "#f59e0b"; return "#ef4444";
}

export function GradeBadge({ score, size = "md" }: { score?: number | null; size?: "sm"|"md"|"lg" }) {
  const g = scoreToGrade(score), c = gradeColor(g);
  const cls = size==="lg" ? "w-16 h-16 text-xl rounded-2xl" : size==="sm" ? "w-9 h-9 text-[13px] rounded-[10px]" : "w-[46px] h-[46px] text-[15px] rounded-xl";
  return <div className={`inline-flex items-center justify-center font-extrabold flex-shrink-0 tracking-tight ${cls}`} style={{background:`${c}18`,color:c,border:`1px solid ${c}25`}}>{g}</div>;
}

export function ScoreBar({ value, max = 10, color }: { value?: number|null; max?: number; color?: string }) {
  const pct = value != null ? Math.min((value/max)*100,100) : 0;
  const c = color || scoreColor(value != null ? (value/max)*10 : 0);
  return <div className="score-bar"><div className="score-bar-fill" style={{width:`${pct}%`,background:c}}/></div>;
}

export default function ScoreRing({ score, size = 48, sw = 3 }: { score?: number|null; size?: number; sw?: number }) {
  const s = score ?? 0, color = scoreColor(s);
  const r = (size - sw*2)/2, circ = 2*Math.PI*r, pct = Math.min(s/10,1);
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{width:size,height:size}}>
      <svg width={size} height={size} className="block -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.25,1,0.5,1)"}}/>
      </svg>
      <span className="absolute font-extrabold" style={{fontSize:size*0.3,color}}>{score!=null?score.toFixed(1):"—"}</span>
    </div>
  );
}
