"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ScoreRing, { scoreColor } from "@/components/ScoreRing";
import { getProduct, getReviews } from "@/lib/api";

export default function ProductPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [reviews, setReviews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getProduct(Number(id)),
      getReviews(Number(id)).catch(() => null),
    ]).then(([prod, rev]) => {
      setData(prod); setReviews(rev); setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-[#64748b]">Chargement...</div>;
  if (error || !data) return <div className="p-10 text-[#f87171]">Erreur: {error} <Link href="/catalogue" className="text-[#3b82f6]">Retour</Link></div>;

  const p = data.product;
  const sd = data.score_details;
  const pd = data.protein_details;
  const hd = data.health_details;
  const offers = data.offers || [];
  const amino = p.amino_profile;

  const stats = [
    {l:"Score Protéique",v:p.score_proteique,max:10},{l:"Score Santé",v:p.score_sante,max:10},
    {l:"Protéines/100g",v:p.proteines_100g,max:100,u:"g"},{l:"BCAA/100g prot",v:p.bcaa_per_100g_prot,max:30,u:"g"},
    {l:"Leucine",v:p.leucine_g,max:15,u:"g"},{l:"Ingrédients",v:p.ingredient_count,max:25},
    {l:"Kcal/100g",v:p.kcal_per_100g,max:500,u:"kcal"},
  ];

  return (
    <div className="pb-10 animate-in">
      <Link href="/catalogue" className="text-[#64748b] text-[13px] no-underline hover:text-[#e2e8f0] mb-4 inline-block">← Retour au catalogue</Link>
      <div className="grid grid-cols-[2fr_1fr] gap-5">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-xs text-[#64748b] uppercase tracking-widest mb-1">{p.brand}</div>
              <h1 className="text-[22px] font-bold text-[#f0f2f5] m-0 mb-2.5">{p.name}</h1>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[rgba(96,165,250,0.12)] text-[#60a5fa] uppercase">{p.type_whey}</span>
                {p.origin_label==="France"&&<span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[rgba(96,165,250,0.1)] text-[#60a5fa]">France</span>}
                {!p.has_sucralose&&!p.has_acesulfame_k&&!p.has_aspartame?<span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[rgba(52,211,153,0.08)] text-[#34d399]">Sans édulcorant</span>:<span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[rgba(248,113,113,0.08)] text-[#f87171]">Édulcorants</span>}
                {p.has_aminogram&&<span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[rgba(250,204,21,0.08)] text-[#facc15]">Aminogramme</span>}
                {sd?.is_top_qualite&&<span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[rgba(250,204,21,0.15)] text-[#facc15]">Top Qualité</span>}
              </div>
            </div>
            <div className="text-center"><ScoreRing score={p.score_final} size={80} sw={5}/><div className="text-[11px] text-[#64748b] mt-1">Score final</div></div>
          </div>
          <div className="flex flex-col gap-3">
            {stats.map(({l,v,max,u})=>(
              <div key={l}><div className="flex justify-between mb-1"><span className="text-xs text-[#94a3b8]">{l}</span><span className="text-xs font-bold text-[#e2e8f0]">{v!=null?v:"—"}{u?" "+u:""}</span></div>
              <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:v!=null?Math.min(Number(v)/max*100,100)+"%":"0%",background:scoreColor(v!=null?Number(v)/max*10:0)}}/></div></div>
            ))}
          </div>

          {/* Aminogramme */}
          {amino && typeof amino === "object" && Object.keys(amino).length > 0 && (
            <div className="mt-6 p-4 bg-[rgba(0,0,0,0.2)] rounded-xl">
              <h3 className="text-sm font-bold text-[#f0f2f5] mb-3">Aminogramme ({p.amino_base})</h3>
              <div className="grid grid-cols-3 gap-2">{Object.entries(amino).sort(([,a],[,b])=>Number(b)-Number(a)).map(([k,v])=>(
                <div key={k} className="flex justify-between text-xs"><span className="text-[#94a3b8] capitalize">{k.replace(/_/g," ")}</span><span className="font-bold text-[#e2e8f0]">{Number(v).toFixed(1)}g</span></div>
              ))}</div>
            </div>
          )}

          {/* Score breakdown */}
          {sd && (
            <div className="mt-6 p-4 bg-[rgba(0,0,0,0.2)] rounded-xl">
              <h3 className="text-sm font-bold text-[#f0f2f5] mb-3">Détail du score</h3>
              <div className="text-xs text-[#94a3b8] space-y-1">
                {sd.premium_reasons?.map((r:string,i:number)=><div key={i} className="text-[#22c55e]">+ {r}</div>)}
                {sd.transparency_reasons?.map((r:string,i:number)=><div key={i} className="text-[#f59e0b]">- {r}</div>)}
                {hd?.details_sante?.map((r:string,i:number)=><div key={i} className="text-[#f87171]">- {r}</div>)}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          {/* Offres */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-[14px] p-5">
            <div className="text-[11px] text-[#64748b] uppercase font-semibold mb-2">Offres ({offers.length})</div>
            {offers.length===0?<div className="text-xs text-[#64748b]">Aucune offre active</div>:
            offers.slice(0,5).map((o:any,i:number)=>(
              <div key={i} className="p-3 bg-[rgba(0,0,0,0.2)] rounded-lg mb-2">
                <div className="flex justify-between items-center">
                  <div><div className="text-sm font-bold text-[#f0f2f5]">{o.prix?o.prix.toFixed(2)+" €":"Prix inconnu"}</div>
                  {o.prix_par_kg&&<div className="text-[11px] text-[#64748b]">{o.prix_par_kg.toFixed(2)} €/kg{o.poids_kg?" · "+o.poids_kg+"kg":""}</div>}
                  <div className="text-[10px] text-[#64748b]">{o.merchant||"Marchand inconnu"}</div></div>
                  <span className={"text-[10px] font-semibold px-2 py-0.5 rounded-md "+(o.disponibilite==="InStock"?"bg-[rgba(52,211,153,0.08)] text-[#34d399]":"bg-[rgba(248,113,113,0.08)] text-[#f87171]")}>{o.disponibilite==="InStock"?"En stock":o.disponibilite||"?"}</span>
                </div>
                {o.url&&<a href={o.url} target="_blank" rel="noopener" className="text-[11px] text-[#60a5fa] no-underline hover:underline mt-1 block">Voir l offre →</a>}
              </div>
            ))}
          </div>
          <Link href={} className="block text-center py-2.5 bg-[#3b82f6] rounded-xl text-white text-[13px] font-bold no-underline">Comparer ce produit</Link>
        </div>
      </div>
    </div>
  );
}