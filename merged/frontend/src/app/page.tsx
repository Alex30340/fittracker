"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCatalogStats } from "@/lib/api";

export default function HomePage() {
  const [stats, setStats] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    getCatalogStats().then(setStats).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const S = {
    page: { fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f9f7f4", minHeight: "100vh", color: "#1a1a1a" } as React.CSSProperties,
  };

  return (
    <div style={S.page}>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(249,247,244,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none",
        transition: "all 0.3s ease",
        padding: "0 48px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #16a34a, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧪</div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", color: "#111" }}>Protein<span style={{ color: "#16a34a" }}>Scan</span></span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/catalogue" style={{ fontSize: 14, color: "#555", padding: "8px 16px", borderRadius: 8, fontWeight: 500 }}>Catalogue</Link>
          <Link href="/comparateur" style={{ fontSize: 14, color: "#555", padding: "8px 16px", borderRadius: 8, fontWeight: 500 }}>Comparateur</Link>
          <Link href="/login" style={{ fontSize: 14, color: "#555", padding: "8px 16px", borderRadius: 8, fontWeight: 500 }}>Connexion</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: "white", background: "#16a34a", padding: "10px 22px", borderRadius: 10, boxShadow: "0 2px 12px rgba(22,163,74,0.35)" }}>S'inscrire</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1800&q=80')`,
          backgroundSize: "cover", backgroundPosition: "center 30%",
        }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(105deg, rgba(249,247,244,0.98) 40%, rgba(249,247,244,0.7) 65%, rgba(249,247,244,0.1) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "130px 48px 80px", width: "100%" }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 32 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 8px rgba(22,163,74,0.9)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{stats?.total_products || "89"}+ produits analysés en temps réel</span>
            </div>

            <h1 style={{ fontSize: "clamp(44px, 6vw, 76px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-3px", marginBottom: 24, color: "#111" }}>
              Le comparateur<br />whey <em style={{ color: "#16a34a", fontStyle: "italic" }}>indépendant.</em>
            </h1>

            <p style={{ fontSize: 19, color: "#555", lineHeight: 1.65, marginBottom: 44, maxWidth: 460 }}>
              Scoring transparent, aminogrammes, prix au gramme de protéine. Trouvez la meilleure whey pour vous — pas celle qui paie le plus de pub.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 60 }}>
              <Link href="/catalogue" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#111", color: "white", padding: "15px 30px", borderRadius: 14, fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", boxShadow: "0 4px 24px rgba(0,0,0,0.22)" }}>
                Explorer le catalogue
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.75 9h10.5m0 0L9 4.5m5.25 4.5L9 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", color: "#111", padding: "15px 30px", borderRadius: 14, fontSize: 15, fontWeight: 600, border: "1.5px solid rgba(0,0,0,0.1)", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                Mon espace fitness
              </Link>
            </div>

            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              {[
                { val: stats?.total_products || "89", label: "Produits analysés" },
                { val: stats?.total_offers || "43", label: "Offres suivies" },
                { val: "100%", label: "Indépendant" },
                { val: "24/7", label: "Scan automatique" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1.5px", color: "#111" }}>{s.val}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: "#111", padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "center", gap: 56, flexWrap: "wrap" }}>
        {[
          { icon: "🔬", text: "Données nutritionnelles vérifiées" },
          { icon: "💸", text: "Prix au gramme de protéine" },
          { icon: "🏷️", text: "0 partenariat avec les marques" },
          { icon: "⚡", text: "Mis à jour en temps réel" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 500 }}>
            <span style={{ fontSize: 17 }}>{item.icon}</span>{item.text}
          </div>
        ))}
      </div>

      {/* TWO TOOLS */}
      <section style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#16a34a", marginBottom: 14 }}>Deux outils, une mission</p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-2px", color: "#111", marginBottom: 16 }}>Tout ce dont vous avez besoin</h2>
          <p style={{ color: "#777", fontSize: 17, maxWidth: 460, margin: "0 auto" }}>Optimisez votre nutrition et vos performances avec des données réelles.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {/* Card ProteinScan */}
          <Link href="/catalogue" style={{ display: "block" }}>
            <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", height: 500, background: "#0f2d1a", cursor: "pointer", boxShadow: "0 8px 40px rgba(0,0,0,0.14)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.22)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 40px rgba(0,0,0,0.14)"; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80" alt="Whey protein" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,45,26,0.99) 45%, rgba(15,45,26,0.3) 100%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 44 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>🧪 ProteinScan</span>
                </div>
                <h3 style={{ fontSize: 34, fontWeight: 900, color: "white", letterSpacing: "-1.5px", marginBottom: 12 }}>Comparez {stats?.total_products || "89"} wheys</h3>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 28 }}>Scoring indépendant, aminogrammes, édulcorants, prix au gramme — tout est analysé et noté.</p>
                <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
                  {["Score A–F", "Aminogramme", "Prix/kg prot."].map((tag, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.07)", padding: "5px 14px", borderRadius: 100 }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#22c55e", color: "white", padding: "13px 26px", borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}>
                  Explorer le catalogue →
                </div>
              </div>
            </div>
          </Link>

          {/* Card FitTracker */}
          <Link href="/dashboard" style={{ display: "block" }}>
            <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", height: 500, background: "#0d1f3c", cursor: "pointer", boxShadow: "0 8px 40px rgba(0,0,0,0.14)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.22)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 40px rgba(0,0,0,0.14)"; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80" alt="Fitness" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,31,60,0.99) 45%, rgba(13,31,60,0.3) 100%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 44 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa" }}>🏋️ FitTracker</span>
                </div>
                <h3 style={{ fontSize: 34, fontWeight: 900, color: "white", letterSpacing: "-1.5px", marginBottom: 12 }}>Votre coach fitness IA</h3>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 28 }}>Programmes personnalisés, TDEE, suivi de progression et plans nutritionnels adaptés à vos objectifs.</p>
                <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
                  {["Coach IA", "TDEE calculé", "Progression"].map((tag, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.07)", padding: "5px 14px", borderRadius: 100 }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#3b82f6", color: "white", padding: "13px 26px", borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: "0 4px 20px rgba(59,130,246,0.35)" }}>
                  Accéder au dashboard →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#111", padding: "100px 48px", color: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#22c55e", marginBottom: 14 }}>Comment ça marche</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-1.5px" }}>Simple, transparent, efficace</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
            {[
              { num: "01", icon: "🔍", title: "On scanne le marché", desc: "Nos robots analysent 40+ boutiques en continu et extraient les données nutritionnelles réelles." },
              { num: "02", icon: "📊", title: "On note chaque produit", desc: "Algorithme de scoring indépendant : protéines, édulcorants, aminogramme, rapport qualité/prix." },
              { num: "03", icon: "🎯", title: "Vous comparez", desc: "Filtrez, comparez, suivez les alertes de prix. Tout pour faire le meilleur choix." },
              { num: "04", icon: "💪", title: "Vous progressez", desc: "Le FitTracker adapte vos besoins à vos objectifs et suit votre évolution semaine par semaine." },
            ].map((step, i) => (
              <div key={i} style={{ padding: "52px 40px", background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "2px", marginBottom: 24 }}>{step.num}</div>
                <div style={{ fontSize: 38, marginBottom: 20 }}>{step.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.5px" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RANKINGS TEASER */}
      <section style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#16a34a", marginBottom: 14 }}>Classements</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-1.5px", color: "#111", marginBottom: 20 }}>
              Trouvez les meilleures<br />wheys par catégorie
            </h2>
            <p style={{ fontSize: 16, color: "#777", lineHeight: 1.7, marginBottom: 36 }}>
              Chaque produit est noté de A+ à F selon ses données réelles. Pas de publicité déguisée, pas d'affiliation.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 44 }}>
              {[
                { label: "Meilleur rapport qualité/prix", color: "#16a34a", score: "A+" },
                { label: "Plus haute teneur en protéines", color: "#2563eb", score: "A" },
                { label: "Sans édulcorants", color: "#ea580c", score: "A" },
                { label: "Budget serré < 20€/kg", color: "#7c3aed", score: "B+" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 22px", background: "white", borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{r.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: r.color, background: `${r.color}18`, padding: "4px 14px", borderRadius: 8 }}>{r.score}</span>
                </div>
              ))}
            </div>
            <Link href="/catalogue" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", color: "white", padding: "14px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
              Voir tous les classements →
            </Link>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "4/5" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=700&q=80" alt="Protein supplement" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", bottom: -20, left: -30, background: "white", borderRadius: 20, padding: "22px 28px", boxShadow: "0 16px 48px rgba(0,0,0,0.14)", minWidth: 210 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Score global</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 52, fontWeight: 900, color: "#16a34a", letterSpacing: "-2px", lineHeight: 1 }}>A+</span>
                <span style={{ fontSize: 14, color: "#bbb" }}>/ A+</span>
              </div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>MyProtein Impact Whey</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ margin: "0 48px 80px", borderRadius: 28, background: "linear-gradient(135deg, #0f2d1a 0%, #0d2620 50%, #0d1f3c 100%)", padding: "90px 60px", position: "relative", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=60" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.08 }} />
        <div style={{ position: "relative", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 56px)", fontWeight: 900, color: "white", letterSpacing: "-2.5px", marginBottom: 20 }}>
            Prêt à mieux choisir<br />votre whey ?
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", maxWidth: 440, margin: "0 auto 44px" }}>
            Rejoignez ceux qui font confiance aux données, pas aux influenceurs.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ background: "#22c55e", color: "white", padding: "16px 36px", borderRadius: 14, fontSize: 15, fontWeight: 700, boxShadow: "0 4px 24px rgba(34,197,94,0.35)" }}>
              Créer un compte gratuit →
            </Link>
            <Link href="/catalogue" style={{ background: "rgba(255,255,255,0.07)", color: "white", padding: "16px 36px", borderRadius: 14, fontSize: 15, fontWeight: 600, border: "1px solid rgba(255,255,255,0.12)" }}>
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0a0a0a", padding: "52px 48px", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #16a34a, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🧪</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.3px" }}>ProteinScan</span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 20 }}>
          Comparateur indépendant · Non affilié aux marques · Données publiques
        </p>
        <div style={{ display: "flex", gap: 28, justifyContent: "center" }}>
          {["Catalogue", "Comparateur", "Connexion", "S'inscrire"].map((l, i) => (
            <a key={i} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
