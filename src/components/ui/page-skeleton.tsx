/**
 * Premium Page Skeletons v2.0
 * 
 * Consistent loading states for every page type.
 * All skeletons use semantic spacing and match actual component layouts.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============= PAGE HEADER SKELETON =============

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

// ============= SUMMARY CARDS SKELETON =============

export function SummaryCardsSkeleton({ 
  count = 4,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-20" />
        </Card>
      ))}
    </div>
  );
}

// ============= METRIC CARD SKELETON =============

export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-16" />
    </Card>
  );
}

// ============= CHART SKELETON =============

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </Card>
  );
}

// ============= TABLE SKELETON =============

export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number; 
  columns?: number;
  className?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className={cn(
            'flex items-center gap-4 p-4',
            rowIndex < rows - 1 && 'border-b'
          )}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
}

// ============= LIST ITEM SKELETON =============

export function ListItemSkeleton({ 
  count = 3,
  showAvatar = true,
  className 
}: { 
  count?: number;
  showAvatar?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            {showAvatar && <Skeleton className="h-10 w-10 rounded-xl shrink-0" />}
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

// ============= BENEFIT GRID SKELETON =============

export function BenefitGridSkeleton({ 
  count = 8,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
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
        </Card>
      ))}
    </div>
  );
}

// ============= FORM SKELETON =============

export function FormSkeleton({ 
  fields = 4,
  className 
}: { 
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// ============= DETAIL DRAWER SKELETON =============

export function DetailDrawerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= DASHBOARD SKELETON =============

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />
      <SummaryCardsSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <BenefitGridSkeleton count={4} />
    </div>
  );
}

// ============= ANALYTICS SKELETON =============

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />
      
      {/* Insights Strip */}
      <Card className="p-4 bg-accent/5">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </Card>

      <SummaryCardsSkeleton count={5} />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <ChartSkeleton className="lg:col-span-2" />
        <ChartSkeleton />
      </div>

      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}

// ============= OPS QUEUE SKELETON =============

export function OpsQueueSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
      </Card>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-lg" />
        ))}
      </div>

      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
