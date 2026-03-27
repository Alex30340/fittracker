"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/coach", icon: "🏋️", label: "Coach IA" },
  { href: "/nutrition", icon: "🍎", label: "Nutrition" },
  { href: "/progression", icon: "📈", label: "Progression" },
  { href: "/profil", icon: "👤", label: "Profil" },
];

export default function FitLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[200px] h-screen flex flex-col border-r border-white/[0.04] bg-[#0a0d14] flex-shrink-0 sticky top-0">
        <Link href="/" className="flex items-center gap-2 px-5 h-14 border-b border-white/[0.04]">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white" style={{background:"linear-gradient(135deg,#3b82f6,#2563eb)"}}>F</div>
          <span className="text-[15px] font-bold text-white tracking-tight"><span className="text-[#3b82f6]">Fit</span>Tracker</span>
        </Link>

        <nav className="flex-1 py-4 px-3">
          {NAV.map(({ href, icon, label }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium mb-0.5 transition-all ${active ? "bg-[rgba(59,130,246,0.08)] text-[#3b82f6]" : "text-[#7d8599] hover:text-white hover:bg-white/[0.02]"}`}>
                <span className="text-[14px] w-5 text-center">{icon}</span>{label}
              </Link>
            );
          })}
        </nav>

        {/* Switch to ProteinScan */}
        <div className="px-3 pb-2">
          <Link href="/catalogue" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-[#22c55e] hover:bg-[rgba(34,197,94,0.04)] transition-colors">
            🧪 ProteinScan
          </Link>
        </div>

        {user && (
          <div className="border-t border-white/[0.04] px-4 py-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#3b82f6]">
              {(user.display_name || user.email)?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">{user.display_name || user.email}</div>
            </div>
            <button onClick={logout} className="text-[#4a5168] text-[10px] cursor-pointer bg-transparent border-none hover:text-[#ef4444]">✕</button>
          </div>
        )}
      </aside>

      <main className="flex-1 p-8 overflow-auto max-h-screen">
        <div className="max-w-[900px]">{children}</div>
      </main>
    </div>
  );
}
