"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await login(email, password); router.push("/dashboard"); }
    catch (e: any) { setErr(e.message || "Erreur de connexion"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#060a10] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 no-underline justify-center mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg text-white" style={{ background: "linear-gradient(135deg,#3b82f6,#22c55e)" }}>F</div>
          <span className="text-xl font-bold text-[#f0f2f5]">Fit<span className="text-[#3b82f6]">Tracker</span></span>
        </Link>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-[#f0f2f5] text-center mb-2">Connexion</h1>
          <p className="text-sm text-[#64748b] text-center mb-6">Accède à ton dashboard fitness</p>
          {err && <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-2.5 text-sm text-[#f87171] mb-4">{err}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#94a3b8] block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ton@email.com"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[#e2e8f0] text-sm outline-none focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="text-xs text-[#94a3b8] block mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[#e2e8f0] text-sm outline-none focus:border-[#3b82f6]" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#3b82f6] rounded-xl text-white font-bold text-sm border-none cursor-pointer hover:bg-[#2563eb] disabled:opacity-50">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <p className="text-sm text-[#64748b] text-center mt-5">
            Pas encore de compte ? <Link href="/register" className="text-[#3b82f6] no-underline font-semibold">S&apos;inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
