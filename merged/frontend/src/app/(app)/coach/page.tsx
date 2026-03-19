"use client";
import Link from "next/link";
import { PROGRAMS, DEFAULT_PROFILE, levelLabels, levelColors } from "@/lib/data";

export default function CoachPage() {
  const profile = DEFAULT_PROFILE;
  const recommended = PROGRAMS.filter(p => Math.abs(p.level - profile.level) <= 1 && p.days <= profile.days);

  return (
    <div className="pb-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-[#f0f2f5] m-0 mb-1">Coach IA</h1>
      <p className="text-[13px] text-[#64748b] m-0 mb-6">Programmes adaptés — Niveau {profile.level}/5, {profile.days}j/semaine, {profile.equipment}</p>
      {recommended.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-bold text-[#22c55e] uppercase tracking-widest mb-2.5">Recommandés pour toi</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recommended.map(prog => (
              <Link key={prog.id} href={`/coach/${prog.id}`} className="bg-[rgba(52,211,153,0.04)] border border-[rgba(52,211,153,0.15)] rounded-[14px] p-5 no-underline hover:border-[rgba(52,211,153,0.3)] transition-colors">
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="text-base font-bold text-[#f0f2f5] m-0">{prog.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: levelColors[prog.level] + "18", color: levelColors[prog.level] }}>{levelLabels[prog.level]}</span>
                </div>
                <p className="text-xs text-[#94a3b8] m-0 mb-2.5 leading-relaxed">{prog.desc}</p>
                <div className="flex gap-3 text-[11px] text-[#64748b]">
                  <span>{prog.days}j/sem</span><span>{prog.duration}</span><span>{prog.goal}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-2.5">Tous les programmes ({PROGRAMS.length})</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 stagger">
        {PROGRAMS.map(prog => (
          <Link key={prog.id} href={`/coach/${prog.id}`} className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] p-5 no-underline hover:border-white/[0.12] transition-colors">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="text-base font-bold text-[#f0f2f5] m-0">{prog.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: levelColors[prog.level] + "18", color: levelColors[prog.level] }}>{levelLabels[prog.level]}</span>
            </div>
            <p className="text-xs text-[#94a3b8] m-0 mb-2.5 leading-relaxed">{prog.desc}</p>
            <div className="flex gap-3 text-[11px] text-[#64748b]">
              <span>{prog.days}j/sem</span><span>{prog.duration}</span><span>{prog.equipment}</span><span>{prog.goal}</span>
            </div>
            <div className="text-[11px] text-[#60a5fa] mt-2">{prog.schedule.length} séances · {prog.schedule.reduce((s, d) => s + d.exercises.length, 0)} exercices</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
