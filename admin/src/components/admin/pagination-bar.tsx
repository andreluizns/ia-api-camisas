// src/components/admin/pagination-bar.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  page: number
  totalPages: number
  basePath: string   // ex: "/camisas"
}

export function PaginationBar({ page, totalPages, basePath }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goTo(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${basePath}?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
