"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMetrics, addMetric, getWorkoutHistory } from "@/lib/api";

export default function ProgressPage() {
  const { token } = useAuth();
  const [weightData, setWeightData] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [newWaist, setNewWaist] = useState("");
  const [newChest, setNewChest] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    getMetrics(token, "weight").then(setWeightData).catch(() => {});
    getWorkoutHistory(token).then(setWorkouts).catch(() => {});
  }, [token]);

  const submitMetric = async () => {
    if (!token) return;
    const data: Record<string, any> = {};
    if (newWeight) data.weight_kg = parseFloat(newWeight);
    if (newWaist) data.waist_cm = parseFloat(newWaist);
    if (newChest) data.chest_cm = parseFloat(newChest);
    if (Object.keys(data).length === 0) return;

    await addMetric(token, data);
    setNewWeight("");
    setNewWaist("");
    setNewChest("");
    setMessage("Mesure ajoutée !");
    setTimeout(() => setMessage(""), 2000);
    getMetrics(token, "weight").then(setWeightData).catch(() => {});
  };

  const totalVolume = workouts.reduce((s, w) => s + (w.total_volume || 0), 0);
  const totalCalories = workouts.reduce((s, w) => s + (w.estimated_calories || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">📈 Progression</h1>
        <p className="text-gray-500 text-sm mt-1">Suivi de ta transformation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: "⚖️", label: "Poids actuel", value: weightData[0]?.weight_kg ? `${weightData[0].weight_kg} kg` : "—", color: "text-blue-400" },
          { icon: "💪", label: "Séances totales", value: workouts.length, color: "text-emerald-400" },
          { icon: "🏋️", label: "Volume total", value: `${Math.round(totalVolume)} kg`, color: "text-purple-400" },
          { icon: "🔥", label: "Calories brûlées", value: `${Math.round(totalCalories)} kcal`, color: "text-orange-400" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><span className="text-lg">{s.icon}</span><span className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</span></div>
            <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Weight history */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold mb-3">⚖️ Historique poids</h2>
          {weightData.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune mesure. Ajoute ton poids ci-dessous !</p>
          ) : (
            <div className="space-y-1.5">
              {weightData.slice(0, 15).map((w, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-800 last:border-0">
                  <span className="text-gray-500">{new Date(w.date).toLocaleDateString("fr-FR")}</span>
                  <span className="font-semibold">{w.weight_kg} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add metric */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold mb-3">📏 Ajouter une mesure</h2>
          {message && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg p-2 mb-3">{message}</div>}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Poids (kg)</label>
              <input value={newWeight} onChange={(e) => setNewWeight(e.target.value)} type="number" step="0.1" placeholder="78.5" className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tour de taille (cm)</label>
              <input value={newWaist} onChange={(e) => setNewWaist(e.target.value)} type="number" step="0.5" placeholder="82" className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tour de poitrine (cm)</label>
              <input value={newChest} onChange={(e) => setNewChest(e.target.value)} type="number" step="0.5" placeholder="102" className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500" />
            </div>
            <button onClick={submitMetric} className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition">
              Enregistrer
            </button>
          </div>
        </div>

        {/* Workout history */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 col-span-2">
          <h2 className="text-sm font-bold mb-3">💪 Historique des séances</h2>
          {workouts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Aucune séance enregistrée. Utilise le Coach IA pour commencer !</p>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-gray-800">
              {workouts.map((w) => (
                <div key={w.id} className="flex justify-between items-center py-3">
                  <div>
                    <div className="font-medium text-sm">{new Date(w.started_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
                    <div className="text-xs text-gray-500">{w.exercises_count} exercices · {w.total_sets} séries</div>
                  </div>
                  <div className="flex gap-5 text-right">
                    <div><div className="text-sm font-bold text-emerald-400">{Math.round(w.total_volume || 0)} kg</div><div className="text-[10px] text-gray-500">Volume</div></div>
                    <div><div className="text-sm font-bold text-orange-400">{Math.round(w.estimated_calories || 0)}</div><div className="text-[10px] text-gray-500">kcal</div></div>
                    {w.session_rating && <div><div className="text-sm font-bold text-yellow-400">{"★".repeat(w.session_rating)}</div><div className="text-[10px] text-gray-500">Note</div></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
