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
  expectedImpact: number;
  owner: string;
  status: ActionStatus;
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

  // Filter to only High Priority (blocked or in_progress with high impact) items if strategicOnly
  const filteredActions = strategicOnly
    ? actions.filter(a => a.status === 'blocked' || (a.status === 'in_progress' && a.expectedImpact > 50000))
    : actions;
  
  const top3 = filteredActions.slice(0, 3);

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
              Strategic Decisions & Alerts
              <Badge variant="secondary" className="ml-2 text-xs">
                Next 30 days
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
              const impactValue = Math.abs(action.expectedImpact);

              return (
                <div 
                  key={action.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{action.title}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{action.owner}</span>
                        </div>
                        <span>•</span>
                        <span className="font-medium text-success tabular-nums">
                          {impactValue > 0 
                            ? `Recoverable: ${formatCurrencyAED(impactValue, { abbreviate: true })}`
                            : 'Process Efficiency'
                          }
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
