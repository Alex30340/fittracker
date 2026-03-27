"use client";
import { useState, useRef, useCallback } from "react";
import {
  discoveryStart, discoveryBatch,
  startRefresh, getPipelineRuns, getCatalogStats
} from "@/lib/api";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Batch state
  const [scanning, setScanning] = useState(false);
  const [queue, setQueue] = useState<any>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [batchLog, setBatchLog] = useState<string[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [totalDiscovered, setTotalDiscovered] = useState(0);
  const stopRef = useRef(false);

  const loadStats = async () => {
    try {
      const [s, r] = await Promise.all([getCatalogStats(), getPipelineRuns()]);
      setStats(s);
      setRuns(r.runs || []);
    } catch (e: any) {
      setStatus("Erreur: " + e.message);
    }
  };

  const log = useCallback((msg: string) => {
    setBatchLog(prev => [...prev.slice(-80), `${new Date().toLocaleTimeString("fr-FR")} — ${msg}`]);
  }, []);

  const launchDiscovery = async () => {
    setScanning(true);
    setLoading(true);
    stopRef.current = false;
    setBatchLog([]);
    setProgressPct(0);
    setQueue(null);
    setTotalFound(0);
    setTotalDiscovered(0);
    setStatus("");

    try {
      // Step 1: Start (instantane)
      log("Initialisation de la queue...");
      const start = await discoveryStart();
      const rid = start.run_id;
      const bd = start.breakdown || {};
      log(`Queue creee: ${bd.direct_products || 0} produits directs, ${bd.catalogs_to_crawl || 0} catalogues, ${bd.duckduckgo_queries || 0} DDG, ${bd.brave_queries || 0} Brave`);
      log(`Total: ${start.total_items} taches. Demarrage du scan...`);

      // Step 2: Batch loop
      let done = false;
      let found = 0;
      let discovered = 0;

      while (!done && !stopRef.current) {
        try {
          const res = await discoveryBatch(rid, 5);

          setQueue(res.queue);
          setProgressPct(res.progress_pct || 0);

          if (res.batch_results) {
            const br = res.batch_results;
            found += br.products_found || 0;
            discovered += br.urls_discovered || 0;
            setTotalFound(found);
            setTotalDiscovered(discovered);

            const parts = [];
            if (br.products_found) parts.push(`+${br.products_found} produits`);
            if (br.urls_discovered) parts.push(`+${br.urls_discovered} URLs decouvertes`);
            if (br.skipped) parts.push(`${br.skipped} ignores`);
            if (br.errors) parts.push(`${br.errors} erreurs`);
            if (parts.length > 0) log(`Batch: ${parts.join(", ")}`);
          }

          if (res.status === "completed") {
            done = true;
            log(`Scan termine ! ${found} produits trouves, ${discovered} URLs decouvertes au total.`);
            setStatus(`Termine : ${found} produits, ${discovered} URLs decouvertes`);
          }
        } catch (e: any) {
          log(`Erreur batch: ${e.message}`);
          await new Promise(r => setTimeout(r, 3000));
        }

        if (!done) await new Promise(r => setTimeout(r, 300));
      }

      if (stopRef.current) {
        log("Scan arrete. Les taches restantes sont en pause dans la queue.");
        setStatus("Scan arrete.");
      }
    } catch (e: any) {
      setStatus("Erreur: " + e.message);
      log(`Erreur: ${e.message}`);
    }

    setScanning(false);
    setLoading(false);
    loadStats();
  };

  const stopScan = () => {
    stopRef.current = true;
    log("Arret demande...");
  };

  const launchRefresh = async () => {
    setLoading(true);
    setStatus("Refresh en cours...");
    try {
      const result = await startRefresh();
      setStatus(`Refresh termine : ${result.stats?.updated || 0} offres mises a jour`);
    } catch (e: any) {
      setStatus("Erreur: " + e.message);
    }
    setLoading(false);
    loadStats();
  };

  return (
    <div className="pb-10 animate-in">
      <h1 className="text-2xl font-bold text-[#f0f2f5] m-0 mb-1">Administration</h1>
      <p className="text-[13px] text-[#64748b] m-0 mb-6">
        Discovery batch — 100+ catalogues + DuckDuckGo + Brave (optionnel)
      </p>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3.5 mb-6">
        <button onClick={launchDiscovery} disabled={loading || scanning}
          className="p-5 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded-xl text-left cursor-pointer hover:border-[rgba(59,130,246,0.4)] disabled:opacity-50">
          <div className="text-lg mb-2">🔍</div>
          <div className="text-sm font-bold text-[#f0f2f5]">Lancer Discovery</div>
          <div className="text-[11px] text-[#64748b] mt-1">
            106 URLs directes + 36 requetes DuckDuckGo + Brave si dispo
          </div>
        </button>
        <button onClick={launchRefresh} disabled={loading || scanning}
          className="p-5 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-xl text-left cursor-pointer hover:border-[rgba(34,197,94,0.4)] disabled:opacity-50">
          <div className="text-lg mb-2">🔄</div>
          <div className="text-sm font-bold text-[#f0f2f5]">Lancer Refresh</div>
          <div className="text-[11px] text-[#64748b] mt-1">Met a jour les prix des offres existantes</div>
        </button>
        <button onClick={loadStats}
          className="p-5 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-xl text-left cursor-pointer hover:border-[rgba(245,158,11,0.4)]">
          <div className="text-lg mb-2">📊</div>
          <div className="text-sm font-bold text-[#f0f2f5]">Charger les stats</div>
          <div className="text-[11px] text-[#64748b] mt-1">Stats du catalogue et historique</div>
        </button>
      </div>

      {status && (
        <div className="p-3 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.15)] rounded-lg mb-4 text-sm text-[#60a5fa]">
          {status}
        </div>
      )}

      {/* Scan progress */}
      {scanning && (
        <div className="bg-white/[0.02] border border-[rgba(59,130,246,0.2)] rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold text-[#f0f2f5] m-0">Scan en cours...</h3>
            <button onClick={stopScan}
              className="px-3 py-1.5 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg text-[#f87171] text-xs font-semibold cursor-pointer hover:bg-[rgba(239,68,68,0.2)]">
              Arreter
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #3b82f6, #22c55e)" }} />
          </div>

          {/* Stats row */}
          <div className="flex gap-4 text-[12px] mb-3">
            <span className="text-[#64748b]">{progressPct.toFixed(1)}%</span>
            {queue && (
              <>
                <span className="text-[#94a3b8]">{queue.done + queue.errors + queue.skipped}/{queue.total} traites</span>
                <span className="text-[#34d399] font-semibold">{totalFound} produits</span>
                {totalDiscovered > 0 && <span className="text-[#60a5fa]">+{totalDiscovered} URLs decouvertes</span>}
                {queue.errors > 0 && <span className="text-[#f87171]">{queue.errors} erreurs</span>}
                {queue.pending > 0 && <span className="text-[#f59e0b]">{queue.pending} en attente</span>}
              </>
            )}
          </div>

          {/* Log */}
          <div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-3 max-h-[220px] overflow-y-auto font-mono text-[11px] text-[#94a3b8]">
            {batchLog.map((line, i) => (
              <div key={i} className={
                line.includes("Erreur") || line.includes("erreur") ? "text-[#f87171]" :
                line.includes("termine") || line.includes("Termine") ? "text-[#34d399] font-semibold" :
                line.includes("decouvertes") ? "text-[#60a5fa]" : ""
              }>{line}</div>
            ))}
            {batchLog.length === 0 && <div>En attente...</div>}
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-6">
          <h3 className="text-[15px] font-bold text-[#f0f2f5] mb-4">Stats du catalogue</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { l: "Produits", v: stats.total_products, c: "#3b82f6" },
              { l: "Offres actives", v: stats.total_active_offers, c: "#22c55e" },
              { l: "Confiance moy.", v: stats.avg_confidence?.toFixed(2), c: "#f59e0b" },
              { l: "A verifier", v: stats.products_needing_review, c: "#ef4444" },
            ].map(({ l, v, c }) => (
              <div key={l} className="p-3 bg-[rgba(0,0,0,0.2)] rounded-lg text-center">
                <div className="text-[10px] text-[#64748b]">{l}</div>
                <div className="text-xl font-extrabold" style={{ color: c }}>{v ?? "?"}</div>
              </div>
            ))}
          </div>
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
              <th className="text-left px-4 py-2.5 text-[#64748b]">Erreurs</th>
              <th className="text-left px-4 py-2.5 text-[#64748b]">Details</th>
              <th className="text-left px-4 py-2.5 text-[#64748b]">Date</th>
            </tr></thead>
            <tbody>{runs.map((r: any, i: number) => (
              <tr key={i} className="border-b border-white/[0.04]">
                <td className="px-4 py-2.5 text-[#e2e8f0] font-semibold">{r.run_type}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    r.status === "completed" ? "bg-[rgba(52,211,153,0.08)] text-[#34d399]" :
                    r.status === "running" ? "bg-[rgba(59,130,246,0.08)] text-[#60a5fa]" :
                    "bg-[rgba(248,113,113,0.08)] text-[#f87171]"
                  }`}>{r.status}</span>
                </td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{r.products_found ?? 0}</td>
                <td className="px-4 py-2.5 text-[#94a3b8]">{r.errors ?? 0}</td>
                <td className="px-4 py-2.5 text-[#64748b] text-[11px] max-w-[200px] truncate">{r.details || ""}</td>
                <td className="px-4 py-2.5 text-[#64748b]">{r.started_at ? new Date(r.started_at).toLocaleString("fr-FR") : "?"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
