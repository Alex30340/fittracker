"use client";

import Link from "next/link";

const features = [
  { icon: "🏪", title: "Comparateur intelligent", desc: "1000+ produits avec scoring multi-critères" },
  { icon: "🤖", title: "Coach IA personnel", desc: "Programmes sur-mesure par intelligence artificielle" },
  { icon: "🥗", title: "Plans nutritionnels", desc: "Nutrition personnalisée, suivi macros temps réel" },
  { icon: "📈", title: "Suivi progression", desc: "Dashboard complet, courbes et records" },
  { icon: "👥", title: "Communauté active", desc: "Avis, discussions et classements" },
  { icon: "📱", title: "Partout avec toi", desc: "Responsive sur tous tes appareils" },
];

const plans = [
  { name: "Free", price: "0€", period: "toujours", features: ["Comparateur basique", "3 recherches/jour", "Suivi limité"], cta: "Commencer", accent: false },
  { name: "Pro", price: "9.99€", period: "/mois", features: ["Comparateur illimité", "Coach IA complet", "Plans nutrition", "Suivi avancé", "Alertes prix"], cta: "Essai 14j gratuit", accent: true },
  { name: "Elite", price: "19.99€", period: "/mois", features: ["Tout Pro +", "Coaching avancé", "Multi-profils", "Exports PDF"], cta: "Choisir Elite", accent: false },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-extrabold text-lg">F</div>
          <span className="text-xl font-extrabold tracking-tight">Fit<span className="text-emerald-500">Tracker</span></span>
        </div>
        <div className="flex gap-3">
          <Link href="/auth?mode=login" className="px-5 py-2 rounded-lg border border-gray-700 text-sm hover:border-gray-500 transition">Connexion</Link>
          <Link href="/auth?mode=register" className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold hover:opacity-90 transition">S'inscrire</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center pt-20 pb-16 px-8 relative overflow-hidden">
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <p className="text-emerald-500 font-semibold text-sm tracking-widest uppercase mb-4">Plateforme Fitness Intelligente</p>
        <h1 className="text-5xl md:text-6xl font-black leading-tight max-w-2xl mx-auto mb-5 tracking-tight">
          Ton fitness,<br />
          <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">simplifié par l'IA</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Compare les meilleurs produits, génère des programmes personnalisés et suis ta progression — tout dans une seule app.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth?mode=register" className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition">
            Commencer gratuitement
          </Link>
          <Link href="/dashboard" className="px-7 py-3.5 rounded-xl border border-gray-700 text-base hover:border-gray-500 transition">
            Voir la démo
          </Link>
        </div>
        <div className="flex justify-center gap-10 mt-12">
          {[["1000+", "Produits"], ["50K+", "Utilisateurs"], ["4.8/5", "Note"]].map(([v, l]) => (
            <div key={l}><div className="text-2xl font-extrabold text-emerald-500">{v}</div><div className="text-xs text-gray-500">{l}</div></div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-20 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold mb-2">Tout ce dont tu as besoin</h2>
          <p className="text-gray-400">Une plateforme complète pour tes objectifs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:-translate-y-0.5 transition-transform">
              <span className="text-3xl block mb-3">{f.icon}</span>
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-16 bg-gray-900/50">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold mb-2">Tarifs simples</h2>
          <p className="text-gray-400">Commence gratuit, évolue quand tu veux</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`bg-gray-900 border rounded-xl p-7 relative ${p.accent ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : "border-gray-800"}`}>
              {p.accent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-[10px] font-bold">POPULAIRE</div>}
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <div className="mb-4"><span className="text-3xl font-extrabold">{p.price}</span><span className="text-gray-500 text-sm">{p.period}</span></div>
              <div className="flex flex-col gap-2 mb-5">
                {p.features.map((f) => <div key={f} className="text-sm text-gray-400 flex items-center gap-2"><span className="text-emerald-500">✓</span>{f}</div>)}
              </div>
              <Link href="/auth?mode=register" className={`block text-center py-3 rounded-lg text-sm font-semibold ${p.accent ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white" : "border border-gray-700 hover:border-gray-500"} transition`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-800 text-gray-500 text-sm">
        © 2026 FitTracker — Plateforme Fitness Intelligente
      </footer>
    </div>
  );
}
