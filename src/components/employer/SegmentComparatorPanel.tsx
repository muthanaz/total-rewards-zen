/**
 * SegmentComparatorPanel - Enhanced side-by-side segment comparison
 * 
 * Features:
 * - Dimension selector (Grade/Dept/Nationality/Life stage/Tenure/Employment type)
 * - Two segment value selectors
 * - Side-by-side comparison: Utilization %, Unrealized value, Rejection %, Approval time, Missing docs %
 * - Generate Actions button
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { SegmentDimension, SegmentValue, SegmentDimensionId } from '@/hooks/useSegmentData';
import { toast } from 'sonner';

interface SegmentComparatorPanelProps {
  dimensions: SegmentDimension[];
  selectedDimensionId?: SegmentDimensionId | null;
  onDimensionChange?: (id: SegmentDimensionId) => void;
}

interface ComparisonMetric {
  label: string;
  valueA: string | number;
  valueB: string | number;
  delta: number;
  isInverse?: boolean; // true if lower is better
  suffix?: string;
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
        Same
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
      {value > 0 ? '+' : ''}{typeof value === 'number' ? value.toFixed(1) : value}{suffix}
    </span>
  );
}

export function SegmentComparatorPanel({ 
  dimensions,
  selectedDimensionId,
  onDimensionChange,
}: SegmentComparatorPanelProps) {
  const navigate = useNavigate();
  
  // State
  const [dimensionId, setDimensionId] = useState<SegmentDimensionId | null>(selectedDimensionId || null);
  const [segmentAId, setSegmentAId] = useState<string>('');
  const [segmentBId, setSegmentBId] = useState<string>('');
  
  // Get current dimension and values
  const activeDimension = useMemo(() => 
    dimensions.find(d => d.id === dimensionId),
    [dimensions, dimensionId]
  );
  
  const segmentA = useMemo(() => 
    activeDimension?.values.find(v => v.id === segmentAId),
    [activeDimension, segmentAId]
  );
  
  const segmentB = useMemo(() => 
    activeDimension?.values.find(v => v.id === segmentBId),
    [activeDimension, segmentBId]
  );
  
  // Auto-select first two segments when dimension changes
  const handleDimensionChange = (id: string) => {
    const newDimId = id as SegmentDimensionId;
    setDimensionId(newDimId);
    onDimensionChange?.(newDimId);
    
    const dim = dimensions.find(d => d.id === newDimId);
    if (dim && dim.values.length >= 2) {
      setSegmentAId(dim.values[0].id);
      setSegmentBId(dim.values[1].id);
    }
  };
  
  // Calculate comparison metrics
  const comparisonMetrics = useMemo((): ComparisonMetric[] | null => {
    if (!segmentA || !segmentB) return null;
    
    // Get extended properties with defaults
    const aExt = segmentA as any;
    const bExt = segmentB as any;
    
    return [
      {
        label: 'Utilization %',
        valueA: formatPercent(segmentA.utilizationRate),
        valueB: formatPercent(segmentB.utilizationRate),
        delta: segmentA.utilizationRate - segmentB.utilizationRate,
        suffix: '%',
      },
      {
        label: 'Unrealized Value',
        valueA: formatCurrencyAED(segmentA.unusedEntitlement, { abbreviate: true }),
        valueB: formatCurrencyAED(segmentB.unusedEntitlement, { abbreviate: true }),
        delta: (segmentA.unusedEntitlement - segmentB.unusedEntitlement) / 1000,
        isInverse: true,
        suffix: 'K',
      },
      {
        label: 'Rejection %',
        valueA: formatPercent(aExt.rejectionRate || 8),
        valueB: formatPercent(bExt.rejectionRate || 12),
        delta: (aExt.rejectionRate || 8) - (bExt.rejectionRate || 12),
        isInverse: true,
        suffix: '%',
      },
      {
        label: 'Approval Time',
        valueA: `${(aExt.avgApprovalDays || 3.2).toFixed(1)} days`,
        valueB: `${(bExt.avgApprovalDays || 4.5).toFixed(1)} days`,
        delta: (aExt.avgApprovalDays || 3.2) - (bExt.avgApprovalDays || 4.5),
        isInverse: true,
        suffix: ' days',
      },
      {
        label: 'Missing Docs %',
        valueA: formatPercent(aExt.missingDocsRate || 15),
        valueB: formatPercent(bExt.missingDocsRate || 22),
        delta: (aExt.missingDocsRate || 15) - (bExt.missingDocsRate || 22),
        isInverse: true,
        suffix: '%',
      },
    ];
  }, [segmentA, segmentB]);
  
  // Handle generate actions
  const handleGenerateActions = () => {
    if (!segmentA || !segmentB || !activeDimension) {
      toast.error('Please select two segments to compare');
      return;
    }
    
    // Navigate to recommendations with prefilled segment tags
    const params = new URLSearchParams({
      prefill_segment_dimension: activeDimension.id,
      prefill_segment_a: segmentA.name,
      prefill_segment_b: segmentB.name,
      prefill_rationale: `Address utilization gap between ${segmentA.name} (${formatPercent(segmentA.utilizationRate)}) and ${segmentB.name} (${formatPercent(segmentB.utilizationRate)})`,
    });
    
    navigate(`/employer/recommendations?${params.toString()}`);
    toast.success('Creating segment-based actions', {
      description: `Comparing ${segmentA.name} vs ${segmentB.name}`,
    });
  };
  
  return (
    <Card className="border-accent/30 bg-gradient-to-r from-card via-card to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-accent" />
          Segment Comparator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dimension Selector */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Segment Dimension</label>
          <Select value={dimensionId || ''} onValueChange={handleDimensionChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select dimension..." />
            </SelectTrigger>
            <SelectContent>
              {dimensions.filter(d => d.isAvailable).map(dim => (
                <SelectItem key={dim.id} value={dim.id}>
                  {dim.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Segment Selectors */}
        {activeDimension && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Segment A</label>
              <Select value={segmentAId} onValueChange={setSegmentAId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {activeDimension.values.map(v => (
                    <SelectItem key={v.id} value={v.id} disabled={v.id === segmentBId}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Segment B</label>
              <Select value={segmentBId} onValueChange={setSegmentBId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {activeDimension.values.map(v => (
                    <SelectItem key={v.id} value={v.id} disabled={v.id === segmentAId}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Comparison Output */}
        {comparisonMetrics && segmentA && segmentB && (
          <>
            <div className="space-y-2">
              {comparisonMetrics.map((metric, idx) => (
                <div 
                  key={idx}
                  className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-background border text-sm"
                >
                  <div className="text-muted-foreground">{metric.label}</div>
                  <div className="font-medium text-center">{metric.valueA}</div>
                  <div className="font-medium text-center">{metric.valueB}</div>
                  <div className="flex justify-end">
                    <DeltaIndicator 
                      value={metric.delta} 
                      isInverse={metric.isInverse} 
                      suffix={metric.suffix} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Top Categories Comparison */}
            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-background border">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Top Categories ({segmentA.name})</p>
                <div className="flex flex-wrap gap-1">
                  {segmentA.topCategories.slice(0, 3).map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Top Categories ({segmentB.name})</p>
                <div className="flex flex-wrap gap-1">
                  {segmentB.topCategories.slice(0, 3).map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Generate Actions Button */}
            <Button 
              className="w-full gap-2" 
              onClick={handleGenerateActions}
            >
              <Zap className="h-4 w-4" />
              Generate Actions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {!activeDimension && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Select a dimension to compare segments
          </div>
        )}
      </CardContent>
    </Card>
  );
}
