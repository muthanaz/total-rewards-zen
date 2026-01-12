import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}

export function SummaryCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${Math.min(count, 4)} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-20" />
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-[240px] w-full rounded-lg" />
    </Card>
  );
}

export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex gap-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BenefitGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-2.5 mb-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="mt-3 pt-2 border-t space-y-1">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-4/5" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />
      <SummaryCardsSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <BenefitGridSkeleton count={4} />
    </div>
  );
}
