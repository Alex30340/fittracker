"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/catalogue", label: "Catalogue", icon: "🧪" },
  { href: "/comparateur", label: "Comparateur", icon: "⚖️" },
  { href: "/coach", label: "Coach IA", icon: "🏋️" },
  { href: "/nutrition", label: "Nutrition", icon: "🍽️" },
  { href: "/progression", label: "Progression", icon: "📈" },
  { href: "/profil", label: "Profil", icon: "👤" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] bg-[#0a0e14] border-r border-white/[0.06] flex flex-col sticky top-0 h-screen shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-[18px] py-5 border-b border-white/[0.04] no-underline">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm text-white"
          style={{ background: "linear-gradient(135deg,#3b82f6,#22c55e)" }}>F</div>
        <span className="text-base font-bold text-[#f0f2f5] tracking-tight">
          Fit<span className="text-[#3b82f6]">Tracker</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] no-underline transition-colors ${
                active
                  ? "bg-[rgba(59,130,246,0.1)] text-[#60a5fa] font-semibold"
                  : "text-[#8b95a5] font-normal hover:bg-white/[0.03] hover:text-[#c0c8d4]"
              }`}>
              <span className="text-[15px]">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-3.5 border-t border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-sm font-bold text-[#3b82f6]">U</div>
          <div>
            <div className="text-[13px] font-semibold text-[#f0f2f5]">Utilisateur</div>
            <div className="text-[10px] text-[#64748b]">Plan Free</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
