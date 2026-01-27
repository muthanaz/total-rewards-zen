/**
 * Strategic Decisions & Alerts Card (Next 30 days)
 * 
 * Shows top 3 HIGH PRIORITY or BLOCKED actions requiring CEO/leadership decision:
 * - Title
 * - Impact (Saves/Recovers AED X)
 * - Owner
 * - Status
 * - "Open" button opens detail Sheet with Approve/Reject/Delegate
 * - "View full Action Plan" link
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  CalendarDays, 
  ArrowRight, 
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Sparkles,
  Check,
  X,
  Forward,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

export type ActionStatus = 'backlog' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';

interface ActionItem {
  id: string;
  title: string;
  subtitle?: string;
  expectedImpact: number;
  impactLabel?: string;
  owner: string;
  status: ActionStatus;
  tag?: 'critical' | 'strategic' | 'compliance' | 'high' | 'medium';
}

interface DecisionsActionsCardProps {
  actions: ActionItem[];
  className?: string;
  /** When true, filter to only show High Priority or Blocked items */
  strategicOnly?: boolean;
}

const STATUS_CONFIG: Record<ActionStatus, {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  bg: string;
}> = {
  backlog: {
    icon: Clock,
    label: 'Pending',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
  in_progress: {
    icon: Clock,
    label: 'Active',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  blocked: {
    icon: AlertCircle,
    label: 'Blocked',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Done',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
};

export function DecisionsActionsCard({ actions, className, strategicOnly = false }: DecisionsActionsCardProps) {
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // High-stakes executive actions (mock data for strategic view)
  const executiveActions: ActionItem[] = strategicOnly ? [
    {
      id: 'policy-exception',
      title: 'Policy Exception: Housing Cap Breach (New Hire: VP Sales)',
      subtitle: 'Request: AED 220k (Cap: AED 180k). HR Recommendation: Approve.',
      expectedImpact: 40000,
      impactLabel: 'Cost Impact: AED +40k',
      owner: 'HR Director',
      status: 'blocked',
      tag: 'critical',
    },
    {
      id: 'budget-reallocation',
      title: 'Authorize Budget Reallocation',
      subtitle: "Move AED 150k from 'Unutilized L&D' to 'Wellness Program'.",
      expectedImpact: 0,
      impactLabel: 'Zero Net Cost. Est. Engagement +15%.',
      owner: 'CFO Office',
      status: 'in_progress',
      tag: 'strategic',
    },
    {
      id: 'governance-signoff',
      title: 'Governance Sign-off: 2026 Health Policy v2.0',
      subtitle: "Includes new 'Mental Health' coverage. Approved by Legal.",
      expectedImpact: 0,
      impactLabel: 'Publish to 312 Employees.',
      owner: 'Legal & Compliance',
      status: 'backlog',
      tag: 'compliance',
    },
  ] : actions;

  // Tag badge mapping for governance scenarios
  const getTagBadge = (action: ActionItem): { label: string; className: string } => {
    switch (action.tag) {
      case 'critical':
        return { label: 'Critical', className: 'bg-destructive/10 text-destructive border-destructive/30' };
      case 'strategic':
        return { label: 'Strategic', className: 'bg-purple-500/10 text-purple-600 border-purple-500/30' };
      case 'compliance':
        return { label: 'Compliance', className: 'bg-orange-500/10 text-orange-600 border-orange-500/30' };
      case 'high':
        return { label: 'High', className: 'bg-warning/10 text-warning border-warning/30' };
      default:
        return { label: 'Medium', className: 'bg-muted text-muted-foreground' };
    }
  };

  const top3 = executiveActions.slice(0, 3);

  const handleOpenAction = (action: ActionItem) => {
    setSelectedAction(action);
    setIsSheetOpen(true);
  };

  const handleApprove = () => {
    // In production, this would call an API
    console.log('Approved action:', selectedAction?.id);
    setIsSheetOpen(false);
  };

  const handleReject = () => {
    // In production, this would call an API
    console.log('Rejected action:', selectedAction?.id);
    setIsSheetOpen(false);
  };

  const handleDelegate = () => {
    // In production, this would open a delegation modal
    console.log('Delegating action:', selectedAction?.id);
    setIsSheetOpen(false);
  };

  return (
    <>
      <Card className={cn('card-elevated', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-accent" />
              Governance & Exceptions
              <Badge variant="secondary" className="ml-2 text-xs">
                Awaiting Decision
              </Badge>
            </CardTitle>
            <Link 
              to="/employer/actions"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View full Action Plan
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top3.map((action) => {
              const statusConfig = STATUS_CONFIG[action.status];
              const StatusIcon = statusConfig.icon;
              const tagBadge = getTagBadge(action);

              return (
                <div 
                  key={action.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{action.title}</p>
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px] shrink-0", tagBadge.className)}
                      >
                        {tagBadge.label}
                      </Badge>
                    </div>
                    {action.subtitle && (
                      <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
                        {action.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{action.owner}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className={cn(
                        "font-semibold tabular-nums",
                        action.tag === 'critical' ? 'text-destructive' : 
                        action.tag === 'strategic' ? 'text-purple-600' : 'text-foreground'
                      )}>
                        {action.impactLabel || 'Process Efficiency'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge 
                      variant="outline" 
                      className={cn('gap-1', statusConfig.bg, statusConfig.color)}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenAction(action)}
                    >
                      Open
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {top3.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 text-success" />
                <p className="text-sm font-medium text-foreground">All caught up</p>
                <p className="text-xs">No strategic decisions needed right now</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-lg">{selectedAction?.title}</SheetTitle>
            <SheetDescription>
              Review and take action on this strategic item
            </SheetDescription>
          </SheetHeader>
          
          {selectedAction && (
            <div className="mt-6 space-y-6">
              {/* Status & Owner */}
              <div className="flex items-center gap-4">
                <Badge 
                  variant="outline" 
                  className={cn('gap-1', STATUS_CONFIG[selectedAction.status].bg, STATUS_CONFIG[selectedAction.status].color)}
                >
                  {React.createElement(STATUS_CONFIG[selectedAction.status].icon, { className: "w-3 h-3" })}
                  {STATUS_CONFIG[selectedAction.status].label}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {selectedAction.owner}
                </div>
              </div>

              {/* Impact */}
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">Expected Impact</p>
                <p className="text-xl font-bold text-success tabular-nums">
                  {selectedAction.expectedImpact > 0 
                    ? formatCurrencyAED(selectedAction.expectedImpact, { abbreviate: true })
                    : 'Process Efficiency'
                  }
                </p>
              </div>

              {/* Description placeholder */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Details</p>
                <p className="text-sm text-muted-foreground">
                  This action requires executive review and approval. Upon approval, the assigned owner will be notified to proceed with implementation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button onClick={handleApprove} className="w-full gap-2">
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleReject} className="gap-2">
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button variant="outline" onClick={handleDelegate} className="gap-2">
                    <Forward className="w-4 h-4" />
                    Delegate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
