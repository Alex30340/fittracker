"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PROGRAMS, levelLabels, levelColors } from "@/lib/data";

export default function ProgramDetailPage() {
  const { programId } = useParams();
  const prog = PROGRAMS.find(p => p.id === Number(programId));
  if (!prog) return <div className="p-10 text-[#f87171]">Programme introuvable. <Link href="/coach" className="text-[#3b82f6]">Retour</Link></div>;

  return (
    <div className="pb-10 animate-fade-in">
      <Link href="/coach" className="text-[#64748b] text-[13px] no-underline hover:text-[#e2e8f0] mb-4 inline-block">← Retour aux programmes</Link>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] p-6 mb-5">
        <h1 className="text-[22px] font-bold text-[#f0f2f5] m-0 mb-1.5">{prog.name}</h1>
        <p className="text-[13px] text-[#94a3b8] m-0 mb-3">{prog.desc}</p>
        <div className="flex gap-2 flex-wrap">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: levelColors[prog.level] + "18", color: levelColors[prog.level] }}>{levelLabels[prog.level]}</span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white/[0.04] text-[#94a3b8]">{prog.days}j/sem</span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white/[0.04] text-[#94a3b8]">{prog.duration}</span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white/[0.04] text-[#94a3b8]">{prog.equipment}</span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[rgba(59,130,246,0.1)] text-[#60a5fa]">{prog.goal}</span>
        </div>
      </div>
      {prog.schedule.map((day, di) => (
        <div key={di} className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex justify-between items-center">
            <div>
              <h3 className="text-[15px] font-bold text-[#f0f2f5] m-0">Jour {day.day} — {day.name}</h3>
              <div className="text-[11px] text-[#64748b]">{day.focus}</div>
            </div>
            <span className="text-xs text-[#64748b]">{day.exercises.length} exercices</span>
          </div>
          {day.exercises.map((ex, ei) => (
            <div key={ei} className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3 border-b border-white/[0.04] items-center">
              <div>
                <div className="text-[14px] font-semibold text-[#f0f2f5]">{ex.name}</div>
                <div className="text-[11px] text-[#64748b]">{ex.muscle}{ex.notes ? ` · ${ex.notes}` : ""}</div>
              </div>
              <div className="text-center"><div className="text-[10px] text-[#64748b]">Séries</div><div className="text-sm font-bold text-[#3b82f6]">{ex.sets}</div></div>
              <div className="text-center"><div className="text-[10px] text-[#64748b]">Reps</div><div className="text-sm font-bold text-[#22c55e]">{ex.reps}</div></div>
              <div className="text-center"><div className="text-[10px] text-[#64748b]">Repos</div><div className="text-sm font-bold text-[#f59e0b]">{ex.rest}</div></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
