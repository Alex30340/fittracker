"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ScoreRing, { scoreColor } from "@/components/ScoreRing";
import { compareProducts, getCompareSuggestions } from "@/lib/api";

export default function ComparateurPage() {
  const sp = useSearchParams();
  const initIds = (sp.get("ids")||"").split(",").filter(Boolean).map(Number);
  const [ids, setIds] = useState<number[]>(initIds);
  const [products, setProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const colors = ["#3b82f6","#f59e0b","#22c55e","#a855f7","#ef4444"];

  useEffect(() => {
    if (ids.length === 0) {
      getCompareSuggestions().then(d => setSuggestions(d.suggestions)).catch(() => {});
      return;
    }
    setLoading(true);
    compareProducts(ids).then(d => { setProducts(d.products); setLoading(false); }).catch(() => setLoading(false));
  }, [ids]);

  if (ids.length === 0) return (
    <div className="pb-10 animate-in">
      <h1 className="text-2xl font-bold text-[#f0f2f5] m-0 mb-1">Comparateur</h1>
      <p className="text-[13px] text-[#64748b] m-0 mb-7">Sélectionnez des produits ou essayez une suggestion :</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {suggestions.map((s:any,i:number) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-center">
            <h3 className="text-[15px] font-bold text-[#f0f2f5] m-0 mb-1.5">{s.title}</h3>
            <p className="text-xs text-[#64748b] m-0 mb-3">{s.desc || s.description}</p>
            <button onClick={() => setIds(s.product_ids)} className="px-5 py-2 bg-[#3b82f6] border-none rounded-lg text-white text-xs font-bold cursor-pointer">Comparer</button>
          </div>
        ))}
      </div>
      <Link href="/catalogue" className="inline-block mt-5 text-[#60a5fa] text-sm no-underline">← Aller au catalogue</Link>
    </div>
  );

  if (loading) return <div className="text-center py-20 text-[#64748b]">Chargement...</div>;

  const rows = [
    {l:"Score Final",k:"score_final",f:(v:any)=>v?.toFixed(1)+"/10"},
    {l:"Protéines/100g",k:"proteines_100g",f:(v:any)=>v+"g"},
    {l:"Score Protéique",k:"score_proteique",f:(v:any)=>v?.toFixed(1)},
    {l:"Score Santé",k:"score_sante",f:(v:any)=>v?.toFixed(1)},
    {l:"BCAA",k:"bcaa_per_100g_prot",f:(v:any)=>v?Number(v).toFixed(1)+"g":"—"},
    {l:"Leucine",k:"leucine_g",f:(v:any)=>v?Number(v).toFixed(1)+"g":"—"},
    {l:"Prix/kg",k:"offer_prix_par_kg",f:(v:any)=>v?Number(v).toFixed(0)+"€":"—"},
    {l:"Type",k:"type_whey",f:(v:any)=>v||"?"},
    {l:"Origine",k:"origin_label",f:(v:any)=>v||"?"},
  ];

  return (
    <div className="pb-10 animate-in">
      <div className="flex justify-between items-center mb-5">
        <div><h1 className="text-2xl font-bold text-[#f0f2f5] m-0">Comparateur</h1><p className="text-[13px] text-[#64748b] m-0">{products.length} produits</p></div>
        <button onClick={() => {setIds([]);setProducts([]);}} className="px-4 py-2 bg-[rgba(127,29,29,0.12)] border border-[rgba(127,29,29,0.3)] rounded-lg text-[#f87171] text-xs font-semibold cursor-pointer">Vider</button>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr className="border-b border-white/[0.08]">
            <th className="text-left px-4 py-3 text-[#64748b] font-semibold">Critère</th>
            {products.map((p:any,i:number)=><th key={p.id} className="text-center px-3 py-3 font-bold" style={{color:colors[i%5]}}>{p.brand}<br/><span className="font-normal text-[11px] text-[#94a3b8]">{(p.name||"").substring(0,25)}</span></th>)}
          </tr></thead>
          <tbody>{rows.map(({l,k,f})=>{
            const vals=products.map((p:any)=>p[k]).filter((v:any)=>v!=null&&typeof v==="number") as number[];
            const best=vals.length?Math.max(...vals):null;
            const bestLow=k==="offer_prix_par_kg"&&vals.length?Math.min(...vals):null;
            return(<tr key={l} className="border-b border-white/[0.04]">
              <td className="px-4 py-2.5 text-[#94a3b8] font-medium">{l}</td>
              {products.map((p:any,i:number)=>{
                const v=p[k];const isB=k==="offer_prix_par_kg"?v===bestLow:typeof v==="number"&&v===best&&vals.length>1;
                return<td key={p.id} className="text-center px-3 py-2.5" style={{color:isB?"#22c55e":"#e2e8f0",fontWeight:isB?700:400}}>{f(v)}</td>;
              })}
            </tr>);
          })}</tbody>
        </table>
      </div>
    </div>
  );
}