import * as React from "react";
import { cn } from "@/lib/utils";

interface EnhancedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer" | "pulse" | "wave";
}

function EnhancedSkeleton({ className, variant = "shimmer", ...props }: EnhancedSkeletonProps) {
  const baseStyles = "rounded-md bg-muted";
  
  const variantStyles = {
    default: "animate-pulse",
    shimmer: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    pulse: "animate-pulse",
    wave: "relative overflow-hidden before:absolute before:inset-0 before:animate-[wave_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}

// Card skeleton with realistic structure
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 space-y-3 rounded-xl bg-card border border-border/50", className)}>
      <div className="flex items-start gap-3">
        <EnhancedSkeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <EnhancedSkeleton className="h-4 w-3/4" />
          <EnhancedSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <EnhancedSkeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <EnhancedSkeleton className="h-3 w-1/4" />
        <EnhancedSkeleton className="h-3 w-1/6" />
      </div>
    </div>
  );
}

// Metric card skeleton
function MetricSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 space-y-2 rounded-xl bg-card border border-border/50", className)}>
      <div className="flex items-center gap-2">
        <EnhancedSkeleton className="h-8 w-8 rounded-lg" />
        <EnhancedSkeleton className="h-4 w-20" />
      </div>
      <EnhancedSkeleton className="h-6 w-24" />
      <EnhancedSkeleton className="h-3 w-16" />
    </div>
  );
}

// Chart skeleton
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 space-y-4 rounded-xl bg-card border border-border/50", className)}>
      <div className="flex justify-between items-center">
        <EnhancedSkeleton className="h-5 w-32" />
        <EnhancedSkeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex items-end gap-2 h-40">
        {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
          <EnhancedSkeleton 
            key={i} 
            className="flex-1 rounded-t-sm" 
            style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// Dashboard skeleton - full page
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <EnhancedSkeleton className="h-8 w-48" />
          <EnhancedSkeleton className="h-4 w-64" />
        </div>
        <EnhancedSkeleton className="h-10 w-32 rounded-lg" />
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Chart */}
      <ChartSkeleton />
    </div>
  );
}

// Table skeleton
function TableSkeleton({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/50 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-muted/50 p-4 flex gap-4">
        {[...Array(columns)].map((_, i) => (
          <EnhancedSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="p-4 flex gap-4 border-t border-border/30"
          style={{ animationDelay: `${rowIndex * 0.05}s` }}
        >
          {[...Array(columns)].map((_, colIndex) => (
            <EnhancedSkeleton 
              key={colIndex} 
              className="h-4 flex-1" 
              style={{ width: colIndex === 0 ? '30%' : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export { 
  EnhancedSkeleton, 
  CardSkeleton, 
  MetricSkeleton, 
  ChartSkeleton, 
  DashboardSkeleton,
  TableSkeleton 
};
