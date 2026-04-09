// src/components/admin/camisa-filters.tsx
"use client"

import { useCallback, useRef, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"

export function CamisaFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Estado local para o input responder imediatamente ao usuário
  const [club, setClub] = useState(searchParams.get("club") ?? "")
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "")
  const [year, setYear] = useState(searchParams.get("year") ?? "")

  const updateFilter = useCallback(
    (key: string, value: string) => {
      // Debounce: só dispara a navegação 300ms após o usuário parar de digitar
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
        // useTransition: marca a navegação como não-urgente e expõe isPending
        startTransition(() => {
          router.push(`/camisas?${params.toString()}`)
        })
      }, 300)
    },
    [router, searchParams]
  )

  const hasFilters = club || brand || year

  function clearFilters() {
    setClub("")
    setBrand("")
    setYear("")
    startTransition(() => router.push("/camisas"))
  }

  return (
    <div className={`mb-4 flex flex-wrap items-center gap-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <Input
        placeholder="Filtrar por clube..."
        className="w-48"
        value={club}
        onChange={(e) => { setClub(e.target.value); updateFilter("club", e.target.value) }}
      />
      <Input
        placeholder="Filtrar por marca..."
        className="w-48"
        value={brand}
        onChange={(e) => { setBrand(e.target.value); updateFilter("brand", e.target.value) }}
      />
      <Input
        placeholder="Ano..."
        className="w-28"
        type="number"
        value={year}
        onChange={(e) => { setYear(e.target.value); updateFilter("year", e.target.value) }}
      />
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      {hasFilters && !isPending && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-500">
          <X className="h-3 w-3" />
          Limpar
        </Button>
      )}
    </div>
  )
}
