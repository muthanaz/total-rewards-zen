/**
 * RejectionFrictionPanel - Mini panel showing rejection and friction metrics
 * 
 * Displays: Rejection rate, Missing docs rate, Median approval time
 * Each metric has "View root causes" link to policy insights
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  XCircle, 
  FileX, 
  Clock, 
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { formatPercent, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface FrictionMetric {
  id: string;
  label: string;
  value: number;
  unit: '%' | 'days';
  threshold: { warning: number; critical: number };
  filterKey: string;
  icon: React.ElementType;
}

interface RejectionFrictionPanelProps {
  rejectionRate: number;
  missingDocsRate: number;
  medianApprovalDays: number;
  isDemo?: boolean;
  className?: string;
}

export function RejectionFrictionPanel({
  rejectionRate,
  missingDocsRate,
  medianApprovalDays,
  isDemo,
  className,
}: RejectionFrictionPanelProps) {
  const metrics: FrictionMetric[] = [
    {
      id: 'rejection',
      label: 'Rejection Rate',
      value: rejectionRate,
      unit: '%',
      threshold: { warning: 10, critical: 20 },
      filterKey: 'rejection_reasons',
      icon: XCircle,
    },
    {
      id: 'missing_docs',
      label: 'Missing Docs Rate',
      value: missingDocsRate,
      unit: '%',
      threshold: { warning: 15, critical: 25 },
      filterKey: 'missing_documents',
      icon: FileX,
    },
    {
      id: 'approval_time',
      label: 'Median Approval Time',
      value: medianApprovalDays,
      unit: 'days',
      threshold: { warning: 3, critical: 5 },
      filterKey: 'processing_time',
      icon: Clock,
    },
  ];

  const getStatus = (metric: FrictionMetric): 'success' | 'warning' | 'destructive' => {
    if (metric.value >= metric.threshold.critical) return 'destructive';
    if (metric.value >= metric.threshold.warning) return 'warning';
    return 'success';
  };

  const getStatusColor = (status: 'success' | 'warning' | 'destructive') => {
    switch (status) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'destructive': return 'text-destructive';
    }
  };

  const hasIssues = metrics.some(m => getStatus(m) !== 'success');

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {hasIssues && <AlertTriangle className="w-4 h-4 text-warning" />}
            Rejection & Friction
          </CardTitle>
          {isDemo && <Badge variant="outline" className="text-[10px]">Demo</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const status = getStatus(metric);
          const statusColor = getStatusColor(status);
          
          // Calculate progress for percentage metrics (capped at 100)
          const progressValue = metric.unit === '%' 
            ? Math.min(metric.value, 100) 
            : Math.min((metric.value / metric.threshold.critical) * 100, 100);
          
          return (
            <div key={metric.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", statusColor)} />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <span className={cn("text-sm font-semibold", statusColor)}>
                  {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                  {metric.unit}
                </span>
              </div>
              
              <Progress 
                value={progressValue} 
                className={cn(
                  "h-1.5",
                  status === 'success' && "[&>div]:bg-success",
                  status === 'warning' && "[&>div]:bg-warning",
                  status === 'destructive' && "[&>div]:bg-destructive",
                )}
              />
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground w-full justify-start"
                asChild
              >
                <Link to={`/employer/policy-insights?focus=${metric.filterKey}`}>
                  View root causes
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
