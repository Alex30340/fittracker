"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GradeBadge, scoreToGrade, gradeColor, scoreColor, ScoreBar } from "@/components/ScoreRing";
import { getProduct, getReviews } from "@/lib/api";

export default function ProductPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getProduct(Number(id)), getReviews(Number(id)).catch(() => null)])
      .then(([prod]) => { setData(prod); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="py-24 text-center text-[#4a5168]">Chargement du rapport...</div>;
  if (error || !data) return <div className="py-12 text-[#ef4444]">Erreur: {error} <Link href="/catalogue" className="text-[#3b82f6] ml-2">← Retour</Link></div>;

  const p = data.product;
  const sd = data.score_details;
  const hd = data.health_details;
  const offers = data.offers || [];
  const amino = p.amino_profile;
  const bestOffer = offers.find((o: any) => o.prix) || offers[0];
  const grade = scoreToGrade(p.score_final);
  const gc = gradeColor(grade);
  const isClean = !p.has_sucralose && !p.has_acesulfame_k && !p.has_aspartame;

  return (
    <div className="anim-up">
      {/* Back */}
      <Link href="/catalogue" className="inline-flex items-center gap-1.5 text-[13px] text-[#7d8599] hover:text-white transition-colors mb-6">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Retour au classement
      </Link>

      {/* Hero */}
      <div className="flex gap-8 items-start mb-8 p-8 rounded-2xl border border-[var(--border)]" style={{background:"var(--bg-card)"}}>
        {/* Image */}
        <div className="flex-shrink-0">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="w-32 h-32 rounded-2xl object-contain bg-white/[0.02] border border-white/[0.04] p-2"
              onError={(e)=>{(e.target as HTMLImageElement).parentElement!.innerHTML='<div class="w-32 h-32 rounded-2xl bg-white/[0.02] flex items-center justify-center text-4xl text-white/[0.06]">🥛</div>'}} />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-4xl text-white/[0.06]">🥛</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#4a5168] mb-1">{p.brand}</div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-3">{p.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <Tag color={gc}>{(p.type_whey||"whey").toUpperCase()}</Tag>
            {p.origin_label==="France" && <Tag color="#3b82f6">🇫🇷 France</Tag>}
            {isClean ? <Tag color="#22c55e">Sans edulcorant</Tag> : <Tag color="#ef4444">Edulcorants</Tag>}
            {p.has_aminogram && <Tag color="#f59e0b">Aminogramme complet</Tag>}
            {sd?.is_top_qualite && <Tag color="#f59e0b">Top Qualite</Tag>}
          </div>
          {bestOffer && (
            <div className="flex items-center gap-4">
              {bestOffer.prix && (
                <span className="text-2xl font-extrabold text-white">{bestOffer.prix.toFixed(2)} €
                  {bestOffer.prix_par_kg && <span className="text-[13px] text-[#4a5168] font-normal ml-2">{bestOffer.prix_par_kg.toFixed(0)} €/kg</span>}
                </span>
              )}
              {bestOffer.url && (
                <a href={bestOffer.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white hover:-translate-y-0.5 transition-all"
                  style={{background:"linear-gradient(135deg,#22c55e,#16a34a)"}}>
                  Acheter sur {bestOffer.merchant || "le site"} →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Grade */}
        <div className="flex-shrink-0 text-center">
          <GradeBadge score={p.score_final} size="lg" />
          <div className="text-[24px] font-extrabold mt-2" style={{color: gc}}>{p.score_final?.toFixed(1) || "?"}</div>
          <div className="text-[11px] text-[#4a5168]">sur 10</div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left */}
        <div className="flex flex-col gap-6">
          {/* Score report */}
          <Card title="Rapport de score">
            <div className="space-y-4">
              {[
                {label:"Score Proteique", value:p.score_proteique, max:10, desc:"Teneur, BCAA, leucine, aminogramme"},
                {label:"Score Sante", value:p.score_sante, max:10, desc:"Edulcorants, additifs, ingredients"},
                {label:"Proteines / 100g", value:p.proteines_100g, max:100, unit:"g", desc:"Teneur en proteine pure"},
                {label:"BCAA / 100g prot", value:p.bcaa_per_100g_prot, max:30, unit:"g"},
                {label:"Leucine", value:p.leucine_g, max:15, unit:"g"},
                {label:"Kcal / 100g", value:p.kcal_per_100g, max:500, unit:"kcal"},
              ].map(({label, value, max, unit, desc}) => (
                <div key={label}>
                  <div className="flex justify-between items-end mb-1.5">
                    <div>
                      <div className="text-[13px] font-semibold text-white">{label}</div>
                      {desc && <div className="text-[11px] text-[#4a5168]">{desc}</div>}
                    </div>
                    <div className="text-[15px] font-extrabold" style={{color: scoreColor(value != null ? (value/max)*10 : 0)}}>
                      {value != null ? value : "—"}{value != null && unit ? " "+unit : ""}
                    </div>
                  </div>
                  <ScoreBar value={value} max={max} />
                </div>
              ))}
            </div>
          </Card>

          {/* Aminogramme */}
          {amino && typeof amino === "object" && Object.keys(amino).length > 0 && (
            <Card title={`Aminogramme (${p.amino_base || "g/100g proteine"})`}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(amino).sort(([,a],[,b])=>Number(b)-Number(a)).map(([k,v]) => (
                  <div key={k} className="flex justify-between items-center py-1 border-b border-white/[0.03]">
                    <span className="text-[12px] text-[#7d8599] capitalize">{k.replace(/_/g," ")}</span>
                    <span className="text-[13px] font-bold text-white">{Number(v).toFixed(2)}g</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Score details */}
          {sd && (sd.premium_reasons?.length > 0 || sd.transparency_reasons?.length > 0) && (
            <Card title="Detail du scoring">
              <div className="space-y-1.5">
                {sd.premium_reasons?.map((r:string,i:number) => <div key={i} className="text-[12px] text-[#22c55e] flex gap-2"><span className="font-bold">+</span>{r}</div>)}
                {sd.transparency_reasons?.map((r:string,i:number) => <div key={i} className="text-[12px] text-[#f59e0b] flex gap-2"><span className="font-bold">−</span>{r}</div>)}
                {hd?.details_sante?.map((r:string,i:number) => <div key={i} className="text-[12px] text-[#ef4444] flex gap-2"><span className="font-bold">−</span>{r}</div>)}
              </div>
            </Card>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-6">
          {/* Offers */}
          <Card title={`${offers.length} offre${offers.length>1?"s":""}`}>
            {offers.length === 0 ? (
              <p className="text-[13px] text-[#4a5168] py-4 text-center">Aucune offre active</p>
            ) : (
              <div className="space-y-2.5">
                {offers.slice(0,8).map((o:any, i:number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="text-[15px] font-extrabold text-white">{o.prix ? o.prix.toFixed(2)+" €" : "Prix ?"}</div>
                        {o.prix_par_kg && <div className="text-[11px] text-[#4a5168]">{o.prix_par_kg.toFixed(2)} €/kg{o.poids_kg ? " · "+o.poids_kg+"kg" : ""}</div>}
                      </div>
                      {o.disponibilite==="InStock" && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(34,197,94,0.06)] text-[#22c55e]">En stock</span>}
                    </div>
                    <div className="text-[11px] text-[#4a5168] mb-2">{o.merchant || "Marchand"}</div>
                    {o.url && (
                      <a href={o.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-2 rounded-lg text-[11px] font-semibold text-[#22c55e] border border-[rgba(34,197,94,0.1)] hover:bg-[rgba(34,197,94,0.04)] transition-colors">
                        Voir l&apos;offre →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Product specs */}
          <Card title="Specifications">
            <div className="space-y-2.5">
              {([
                ["Type", (p.type_whey||"?"), true],
                ["Origine", p.origin_label||"Inconnue"],
                ["Nb ingredients", p.ingredient_count||"?"],
                ["Sucralose", p.has_sucralose],
                ["Acesulfame-K", p.has_acesulfame_k],
                ["Aspartame", p.has_aspartame],
                ["Aminogramme", p.has_aminogram, false, true],
              ] as any[]).map(([label, value, capitalize, good]) => (
                <div key={label} className="flex justify-between items-center py-0.5">
                  <span className="text-[12px] text-[#7d8599]">{label}</span>
                  {typeof value === "boolean" ? (
                    good !== undefined ? (
                      <span className={`text-[12px] font-semibold ${value ? "text-[#f59e0b]" : "text-[#4a5168]"}`}>{value ? "Complet" : "Non"}</span>
                    ) : (
                      <span className={`text-[12px] font-semibold ${value ? "text-[#ef4444]" : "text-[#22c55e]"}`}>{value ? "Oui" : "Non"}</span>
                    )
                  ) : (
                    <span className={`text-[12px] font-semibold text-white ${capitalize ? "capitalize" : ""}`}>{value}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Link href={`/comparateur?id=${id}`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
            style={{background:"linear-gradient(135deg,#3b82f6,#2563eb)"}}>
            ⚖️ Comparer ce produit
          </Link>
        </div>
      </div>
    </div>
  );
}

function Card({title, children}: {title:string, children:React.ReactNode}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-6" style={{background:"var(--bg-card)"}}>
      <h3 className="text-[14px] font-extrabold text-white mb-5 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Tag({children, color}: {children:React.ReactNode, color:string}) {
  return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{background:`${color}10`, color}}>{children}</span>;
}
