/**
 * Today's Priorities Strip - HR Ops Dashboard
 * 
 * Clickable priority chips that deep-link to Claims & Approvals with filters applied.
 */

import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  FileQuestion, 
  TrendingUp, 
  FileText,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityItem {
  id: string;
  label: string;
  count: number;
  path: string;
  icon: React.ElementType;
  variant: 'destructive' | 'warning' | 'info' | 'default';
}

interface TodaysPrioritiesStripProps {
  slaAtRisk: number;
  missingDocs: number;
  highValue: number;
  policyUpdates: number;
}

export function TodaysPrioritiesStrip({
  slaAtRisk,
  missingDocs,
  highValue,
  policyUpdates,
}: TodaysPrioritiesStripProps) {
  const priorities: PriorityItem[] = [
    {
      id: 'sla',
      label: 'SLA at Risk',
      count: slaAtRisk,
      path: '/employer/claims?tab=sla_risk&due=24h',
      icon: Flame,
      variant: 'destructive',
    },
    {
      id: 'docs',
      label: 'Missing Docs',
      count: missingDocs,
      path: '/employer/claims?tab=missing_docs',
      icon: FileQuestion,
      variant: 'warning',
    },
    {
      id: 'high',
      label: 'High Value',
      count: highValue,
      path: '/employer/claims?tab=high_value',
      icon: TrendingUp,
      variant: 'info',
    },
    {
      id: 'policy',
      label: 'Policy Updates Due',
      count: policyUpdates,
      path: '/employer/policies?tab=drafts',
      icon: FileText,
      variant: 'default',
    },
  ];

  const getVariantClasses = (variant: PriorityItem['variant'], hasCount: boolean) => {
    if (!hasCount) return 'bg-muted/50 text-muted-foreground border-muted cursor-default';
    
    switch (variant) {
      case 'destructive':
        return 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20';
      case 'info':
        return 'bg-info/10 text-info border-info/30 hover:bg-info/20';
      default:
        return 'bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80';
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">Today's Priorities:</span>
      {priorities.map((priority) => {
        const hasCount = priority.count > 0;
        const content = (
          <Badge
            key={priority.id}
            variant="outline"
            className={cn(
              'gap-1.5 px-3 py-1.5 transition-colors cursor-pointer',
              getVariantClasses(priority.variant, hasCount)
            )}
          >
            <priority.icon className="w-3.5 h-3.5" />
            <span className="font-semibold">{priority.count}</span>
            <span>{priority.label}</span>
          </Badge>
        );

        if (hasCount) {
          return (
            <Link key={priority.id} to={priority.path}>
              {content}
            </Link>
          );
        }

        return content;
      })}
    </div>
  );
}
