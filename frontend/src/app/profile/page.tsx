"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile } from "@/lib/api";

const GOALS = [
  { value: "mass_gain", label: "Prise de masse" },
  { value: "cut", label: "Sèche" },
  { value: "recomp", label: "Recomposition" },
  { value: "strength", label: "Force" },
  { value: "endurance", label: "Endurance" },
];

const EQUIPMENT = [
  { value: "full_gym", label: "Salle complète" },
  { value: "home_gym", label: "Home gym" },
  { value: "bodyweight", label: "Poids du corps" },
  { value: "bands", label: "Bandes élastiques" },
];

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      getProfile(token).then(setProfile).catch(() => {});
    }
  }, [token]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const result = await updateProfile(token, profile);
      setMessage("Profil mis à jour !");
      setEditing(false);
      // Refresh to get recalculated macros
      const updated = await getProfile(token);
      setProfile(updated);
    } catch (err: any) {
      setMessage(err.message);
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">👤 Mon Profil</h1>
          <p className="text-gray-500 text-sm mt-1">Informations et objectifs fitness</p>
        </div>
        <button onClick={() => editing ? save() : setEditing(true)} disabled={saving} className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${editing ? "bg-emerald-500 text-white hover:bg-emerald-600" : "border border-gray-700 text-gray-400 hover:text-white"}`}>
          {saving ? "Sauvegarde..." : editing ? "💾 Sauvegarder" : "✏️ Modifier"}
        </button>
      </div>

      {message && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg p-3 mb-4">{message}</div>}

      <div className="grid grid-cols-2 gap-5">
        {/* Personal info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-bold mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Sexe", key: "sex", type: "select", options: [{ value: "male", label: "Homme" }, { value: "female", label: "Femme" }] },
              { label: "Date de naissance", key: "birth_date", type: "date" },
              { label: "Taille (cm)", key: "height_cm", type: "number" },
              { label: "Poids (kg)", key: "current_weight_kg", type: "number" },
              { label: "Poids cible (kg)", key: "target_weight_kg", type: "number" },
              { label: "% masse grasse", key: "body_fat_pct", type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-[10px] text-gray-500 block mb-1">{field.label}</label>
                {editing ? (
                  field.type === "select" ? (
                    <select value={profile[field.key] || ""} onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })} className={inputClass}>
                      <option value="">—</option>
                      {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={profile[field.key] || ""} onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })} className={inputClass} />
                  )
                ) : (
                  <div className="text-sm font-semibold py-2.5">{profile[field.key] || "—"}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fitness goals */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-bold mb-4">Objectifs fitness</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1.5">Objectif principal</label>
              {editing ? (
                <div className="flex gap-2 flex-wrap">{GOALS.map((g) => (
                  <button key={g.value} onClick={() => setProfile({ ...profile, primary_goal: g.value })} className={`px-3 py-1.5 rounded-lg text-xs border transition ${profile.primary_goal === g.value ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold" : "border-gray-700 text-gray-400"}`}>{g.label}</button>
                ))}</div>
              ) : <div className="text-sm font-semibold">{GOALS.find((g) => g.value === profile.primary_goal)?.label || "—"}</div>}
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1.5">Niveau (1-5)</label>
              {editing ? (
                <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setProfile({ ...profile, experience_level: n })} className={`w-10 h-10 rounded-lg border text-sm font-bold transition ${profile.experience_level === n ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "border-gray-700 text-gray-400"}`}>{n}</button>
                ))}</div>
              ) : <div className="text-sm font-semibold">{profile.experience_level || "—"}/5</div>}
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1.5">Jours / semaine</label>
              {editing ? (
                <div className="flex gap-2">{[2, 3, 4, 5, 6].map((n) => (
                  <button key={n} onClick={() => setProfile({ ...profile, available_days: n })} className={`w-10 h-10 rounded-lg border text-sm font-bold transition ${profile.available_days === n ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "border-gray-700 text-gray-400"}`}>{n}</button>
                ))}</div>
              ) : <div className="text-sm font-semibold">{profile.available_days || "—"} jours</div>}
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1.5">Équipement</label>
              {editing ? (
                <div className="flex gap-2 flex-wrap">{EQUIPMENT.map((e) => (
                  <button key={e.value} onClick={() => setProfile({ ...profile, equipment: e.value })} className={`px-3 py-1.5 rounded-lg text-xs border transition ${profile.equipment === e.value ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold" : "border-gray-700 text-gray-400"}`}>{e.label}</button>
                ))}</div>
              ) : <div className="text-sm font-semibold">{EQUIPMENT.find((e) => e.value === profile.equipment)?.label || "—"}</div>}
            </div>
          </div>
        </div>

        {/* Calculated macros */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 col-span-2">
          <h2 className="font-bold mb-4">📊 Macros calculées automatiquement</h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "BMR", value: profile.bmr, unit: "kcal", color: "text-gray-400" },
              { label: "TDEE", value: profile.tdee, unit: "kcal", color: "text-orange-400" },
              { label: "Protéines", value: profile.target_protein_g, unit: "g/jour", color: "text-blue-400" },
              { label: "Glucides", value: profile.target_carbs_g, unit: "g/jour", color: "text-emerald-400" },
              { label: "Lipides", value: profile.target_fat_g, unit: "g/jour", color: "text-purple-400" },
            ].map((m) => (
              <div key={m.label} className="text-center bg-gray-950 rounded-lg p-4">
                <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">{m.label}</div>
                <div className={`text-2xl font-extrabold ${m.color}`}>{m.value ? Math.round(m.value) : "—"}</div>
                <div className="text-xs text-gray-500">{m.unit}</div>
              </div>
            ))}
          </div>
          {!profile.bmr && <p className="text-gray-500 text-xs mt-3 text-center">Remplis ton profil (sexe, âge, taille, poids, objectif) pour que les macros soient calculées automatiquement.</p>}
        </div>
      </div>
    </div>
  );
}
