/**
 * Segment Drilldown Drawer
 * 
 * Opens on every chart/insight click with:
 * - Segment definition (who is included)
 * - Member list table (Name (Grade), Dept, Location)
 * - Key metrics (utilization, leakage, pending requests)
 * - Primary CTA: "Send Communication"
 * - Secondary CTA: "Create Action"
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  ClipboardPlus, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  FileText,
  Building2,
  MapPin,
  Filter,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { MockEmployee, SegmentFilters, SegmentMetrics } from './types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export interface DrilldownContext {
  title: string;
  description: string;
  source: 'benefit' | 'watchlist' | 'chart' | 'filter';
  filterApplied?: string;
}

interface SegmentDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: DrilldownContext;
  filters: SegmentFilters;
  metrics: SegmentMetrics;
  employees: MockEmployee[];
  segmentName?: string;
}

// Compute display metrics for drilldown
function computeDrilldownMetrics(employees: MockEmployee[]) {
  if (employees.length === 0) {
    return {
      headcount: 0,
      utilization: 0,
      leakage: 0,
      pendingRequests: 0,
      atRiskCount: 0,
    };
  }

  const totalBudget = employees.reduce((sum, e) => sum + e.budgetAllocated, 0);
  const totalSpent = employees.reduce((sum, e) => sum + e.amountSpent, 0);
  const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const leakage = totalBudget - totalSpent;
  
  // Simulate pending requests (mock: ~10% of employees have pending)
  const pendingRequests = Math.round(employees.length * 0.1);
  
  // At-risk count (0% utilization)
  const atRiskCount = employees.filter(e => e.amountSpent === 0).length;

  return {
    headcount: employees.length,
    utilization,
    leakage,
    pendingRequests,
    atRiskCount,
  };
}

// Build filter description from active filters
function buildFilterDescription(filters: SegmentFilters): string[] {
  const parts: string[] = [];
  
  if (filters.departments.length > 0) {
    parts.push(`Departments: ${filters.departments.join(', ')}`);
  }
  if (filters.grades.length > 0) {
    parts.push(`Grades: ${filters.grades.join(', ')}`);
  }
  if (filters.nationalities.length > 0) {
    parts.push(`Nationalities: ${filters.nationalities.join(', ')}`);
  }
  if (filters.tenure) {
    parts.push(`Tenure: ${filters.tenure}`);
  }
  if (filters.riskLevel) {
    parts.push(`Risk Level: ${filters.riskLevel}`);
  }
  if (filters.benefitType) {
    parts.push(`Benefit: ${filters.benefitType}`);
  }
  
  return parts.length > 0 ? parts : ['All employees'];
}

export function SegmentDrilldownDrawer({
  open,
  onOpenChange,
  context,
  filters,
  metrics,
  employees,
  segmentName,
}: SegmentDrilldownDrawerProps) {
  const navigate = useNavigate();
  const drilldownMetrics = computeDrilldownMetrics(employees);
  const filterParts = buildFilterDescription(filters);
  
  // Primary CTA: Send Communication
  const handleSendCommunication = () => {
    const audience = segmentName || context.title;
    navigate(`/employer/communications?create=true&audience=${encodeURIComponent(audience)}&count=${employees.length}`);
    onOpenChange(false);
    toast.success('Opening communication composer', {
      description: `Pre-filled for ${employees.length} employees`,
    });
  };
  
  // Secondary CTA: Create Action
  const handleCreateAction = () => {
    const source = segmentName || context.title;
    navigate(`/employer/actions?create=true&source=segments&segment=${encodeURIComponent(source)}&count=${employees.length}`);
    onOpenChange(false);
    toast.success('Opening action creator', {
      description: 'Assign owner and due date',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b bg-gradient-to-r from-accent/5 to-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2 bg-accent/10 border-accent/30">
                <Filter className="h-3 w-3 mr-1" />
                {context.source === 'benefit' ? 'Benefit Drilldown' :
                 context.source === 'watchlist' ? 'Watchlist Segment' :
                 context.source === 'chart' ? 'Chart Drilldown' : 'Filtered Segment'}
              </Badge>
              <SheetTitle className="text-xl">{context.title}</SheetTitle>
              <SheetDescription className="mt-1">
                {context.description}
              </SheetDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">{employees.length}</div>
              <div className="text-xs text-muted-foreground">employees</div>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Segment Definition */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Segment Definition
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterParts.map((part, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {part}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                icon={Users}
                label="Headcount"
                value={drilldownMetrics.headcount.toString()}
                iconClassName="text-primary"
              />
              <MetricCard
                icon={TrendingUp}
                label="Utilization"
                value={formatPercent(drilldownMetrics.utilization)}
                iconClassName={drilldownMetrics.utilization >= 60 ? 'text-success' : 'text-warning'}
              />
              <MetricCard
                icon={DollarSign}
                label="Budget Leakage"
                value={formatCurrencyAED(drilldownMetrics.leakage, { abbreviate: true })}
                iconClassName="text-warning"
              />
              <MetricCard
                icon={AlertTriangle}
                label="At Risk"
                value={drilldownMetrics.atRiskCount.toString()}
                iconClassName="text-destructive"
              />
            </div>

            <Separator />

            {/* Member List Table */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Member List
                <span className="text-muted-foreground font-normal">
                  (showing first 20)
                </span>
              </h4>
              
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Name (Grade)</TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Dept
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Location
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-semibold">Util %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {employees.slice(0, 20).map((emp, index) => {
                        const utilPct = emp.budgetAllocated > 0 
                          ? Math.round((emp.amountSpent / emp.budgetAllocated) * 100)
                          : 0;
                        
                        return (
                          <motion.tr
                            key={emp.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="group hover:bg-muted/30"
                          >
                            <TableCell className="font-medium">
                              {emp.name}
                              <Badge variant="outline" className="ml-2 text-[10px]">
                                {emp.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {emp.department}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              Dubai
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              <span className={cn(
                                'font-semibold',
                                utilPct >= 60 ? 'text-success' :
                                utilPct >= 30 ? 'text-foreground' : 'text-warning'
                              )}>
                                {utilPct}%
                              </span>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
                
                {employees.length > 20 && (
                  <div className="p-2 text-center text-xs text-muted-foreground border-t bg-muted/30">
                    +{employees.length - 20} more employees
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sticky Footer with CTAs */}
        <div className="border-t p-4 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 gap-2" 
              onClick={handleSendCommunication}
              disabled={employees.length === 0}
            >
              <Mail className="h-4 w-4" />
              Send Communication
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={handleCreateAction}
              disabled={employees.length === 0}
            >
              <ClipboardPlus className="h-4 w-4" />
              Create Action
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Target {employees.length} employees in this segment
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Small metric card for the drilldown
function MetricCard({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconClassName?: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-4 w-4', iconClassName)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
    </Card>
  );
}
