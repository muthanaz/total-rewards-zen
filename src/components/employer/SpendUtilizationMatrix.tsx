/**
 * SpendUtilizationMatrix - Bubble chart showing Spend vs Utilization by category
 * 
 * X-axis: Utilization %
 * Y-axis: Spend (AED)
 * Bubble size: Entitled value (represents opportunity size)
 * 
 * Supports two view modes:
 * - Spend Risk: Colors by quadrant position (default)
 * - Rejection Rate: Colors by rejection % (Red = High, Green = Low)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
  Cell,
} from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { ArrowRight, AlertTriangle, FileX, Lightbulb, Download, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export interface CategoryBubble {
  id: string;
  name: string;
  spend: number;
  entitled: number;
  utilization: number;
  rejectionRate?: number; // Overall rejection rate for this category
  nonUserCount?: number; // Employees with AED 0 utilization
  topSegments?: { name: string; spend: number; utilization: number }[];
  rejectionReasons?: { reason: string; count: number; percentage: number }[];
  suggestedAction?: string;
}

interface SpendUtilizationMatrixProps {
  data: CategoryBubble[];
  isDemo?: boolean;
  className?: string;
  onCategoryClick?: (category: CategoryBubble) => void;
}

type ViewMode = 'spend_risk' | 'rejection_rate';

const QUADRANT_COLORS = {
  highSpendHighUtil: 'hsl(var(--success))',      // Good: Well utilized
  highSpendLowUtil: 'hsl(var(--destructive))',   // Bad: Overspend/waste
  lowSpendHighUtil: 'hsl(var(--chart-2))',       // Efficient
  lowSpendLowUtil: 'hsl(var(--warning))',        // Underutilized
};

// Rejection rate color scale: Green (low) -> Yellow (medium) -> Red (high)
function getRejectionRateColor(rejectionRate: number): string {
  if (rejectionRate >= 15) return 'hsl(var(--destructive))';    // High rejection = Policy Friction
  if (rejectionRate >= 8) return 'hsl(var(--warning))';          // Medium
  return 'hsl(var(--success))';                                   // Low rejection = Awareness issue
}

function getQuadrantColor(utilization: number, spend: number, medianSpend: number): string {
  const isHighSpend = spend >= medianSpend;
  const isHighUtil = utilization >= 65;
  
  if (isHighSpend && isHighUtil) return QUADRANT_COLORS.highSpendHighUtil;
  if (isHighSpend && !isHighUtil) return QUADRANT_COLORS.highSpendLowUtil;
  if (!isHighSpend && isHighUtil) return QUADRANT_COLORS.lowSpendHighUtil;
  return QUADRANT_COLORS.lowSpendLowUtil;
}

export function SpendUtilizationMatrix({ data, isDemo, className, onCategoryClick }: SpendUtilizationMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryBubble | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('spend_risk');
  
  // Calculate median for quadrant lines
  const medianSpend = data.length > 0 
    ? data.map(d => d.spend).sort((a, b) => a - b)[Math.floor(data.length / 2)]
    : 0;
  
  // Prepare chart data with z-axis for bubble size
  const chartData = data.map(item => ({
    ...item,
    x: item.utilization,
    y: item.spend,
    z: item.entitled / 100000, // Scale for bubble size
  }));

  // Get bubble color based on current view mode
  const getBubbleColor = (item: CategoryBubble): string => {
    if (viewMode === 'rejection_rate') {
      return getRejectionRateColor(item.rejectionRate ?? 10);
    }
    return getQuadrantColor(item.utilization, item.spend, medianSpend);
  };

  // Handle export non-users
  const handleExportNonUsers = (category: CategoryBubble) => {
    const nonUserCount = category.nonUserCount ?? Math.round((1 - category.utilization / 100) * 312 * 0.3);
    toast.success(`Exporting ${nonUserCount} non-users from ${category.name}`, {
      description: 'Download will start shortly...',
    });
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload as CategoryBubble;
    
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 space-y-2">
        <p className="font-semibold text-sm">{item.name}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Spend:</span>
            <span className="font-medium">{formatCurrencyAED(item.spend, { abbreviate: true })}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Utilization:</span>
            <span className="font-medium">{formatPercent(item.utilization)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Entitled:</span>
            <span className="font-medium">{formatCurrencyAED(item.entitled, { abbreviate: true })}</span>
          </div>
          {viewMode === 'rejection_rate' && item.rejectionRate !== undefined && (
            <div className="flex justify-between gap-4 pt-1 border-t">
              <span className="text-muted-foreground">Rejection Rate:</span>
              <span className={cn(
                "font-medium",
                item.rejectionRate >= 15 ? "text-destructive" : 
                item.rejectionRate >= 8 ? "text-warning" : "text-success"
              )}>
                {formatPercent(item.rejectionRate)}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground pt-2 border-t">Click to drill down</p>
      </div>
    );
  };

  return (
    <>
      <Card className={cn("border-border/50", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Spend vs Utilization Matrix
                <InfoTooltip 
                  formula="X: Utilization %, Y: Spend AED, Bubble: Entitled value" 
                  dataSource="benefit_entitlements + requests" 
                />
              </CardTitle>
              <CardDescription>Click any bubble to see category drilldown</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                <Label htmlFor="view-mode" className="text-xs text-muted-foreground cursor-pointer">
                  View by Rejection Rate
                </Label>
                <Switch 
                  id="view-mode" 
                  checked={viewMode === 'rejection_rate'}
                  onCheckedChange={(checked) => setViewMode(checked ? 'rejection_rate' : 'spend_risk')}
                />
              </div>
              {isDemo && <Badge variant="outline" className="text-xs">Demo</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] relative">
            {/* Quadrant background colors */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{ margin: '40px 60px 40px 60px' }}>
              {/* Background quadrant fills */}
              <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-success/5" />
              <div className="absolute right-0 top-0 w-1/2 h-1/2 bg-chart-2/5" />
              <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-muted/20" />
              <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-destructive/5" />
              
              {/* Quadrant divider lines */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/40" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-border/40" />
              
              {/* Top-Left: Star Performers (High Util, Low Spend) */}
              <div className="absolute left-[25%] top-[25%] -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-success/30 select-none whitespace-nowrap">
                Star Performers
              </div>
              {/* Top-Right: High Value / High Cost (High Util, High Spend) */}
              <div className="absolute left-[75%] top-[25%] -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-chart-2/30 select-none whitespace-nowrap">
                High Value / High Cost
              </div>
              {/* Bottom-Left: Low Impact (Low Util, Low Spend) */}
              <div className="absolute left-[25%] top-[75%] -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground/20 select-none whitespace-nowrap">
                Low Impact
              </div>
              {/* Bottom-Right: Optimization Candidates (Low Util, High Spend) */}
              <div className="absolute left-[75%] top-[75%] -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-destructive/30 select-none whitespace-nowrap">
                Optimization Candidates
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Utilization" 
                  unit="%" 
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  label={{ value: 'Utilization %', position: 'bottom', offset: 0, fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Spend" 
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  label={{ value: 'Spend (AED)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="z" range={[100, 800]} name="Entitled" />
                <ReferenceLine x={65} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.5} />
                <ReferenceLine y={medianSpend} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter 
                  data={chartData} 
                  cursor="pointer"
                  onClick={(e) => {
                    if (e) {
                      const category = e as CategoryBubble;
                      if (onCategoryClick) {
                        onCategoryClick(category);
                      } else {
                        setSelectedCategory(category);
                      }
                    }
                  }}
                >
                  {chartData.map((entry, index) => {
                    const color = getBubbleColor(entry);
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={color}
                        fillOpacity={0.7}
                        stroke={color}
                        strokeWidth={2}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend - Dynamic based on view mode */}
          {viewMode === 'spend_risk' ? (
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS.highSpendHighUtil }} />
                <span className="text-muted-foreground">Well Utilized</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS.lowSpendHighUtil }} />
                <span className="text-muted-foreground">Efficient</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS.lowSpendLowUtil }} />
                <span className="text-muted-foreground">Underutilized</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS.highSpendLowUtil }} />
                <span className="text-muted-foreground">Overspend Risk</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-muted-foreground">Low Rejection (&lt;8%) — Awareness Issue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Medium (8-15%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">High Rejection (&gt;15%) — Policy Friction</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drilldown Modal */}
      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCategory?.name} Analysis
              <Badge 
                variant={selectedCategory && selectedCategory.utilization >= 65 ? 'default' : 'destructive'}
                className="text-xs"
              >
                {selectedCategory && formatPercent(selectedCategory.utilization)} utilized
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Category breakdown and friction analysis
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Top Segments */}
            {selectedCategory?.topSegments && selectedCategory.topSegments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Top 3 Segments Driving Cost</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Segment</TableHead>
                      <TableHead className="text-xs text-right">Spend</TableHead>
                      <TableHead className="text-xs text-right">Util %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCategory.topSegments.map((seg, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{seg.name}</TableCell>
                        <TableCell className="text-sm text-right">{formatCurrencyAED(seg.spend, { abbreviate: true })}</TableCell>
                        <TableCell className="text-sm text-right">{formatPercent(seg.utilization)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Rejection Reasons */}
            {selectedCategory?.rejectionReasons && selectedCategory.rejectionReasons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Top 3 Rejection Reasons
                </h4>
                <div className="space-y-2">
                  {selectedCategory.rejectionReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded">
                      <span>{reason.reason}</span>
                      <Badge variant="outline" className="text-xs">
                        {reason.count} ({formatPercent(reason.percentage)})
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Action */}
            {selectedCategory?.suggestedAction && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Suggested Action</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedCategory.suggestedAction}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Export Non-Users Action */}
            {selectedCategory && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Non-Users</p>
                      <p className="text-xs text-muted-foreground">
                        {formatInteger(selectedCategory.nonUserCount ?? Math.round((1 - selectedCategory.utilization / 100) * 312 * 0.3))} employees with AED 0 utilization
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5"
                    onClick={() => handleExportNonUsers(selectedCategory)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Non-Users
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to={`/employer/recommendations?category=${selectedCategory?.id}&source=spend-matrix`}>
                  Create Action for {selectedCategory?.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
