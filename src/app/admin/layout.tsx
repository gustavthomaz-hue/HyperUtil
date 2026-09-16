"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Newspaper, 
  Trophy, 
  Target,
  Swords
} from "lucide-react";

const adminNavItems = [
  {
    title: "Visão Geral",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Produtos",
    href: "/admin/produtos",
    icon: Package,
  },
  {
    title: "Notícias",
    href: "/admin/noticias",
    icon: Newspaper,
  },
  {
    title: "Rankings IA",
    href: "/admin/rankings",
    icon: Trophy,
  },
  {
    title: "Quiz Recomendador",
    href: "/admin/recomendador",
    icon: Target,
  },
  {
    title: "Duelos",
    href: "/admin/duelos",
    icon: Swords,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar Ajustada (w-64) com proporções padrão */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 p-6 flex flex-col justify-between shrink-0 shadow-xl">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                Hyper<span className="text-emerald-400">Util</span>
              </span>
            </Link>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Admin
            </span>
          </div>

          {/* Navigation Links proporcionais */}
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-500 font-medium">
          HyperUtil Admin v2.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}