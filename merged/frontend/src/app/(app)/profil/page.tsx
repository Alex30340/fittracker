"use client";
import { useState } from "react";
import { calcTDEE } from "@/lib/api";

export default function ProfilPage() {
  const [p, setP] = useState({age:28,weight:77,height:178,sex:"M",level:1.55,goal:"bulk"});
  const [result, setResult] = useState<any>(null);
  const calc = () => calcTDEE({age:p.age,weight_kg:p.weight,height_cm:p.height,sex:p.sex,activity_level:p.level,goal:p.goal}).then(setResult).catch(() => {});

  return (
    <div className="pb-10 animate-in">
      <h1 className="text-2xl font-bold text-[#f0f2f5] m-0 mb-1">Profil</h1>
      <p className="text-[13px] text-[#64748b] m-0 mb-6">Calcul personnalisé via l API</p>
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] p-6">
          <h3 className="text-[15px] font-bold text-[#f0f2f5] m-0 mb-4">Informations</h3>
          {[{l:"Âge",k:"age"},{l:"Poids (kg)",k:"weight"},{l:"Taille (cm)",k:"height"}].map(({l,k})=>(
            <div key={k} className="mb-3.5"><label className="text-xs text-[#94a3b8] block mb-1">{l}</label>
            <input type="number" value={(p as any)[k]} onChange={e=>setP({...p,[k]:Number(e.target.value)})} className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#e2e8f0] text-sm outline-none"/></div>
          ))}
          <div className="mb-3.5"><label className="text-xs text-[#94a3b8] block mb-1">Sexe</label><div className="flex gap-2">{["M","F"].map(s=>(
            <button key={s} onClick={()=>setP({...p,sex:s})} className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer ${p.sex===s?"bg-[#3b82f6] text-white border-none":"bg-transparent text-[#94a3b8]"}`} style={p.sex!==s?{border:"1px solid #334155"}:{}}>{s==="M"?"Homme":"Femme"}</button>
          ))}</div></div>
          <div className="mb-3.5"><label className="text-xs text-[#94a3b8] block mb-1">Activité</label><select value={p.level} onChange={e=>setP({...p,level:Number(e.target.value)})} className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-white/[0.08] rounded-lg text-[#e2e8f0] text-[13px]">
            <option value={1.2}>Sédentaire</option><option value={1.375}>Léger (1-2j/sem)</option><option value={1.55}>Modéré (3-4j/sem)</option><option value={1.725}>Actif (5-6j/sem)</option><option value={1.9}>Très actif</option>
          </select></div>
          <div className="mb-4"><label className="text-xs text-[#94a3b8] block mb-1">Objectif</label><div className="flex gap-2">{[{k:"bulk",l:"Masse"},{k:"cut",l:"Sèche"},{k:"maintain",l:"Maintien"}].map(({k,l})=>(
            <button key={k} onClick={()=>setP({...p,goal:k})} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold cursor-pointer ${p.goal===k?"bg-[#3b82f6] text-white border-none":"text-[#94a3b8]"}`} style={p.goal!==k?{border:"1px solid #334155"}:{}}>{l}</button>
          ))}</div></div>
          <button onClick={calc} className="w-full py-3 bg-[#3b82f6] border-none rounded-xl text-white text-sm font-bold cursor-pointer">Calculer mes besoins</button>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] p-6">
          <h3 className="text-[15px] font-bold text-[#f0f2f5] m-0 mb-4">Résultats</h3>
          {result ? (<div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">{[{l:"BMR",v:result.bmr+" kcal",c:"#94a3b8"},{l:"TDEE",v:result.tdee+" kcal",c:"#3b82f6"},{l:"Objectif",v:result.target_calories+" kcal",c:"#22c55e"},{l:"Protéines",v:result.macros.protein_g+"g",c:"#f59e0b"}].map(({l,v,c})=>(
              <div key={l} className="p-3 bg-[rgba(0,0,0,0.2)] rounded-lg text-center"><div className="text-[10px] text-[#64748b]">{l}</div><div className="text-lg font-extrabold" style={{color:c}}>{v}</div></div>
            ))}</div>
            <div className="text-xs text-[#64748b] p-3 bg-[rgba(0,0,0,0.15)] rounded-lg">Protéines: {result.macros.protein_g}g ({result.ratios.protein_pct}%) · Glucides: {result.macros.carbs_g}g ({result.ratios.carbs_pct}%) · Lipides: {result.macros.fat_g}g ({result.ratios.fat_pct}%)</div>
          </div>) : <div className="text-sm text-[#64748b] text-center py-10">Remplis ton profil et clique sur Calculer</div>}
        </div>
      </div>
    </div>
  );
}