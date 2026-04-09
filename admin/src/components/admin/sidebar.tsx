"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Shirt, Users, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/camisas", label: "Camisas", icon: Shirt },
  { href: "/users", label: "Usuários", icon: Users },
  { href: "/relatorio", label: "Relatório de Chat", icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="stadium-pattern relative flex h-full w-64 flex-col px-4 py-6"
      style={{ backgroundColor: "#0a1e0f" }}
    >
      {/* Gradient overlay para suavizar o pattern */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

      <div className="relative mb-10 px-2">
        <p className="font-display mb-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-500/70">
          Painel
        </p>
        <h1 className="font-display text-2xl font-bold uppercase leading-none tracking-tight text-white">
          Admin<br />
          <span className="text-emerald-400">Camisas</span>
        </h1>
        <div className="mt-3 h-px w-10 bg-emerald-500/40" />
      </div>

      <nav className="relative flex flex-1 flex-col gap-0.5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
          Navegação
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-emerald-400" : "text-white/30 group-hover:text-white/60"
                )}
              />
              {label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="relative mt-6 border-t border-white/10 pt-4">
        <p className="px-3 text-[10px] text-white/25">
          © {new Date().getFullYear()} Loja de Camisas
        </p>
      </div>
    </aside>
  )
}
