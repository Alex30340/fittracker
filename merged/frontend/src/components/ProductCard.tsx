"use client";
import Link from "next/link";
import ScoreRing from "./ScoreRing";
import { typeStyles } from "@/lib/data";

interface Props {
  product: any;
  isCompared?: boolean;
  onToggleCompare?: (id: number) => void;
}

export default function ProductCard({ product: p, isCompared = false, onToggleCompare }: Props) {
  const badge = typeStyles[p.type || p.type_whey] || typeStyles.concentrate;
  const priceKg = p.price && p.weight ? (p.price / p.weight).toFixed(0) :
    p.offer_prix_par_kg ? p.offer_prix_par_kg.toFixed(0) : "—";
  const prot = p.prot || p.proteines_100g || 0;
  const bcaa = p.bcaa || p.bcaa_per_100g_prot;
  const score = p.score || p.score_final;
  const sucr = p.sucr ?? p.has_sucralose ?? false;
  const ace = p.ace ?? p.has_acesulfame_k ?? false;
  const origin = p.origin || p.origin_label || "";

  return (
    <div className="relative bg-[#0d1117] border border-white/[0.06] rounded-[14px] p-4 cursor-pointer transition-all hover:border-white/[0.12] hover:-translate-y-0.5">
      {/* Compare toggle */}
      {onToggleCompare && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(p.id); }}
          className="absolute top-3 right-3 w-[22px] h-[22px] rounded-md flex items-center justify-center transition-colors"
          style={{
            border: `2px solid ${isCompared ? "#3b82f6" : "#334155"}`,
            background: isCompared ? "#3b82f6" : "transparent",
          }}>
          {isCompared && <span className="text-white text-[13px] font-bold">✓</span>}
        </button>
      )}

      <Link href={`/produit/${p.id}`} className="no-underline">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <ScoreRing score={score} size={48} sw={3} />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[#64748b] font-medium uppercase tracking-wider">{p.brand}</div>
            <div className="text-[14px] text-[#f0f2f5] font-semibold truncate">{p.name}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
            style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
          {origin === "France" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(96,165,250,0.1)] text-[#60a5fa]">🇫🇷 France</span>
          )}
          {!sucr && !ace && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(52,211,153,0.08)] text-[#34d399]">Clean</span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { l: "Prot", v: `${prot}g` },
            { l: "BCAA", v: bcaa ? `${Number(bcaa).toFixed(1)}` : "—" },
            { l: "€/kg", v: `${priceKg}€` },
          ].map(({ l, v }) => (
            <div key={l} className="bg-black/20 rounded-lg py-1.5 px-2 text-center">
              <div className="text-[10px] text-[#64748b]">{l}</div>
              <div className="text-[12px] font-bold text-[#e2e8f0]">{v}</div>
            </div>
          ))}
        </div>
      </Link>
    </div>
  );
}
