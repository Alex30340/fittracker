"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ScoreRing, { scoreColor } from "@/components/ScoreRing";
import { getProducts, getRanking } from "@/lib/api";

const TL: Record<string,{bg:string,color:string,label:string}> = {
  native:{bg:"rgba(52,211,153,0.12)",color:"#34d399",label:"Native"},
  isolate:{bg:"rgba(96,165,250,0.12)",color:"#60a5fa",label:"Isolate"},
  hydrolysate:{bg:"rgba(167,139,250,0.12)",color:"#a78bfa",label:"Hydrolysate"},
  concentrate:{bg:"rgba(148,163,184,0.12)",color:"#94a3b8",label:"Concentrate"},
  unknown:{bg:"rgba(148,163,184,0.08)",color:"#64748b",label:"Whey"},
};

export default function CataloguePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [cleanOnly, setCleanOnly] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [view, setView] = useState<"catalogue"|"ranking">("catalogue");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (view === "ranking") {
        const d = await getRanking({ type_whey: typeFilter||undefined, clean_only: cleanOnly||undefined, limit: 50 });
        setProducts(d.ranking); setTotal(d.total);
      } else {
        const d = await getProducts({ search: search||undefined, type_whey: typeFilter||undefined, sort_by: sortBy, clean_only: cleanOnly||undefined, limit: 100 });
        setProducts(d.products); setTotal(d.total);
      }
    } catch (e: any) { setError(e.message || "Erreur API"); }
    setLoading(false);
  }, [search, typeFilter, sortBy, cleanOnly, view]);

  useEffect(() => { load(); }, [load]);

  const toggleC = (id: number) => setCompareList(p => p.includes(id) ? p.filter(x=>x!==id) : p.length<5 ? [...p,id] : p);

  return (
    <div className="pb-10 animate-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f2f5] m-0">{view==="ranking"?"Classement Whey":"Catalogue Whey"}</h1>
          <p className="text-[13px] text-[#64748b] m-0">{total} produits analysés</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setView("catalogue")} className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border-none ${view==="catalogue"?"bg-[#3b82f6] text-white":"bg-white/[0.03] text-[#94a3b8]"}`}>Catalogue</button>
          <button onClick={()=>setView("ranking")} className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border-none ${view==="ranking"?"bg-[#3b82f6] text-white":"bg-white/[0.03] text-[#94a3b8]"}`}>Classement</button>
        </div>
      </div>
      <div className="flex gap-2.5 flex-wrap mb-5">
        {view==="catalogue"&&<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." className="flex-1 min-w-[200px] px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[#e2e8f0] text-[13px] outline-none"/>}
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="px-3.5 py-2.5 bg-[#0d1117] border border-white/[0.08] rounded-xl text-[#e2e8f0] text-[13px]">
          <option value="">Tous types</option><option value="native">Native</option><option value="isolate">Isolate</option><option value="hydrolysate">Hydrolysate</option>
        </select>
        {view==="catalogue"&&<select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="px-3.5 py-2.5 bg-[#0d1117] border border-white/[0.08] rounded-xl text-[#e2e8f0] text-[13px]">
          <option value="score">Score</option><option value="protein">Protéines</option><option value="price">Prix/kg</option><option value="health">Santé</option>
        </select>}
        <label className={`flex items-center gap-1.5 cursor-pointer px-3.5 py-2.5 rounded-xl border ${cleanOnly?"bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.3)]":"bg-white/[0.03] border-white/[0.08]"}`}>
          <input type="checkbox" checked={cleanOnly} onChange={e=>setCleanOnly(e.target.checked)} className="accent-[#22c55e]"/>
          <span className={`text-[13px] font-semibold ${cleanOnly?"text-[#34d399]":"text-[#94a3b8]"}`}>Clean</span>
        </label>
      </div>
      {compareList.length>0&&<div className="flex items-center justify-between px-4 py-3 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded-xl mb-4">
        <span className="text-[13px] text-[#60a5fa] font-semibold">{compareList.length} sélectionné{compareList.length>1?"s":""}</span>
        <div className="flex gap-2"><button onClick={()=>setCompareList([])} className="px-3 py-1.5 bg-transparent border border-white/[0.1] rounded-lg text-[#94a3b8] text-xs font-semibold cursor-pointer">Vider</button>
        <Link href={`/comparateur?ids=${compareList.join(",")}`} className="px-3 py-1.5 bg-[#3b82f6] rounded-lg text-white text-xs font-bold no-underline">Comparer</Link></div>
      </div>}
      {error&&<div className="p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl mb-4 text-[#f87171] text-sm">{error}</div>}
      {loading?<div className="text-center py-20 text-[#64748b]">Chargement des produits depuis l API...</div>:
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {products.map((p:any,i:number)=>{const b=TL[p.type_whey]||TL.unknown;const ic=compareList.includes(p.id);const rk=p.rank||i+1;return(
          <div key={p.id} className="relative bg-[#0d1117] border border-white/[0.06] rounded-[14px] p-4 hover:border-white/[0.12] transition-all">
            {view==="ranking"&&rk<=3&&<div className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white" style={{background:rk===1?"#f59e0b":rk===2?"#94a3b8":"#cd7f32"}}>{rk}</div>}
            {view==="ranking"&&rk>3&&<div className="absolute top-3 left-3 text-[11px] font-bold text-[#64748b]">#{rk}</div>}
            <button onClick={()=>toggleC(p.id)} className="absolute top-3 right-3 w-[22px] h-[22px] rounded-md flex items-center justify-center" style={{border:`2px solid ${ic?"#3b82f6":"#334155"}`,background:ic?"#3b82f6":"transparent"}}>{ic&&<span className="text-white text-[13px] font-bold">✓</span>}</button>
            <Link href={`/produit/${p.id}`} className="no-underline">
              <div className="flex items-center gap-3 mb-3"><ScoreRing score={p.score_final} size={48} sw={3}/><div className="flex-1 min-w-0"><div className="text-[11px] text-[#64748b] uppercase tracking-wider">{p.brand}</div><div className="text-[14px] text-[#f0f2f5] font-semibold truncate">{p.name}</div></div></div>
              <div className="flex gap-1.5 mb-2.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase" style={{background:b.bg,color:b.color}}>{b.label}</span>
                {p.origin_label==="France"&&<span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(96,165,250,0.1)] text-[#60a5fa]">France</span>}
                {!p.has_sucralose&&!p.has_acesulfame_k&&<span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(52,211,153,0.08)] text-[#34d399]">Clean</span>}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-black/20 rounded-lg py-1.5 px-2 text-center"><div className="text-[10px] text-[#64748b]">Prot</div><div className="text-xs font-bold text-[#e2e8f0]">{p.proteines_100g||"?"}g</div></div>
                <div className="bg-black/20 rounded-lg py-1.5 px-2 text-center"><div className="text-[10px] text-[#64748b]">BCAA</div><div className="text-xs font-bold text-[#e2e8f0]">{p.bcaa_per_100g_prot?Number(p.bcaa_per_100g_prot).toFixed(1):"?"}</div></div>
                <div className="bg-black/20 rounded-lg py-1.5 px-2 text-center"><div className="text-[10px] text-[#64748b]">€/kg</div><div className="text-xs font-bold text-[#e2e8f0]">{p.offer_prix_par_kg?Number(p.offer_prix_par_kg).toFixed(0)+"€":"?"}</div></div>
              </div>
            </Link>
          </div>
        );})}
      </div>}
    </div>
  );
}
