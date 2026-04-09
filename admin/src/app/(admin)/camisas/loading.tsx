// src/app/(admin)/camisas/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function CamisasLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="mb-4 h-10 w-full max-w-sm" />
      <div className="rounded-md border bg-white">
        <div className="p-4">
          <Skeleton className="mb-3 h-10 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
