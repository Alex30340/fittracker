"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, getDailyNutrition, getWorkoutHistory } from "@/lib/api";

export default function DashboardPage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [nutrition, setNutrition] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    getProfile(token).then(setProfile).catch(() => {});
    getDailyNutrition(token).then(setNutrition).catch(() => {});
    getWorkoutHistory(token).then(setWorkouts).catch(() => {});
  }, [token]);

  const macroTargets = profile ? {
    cal: profile.target_calories || 2400,
    p: profile.target_protein_g || 180,
    g: profile.target_carbs_g || 280,
    l: profile.target_fat_g || 75,
  } : { cal: 2400, p: 180, g: 280, l: 75 };

  const todayTotals = nutrition?.totals || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de ta progression fitness</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: "🔥", label: "Calories brûlées", value: workouts.reduce((s: number, w: any) => s + (w.estimated_calories || 0), 0), suffix: " kcal", color: "text-orange-400" },
          { icon: "💪", label: "Séances (30j)", value: workouts.length, suffix: "", color: "text-emerald-400" },
          { icon: "⚖️", label: "Poids", value: profile?.current_weight_kg || "—", suffix: " kg", color: "text-blue-400" },
          { icon: "🎯", label: "Objectif", value: profile?.primary_goal?.replace("_", " ") || "Non défini", suffix: "", color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</span>
            </div>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}{s.suffix}</div>
          </div>
        ))}
      </div>

      {/* Macros du jour */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-bold mb-4">🥗 Macros du jour</h2>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "Calories", current: todayTotals.calories, target: macroTargets.cal, unit: "kcal", color: "text-orange-400 bg-orange-500" },
            { label: "Protéines", current: todayTotals.protein_g, target: macroTargets.p, unit: "g", color: "text-blue-400 bg-blue-500" },
            { label: "Glucides", current: todayTotals.carbs_g, target: macroTargets.g, unit: "g", color: "text-emerald-400 bg-emerald-500" },
            { label: "Lipides", current: todayTotals.fat_g, target: macroTargets.l, unit: "g", color: "text-purple-400 bg-purple-500" },
          ].map((m) => {
            const pct = m.target > 0 ? Math.min(Math.round((m.current / m.target) * 100), 100) : 0;
            const [textColor, bgColor] = m.color.split(" ");
            return (
              <div key={m.label} className="text-center">
                <div className={`text-2xl font-extrabold ${textColor}`}>{Math.round(m.current)}</div>
                <div className="text-xs text-gray-500">/ {m.target} {m.unit}</div>
                <div className="h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${bgColor}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-1">{m.label} — {pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent workouts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold mb-3">💪 Dernières séances</h2>
          {workouts.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune séance enregistrée. Lance ton premier programme via le Coach IA !</p>
          ) : (
            workouts.slice(0, 5).map((w: any) => (
              <div key={w.id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <div>
                  <div className="text-sm font-medium">{new Date(w.started_at).toLocaleDateString("fr-FR")}</div>
                  <div className="text-xs text-gray-500">{w.exercises_count} exercices · {w.total_sets} séries</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">{Math.round(w.total_volume || 0)} kg</div>
                  <div className="text-xs text-gray-500">{Math.round(w.estimated_calories || 0)} kcal</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold mb-3">📊 Profil rapide</h2>
          {profile ? (
            <div className="space-y-3">
              {[
                { label: "Niveau", value: `${profile.experience_level || 1}/5` },
                { label: "Jours dispo", value: `${profile.available_days || 4}/semaine` },
                { label: "Équipement", value: profile.equipment || "Non défini" },
                { label: "BMR", value: profile.bmr ? `${Math.round(profile.bmr)} kcal` : "—" },
                { label: "TDEE", value: profile.tdee ? `${Math.round(profile.tdee)} kcal` : "—" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Complète ton profil pour voir tes stats calculées !</p>
          )}
        </div>
      </div>
    </div>
  );
}
