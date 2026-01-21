/**
 * Segment Insights Drawer
 * 
 * Drawer showing detailed insights for a segment value with action CTAs.
 */

import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, ArrowRight, Target, Ghost, Megaphone, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  BarChart3
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { SegmentValueInsights, SpendByCategory, UtilizationByCategory } from '@/hooks/useSegmentData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

interface SegmentInsightsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insights: SegmentValueInsights | null;
  chartData: { spendByCategory: SpendByCategory[]; utilizationByCategory: UtilizationByCategory[] } | null;
  dimensionName: string;
}

const actionIcons = {
  recommendation: Target,
  zombie_review: Ghost,
  comms_campaign: Megaphone,
};

const actionColors = {
  recommendation: 'bg-accent text-accent-foreground hover:bg-accent/90',
  zombie_review: 'bg-amber-500 text-white hover:bg-amber-600',
  comms_campaign: 'bg-emerald-500 text-white hover:bg-emerald-600',
};

export function SegmentInsightsDrawer({ 
  open, 
  onOpenChange, 
  insights, 
  chartData,
  dimensionName 
}: SegmentInsightsDrawerProps) {
  const navigate = useNavigate();
  
  if (!insights) return null;
  
  const { segmentValue, insights: insightsList, suggestedActions } = insights;
  
  const handleAction = (action: typeof suggestedActions[0]) => {
    // Build URL with query params
    const params = new URLSearchParams(action.routeParams);
    const url = `${action.routePath}?${params.toString()}`;
    
    if (action.type === 'comms_campaign') {
      // Comms campaign is "coming soon" per requirements
      toast.info('Coming soon', {
        description: 'Comms campaign functionality will be available in a future update',
      });
      return;
    }
    
    navigate(url);
    onOpenChange(false);
    
    toast.success(`Navigating to ${action.title}`, {
      description: `Filtered for ${segmentValue.name}`,
    });
  };
  
  const utilizationColor = segmentValue.utilizationRate >= 80 ? 'text-success' :
    segmentValue.utilizationRate >= 60 ? 'text-foreground' : 'text-warning';
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            {segmentValue.name} Insights
          </SheetTitle>
          <SheetDescription>
            {dimensionName} segment • {formatInteger(segmentValue.headcount)} employees
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Utilization</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-xl font-bold ${utilizationColor}`}>
                    {formatPercent(segmentValue.utilizationRate)}
                  </p>
                  {segmentValue.utilizationRate >= 80 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : segmentValue.utilizationRate < 60 ? (
                    <TrendingDown className="h-4 w-4 text-warning" />
                  ) : null}
                </div>
                <Progress value={segmentValue.utilizationRate} className="h-1 mt-2" />
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Unused Entitlement</p>
                <p className="text-xl font-bold text-amber-600 mt-1">
                  {formatCurrencyAED(segmentValue.unusedEntitlement)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Zombie spend proxy
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Avg Total Comp</p>
                <p className="text-xl font-bold mt-1">
                  {segmentValue.avgTotalComp 
                    ? formatCurrencyAED(segmentValue.avgTotalComp) 
                    : '—'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Risk Flags</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold">
                    {segmentValue.slaRiskCount + segmentValue.missingDocsCount + segmentValue.overLimitCount}
                  </p>
                  {(segmentValue.slaRiskCount + segmentValue.missingDocsCount) > 3 && (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  SLA, docs, over-limit
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Spend by Category Chart */}
          {chartData && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">Spend by Category</h4>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.spendByCategory} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="category" width={70} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrencyAED(value)}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="spent" name="Spent" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Separator />
          
          {/* Insights */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-accent" />
              Key Insights ({insightsList.length})
            </h4>
            <div className="space-y-3">
              {insightsList.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-accent">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h5 className="font-medium text-sm">{insight.title}</h5>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {insight.metric}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Impact:</span>
                      <span className="font-medium text-amber-600">{insight.impact}</span>
                    </div>
                    {insight.drivers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {insight.drivers.map((driver, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {driver}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Suggested Actions */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-accent" />
              Suggested Actions
            </h4>
            <div className="space-y-2">
              {suggestedActions.map((action) => {
                const Icon = actionIcons[action.type];
                const colorClass = actionColors[action.type];
                
                return (
                  <Button
                    key={action.id}
                    className={`w-full justify-start gap-3 ${colorClass}`}
                    onClick={() => handleAction(action)}
                  >
                    <Icon className="h-4 w-4" />
                    {action.title}
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
