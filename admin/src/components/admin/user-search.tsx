// src/components/admin/user-search.tsx
"use client"

import { useCallback, useRef, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, X } from "lucide-react"

export function UserSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Estado local: input reage imediatamente; navegação é debounced
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  const updateQuery = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
          params.set("q", value)
        } else {
          params.delete("q")
        }
        startTransition(() => {
          router.push(`/users?${params.toString()}`)
        })
      }, 300)
    },
    [router, searchParams]
  )

  function clearSearch() {
    setQuery("")
    startTransition(() => router.push("/users"))
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="relative w-72">
        {isPending ? (
          <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        ) : (
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-9"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            updateQuery(e.target.value)
          }}
        />
      </div>
      {query && !isPending && (
        <Button variant="ghost" size="sm" onClick={clearSearch} className="gap-1 text-slate-500">
          <X className="h-3 w-3" />
          Limpar
        </Button>
      )}
    </div>
  )
}
