// src/components/admin/relatorio-stats.tsx
"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, BarChart2, MapPin } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type CityData = { city: string; users: number; sessions: number }
type ClubCount = { club: string; count: number }
type MatrixRow = { city: string; cols: { club: string; count: number }[] }

type Props = {
  totalSessions: number
  totalMessages: number
  totalCamisasPesquisadas: number
  uniqueCities: number
  cityData: CityData[]
}

type ActivePanel = "cidades" | "camisas" | null

// ── Paleta ────────────────────────────────────────────────────────────────────

const EMERALD = "#059669"
const EMERALD_MID = "#34d399"

function heatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "#f8fafc"
  const intensity = Math.min(value / max, 1)
  const r = Math.round(255 - intensity * (255 - 6))
  const g = Math.round(255 - intensity * (255 - 95))
  const b = Math.round(255 - intensity * (255 - 70))
  return `rgb(${r},${g},${b})`
}

function heatTextColor(value: number, max: number): string {
  if (max === 0 || value === 0) return "#94a3b8"
  return value / max > 0.5 ? "#fff" : "#1e293b"
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-100 ${className ?? ""}`}
      aria-hidden="true"
    />
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-3 py-4">
      {[100, 80, 65, 55, 40, 35, 25].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton style={{ width: `${w}%`, height: 20 }} />
        </div>
      ))}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  value: number | string
  accent: string
  icon: React.ElementType
  active?: boolean
  onClick?: () => void
}) {
  const isClickable = !!onClick
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      aria-pressed={active}
      aria-label={isClickable ? `${label}: ${value}. ${active ? "Fechar painel" : "Ver detalhes"}` : undefined}
      className={[
        "group relative w-full overflow-hidden rounded-xl border p-5 text-left shadow-sm outline-none",
        "transition-all duration-200",
        isClickable ? "cursor-pointer" : "cursor-default",
        active
          ? "border-emerald-400 ring-2 ring-emerald-100 bg-white shadow-md"
          : "border-slate-200 bg-white hover:shadow-md hover:border-emerald-200",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Accent bar top */}
      <span
        className={`absolute inset-x-0 top-0 h-0.5 transition-all duration-300 ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ background: `linear-gradient(90deg, ${EMERALD}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 text-4xl font-bold tabular-nums text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={`shrink-0 rounded-lg p-2.5 transition-colors ${
            active ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-emerald-50"
          }`}
        >
          <Icon
            className={`h-5 w-5 transition-colors ${
              active ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"
            }`}
            aria-hidden="true"
          />
        </div>
      </div>

      {isClickable && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-xs font-medium transition-colors ${
              active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
            }`}
          >
            {active ? "Fechar detalhes" : "Ver detalhes"}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-all ${
              active ? "rotate-180 text-emerald-600" : "text-slate-400"
            }`}
            aria-hidden="true"
          />
        </div>
      )}
    </button>
  )
}

// ── Painel Cidades ─────────────────────────────────────────────────────────────

function CidadesPanel({ data }: { data: CityData[] }) {
  const sorted = [...data].sort((a, b) => b.users - a.users)
  const isHorizontal = sorted.length > 8

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        <h2 className="text-base font-semibold text-slate-800">
          Usuários por Cidade
        </h2>
        <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          {sorted.length} cidades
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          Nenhuma cidade encontrada.
        </p>
      ) : isHorizontal ? (
        /* Horizontal: muitas cidades */
        <ResponsiveContainer width="100%" height={Math.max(280, sorted.length * 32)}>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="city"
              width={120}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <Tooltip
              cursor={{ fill: "#f0fdf4" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(v) => [v, "Usuários"]}
            />
            <Bar dataKey="users" name="Usuários" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList
                dataKey="users"
                position="right"
                style={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
              />
              {sorted.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? EMERALD : i < sorted.length * 0.3 ? EMERALD : EMERALD_MID}
                  opacity={Math.max(0.5, 1 - i * 0.04)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        /* Vertical: poucas cidades — largura proporcional para alinhar à esquerda */
        <div className="overflow-x-auto">
        <div style={{ width: Math.max(300, sorted.length * 72), height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            barCategoryGap="12%"
            margin={{ top: 16, right: 8, left: 8, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="city"
              tick={{ fontSize: 11, fill: "#64748b" }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "#f0fdf4" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(v) => [v, "Usuários"]}
            />
            <Bar dataKey="users" name="Usuários" radius={[4, 4, 0, 0]} maxBarSize={32}>
              <LabelList
                dataKey="users"
                position="top"
                style={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
              />
              {sorted.map((_, i) => (
                <Cell
                  key={i}
                  fill={EMERALD}
                  opacity={Math.max(0.45, 1 - i * 0.07)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
        </div>
      )}
    </div>
  )
}

// ── Painel Camisas ─────────────────────────────────────────────────────────────

function CamisasPanel() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("loading")
  const [clubs, setClubs] = useState<ClubCount[]>([])
  const [matrix, setMatrix] = useState<MatrixRow[]>([])
  const [matrixClubs, setMatrixClubs] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/admin/relatorio/camisas")
      .then((r) => r.json())
      .then((data) => {
        setClubs(data.clubs ?? [])
        setMatrix(data.matrix ?? [])
        setMatrixClubs(data.matrixClubs ?? [])
        setStatus("done")
      })
      .catch(() => setStatus("error"))
  }, [])

  if (status === "loading") {
    return (
      <div>
        <div className="mb-5 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-800">Times mais pesquisados</h2>
        </div>
        <ChartSkeleton />
      </div>
    )
  }

  if (status === "error") {
    return (
      <p className="py-12 text-center text-sm text-red-400">
        Erro ao carregar dados. Recarregue a página.
      </p>
    )
  }

  if (clubs.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        Nenhum time foi mencionado nas conversas ainda.
      </p>
    )
  }

  const maxMatrix =
    matrix.flatMap((r) => r.cols.map((c) => c.count)).reduce((a, b) => Math.max(a, b), 0)

  return (
    <div className="space-y-10">
      {/* Gráfico horizontal: times × pesquisas */}
      <div>
        <div className="mb-5 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-800">
            Times mais pesquisados
          </h2>
          <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            top {clubs.length}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(280, clubs.length * 32)}>
          <BarChart
            data={clubs}
            layout="vertical"
            margin={{ top: 4, right: 56, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="club"
              width={140}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <Tooltip
              cursor={{ fill: "#f0fdf4" }}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(v) => [v, "Pesquisas"]}
            />
            <Bar dataKey="count" name="Pesquisas" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList
                dataKey="count"
                position="right"
                style={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
              />
              {clubs.map((_, i) => (
                <Cell
                  key={i}
                  fill={i < clubs.length * 0.4 ? EMERALD : EMERALD_MID}
                  opacity={Math.max(0.45, 1 - i * 0.018)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap: cidade × time */}
      {matrix.length > 0 && matrixClubs.length > 0 && (
        <div>
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Pesquisas por Cidade × Time
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Exibindo top {matrixClubs.length} times. Intensidade indica volume de pesquisas.
              </p>
            </div>
            {/* Legenda de cor */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-xs text-slate-400">0</span>
              <div
                className="h-3 w-24 rounded"
                style={{
                  background: `linear-gradient(90deg, #f8fafc, ${EMERALD})`,
                }}
                aria-label="Escala de intensidade: branco = 0, verde = máximo"
              />
              <span className="text-xs text-slate-400">max</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-max text-xs" role="grid" aria-label="Heatmap de pesquisas por cidade e time">
              <thead>
                <tr className="bg-slate-50">
                  <th
                    scope="col"
                    className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap"
                  >
                    Cidade
                  </th>
                  {matrixClubs.map((club) => (
                    <th
                      key={club}
                      scope="col"
                      className="border-b border-r border-slate-200 px-2 py-2 font-medium text-slate-500 whitespace-nowrap"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        minWidth: 32,
                        height: 88,
                        fontSize: 11,
                      }}
                    >
                      {club}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, ri) => (
                  <tr
                    key={row.city}
                    className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                  >
                    <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-inherit px-4 py-2 font-medium text-slate-700 whitespace-nowrap">
                      {row.city}
                    </td>
                    {matrixClubs.map((club) => {
                      const cell = row.cols.find((c) => c.club === club)
                      const count = cell?.count ?? 0
                      return (
                        <td
                          key={club}
                          className="border-b border-r border-slate-100 px-2 py-2 text-center font-semibold tabular-nums"
                          style={{
                            backgroundColor: heatColor(count, maxMatrix),
                            color: heatTextColor(count, maxMatrix),
                            minWidth: 36,
                          }}
                          title={`${row.city} × ${club}: ${count} pesquisa${count !== 1 ? "s" : ""}`}
                          aria-label={`${row.city} e ${club}: ${count} pesquisa${count !== 1 ? "s" : ""}`}
                        >
                          {count > 0 ? count : (
                            <span className="text-slate-200" aria-hidden="true">·</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Componente Principal ──────────────────────────────────────────────────────

export function RelatorioStats({
  totalSessions,
  totalMessages,
  totalCamisasPesquisadas,
  uniqueCities,
  cityData,
}: Props) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)

  function toggle(panel: ActivePanel) {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }

  const cards = [
    {
      label: "Total de Sessões",
      value: totalSessions,
      accent: "text-emerald-600",
      icon: BarChart2,
      panel: null as ActivePanel,
    },
    {
      label: "Total de Perguntas",
      value: totalMessages,
      accent: "text-emerald-600",
      icon: BarChart2,
      panel: null as ActivePanel,
    },
    {
      label: "Camisas Pesquisadas",
      value: totalCamisasPesquisadas,
      accent: "text-emerald-600",
      icon: BarChart2,
      panel: "camisas" as ActivePanel,
    },
    {
      label: "Cidades Diferentes",
      value: uniqueCities,
      accent: "text-emerald-600",
      icon: MapPin,
      panel: "cidades" as ActivePanel,
    },
  ]

  return (
    <div className="mb-8 space-y-4">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={c.value}
            accent={c.accent}
            icon={c.icon}
            active={activePanel === c.panel && c.panel !== null}
            onClick={c.panel ? () => toggle(c.panel) : undefined}
          />
        ))}
      </div>

      {/* Painel expandido */}
      {activePanel && (
        <div
          className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          style={{ animation: "fadeSlideIn 200ms ease-out" }}
        >
          <button
            type="button"
            onClick={() => setActivePanel(null)}
            aria-label="Fechar painel"
            className="absolute right-4 top-4 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X className="h-4 w-4" />
          </button>

          {activePanel === "cidades" && <CidadesPanel data={cityData} />}
          {activePanel === "camisas" && <CamisasPanel />}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes fadeSlideIn { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </div>
  )
}
