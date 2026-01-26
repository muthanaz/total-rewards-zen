/**
 * Queue Item Row Component
 * 
 * Streamlined queue row showing only critical information:
 * - Employee + request type + policy + amount
 * - SLA timer (time remaining or overdue)
 * - Docs status (complete / missing N)
 * - Assignment (owner)
 * - Next step
 * - One-click actions
 */

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileQuestion,
  User,
  UserPlus,
  Flag,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Timer,
  FileText,
  ExternalLink,
  History,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import {
  calculatePriorityScore,
  getPriorityTierStyle,
  getNextStepLabel,
  type PriorityFactors,
} from '@/lib/hrOps/priorityScoring';

// ============================================================================
// TYPES
// ============================================================================

export interface QueueItemData extends PriorityFactors {
  id: string;
  employeeName: string;
  employeeCode?: string;
  requestType: 'request' | 'claim';
  category: string;
  policyName?: string;
  policyId?: string;
  missingDocs?: string[];
  assignedToName?: string;
  assignedToId?: string;
  createdAt: string;
  slaDueAt?: string | null;
  slaReasonCode?: string | null;
}

interface QueueItemRowProps {
  item: QueueItemData;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestDocs: (id: string) => void;
  onAssign: (id: string) => void;
  onEscalate: (id: string) => void;
  onViewAuditTrail: (id: string) => void;
  onViewPolicy?: (policyId: string) => void;
  showSla?: boolean;
  canProcess?: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SlaTimer({ 
  hoursRemaining, 
  isOverdue, 
  isUrgent,
  reasonCode,
}: { 
  hoursRemaining: number | null; 
  isOverdue: boolean;
  isUrgent: boolean;
  reasonCode?: string | null;
}) {
  if (hoursRemaining === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const absHours = Math.abs(hoursRemaining);
  const display = absHours < 24 
    ? `${Math.round(absHours)}h` 
    : `${Math.round(absHours / 24)}d`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-muted-foreground"
        )}>
          <Timer className="w-3 h-3" />
          {isOverdue ? `-${display}` : display}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          {isOverdue 
            ? `SLA breached ${display} ago` 
            : `${display} remaining`}
          {reasonCode && <span className="block text-muted-foreground mt-1">Reason: {reasonCode}</span>}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function DocsStatus({ 
  hasMissing, 
  missingCount,
  missingDocs,
}: { 
  hasMissing: boolean; 
  missingCount: number;
  missingDocs?: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasMissing) {
    return (
      <span className="text-xs text-success flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Complete
      </span>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-1 text-xs text-warning hover:text-warning/80">
          <FileQuestion className="w-3 h-3" />
          <span>{missingCount} missing</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="p-2 rounded-md bg-warning/5 border border-warning/20 text-xs space-y-1">
          {missingDocs?.map((doc, i) => (
            <div key={i} className="flex items-center gap-1 text-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              {doc}
            </div>
          )) || <p className="text-muted-foreground">No details available</p>}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NextStepBadge({ label }: { label: string }) {
  return (
    <Badge variant="outline" className="text-[10px] font-normal">
      {label}
    </Badge>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function QueueItemRow({
  item,
  isSelected,
  onSelect,
  onView,
  onApprove,
  onReject,
  onRequestDocs,
  onAssign,
  onEscalate,
  onViewAuditTrail,
  onViewPolicy,
  showSla = true,
  canProcess = true,
}: QueueItemRowProps) {
  // Calculate priority
  const priority = useMemo(() => calculatePriorityScore(item), [item]);
  const tierStyle = getPriorityTierStyle(priority.tier);
  const nextStep = getNextStepLabel(item);

  // Type badge
  const typeLabel = item.requestType === 'request' ? 'Pre-approval' : 'Reimbursement';
  const typeColor = item.requestType === 'request' 
    ? 'bg-info/10 text-info border-info/20' 
    : 'bg-primary/10 text-primary border-primary/20';

  return (
    <TooltipProvider>
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        isSelected ? "border-primary bg-primary/5" : "border-border/40 hover:border-accent/30",
        priority.tier === 'critical' && "border-l-2 border-l-destructive",
        priority.tier === 'high' && "border-l-2 border-l-warning"
      )}>
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(item.id, !!checked)}
        />

        {/* Priority indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn("text-[10px] shrink-0", tierStyle.className)}>
              {tierStyle.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px]">
            <p className="text-xs font-medium mb-1">Priority Score: {priority.score}</p>
            <p className="text-[10px] text-muted-foreground">{priority.summary}</p>
          </TooltipContent>
        </Tooltip>

        {/* Employee + Request Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">
                {item.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.employeeName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className={cn("text-[10px]", typeColor)}>
                  {typeLabel}
                </Badge>
                <span className="truncate">{item.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Link */}
        {item.policyName && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => item.policyId && onViewPolicy?.(item.policyId)}
                className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-primary truncate max-w-[120px]"
              >
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{item.policyName}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>View policy details</TooltipContent>
          </Tooltip>
        )}

        {/* Amount */}
        <div className="w-24 text-right shrink-0">
          <p className="text-sm font-semibold tabular-nums">
            {item.amount ? formatCurrencyAED(item.amount) : '—'}
          </p>
        </div>

        {/* SLA Timer */}
        {showSla && (
          <div className="w-16 shrink-0">
            <SlaTimer
              hoursRemaining={item.slaHoursRemaining}
              isOverdue={item.isOverdue}
              isUrgent={item.isUrgent}
              reasonCode={item.slaReasonCode}
            />
          </div>
        )}

        {/* Docs Status */}
        <div className="w-24 shrink-0">
          <DocsStatus
            hasMissing={item.hasMissingDocs}
            missingCount={item.missingDocsCount}
            missingDocs={item.missingDocs}
          />
        </div>

        {/* Assignment */}
        <div className="w-24 shrink-0">
          {item.assignedToName ? (
            <div className="flex items-center gap-1 text-xs">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="truncate">{item.assignedToName}</span>
            </div>
          ) : (
            <button
              onClick={() => onAssign(item.id)}
              className="flex items-center gap-1 text-xs text-warning hover:text-warning/80"
            >
              <UserPlus className="w-3 h-3" />
              Unassigned
            </button>
          )}
        </div>

        {/* Next Step */}
        <div className="hidden xl:block w-36 shrink-0">
          <NextStepBadge label={nextStep} />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onView(item.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Details</TooltipContent>
          </Tooltip>

          {canProcess && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-success hover:text-success hover:bg-success/10"
                    onClick={() => onApprove(item.id)}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Approve</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onReject(item.id)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reject</TooltipContent>
              </Tooltip>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onRequestDocs(item.id)}>
                <FileQuestion className="w-4 h-4 mr-2" />
                Request Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssign(item.id)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign / Reassign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEscalate(item.id)}>
                <Flag className="w-4 h-4 mr-2" />
                Escalate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewAuditTrail(item.id)}>
                <History className="w-4 h-4 mr-2" />
                View Audit Trail
              </DropdownMenuItem>
              {item.policyId && onViewPolicy && (
                <DropdownMenuItem onClick={() => onViewPolicy(item.policyId!)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Policy
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default QueueItemRow;
