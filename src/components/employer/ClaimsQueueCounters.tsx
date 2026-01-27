/**
 * Claims Queue Counters
 * 
 * Compact 3-counter strip for Claims & Approvals:
 * - Active in Queue (pending/submitted/in_review)
 * - Needs Info (missing docs or info requested)
 * - At Risk (SLA urgent/breached) - only if SLA enabled
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Inbox, FileQuestion, Flame, Info, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RequestWithDetails } from '@/hooks/useSharedRequests';

interface ClaimsQueueCountersProps {
  requests: RequestWithDetails[];
  slaEnabled: boolean;
  onCounterClick?: (filter: 'active' | 'needs_info' | 'at_risk' | 'pending_7d') => void;
}

interface CounterConfig {
  key: 'active' | 'needs_info' | 'at_risk' | 'pending_7d';
  label: string;
  icon: React.ReactNode;
  count: number;
  variant: 'default' | 'warning' | 'danger';
  tooltip: string;
  slaRequired?: boolean;
}

export function ClaimsQueueCounters({ 
  requests, 
  slaEnabled,
  onCounterClick 
}: ClaimsQueueCountersProps) {
  // Calculate counts
  const activeStatuses = ['pending', 'submitted', 'in_review'];
  const activeCount = requests.filter(r => activeStatuses.includes(r.status || '')).length;
  
  const needsInfoCount = requests.filter(r => {
    // Has missing docs OR status indicates waiting for info
    const hasMissingDocs = r.hasMissingDocs;
    const waitingForInfo = r.status === 'info_requested' || r.status === 'pending_employee';
    return hasMissingDocs || waitingForInfo;
  }).length;
  
  const atRiskCount = requests.filter(r => {
    if (!r.sla_due_at) return false;
    if (!activeStatuses.includes(r.status || '')) return false;
    const hoursRemaining = (new Date(r.sla_due_at).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursRemaining <= 24;
  }).length;
  
  // NEW: Pending > 7 days (critical SLA breach)
  const pending7dCount = requests.filter(r => {
    if (!activeStatuses.includes(r.status || '')) return false;
    const createdAt = new Date(r.created_at).getTime();
    const daysAgo = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    return daysAgo > 7;
  }).length;

  const counters: CounterConfig[] = [
    {
      key: 'active',
      label: 'Active in Queue',
      icon: <Inbox className="w-4 h-4" />,
      count: activeCount,
      variant: 'default',
      tooltip: 'Pending, submitted, and in-review items requiring action',
    },
    {
      key: 'needs_info',
      label: 'Needs Info',
      icon: <FileQuestion className="w-4 h-4" />,
      count: needsInfoCount,
      variant: needsInfoCount > 0 ? 'warning' : 'default',
      tooltip: 'Items with missing documentation or awaiting employee response',
    },
    {
      key: 'pending_7d',
      label: 'Pending > 7 Days',
      icon: <AlertTriangle className="w-4 h-4" />,
      count: pending7dCount,
      variant: pending7dCount > 0 ? 'danger' : 'default',
      tooltip: 'Critical SLA breach: items pending for more than 7 days',
    },
    {
      key: 'at_risk',
      label: 'At Risk',
      icon: <Flame className="w-4 h-4" />,
      count: atRiskCount,
      variant: atRiskCount > 0 ? 'danger' : 'default',
      tooltip: 'Items breaching SLA or due within 24 hours',
      slaRequired: true,
    },
  ];

  // Filter out SLA counter if disabled
  const visibleCounters = counters.filter(c => !c.slaRequired || slaEnabled);

  const variantStyles = {
    default: {
      bg: 'bg-muted/50 hover:bg-muted/70',
      text: 'text-foreground',
      icon: 'text-muted-foreground',
    },
    warning: {
      bg: 'bg-warning/10 hover:bg-warning/20',
      text: 'text-warning',
      icon: 'text-warning',
    },
    danger: {
      bg: 'bg-destructive/10 hover:bg-destructive/20',
      text: 'text-destructive',
      icon: 'text-destructive',
    },
  };

  return (
    <div className="flex items-center gap-3">
      {visibleCounters.map((counter) => {
        const styles = variantStyles[counter.variant];
        
        return (
          <Tooltip key={counter.key}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onCounterClick?.(counter.key)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/50 transition-all cursor-pointer',
                  styles.bg,
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                )}
              >
                <span className={cn('opacity-80', styles.icon)}>
                  {counter.icon}
                </span>
                <div className="text-left">
                  <div className={cn('text-2xl font-bold leading-none', styles.text)}>
                    {counter.count}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {counter.label}
                  </div>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs">{counter.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
      
      {/* Total indicator */}
      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        <span>{requests.length} total items</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">
              <strong>Terminology:</strong><br />
              • <strong>Request</strong> = Pre-approval before spend (e.g., business trip, per diem)<br />
              • <strong>Claim</strong> = Reimbursement after spend (invoice/receipt)
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
