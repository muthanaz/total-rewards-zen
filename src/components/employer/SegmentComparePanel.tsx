/**
 * Segment Compare Panel
 * 
 * Side-by-side comparison of two segments with delta indicators.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  TrendingUp, 
  TrendingDown,
  Minus,
  GitCompare
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { SegmentValue, RootCauseDriver } from '@/hooks/useSegmentData';

interface SegmentComparePanelProps {
  values: SegmentValue[];
  dimensionName: string;
  onClose: () => void;
}

function DeltaIndicator({ 
  value, 
  isInverse = false,
  suffix = '' 
}: { 
  value: number; 
  isInverse?: boolean;
  suffix?: string;
}) {
  const isPositive = isInverse ? value < 0 : value > 0;
  const isNeutral = Math.abs(value) < 0.5;
  
  if (isNeutral) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        No change
      </span>
    );
  }
  
  return (
    <span className={cn(
      "flex items-center gap-1 text-xs font-medium",
      isPositive ? "text-success" : "text-destructive"
    )}>
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {value > 0 ? '+' : ''}{value.toFixed(1)}{suffix}
    </span>
  );
}

export function SegmentComparePanel({ 
  values, 
  dimensionName,
  onClose 
}: SegmentComparePanelProps) {
  const [segmentA, setSegmentA] = useState<string>(values[0]?.id || '');
  const [segmentB, setSegmentB] = useState<string>(values[1]?.id || '');
  
  const valueA = values.find(v => v.id === segmentA);
  const valueB = values.find(v => v.id === segmentB);
  
  // Calculate deltas (use type assertion for extended properties)
  const valA = valueA as any;
  const valB = valueB as any;
  const deltas = valueA && valueB ? {
    utilization: valueA.utilizationRate - valueB.utilizationRate,
    unused: valueA.unusedEntitlement - valueB.unusedEntitlement,
    spend: (valA.claimsCost || 0) - (valB.claimsCost || 0),
    satisfaction: (valA.satisfactionScore || 0) - (valB.satisfactionScore || 0),
  } : null;
  
  // Find biggest driver difference
  const findBiggestDriverDiff = () => {
    if (!valueA || !valueB) return null;
    
    const driversA: RootCauseDriver[] = (valueA as any).drivers || [];
    const driversB: RootCauseDriver[] = (valueB as any).drivers || [];
    
    let maxDiff = 0;
    let biggestDriver = '';
    
    driversA.forEach((dA) => {
      const dB = driversB.find((d) => d.id === dA.id);
      const diff = Math.abs(dA.percentage - (dB?.percentage || 0));
      if (diff > maxDiff) {
        maxDiff = diff;
        biggestDriver = dA.name;
      }
    });
    
    return maxDiff > 0 ? `${biggestDriver}: ${maxDiff.toFixed(0)}% difference` : null;
  };
  
  const biggestDriverDiff = findBiggestDriverDiff();
  
  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-accent" />
            Compare {dimensionName}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Segment Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Segment A</label>
            <Select value={segmentA} onValueChange={setSegmentA}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {values.map(v => (
                  <SelectItem key={v.id} value={v.id} disabled={v.id === segmentB}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Segment B</label>
            <Select value={segmentB} onValueChange={setSegmentB}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {values.map(v => (
                  <SelectItem key={v.id} value={v.id} disabled={v.id === segmentA}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {valueA && valueB && deltas && (
          <>
            {/* Comparison Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {/* Utilization */}
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-xs text-muted-foreground mb-1">Utilization Δ</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold">{Math.abs(deltas.utilization).toFixed(1)}%</span>
                  </div>
                  <DeltaIndicator value={deltas.utilization} suffix="%" />
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1">
                    <Progress value={valueA.utilizationRate} className="h-1" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{valueA.name}: {formatPercent(valueA.utilizationRate)}</p>
                  </div>
                  <div className="flex-1">
                    <Progress value={valueB.utilizationRate} className="h-1" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{valueB.name}: {formatPercent(valueB.utilizationRate)}</p>
                  </div>
                </div>
              </div>
              
              {/* Unused */}
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-xs text-muted-foreground mb-1">Unused AED Δ</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{formatCurrencyAED(Math.abs(deltas.unused), { abbreviate: true })}</span>
                  <DeltaIndicator value={deltas.unused / 1000} isInverse suffix="K" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span>{valueA.name}: {formatCurrencyAED(valueA.unusedEntitlement, { abbreviate: true })}</span>
                  <span>{valueB.name}: {formatCurrencyAED(valueB.unusedEntitlement, { abbreviate: true })}</span>
                </div>
              </div>
              
              {/* Spend */}
              <div className="p-3 rounded-lg bg-background border">
                <p className="text-xs text-muted-foreground mb-1">Spend Δ</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{formatCurrencyAED(Math.abs(deltas.spend), { abbreviate: true })}</span>
                  <DeltaIndicator value={deltas.spend / 1000} suffix="K" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span>{valueA.name}: {formatCurrencyAED((valueA as any).claimsCost || 0, { abbreviate: true })}</span>
                  <span>{valueB.name}: {formatCurrencyAED((valueB as any).claimsCost || 0, { abbreviate: true })}</span>
                </div>
              </div>
            </div>
            
            {/* Top Categories Side by Side */}
            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-background border">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Top Categories ({valueA.name})</p>
                <div className="flex flex-wrap gap-1">
                  {valueA.topCategories.slice(0, 3).map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Top Categories ({valueB.name})</p>
                <div className="flex flex-wrap gap-1">
                  {valueB.topCategories.slice(0, 3).map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Biggest Driver Difference */}
            {biggestDriverDiff && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Biggest Driver Difference</p>
                <p className="text-sm font-medium text-accent">{biggestDriverDiff}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
