import Skeleton from "../ui/Skeleton"

export default function DashboardCardSkeleton() {
  return (
    <div className="rounded-xl border p-4 shadow-sm space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}