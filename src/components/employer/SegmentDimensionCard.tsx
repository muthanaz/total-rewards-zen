/**
 * Segment Dimension Card
 * 
 * Clickable card showing a segment dimension with mini KPIs.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { SegmentDimension } from '@/hooks/useSegmentData';
import { cn } from '@/lib/utils';

interface SegmentDimensionCardProps {
  dimension: SegmentDimension;
  isSelected: boolean;
  onClick: () => void;
}

export function SegmentDimensionCard({ dimension, isSelected, onClick }: SegmentDimensionCardProps) {
  const Icon = dimension.icon;
  const isLowCoverage = dimension.coverage < 70;
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:border-accent/50 hover:shadow-md',
        isSelected && 'ring-2 ring-accent border-accent',
        !dimension.isAvailable && 'opacity-70'
      )}
      onClick={onClick}
    >
      <CardContent className="pt-4 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-2 rounded-lg',
              isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted'
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{dimension.name}</h4>
              <p className="text-xs text-muted-foreground">{dimension.description}</p>
            </div>
          </div>
          {isLowCoverage && (
            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low data
            </Badge>
          )}
        </div>
        
        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-muted/50">
            <p className="text-muted-foreground">Headcount</p>
            <p className="font-semibold">{formatInteger(dimension.headcount)}</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="text-muted-foreground">Avg Comp</p>
            <p className="font-semibold">
              {dimension.avgTotalComp 
                ? formatCurrencyAED(dimension.avgTotalComp, { abbreviate: true }) 
                : '—'}
            </p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="text-muted-foreground">Utilization</p>
            <div className="flex items-center gap-1">
              <p className="font-semibold">{formatPercent(dimension.utilizationRate)}</p>
              <Progress value={dimension.utilizationRate} className="h-1 w-8" />
            </div>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="text-muted-foreground">Unused</p>
            <p className="font-semibold text-amber-600">
              {formatCurrencyAED(dimension.unusedEntitlement, { abbreviate: true })}
            </p>
          </div>
        </div>
        
        {/* Top Category */}
        <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Top category:</span>
          <Badge variant="secondary" className="text-xs">{dimension.topCategory}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
