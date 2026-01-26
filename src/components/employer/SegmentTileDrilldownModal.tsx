/**
 * SegmentTileDrilldownModal - Modal for segment tile clicks
 * 
 * Shows:
 * - Top 3 cost categories
 * - Top 3 friction reasons
 * - Suggested action templates (buttons)
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign,
  AlertTriangle,
  Megaphone,
  FileText,
  Settings,
  ArrowRight,
  TrendingDown,
  Users,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { SegmentDimension, DRIVER_DEFINITIONS, DriverType } from '@/hooks/useSegmentData';
import { toast } from 'sonner';

interface SegmentTileDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dimension: SegmentDimension | null;
}

interface FrictionReason {
  id: DriverType;
  name: string;
  percentage: number;
  count: number;
}

interface CostCategory {
  name: string;
  cost: number;
  unusedValue: number;
  utilizationRate: number;
}

const ACTION_TEMPLATES = [
  {
    id: 'awareness_campaign',
    title: 'Launch Awareness Campaign',
    icon: Megaphone,
    description: 'Target low-utilization segments with comms',
  },
  {
    id: 'policy_simplification',
    title: 'Simplify Policy',
    icon: FileText,
    description: 'Reduce complexity and confusion',
  },
  {
    id: 'friction_fix',
    title: 'Reduce Friction',
    icon: Settings,
    description: 'Fix docs and approval bottlenecks',
  },
];

export function SegmentTileDrilldownModal({ 
  open, 
  onOpenChange, 
  dimension 
}: SegmentTileDrilldownModalProps) {
  const navigate = useNavigate();
  
  // Aggregate top cost categories from dimension values
  const topCostCategories = useMemo((): CostCategory[] => {
    if (!dimension) return [];
    
    const categoryMap: Record<string, CostCategory> = {};
    
    dimension.values.forEach(v => {
      v.topCategories.forEach((cat, idx) => {
        if (!categoryMap[cat]) {
          categoryMap[cat] = {
            name: cat,
            cost: 0,
            unusedValue: 0,
            utilizationRate: 0,
          };
        }
        // Simulate cost distribution (in production, this would come from real data)
        const weight = 1 / (idx + 1);
        categoryMap[cat].cost += v.claimsCost * weight * 0.3;
        categoryMap[cat].unusedValue += v.unusedEntitlement * weight * 0.3;
        categoryMap[cat].utilizationRate = (categoryMap[cat].utilizationRate + v.utilizationRate) / 2;
      });
    });
    
    return Object.values(categoryMap)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 3);
  }, [dimension]);
  
  // Aggregate friction reasons from driver data
  const topFrictionReasons = useMemo((): FrictionReason[] => {
    if (!dimension) return [];
    
    const reasonMap: Record<DriverType, { total: number; count: number }> = {} as any;
    
    dimension.values.forEach(v => {
      v.drivers?.forEach(driver => {
        if (!reasonMap[driver.id]) {
          reasonMap[driver.id] = { total: 0, count: 0 };
        }
        reasonMap[driver.id].total += driver.percentage;
        reasonMap[driver.id].count += 1;
      });
    });
    
    return Object.entries(reasonMap)
      .map(([id, data]) => ({
        id: id as DriverType,
        name: DRIVER_DEFINITIONS[id as DriverType]?.name || id,
        percentage: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [dimension]);
  
  const handleActionClick = (actionId: string) => {
    if (!dimension) return;
    
    const params = new URLSearchParams({
      prefill_action: actionId,
      prefill_segment: dimension.name,
      prefill_rationale: `Address ${dimension.name} segment with ${actionId.replace('_', ' ')}`,
    });
    
    navigate(`/employer/recommendations?${params.toString()}`);
    onOpenChange(false);
    toast.success('Creating action from template');
  };
  
  const handleViewFullDrilldown = () => {
    if (!dimension) return;
    navigate(`/employer/segments?dimension=${dimension.id}`);
    onOpenChange(false);
  };
  
  if (!dimension) return null;
  
  const utilizationColor = dimension.utilizationRate >= 75 ? 'text-success' :
    dimension.utilizationRate >= 50 ? 'text-foreground' : 'text-warning';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <dimension.icon className="h-5 w-5 text-accent" />
            {dimension.name}
          </DialogTitle>
          <DialogDescription>
            Quick analysis of cost drivers and friction points
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{formatInteger(dimension.headcount)}</p>
              <p className="text-xs text-muted-foreground">Headcount</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <TrendingDown className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className={cn("text-lg font-bold", utilizationColor)}>
                {formatPercent(dimension.utilizationRate)}
              </p>
              <p className="text-xs text-muted-foreground">Utilization</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <DollarSign className="h-4 w-4 mx-auto text-warning mb-1" />
              <p className="text-lg font-bold text-warning">
                {formatCurrencyAED(dimension.unusedEntitlement, { abbreviate: true })}
              </p>
              <p className="text-xs text-muted-foreground">Unrealized</p>
            </div>
          </div>
          
          {/* Top 3 Cost Categories */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" />
              Top 3 Cost Categories
            </h4>
            <div className="space-y-2">
              {topCostCategories.map((cat, idx) => (
                <div 
                  key={cat.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                      Cost: <span className="font-medium text-foreground">
                        {formatCurrencyAED(cat.cost, { abbreviate: true })}
                      </span>
                    </span>
                    <span className="text-warning">
                      Unused: {formatCurrencyAED(cat.unusedValue, { abbreviate: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top 3 Friction Reasons */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Top 3 Friction Reasons
            </h4>
            <div className="space-y-2">
              {topFrictionReasons.map((reason) => (
                <div 
                  key={reason.id}
                  className="p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{reason.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {reason.percentage}% contribution
                    </Badge>
                  </div>
                  <Progress value={reason.percentage} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Suggested Action Templates */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Suggested Actions</h4>
            <div className="grid grid-cols-1 gap-2">
              {ACTION_TEMPLATES.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => handleActionClick(action.id)}
                  >
                    <Icon className="h-4 w-4 mr-3 text-accent shrink-0" />
                    <div className="text-left flex-1">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* View Full Drilldown */}
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleViewFullDrilldown}
          >
            View Full Analysis
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
