"use client";
import { useState } from "react";
import { startDiscovery, startRefresh, getPipelineRuns, getCatalogStats } from "@/lib/api";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      const [s, r] = await Promise.all([getCatalogStats(), getPipelineRuns()]);
      setStats(s); setRuns(r.runs || []);
    } catch (e: any) { setStatus("Erreur: " + e.message); }
  };

  const launchDiscovery = async () => {
    setLoading(true); setStatus("Discovery en cours...");
    try { await startDiscovery(); setStatus("Discovery lancée en arrière-plan"); } catch (e: any) { setStatus("Erreur: " + e.message); }
    setLoading(false);
  };

  const launchRefresh = async () => {
    setLoading(true); setStatus("Refresh en cours...");
    try { await startRefresh(); setStatus("Refresh lancé en arrière-plan"); } catch (e: any) { setStatus("Erreur: " + e.message); }
    setLoading(false);
  };

  return (
    <div className="pb-10 animate-in">
      <h1 className="text-2xl font-bold text-[#f0f2f5] m-0 mb-1">Administration</h1>
      <p className="text-[13px] text-[#64748b] m-0 mb-6">Pipeline Discovery/Refresh et stats du catalogue</p>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3.5 mb-6">
        <button onClick={launchDiscovery} disabled={loading}
          className="p-5 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded-xl text-left cursor-pointer hover:border-[rgba(59,130,246,0.4)] disabled:opacity-50">
          <div className="text-lg mb-2">🔍</div>
          <div className="text-sm font-bold text-[#f0f2f5]">Lancer Discovery</div>
          <div className="text-[11px] text-[#64748b] mt-1">Recherche automatique de nouveaux produits via Brave Search</div>
        </button>
        <button onClick={launchRefresh} disabled={loading}
          className="p-5 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-xl text-left cursor-pointer hover:border-[rgba(34,197,94,0.4)] disabled:opacity-50">
          <div className="text-lg mb-2">🔄</div>
          <div className="text-sm font-bold text-[#f0f2f5]">Lancer Refresh</div>
          <div className="text-[11px] text-[#64748b] mt-1">Met à jour les prix et disponibilités des offres existantes</div>
        </button>
        <button onClick={loadStats}
          className="p-5 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-xl text-left cursor-pointer hover:border-[rgba(245,158,11,0.4)]">
          <div className="text-lg mb-2">📊</div>
          <div className="text-sm font-bold text-[#f0f2f5]">Charger les stats</div>
          <div className="text-[11px] text-[#64748b] mt-1">Voir les stats du catalogue et l historique des pipelines</div>
        </button>
      </div>

      {status && <div className="p-3 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] rounded-lg mb-4 text-sm text-[#60a5fa]">{status}</div>}

      {/* Stats */}
      {stats && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-6">
          <h3 className="text-[15px] font-bold text-[#f0f2f5] mb-4">Stats du catalogue</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              {l:"Produits",v:stats.total_products,c:"#3b82f6"},
              {l:"Offres actives",v:stats.total_active_offers,c:"#22c55e"},
              {l:"Confiance moy.",v:stats.avg_confidence?.toFixed(2),c:"#f59e0b"},
              {l:"À vérifier",v:stats.products_needing_review,c:"#ef4444"},
            ].map(({l,v,c}) => (
              <div key={l} className="p-3 bg-[rgba(0,0,0,0.2)] rounded-lg text-center">
                <div className="text-[10px] text-[#64748b]">{l}</div>
                <div className="text-xl font-extrabold" style={{color:c}}>{v ?? "?"}</div>
              </div>
            ))}
          </div>
          {stats.last_discovery && <div className="text-[11px] text-[#64748b] mt-3">Dernière discovery: {new Date(stats.last_discovery).toLocaleString("fr-FR")}</div>}
          {stats.last_refresh && <div className="text-[11px] text-[#64748b]">Dernier refresh: {new Date(stats.last_refresh).toLocaleString("fr-FR")}</div>}
        </div>
      )}

      {/* Pipeline runs */}
      {runs.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h3 className="text-[15px] font-bold text-[#f0f2f5] m-0">Historique des pipelines</h3>
          </div>
          <table className="w-full border-collapse text-[13px]">
            <thead><tr className="border-b border-white/[0.08]">
              <th className="text-left px-4 py-2.5 text-[#64748b]">Type</th>
              <th className="text-left px-4 py-2.5 text-[#64748b]">Status</th>
              <th className="text-left px-4 py-2.5 text-[#64748b]">Produits</th>
              <th className="text-left px-4 py-2.5 text-[#64748b]">Offres</th>
              <th className="text-left px-4 py-2.5 text-[#64748b]">Erreurs</th>
              <th className="text-left px-4 py-2.5 text-[#64748b]">Date</th>
            </tr></thead>
            <tbody>{runs.map((r: any, i: number) => (
              <tr key={i} className="border-b border-white/[0.04]">
                <td className="px-4 py-2.5 text-[#e2e8f0] font-semibold">{r.run_type}</td>
                <td className="px-4 py-2.5"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${r.status==="completed"?"bg-[rgba(52,211,153,0.08)] text-[#34d399]":r.status==="running"?"bg-[rgba(59,130,246,0.08)] text-[#60a5fa]":"bg-[rgba(248,113,113,0.08)] text-[#f87171]"}`}>{r.status}</span></td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{r.products_found ?? 0}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{r.offers_updated ?? 0}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{r.errors ?? 0}</td>
                <td className="px-4 py-2.5 text-[#64748b]">{r.started_at ? new Date(r.started_at).toLocaleString("fr-FR") : "?"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}