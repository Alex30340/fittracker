"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { calcTDEE, getCatalogStats } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [tdee, setTdee] = useState<any>(null);

  useEffect(() => {
    getCatalogStats().then(setStats).catch(() => {});
    calcTDEE({ age:28, weight_kg:77, height_cm:178, sex:"M", activity_level:1.55, goal:"bulk" }).then(setTdee).catch(() => {});
  }, []);

  return (
    <div className="pb-10 animate-in">
      <h1 className="text-2xl font-bold text-[#f0f2f5] m-0 mb-1">Tableau de bord</h1>
      <p className="text-[13px] text-[#64748b] m-0 mb-6">Vue d ensemble</p>

      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-[18px]">
          <div className="text-[11px] text-[#64748b] uppercase font-semibold mb-2">Produits analysés</div>
          <div className="text-[22px] font-extrabold text-[#3b82f6]">{stats?.total_products || "..."}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-[18px]">
          <div className="text-[11px] text-[#64748b] uppercase font-semibold mb-2">Offres suivies</div>
          <div className="text-[22px] font-extrabold text-[#22c55e]">{stats?.total_active_offers || "..."}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-[18px]">
          <div className="text-[11px] text-[#64748b] uppercase font-semibold mb-2">TDEE calculé</div>
          <div className="text-[22px] font-extrabold text-[#f59e0b]">{tdee?.tdee || "..."} kcal</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-[18px]">
          <div className="text-[11px] text-[#64748b] uppercase font-semibold mb-2">Objectif calorique</div>
          <div className="text-[22px] font-extrabold text-[#a855f7]">{tdee?.target_calories || "..."} kcal</div>
        </div>
      </div>

      {tdee?.macros && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-6">
          <h3 className="text-[15px] font-bold text-[#f0f2f5] mb-4">Macros recommandées (calculées par API)</h3>
          <div className="grid grid-cols-3 gap-4">
            {[{l:"Protéines",v:tdee.macros.protein_g,u:"g",c:"#3b82f6",pct:tdee.ratios?.protein_pct},
              {l:"Glucides",v:tdee.macros.carbs_g,u:"g",c:"#22c55e",pct:tdee.ratios?.carbs_pct},
              {l:"Lipides",v:tdee.macros.fat_g,u:"g",c:"#a855f7",pct:tdee.ratios?.fat_pct}].map(({l,v,u,c,pct}) => (
              <div key={l} className="text-center p-4 bg-[rgba(0,0,0,0.2)] rounded-xl">
                <div className="text-xs text-[#64748b] mb-1">{l}</div>
                <div className="text-2xl font-extrabold" style={{color:c}}>{v}{u}</div>
                <div className="text-[11px] text-[#64748b] mt-1">{pct}% des calories</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3.5">
        <Link href="/catalogue" className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 no-underline hover:border-white/[0.12]">
          <h3 className="text-[15px] font-bold text-[#f0f2f5] mb-2">Explorer le catalogue</h3>
          <p className="text-xs text-[#94a3b8] m-0">Parcourir les {stats?.total_products || 80}+ whey analysées</p>
        </Link>
        <Link href="/coach" className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 no-underline hover:border-white/[0.12]">
          <h3 className="text-[15px] font-bold text-[#f0f2f5] mb-2">Programmes d entraînement</h3>
          <p className="text-xs text-[#94a3b8] m-0">6 programmes adaptés à ton niveau</p>
        </Link>
      </div>
    </div>
  );
}