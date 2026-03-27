"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCatalogStats } from "@/lib/api";

export default function HomePage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { getCatalogStats().then(setStats).catch(() => {}); }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-8 h-14 border-b border-white/[0.04]">
        <span className="text-[15px] font-bold tracking-tight text-white">Protein<span className="text-[#22c55e]">Scan</span> <span className="text-[#4a5168] font-normal mx-1">&times;</span> <span className="text-[#3b82f6]">Fit</span>Tracker</span>
        <div className="flex gap-2">
          <Link href="/login" className="text-[13px] text-[#7d8599] hover:text-white transition-colors px-3 py-1.5">Connexion</Link>
          <Link href="/register" className="text-[13px] font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] px-4 py-1.5 rounded-lg transition-colors">S&apos;inscrire</Link>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* ProteinScan */}
        <Link href="/catalogue" className="group relative flex flex-col justify-center items-center p-12 lg:p-20 border-r border-white/[0.04] transition-all hover:bg-[rgba(34,197,94,0.02)] cursor-pointer">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{background:"radial-gradient(ellipse at center, rgba(34,197,94,0.05) 0%, transparent 70%)"}} />
          <div className="relative text-center max-w-[400px]">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl" style={{background:"linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))", border:"1px solid rgba(34,197,94,0.1)"}}>🧪</div>
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">ProteinScan</h2>
            <p className="text-[15px] text-[#7d8599] leading-relaxed mb-6">Comparateur independant de whey proteines. Scoring, aminogrammes, edulcorants, prix — tout est analyse et note.</p>
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center"><div className="text-xl font-extrabold text-[#22c55e]">{stats?.total_products||"80"}+</div><div className="text-[10px] text-[#4a5168] uppercase tracking-widest mt-0.5">Produits</div></div>
              <div className="w-px h-8 bg-white/[0.06]"/>
              <div className="text-center"><div className="text-xl font-extrabold text-[#22c55e]">A+</div><div className="text-[10px] text-[#4a5168] uppercase tracking-widest mt-0.5">Grades</div></div>
              <div className="w-px h-8 bg-white/[0.06]"/>
              <div className="text-center"><div className="text-xl font-extrabold text-[#22c55e]">0&euro;</div><div className="text-[10px] text-[#4a5168] uppercase tracking-widest mt-0.5">Gratuit</div></div>
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all group-hover:gap-3" style={{background:"linear-gradient(135deg, #22c55e, #16a34a)"}}>
              Explorer le catalogue <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </Link>

        {/* FitTracker */}
        <Link href="/dashboard" className="group relative flex flex-col justify-center items-center p-12 lg:p-20 transition-all hover:bg-[rgba(59,130,246,0.02)] cursor-pointer">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{background:"radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)"}} />
          <div className="relative text-center max-w-[400px]">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl" style={{background:"linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))", border:"1px solid rgba(59,130,246,0.1)"}}>🏋️</div>
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">FitTracker</h2>
            <p className="text-[15px] text-[#7d8599] leading-relaxed mb-6">Coach fitness et suivi sportif complet. Programmes, plans nutritionnels, suivi de progression et objectifs.</p>
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center"><div className="text-xl font-extrabold text-[#3b82f6]">TDEE</div><div className="text-[10px] text-[#4a5168] uppercase tracking-widest mt-0.5">Calcul</div></div>
              <div className="w-px h-8 bg-white/[0.06]"/>
              <div className="text-center"><div className="text-xl font-extrabold text-[#3b82f6]">📈</div><div className="text-[10px] text-[#4a5168] uppercase tracking-widest mt-0.5">Suivi</div></div>
              <div className="w-px h-8 bg-white/[0.06]"/>
              <div className="text-center"><div className="text-xl font-extrabold text-[#3b82f6]">🎯</div><div className="text-[10px] text-[#4a5168] uppercase tracking-widest mt-0.5">Objectifs</div></div>
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all group-hover:gap-3" style={{background:"linear-gradient(135deg, #3b82f6, #2563eb)"}}>
              Acceder au dashboard <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </Link>
      </div>

      <div className="text-center py-5 border-t border-white/[0.04]">
        <p className="text-[11px] text-[#4a5168]">Comparateur independant &middot; Non affilie aux marques &middot; Donnees publiques</p>
      </div>
    </div>
  );
}
