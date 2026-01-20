import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Deterministic color palette for vendor initials (semantic-friendly, works in dark mode)
const PALETTE = [
  { bg: 'bg-chart-1/15 dark:bg-chart-1/20', text: 'text-chart-1' },
  { bg: 'bg-chart-2/15 dark:bg-chart-2/20', text: 'text-chart-2' },
  { bg: 'bg-chart-3/15 dark:bg-chart-3/20', text: 'text-chart-3' },
  { bg: 'bg-chart-4/15 dark:bg-chart-4/20', text: 'text-chart-4' },
  { bg: 'bg-chart-5/15 dark:bg-chart-5/20', text: 'text-chart-5' },
  { bg: 'bg-chart-6/15 dark:bg-chart-6/20', text: 'text-chart-6' },
];

// Get deterministic palette index from name string
export function getDeterministicPaletteIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % PALETTE.length;
}

// Get 2-letter initials from merchant/vendor name
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface MarketplaceOfferMediaProps {
  imageUrl?: string | null;
  vendorName: string;
  title: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MarketplaceOfferMedia({
  imageUrl,
  vendorName,
  title,
  className,
  size = 'md',
}: MarketplaceOfferMediaProps) {
  const paletteIdx = getDeterministicPaletteIndex(vendorName);
  const palette = PALETTE[paletteIdx];
  const initials = getInitials(vendorName);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-32',
    lg: 'h-40',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  // If there's an image URL, show it
  if (imageUrl) {
    return (
      <div className={cn('relative overflow-hidden bg-muted', sizeClasses[size], className)}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: Gradient with initials
  return (
    <div
      className={cn(
        'relative overflow-hidden flex flex-col items-center justify-center',
        palette.bg,
        sizeClasses[size],
        className
      )}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")` 
           }} 
      />
      
      {/* Vendor initials */}
      <span className={cn('font-bold', palette.text, textSizeClasses[size])}>
        {initials}
      </span>
      
      {/* Verified badge styling hint */}
      <span className="text-[9px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-wider">
        Partner
      </span>
    </div>
  );
}

// Skeleton loader for offer cards
export function MarketplaceOfferSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 border rounded-lg">
        <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        <div className="shrink-0 space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Color bar */}
      <Skeleton className="h-1 w-full" />
      {/* Media area */}
      <Skeleton className="h-32 w-full" />
      {/* Content */}
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-10 ml-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
