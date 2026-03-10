"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    (searchParams.get("mode") as "login" | "register") || "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <Link href="/" className="text-gray-500 text-sm hover:text-gray-300 transition">← Retour</Link>

        <div className="flex items-center gap-2.5 mt-4 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-extrabold text-sm">F</div>
          <span className="text-lg font-extrabold">Fit<span className="text-emerald-500">Tracker</span></span>
        </div>

        <h2 className="text-xl font-extrabold mb-1">
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {mode === "login" ? "Content de te revoir !" : "Rejoins FitTracker"}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {mode === "register" && (
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nom d'affichage"
              className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500 transition"
            />
          )}
          <input
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" type="email"
            className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500 transition"
          />
          <input
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe (8 caractères min)" type="password"
            className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none focus:border-emerald-500 transition"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold text-sm disabled:opacity-50 transition hover:opacity-90"
          >
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </div>

        <p className="text-center mt-5 text-sm text-gray-500">
          {mode === "login" ? "Pas de compte ? " : "Déjà inscrit ? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-emerald-500 font-semibold hover:underline"
          >
            {mode === "login" ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}
