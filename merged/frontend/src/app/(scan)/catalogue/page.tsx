"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GradeBadge, scoreToGrade, gradeColor, ScoreBar } from "@/components/ScoreRing";
import { getProducts, getRanking } from "@/lib/api";

const TYPES: Record<string,string> = { native:"Native", isolate:"Isolate", hydrolysate:"Hydrolysate", concentrate:"Concentrate", unknown:"Whey" };

export default function CataloguePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [cleanOnly, setCleanOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getProducts({ search: search||undefined, type_whey: typeFilter||undefined, sort_by: sortBy, clean_only: cleanOnly||undefined, limit: 100 });
      setProducts(d.products); setTotal(d.total);
    } catch {}
    setLoading(false);
  }, [search, typeFilter, sortBy, cleanOnly]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="anim-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Classement Whey Proteines</h1>
        <p className="text-[14px] text-[#7d8599]">{total} produits analyses et notes par notre algorithme independant.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5168]" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une marque ou un produit..."
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text)] text-[13px] outline-none focus:border-[#22c55e]/30 transition-colors placeholder:text-[#4a5168]" />
        </div>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text)] text-[13px] cursor-pointer">
          <option value="">Tous types</option>
          <option value="native">Native</option><option value="isolate">Isolate</option><option value="hydrolysate">Hydrolysate</option><option value="concentrate">Concentrate</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text)] text-[13px] cursor-pointer">
          <option value="score">Score</option><option value="protein">Proteines</option><option value="price">Prix/kg</option><option value="health">Sante</option>
        </select>
        <button onClick={()=>setCleanOnly(!cleanOnly)}
          className={`px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border transition-all ${
            cleanOnly ? "bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.15)] text-[#22c55e]" : "bg-[var(--bg-card)] border-[var(--border)] text-[#7d8599] hover:text-white"
          }`}>
          Sans edulcorant
        </button>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a5168] border-b border-[var(--border)]">
        <div className="w-8 text-center mr-3">#</div>
        <div className="w-[46px] mr-4">Grade</div>
        <div className="flex-1">Produit</div>
        <div className="w-20 text-center">Prot.</div>
        <div className="w-20 text-center">Sante</div>
        <div className="w-20 text-center">Prix/kg</div>
        <div className="w-20 text-center">Score</div>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="py-20 text-center text-[#4a5168]">Chargement...</div>
      ) : (
        <div className="stagger">
          {products.map((p: any, i: number) => {
            const grade = scoreToGrade(p.score_final);
            const gc = gradeColor(grade);
            const type = TYPES[p.type_whey] || "Whey";
            const isClean = !p.has_sucralose && !p.has_acesulfame_k && !p.has_aspartame;
            return (
              <Link key={p.id} href={`/produit/${p.id}`}
                className="flex items-center px-5 py-4 border-b border-[var(--border)] hover-row rounded-lg cursor-pointer group">
                {/* Rank */}
                <div className="w-8 text-center mr-3 text-[13px] font-bold text-[#4a5168]">{i+1}</div>

                {/* Grade */}
                <div className="mr-4">
                  <GradeBadge score={p.score_final} />
                </div>

                {/* Product info */}
                <div className="flex-1 flex items-center gap-3.5 min-w-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-12 h-12 rounded-xl object-contain bg-white/[0.02] border border-white/[0.04] flex-shrink-0"
                      onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.03] flex items-center justify-center text-xl text-white/[0.05] flex-shrink-0">🥛</div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-white truncate group-hover:text-[#22c55e] transition-colors">{p.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#7d8599]">{p.brand}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{background:`${gc}10`, color: gc}}>{type}</span>
                      {p.origin_label==="France" && <span className="text-[10px]">🇫🇷</span>}
                      {isClean && <span className="text-[10px] text-[#22c55e]">Clean</span>}
                      {p.has_aminogram && <span className="text-[10px] text-[#f59e0b]">Amino</span>}
                    </div>
                  </div>
                </div>

                {/* Prot */}
                <div className="w-20 text-center">
                  <div className="text-[14px] font-bold text-white">{p.proteines_100g || "?"}<span className="text-[10px] text-[#4a5168] font-normal">g</span></div>
                </div>

                {/* Sante */}
                <div className="w-20 text-center">
                  <div className="text-[14px] font-bold" style={{color: p.score_sante >= 8 ? "#22c55e" : p.score_sante >= 5 ? "#3b82f6" : "#f59e0b"}}>{p.score_sante?.toFixed(1) || "?"}</div>
                </div>

                {/* Prix/kg */}
                <div className="w-20 text-center">
                  <div className="text-[14px] font-bold text-white">{p.offer_prix_par_kg ? Math.round(p.offer_prix_par_kg)+"€" : "—"}</div>
                </div>

                {/* Score */}
                <div className="w-20 text-center">
                  <div className="text-[16px] font-extrabold" style={{color: gc}}>{p.score_final?.toFixed(1) || "?"}<span className="text-[10px] text-[#4a5168] font-normal">/10</span></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
