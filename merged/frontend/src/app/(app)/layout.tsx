"use client";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen font-sans" style={{ background: "#060a10", color: "#e2e8f0" }}>
      <Sidebar />
      <main className="flex-1 p-7 overflow-auto max-h-screen">{children}</main>
    </div>
  );
}
