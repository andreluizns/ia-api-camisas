import Link from "next/link"
import { Shirt, Users, MessageSquare } from "lucide-react"
import { prisma } from "@/lib/db"

export const metadata = { title: "Dashboard — Admin Camisas" }

export default async function DashboardPage() {
  const [totalCamisas, totalUsers, totalSessions] = await Promise.all([
    prisma.camisa.count(),
    prisma.user.count({ where: { role: { not: "master" } } }),
    prisma.chatSession.count(),
  ])

  const metrics = [
    {
      label: "Total de Camisas",
      value: totalCamisas,
      icon: Shirt,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      href: "/camisas",
    },
    {
      label: "Usuários Admin",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      href: "/users",
    },
    {
      label: "Sessões de Chat",
      value: totalSessions,
      icon: MessageSquare,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      href: "/relatorio",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon, color, bg, border, href }) => (
          <Link
            key={label}
            href={href}
            className={`group relative overflow-hidden rounded-xl border ${border} bg-white p-6 shadow-sm transition-shadow hover:shadow-md cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
              </div>
              <div className={`rounded-xl ${bg} p-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
            {/* Accent bar */}
            <div className={`absolute bottom-0 left-0 h-0.5 w-0 ${bg.replace("bg-", "bg-").replace("-50", "-400")} transition-all duration-300 group-hover:w-full`} />
          </Link>
        ))}
      </div>
    </div>
  )
}
