"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { href: "/catalogue", label: "Classement" },
  { href: "/comparateur", label: "Comparateur" },
  { href: "/admin", label: "Admin" },
];

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="theme-dark min-h-screen flex flex-col" style={{ background: "#0c1017", color: "#e8eaf0" }}>
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 lg:px-10 h-14 border-b border-white/[0.04] bg-[#0c1017]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white" style={{background:"linear-gradient(135deg,#22c55e,#16a34a)"}}>P</div>
            <span className="text-[15px] font-bold text-white tracking-tight">Protein<span className="text-[#22c55e]">Scan</span></span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href || pathname?.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${active ? "bg-white/[0.06] text-white" : "text-[#7d8599] hover:text-white"}`}>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-[#22c55e]">
                {(user.display_name || user.email)?.[0]?.toUpperCase() || "?"}
              </div>
              <span className="text-[13px] text-[#7d8599]">{user.display_name || user.email}</span>
              <button onClick={logout} className="text-[12px] text-[#4a5168] hover:text-[#ef4444] cursor-pointer bg-transparent border-none ml-1 transition-colors">Deconnexion</button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-[13px] text-[#7d8599] hover:text-white transition-colors">Connexion</Link>
              <Link href="/register" className="text-[13px] font-semibold text-white bg-[#22c55e] hover:bg-[#16a34a] px-4 py-1.5 rounded-lg transition-colors">S&apos;inscrire</Link>
            </>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 lg:px-10 py-8 max-w-[1100px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
