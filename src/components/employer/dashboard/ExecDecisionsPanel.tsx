/**
 * Executive Decisions Panel (Action Plan Preview)
 * 
 * Shows 3 highest-impact recommended actions with:
 * - Impact (AED)
 * - Effort (Low/Med/High)
 * - Owner
 * - Due Date
 * - Primary CTA: "Create/Assign Action"
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Lightbulb, 
  ArrowRight, 
  User,
  Calendar,
  Zap,
  Clock,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';

export type EffortLevel = 'low' | 'medium' | 'high';

export interface RecommendedAction {
  id: string;
  title: string;
  description?: string;
  impactAED: number;
  effort: EffortLevel;
  owner?: string;
  dueDate?: Date | string;
  category?: string;
  status?: 'draft' | 'pending' | 'assigned' | 'in_progress';
}

interface ExecDecisionsPanelProps {
  actions: RecommendedAction[];
  onAssignAction?: (actionId: string) => void;
  onCreateAction?: () => void;
  className?: string;
}

const EFFORT_CONFIG: Record<EffortLevel, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-success', bg: 'bg-success/10' },
  medium: { label: 'Med', color: 'text-warning', bg: 'bg-warning/10' },
  high: { label: 'High', color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function ExecDecisionsPanel({
  actions,
  onAssignAction,
  onCreateAction,
  className,
}: ExecDecisionsPanelProps) {
  const [selectedAction, setSelectedAction] = useState<RecommendedAction | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const top3 = actions.slice(0, 3);
  const totalImpact = top3.reduce((sum, a) => sum + a.impactAED, 0);

  const handleOpenAction = (action: RecommendedAction) => {
    setSelectedAction(action);
    setIsSheetOpen(true);
  };

  const formatDueDate = (date: Date | string | undefined) => {
    if (!date) return 'No due date';
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'MMM d, yyyy');
  };

  return (
    <>
      <Card className={cn('border-border/50', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent" />
              Top Recommended Actions
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs tabular-nums">
                Est. {formatCurrencyAED(totalImpact, { abbreviate: true })} impact
              </Badge>
              <Link to="/employer/actions">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  View Action Plan
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top3.map((action, index) => {
              const effortConfig = EFFORT_CONFIG[action.effort];
              
              return (
                <div 
                  key={action.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:border-accent/30 transition-colors"
                >
                  {/* Rank indicator */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-sm shrink-0">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1 line-clamp-1">{action.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {/* Impact */}
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-success" />
                        <span className="font-semibold text-success tabular-nums">
                          {formatCurrencyAED(action.impactAED, { abbreviate: true })}
                        </span>
                      </div>
                      
                      {/* Effort */}
                      <Badge 
                        variant="outline" 
                        className={cn('text-[10px] gap-1', effortConfig.bg, effortConfig.color)}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        {effortConfig.label} Effort
                      </Badge>

                      {/* Owner */}
                      {action.owner && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{action.owner}</span>
                        </div>
                      )}

                      {/* Due Date */}
                      {action.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDueDate(action.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button 
                    size="sm" 
                    className="gap-1.5 shrink-0"
                    onClick={() => handleOpenAction(action)}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {action.owner ? 'View' : 'Assign'}
                  </Button>
                </div>
              );
            })}

            {top3.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No pending recommendations</p>
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
              Review and assign this recommended action
            </SheetDescription>
          </SheetHeader>
          
          {selectedAction && (
            <div className="mt-6 space-y-6">
              {/* Impact highlight */}
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">Estimated Impact</p>
                <p className="text-2xl font-bold text-success tabular-nums">
                  {formatCurrencyAED(selectedAction.impactAED)}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Effort Level</p>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      EFFORT_CONFIG[selectedAction.effort].bg,
                      EFFORT_CONFIG[selectedAction.effort].color
                    )}
                  >
                    {EFFORT_CONFIG[selectedAction.effort].label}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="text-sm font-medium">
                    {formatDueDate(selectedAction.dueDate)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedAction.description && (
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAction.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button 
                  className="w-full gap-2"
                  onClick={() => {
                    onAssignAction?.(selectedAction.id);
                    setIsSheetOpen(false);
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  Assign Action
                </Button>
                <Link to={`/employer/actions?open=${selectedAction.id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowRight className="w-4 h-4" />
                    View Full Details
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
