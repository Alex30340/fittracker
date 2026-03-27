"use client";
import ProgressChart from "@/components/ProgressChart";
import { PROGRESS_DATA } from "@/lib/data";

export default function ProgressionPage() {
  const latest = PROGRESS_DATA[PROGRESS_DATA.length - 1];
  const first = PROGRESS_DATA[0];
  const lines = [
    { key: "bench", color: "#3b82f6", label: "Bench Press" },
    { key: "squat", color: "#22c55e", label: "Squat" },
    { key: "deadlift", color: "#f59e0b", label: "Deadlift" },
    { key: "ohp", color: "#a855f7", label: "OHP" },
    { key: "row", color: "#ef4444", label: "Rowing" },
  ];

  return (
    <div className="pb-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-[#f0f2f5] m-0 mb-1">Progression</h1>
      <p className="text-[13px] text-[#64748b] m-0 mb-6">Suivi des performances sur {PROGRESS_DATA.length} semaines</p>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { l: "Bench", v: `${latest.bench} kg`, d: `+${latest.bench - first.bench}kg`, c: "#3b82f6" },
          { l: "Squat", v: `${latest.squat} kg`, d: `+${latest.squat - first.squat}kg`, c: "#22c55e" },
          { l: "Deadlift", v: `${latest.deadlift} kg`, d: `+${latest.deadlift - first.deadlift}kg`, c: "#f59e0b" },
          { l: "OHP", v: `${latest.ohp} kg`, d: `+${latest.ohp - first.ohp}kg`, c: "#a855f7" },
          { l: "Rowing", v: `${latest.row} kg`, d: `+${latest.row - first.row}kg`, c: "#ef4444" },
          { l: "Poids", v: `${latest.weight} kg`, d: `${(latest.weight - first.weight).toFixed(1)}kg`, c: "#94a3b8" },
        ].map(({ l, v, d, c }) => (
          <div key={l} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <div className="text-[11px] text-[#64748b] mb-1.5">{l}</div>
            <div className="text-xl font-extrabold" style={{ color: c }}>{v}</div>
            <div className={`text-xs font-semibold mt-1 ${d.startsWith("-") ? "text-[#f87171]" : "text-[#22c55e]"}`}>{d}</div>
          </div>
        ))}
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] p-6">
        <h3 className="text-base font-bold text-[#f0f2f5] m-0 mb-4">Évolution des charges (kg)</h3>
        <div className="flex gap-4 mb-4 flex-wrap">
          {lines.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              <span className="text-xs text-[#e2e8f0]">{label}</span>
            </div>
          ))}
        </div>
        <ProgressChart data={PROGRESS_DATA} lines={lines} />
      </div>
    </div>
  );
}
