"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/catalogue", icon: "🏪", label: "Catalogue" },
  { href: "/coach", icon: "🤖", label: "Coach IA" },
  { href: "/nutrition", icon: "🥗", label: "Nutrition" },
  { href: "/progress", icon: "📈", label: "Progression" },
  { href: "/profile", icon: "👤", label: "Profil" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-extrabold text-sm">F</div>
        <span className="text-base font-extrabold">Fit<span className="text-emerald-500">Tracker</span></span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative ${
                active
                  ? "bg-emerald-500/10 text-emerald-500 font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-full" />}
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-800">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-xs text-white font-bold">
            {(user?.display_name || "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-semibold">{user?.display_name || "Utilisateur"}</div>
            <div className="text-[10px] text-gray-500">Plan {user?.plan || "Free"}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
