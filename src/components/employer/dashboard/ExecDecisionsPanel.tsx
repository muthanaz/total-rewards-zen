/**
 * Executive Decisions Panel (Action Plan Preview)
 * 
 * PROMPT 07: Board-ready action cards with:
 * - Lever type (Policy/Vendor/Comms/Process)
 * - Impact range (Low–High AED)
 * - Confidence band
 * - Owner + Due Date
 * - Mechanism one-liner
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
  Cog,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';

// Lever types for PROMPT 07
export type LeverType = 'policy' | 'vendor' | 'comms' | 'process';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

const LEVER_CONFIG: Record<LeverType, { label: string; color: string; bgColor: string; icon: string }> = {
  policy: { label: 'Policy', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30', icon: '📋' },
  vendor: { label: 'Vendor', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30', icon: '🤝' },
  comms: { label: 'Comms', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30', icon: '📣' },
  process: { label: 'Process', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', icon: '⚙️' },
};

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string; color: string; bgColor: string }> = {
  high: { label: 'High', color: 'text-success', bgColor: 'bg-success/10' },
  medium: { label: 'Med', color: 'text-warning', bgColor: 'bg-warning/10' },
  low: { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

export interface RecommendedAction {
  id: string;
  title: string;
  description?: string;
  /** Impact range - use min/max for non-high confidence */
  impactAEDMin: number;
  impactAEDMax: number;
  /** @deprecated Use impactAEDMin/Max */
  impactAED?: number;
  /** Lever type categorization */
  leverType: LeverType;
  /** Confidence band */
  confidence: ConfidenceLevel;
  /** Mechanism: what changes operationally */
  mechanism: string;
  owner?: string;
  ownerRole?: string;
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

export function ExecDecisionsPanel({
  actions,
  onAssignAction,
  onCreateAction,
  className,
}: ExecDecisionsPanelProps) {
  const [selectedAction, setSelectedAction] = useState<RecommendedAction | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const top3 = actions.slice(0, 3);
  
  // Only include actions with financial impact > 0 in the header total
  // Use min values for conservative estimates
  const financialImpactMin = top3.reduce((sum, a) => sum + (a.impactAEDMax > 0 ? a.impactAEDMin : 0), 0);
  const financialImpactMax = top3.reduce((sum, a) => sum + a.impactAEDMax, 0);
  const showRange = financialImpactMin !== financialImpactMax;

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
                Est. impact: {showRange 
                  ? `${formatCurrencyAED(financialImpactMin, { abbreviate: true })}–${formatCurrencyAED(financialImpactMax, { abbreviate: true })}`
                  : formatCurrencyAED(financialImpactMax, { abbreviate: true })
                }
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
              const leverConfig = LEVER_CONFIG[action.leverType];
              const confidenceConfig = CONFIDENCE_CONFIG[action.confidence];
              const hasFinancialImpact = action.impactAEDMax > 0;
              const isSinglePoint = action.impactAEDMin === action.impactAEDMax || action.confidence === 'high';
              
              return (
                <div 
                  key={action.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-accent/30 transition-colors min-h-[100px]"
                >
                  {/* Rank indicator */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-sm shrink-0">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title Row */}
                    <p className="font-medium text-sm line-clamp-1">{action.title}</p>
                    
                    {/* Badges Row: Lever + Confidence */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px]", leverConfig.bgColor, leverConfig.color)}>
                        {leverConfig.icon} {leverConfig.label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px]", confidenceConfig.bgColor, confidenceConfig.color)}>
                        {confidenceConfig.label} conf
                      </Badge>
                    </div>
                    
                    {/* Metadata Row: Owner, Date */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {action.owner && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{action.owner}{action.ownerRole && ` (${action.ownerRole})`}</span>
                        </div>
                      )}
                      {action.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDueDate(action.dueDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Impact Row - Range Display */}
                    <div className="flex items-center gap-1">
                      <Zap className={cn('w-3 h-3', hasFinancialImpact ? 'text-success' : 'text-muted-foreground')} />
                      {hasFinancialImpact ? (
                        <>
                          <span className="text-xs font-semibold text-success tabular-nums">
                            {isSinglePoint 
                              ? formatCurrencyAED(action.impactAEDMax, { abbreviate: true })
                              : `${formatCurrencyAED(action.impactAEDMin, { abbreviate: true })}–${formatCurrencyAED(action.impactAEDMax, { abbreviate: true })}`
                            }
                          </span>
                          <span className="text-xs text-muted-foreground">est. impact</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          AED 0 (Experience/clarity improvement)
                        </span>
                      )}
                    </div>

                    {/* Mechanism Row */}
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Cog className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{action.mechanism}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button 
                    size="sm" 
                    className="gap-1.5 shrink-0 min-w-[80px]"
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
              {/* Lever + Confidence badges */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", LEVER_CONFIG[selectedAction.leverType].bgColor, LEVER_CONFIG[selectedAction.leverType].color)}>
                  {LEVER_CONFIG[selectedAction.leverType].icon} {LEVER_CONFIG[selectedAction.leverType].label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", CONFIDENCE_CONFIG[selectedAction.confidence].bgColor, CONFIDENCE_CONFIG[selectedAction.confidence].color)}>
                  {CONFIDENCE_CONFIG[selectedAction.confidence].label} confidence
                </Badge>
              </div>

              {/* Impact highlight - Range */}
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">Estimated Impact</p>
                <p className="text-2xl font-bold text-success tabular-nums">
                  {selectedAction.impactAEDMin === selectedAction.impactAEDMax || selectedAction.confidence === 'high'
                    ? formatCurrencyAED(selectedAction.impactAEDMax)
                    : `${formatCurrencyAED(selectedAction.impactAEDMin)} – ${formatCurrencyAED(selectedAction.impactAEDMax)}`
                  }
                </p>
              </div>

              {/* Mechanism */}
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Cog className="w-3.5 h-3.5" />
                  Mechanism
                </p>
                <p className="text-sm">{selectedAction.mechanism}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Owner</p>
                  <p className="text-sm font-medium">
                    {selectedAction.owner || 'Unassigned'}
                    {selectedAction.ownerRole && (
                      <span className="text-muted-foreground font-normal"> ({selectedAction.ownerRole})</span>
                    )}
                  </p>
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
