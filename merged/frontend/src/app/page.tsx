"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { scoreColor } from "@/components/ScoreRing";
import { getTopProducts, getCatalogStats } from "@/lib/api";

export default function LandingPage() {
  const [top, setTop] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getTopProducts(5).then(d => setTop(d.products)).catch(() => {});
    getCatalogStats().then(d => setStats(d)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#060a10]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 h-14 bg-[rgba(6,10,16,0.9)] backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm text-white" style={{background:"linear-gradient(135deg,#3b82f6,#22c55e)"}}>F</div>
          <span className="text-base font-bold text-[#f0f2f5]">Fit<span className="text-[#3b82f6]">Tracker</span></span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/catalogue" className="text-[#8b95a5] text-[13px] no-underline hover:text-white">Catalogue</Link>
          <Link href="/comparateur" className="text-[#8b95a5] text-[13px] no-underline hover:text-white">Comparateur</Link>
          <Link href="/coach" className="text-[#8b95a5] text-[13px] no-underline hover:text-white">Coach</Link>
          <Link href="/dashboard" className="px-[18px] py-[7px] rounded-lg font-semibold text-[13px] text-white bg-[#3b82f6] no-underline">Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-8 max-w-[760px] mx-auto text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] mb-6">
          <span className="text-xs font-semibold text-[#60a5fa]">Comparateur indépendant + Suivi fitness complet</span>
        </div>
        <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold text-[#f0f2f5] leading-[1.12] mb-5 tracking-tighter">
          Ton fitness,<br/><span className="bg-gradient-to-r from-[#3b82f6] to-[#22c55e] bg-clip-text text-transparent">optimisé par la data</span>
        </h1>
        <p className="text-[17px] text-[#8b95a5] leading-relaxed max-w-[540px] mx-auto mb-9">
          Analyse indépendante de whey protéines, programmes personnalisés, suivi nutritionnel et progression — tout dans une seule app, alimentée par des données réelles.
        </p>
        <Link href="/catalogue" className="inline-block px-9 py-3.5 rounded-xl font-bold text-[15px] text-white no-underline"
          style={{background:"linear-gradient(135deg,#3b82f6,#2563eb)",boxShadow:"0 4px 20px rgba(59,130,246,0.3)"}}>
          Explorer le catalogue
        </Link>
      </section>

      {/* Stats from real API */}
      <div className="flex gap-10 justify-center flex-wrap px-8 pb-12">
        {[
          {n: stats?.total_products || "80+", l:"Produits analysés"},
          {n: stats?.total_active_offers || "100+", l:"Offres suivies"},
          {n:"38+", l:"Marques comparées"},
          {n:"100%", l:"Indépendant"},
        ].map(({n,l}) => (
          <div key={l} className="text-center">
            <div className="text-3xl font-extrabold text-[#f0f2f5]">{n}</div>
            <div className="text-xs text-[#64748b] mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <section className="max-w-[960px] mx-auto px-8 pb-16">
        <h2 className="text-xl font-bold text-[#f0f2f5] text-center mb-8">Chaque module, une expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Comparateur */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7">
            <div className="text-3xl mb-3">🧪</div>
            <h3 className="text-lg font-bold text-[#f0f2f5] mb-2">Comparateur de Whey</h3>
            <p className="text-[13px] text-[#94a3b8] leading-relaxed mb-4">
              Notre algorithme analyse chaque produit sur <strong className="text-[#f0f2f5]">3 axes</strong> : qualité protéique (teneur, BCAA, leucine, aminogramme),
              santé (édulcorants, additifs, ingrédients), et rapport qualité-prix. Chaque whey reçoit un score de 0 à 10.
            </p>
            <div className="text-xs text-[#64748b] leading-relaxed">
              <strong className="text-[#60a5fa]">Avantages whey :</strong> absorption rapide, profil aminé complet, stimulation synthèse protéique, récupération musculaire.<br/>
              <strong className="text-[#f87171]">Points de vigilance :</strong> édulcorants artificiels (sucralose, acésulfame-K), additifs inutiles, claims marketing non vérifiés.
            </div>
          </div>
          {/* Coach */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7">
            <div className="text-3xl mb-3">🏋️</div>
            <h3 className="text-lg font-bold text-[#f0f2f5] mb-2">Programmes d'entraînement</h3>
            <p className="text-[13px] text-[#94a3b8] leading-relaxed mb-4">
              Programmes structurés par niveau et objectif. Chaque exercice est documenté avec séries, reps, repos et notes techniques.
              Le calcul calorique par exercice utilise les <strong className="text-[#f0f2f5]">valeurs MET</strong> (Metabolic Equivalent of Task) validées scientifiquement.
            </p>
            <div className="text-xs text-[#64748b] leading-relaxed">
              <strong className="text-[#60a5fa]">Pourquoi le sport :</strong> augmente le métabolisme basal, renforce les os, améliore la sensibilité à l'insuline, réduit le risque cardiovasculaire, boost l'humeur.<br/>
              <strong className="text-[#22c55e]">Notre approche :</strong> progression linéaire, volume adapté au niveau, récupération intégrée.
            </div>
          </div>
          {/* Nutrition */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="text-lg font-bold text-[#f0f2f5] mb-2">Plans nutritionnels</h3>
            <p className="text-[13px] text-[#94a3b8] leading-relaxed mb-4">
              Calcul automatique des besoins caloriques (formule Mifflin-St Jeor) et répartition optimale des macronutriments selon votre objectif :
              <strong className="text-[#f0f2f5]"> 2g protéines/kg</strong> pour la masse musculaire, glucides et lipides ajustés.
            </p>
            <div className="text-xs text-[#64748b] leading-relaxed">
              <strong className="text-[#60a5fa]">Prise de masse :</strong> surplus de +300 kcal, focus protéines et glucides complexes.<br/>
              <strong className="text-[#f59e0b]">Sèche :</strong> déficit de -400 kcal, protéines élevées pour préserver le muscle.<br/>
              <strong className="text-[#22c55e]">Recomposition :</strong> calories au TDEE, ratio protéique maximal.
            </div>
          </div>
          {/* Progression */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-bold text-[#f0f2f5] mb-2">Suivi de progression</h3>
            <p className="text-[13px] text-[#94a3b8] leading-relaxed mb-4">
              Tracking des performances sur les mouvements composés clés (squat, bench, deadlift, OHP, rowing).
              Visualisation de l'évolution des charges et du poids corporel sur plusieurs semaines.
            </p>
            <div className="text-xs text-[#64748b] leading-relaxed">
              <strong className="text-[#60a5fa]">Principe :</strong> la surcharge progressive est le moteur principal de l'hypertrophie. Suivre ses charges permet de s'assurer qu'on progresse réellement.<br/>
              <strong className="text-[#22c55e]">Données :</strong> graphiques D3.js, deltas par exercice, tendances sur 12 semaines.
            </div>
          </div>
        </div>
      </section>

      {/* Scoring explanation */}
      <section className="max-w-[880px] mx-auto px-8 pb-16">
        <div className="bg-white/[0.015] border border-white/[0.04] rounded-xl p-8">
          <h2 className="text-xl font-bold text-[#f0f2f5] mb-6 text-center">Comment fonctionne le scoring ?</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-[#3b82f6] mb-2">50%</div>
              <div className="text-sm font-bold text-[#f0f2f5] mb-1">Score Protéique</div>
              <div className="text-xs text-[#64748b] leading-relaxed">Teneur en protéines/100g, profil BCAA, leucine, aminogramme complet, détection de profils suspects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-[#22c55e] mb-2">35%</div>
              <div className="text-sm font-bold text-[#f0f2f5] mb-1">Score Santé</div>
              <div className="text-xs text-[#64748b] leading-relaxed">Édulcorants (sucralose, acésulfame-K, aspartame), arômes artificiels, épaississants, colorants, nombre d'ingrédients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-[#f59e0b] mb-2">15%</div>
              <div className="text-sm font-bold text-[#f0f2f5] mb-1">Score Prix</div>
              <div className="text-xs text-[#64748b] leading-relaxed">Prix au kg, rapport qualité/prix, bonus transparence (aminogramme publié), bonus origine France</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 5 from real API */}
      {top.length > 0 && (
        <section className="max-w-[920px] mx-auto px-8 pb-16">
          <h2 className="text-xl font-bold text-[#f0f2f5] text-center mb-7">🏆 Top 5 Whey Protéines — Classement réel</h2>
          <div className="flex gap-3 justify-center flex-wrap">
            {top.slice(0,5).map((p: any, i: number) => (
              <Link key={p.id} href={`/produit/${p.id}`} className="flex-1 min-w-[150px] max-w-[170px] bg-white/[0.02] border border-white/[0.06] rounded-xl p-[18px] text-center no-underline hover:border-white/[0.12]">
                <div className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-widest mb-2">#{i+1}</div>
                <div className="text-2xl font-extrabold mb-1.5" style={{color: scoreColor(p.score_final)}}>{p.score_final?.toFixed(1) || "—"}</div>
                <div className="text-[13px] font-semibold text-[#f0f2f5] leading-tight mb-1">{(p.name||"").substring(0,30)}</div>
                <div className="text-[11px] text-[#64748b]">{p.brand}</div>
                {p.proteines_100g && <div className="text-[11px] text-[#60a5fa] mt-1.5">{p.proteines_100g}g prot/100g</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-[880px] mx-auto px-8 pb-16 text-center">
        <div className="bg-white/[0.015] border border-white/[0.04] rounded-xl p-12">
          <h2 className="text-xl font-bold text-[#f0f2f5] mb-10">Comment ça marche ?</h2>
          <div className="flex gap-10 justify-center flex-wrap">
            {[
              {n:1, t:"Pipeline automatique", d:"Notre scraper analyse automatiquement les sites marchands, extrait les données nutritionnelles et calcule les scores."},
              {n:2, t:"Compare & Choisis", d:"Catalogue filtrable, classement objectif, comparaison visuelle (radar chart). Tu vois les vrais chiffres."},
              {n:3, t:"Entraîne-toi & Progresse", d:"Programmes adaptés à ton niveau, calcul calorique par exercice, nutrition sur mesure, suivi de progression."},
            ].map(({n,t,d}) => (
              <div key={n} className="flex-1 min-w-[200px] max-w-[240px]">
                <div className="w-10 h-10 rounded-xl bg-[#3b82f6] text-white text-base font-extrabold flex items-center justify-center mx-auto mb-3.5">{n}</div>
                <h4 className="text-[15px] font-semibold text-[#f0f2f5] mb-1.5">{t}</h4>
                <p className="text-[13px] text-[#8b95a5] leading-relaxed m-0">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center px-8 py-10 border-t border-white/[0.04]">
        <p className="text-[#475569] text-xs leading-relaxed m-0">
          FitTracker × ProteinScan — Comparateur indépendant, non affilié aux marques. Les scores sont algorithmiques basés sur des données publiques.<br/>
          Les informations ne constituent pas un avis médical. Vérifiez toujours les étiquettes officielles des produits.
        </p>
      </footer>
    </div>
  );
}
