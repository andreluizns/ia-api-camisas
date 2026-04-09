// src/app/(admin)/relatorio/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function RelatorioLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-52" />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
