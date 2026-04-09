// src/app/(admin)/users/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="mb-4 h-10 w-72" />
      <div className="rounded-md border bg-white">
        <div className="p-4">
          <Skeleton className="mb-3 h-10 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
