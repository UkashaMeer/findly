import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="w-full mx-auto space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="shadow-sm pb-0">
          {/* Header */}
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-14 rounded" />
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="py-0 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />

            <div className="flex items-start gap-2 bg-muted/40 rounded-md p-2.5">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-40" />
            </div>

            <Skeleton className="h-48 w-full rounded-md" />
          </CardContent>

          {/* Footer */}
          <CardFooter className="border-t bg-muted/20 px-6 !py-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
