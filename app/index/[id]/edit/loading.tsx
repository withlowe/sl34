import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-[400px] w-full rounded-md" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
    </div>
  )
}
