"use client";
import { useState, useEffect } from "react";
import { calcTDEE } from "@/lib/api";

export default function NutritionPage() {
  const [goal, setGoal] = useState("bulk");
  const [tdee, setTdee] = useState<any>(null);
  useEffect(() => {
    calcTDEE({ age:28, weight_kg:77, height_cm:178, sex:"M", activity_level:1.55, goal }).then(setTdee).catch(() => {});
  }, [goal]);
  return (
    <div className="pb-10 animate-in">
      <h1 className="text-2xl font-bold text-[#f0f2f5] m-0 mb-1">Nutrition</h1>
      <p className="text-[13px] text-[#64748b] m-0 mb-6">Calcul automatique basé sur la formule Mifflin-St Jeor</p>
      <div className="flex gap-2 mb-5">{[{k:"bulk",l:"Prise de masse"},{k:"cut",l:"Sèche"},{k:"maintain",l:"Maintien"}].map(({k,l})=>(
        <button key={k} onClick={()=>setGoal(k)} className={`px-5 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border-none ${goal===k?"bg-[#3b82f6] text-white":"bg-white/[0.03] text-[#94a3b8]"}`}>{l}</button>
      ))}</div>
      {tdee && <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center"><div className="text-[11px] text-[#64748b] mb-1">BMR</div><div className="text-xl font-extrabold text-[#94a3b8]">{tdee.bmr} kcal</div></div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center"><div className="text-[11px] text-[#64748b] mb-1">TDEE</div><div className="text-xl font-extrabold text-[#3b82f6]">{tdee.tdee} kcal</div></div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center"><div className="text-[11px] text-[#64748b] mb-1">Objectif</div><div className="text-xl font-extrabold text-[#22c55e]">{tdee.target_calories} kcal</div></div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center"><div className="text-[11px] text-[#64748b] mb-1">Ajustement</div><div className="text-xl font-extrabold" style={{color:goal==="bulk"?"#22c55e":goal==="cut"?"#f87171":"#94a3b8"}}>{goal==="bulk"?"+300":goal==="cut"?"-400":"0"} kcal</div></div>
      </div>}
      {tdee?.macros && <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-[15px] font-bold text-[#f0f2f5] mb-4">Répartition macros</h3>
        <div className="grid grid-cols-3 gap-4">{[{l:"Protéines",v:tdee.macros.protein_g,c:"#3b82f6",pct:tdee.ratios.protein_pct,note:"2g/kg pour synthèse protéique"},{l:"Glucides",v:tdee.macros.carbs_g,c:"#22c55e",pct:tdee.ratios.carbs_pct,note:"Énergie pour l entraînement"},{l:"Lipides",v:tdee.macros.fat_g,c:"#a855f7",pct:tdee.ratios.fat_pct,note:"1g/kg pour les hormones"}].map(({l,v,c,pct,note})=>(
          <div key={l} className="p-4 bg-[rgba(0,0,0,0.2)] rounded-xl text-center"><div className="text-xs text-[#64748b] mb-1">{l}</div><div className="text-2xl font-extrabold" style={{color:c}}>{v}g</div><div className="text-[11px] text-[#64748b] mt-1">{pct}%</div><div className="text-[10px] text-[#64748b] mt-2">{note}</div></div>
        ))}</div>
      </div>}
    </div>
  );
}