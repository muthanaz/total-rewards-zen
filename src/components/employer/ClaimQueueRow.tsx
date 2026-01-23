/**
 * ClaimQueueRow - Type-aware row component for Claims Ops queue
 * 
 * Displays claim/request info with type-specific columns:
 * - Leave: Date range, duration
 * - Claim/Reimbursement: Amount, receipts
 * - Pre-approval: Requested amount, urgency
 * - Support/Question: Priority, response time
 */

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Mail,
  Timer,
  AlertCircle,
  FileQuestion,
  Calendar,
  Clock,
  User,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClaimsTypeChip } from './ClaimsTypeChip';
import { WaitingOnBadge, SLAPausedBadge } from '@/components/shared/WaitingOnBadge';
import { getStatusBadgeClasses, getStatusLabel } from '@/lib/statusStyles';
import { isSlaPaused } from '@/lib/crossPortalContract';
import type { RequestWithDetails } from '@/hooks/useSharedRequests';

interface ClaimQueueRowProps {
  request: RequestWithDetails;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onRequestDocs?: (id: string) => void;
  slaEnabled: boolean;
  canProcess: boolean;
}

// Type-specific display helpers
type RequestCategory = 'leave' | 'claim' | 'pre_approval' | 'support' | 'general';

function getRequestCategory(request: RequestWithDetails): RequestCategory {
  const type = request.request_type?.toLowerCase() || '';
  const category = request.category?.toLowerCase() || '';
  
  if (category.includes('leave') || type === 'leave') return 'leave';
  if (type === 'request' || type === 'pre_approval') return 'pre_approval';
  if (type === 'question' || type === 'support') return 'support';
  if (type === 'claim' || type === 'reimbursement') return 'claim';
  return 'general';
}

// SLA Badge with pause awareness
function SLABadge({ 
  request, 
  slaEnabled 
}: { 
  request: RequestWithDetails; 
  slaEnabled: boolean;
}) {
  if (!slaEnabled || !request.sla_due_at) return null;
  
  // Check if SLA is paused
  const isPaused = isSlaPaused(request.status);
  if (isPaused) {
    return (
      <Badge variant="outline" className="gap-1 text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
        <Pause className="w-3 h-3" />
        Paused
      </Badge>
    );
  }
  
  // Calculate time remaining
  const terminalStatuses = ['approved', 'rejected', 'paid', 'closed', 'cancelled'];
  if (terminalStatuses.includes(request.status || '')) return null;
  
  const now = new Date();
  const sla = new Date(request.sla_due_at);
  const hoursRemaining = (sla.getTime() - now.getTime()) / (1000 * 60 * 60);
  const daysRemaining = hoursRemaining / 24;
  
  const isOverdue = hoursRemaining < 0;
  const isUrgent = hoursRemaining > 0 && hoursRemaining < 24;
  
  if (isOverdue) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-destructive text-destructive-foreground border-0 gap-1 text-xs">
            <AlertCircle className="w-3 h-3" />
            {Math.abs(Math.round(hoursRemaining))}h overdue
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Due: {sla.toLocaleString()}</TooltipContent>
      </Tooltip>
    );
  }
  
  if (isUrgent) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-warning text-warning-foreground border-0 gap-1 text-xs">
            <Timer className="w-3 h-3" />
            {Math.round(hoursRemaining)}h left
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Due: {sla.toLocaleString()}</TooltipContent>
      </Tooltip>
    );
  }
  
  return (
    <Badge variant="outline" className="text-success border-success/30 gap-1 text-xs">
      <CheckCircle className="w-3 h-3" />
      {Math.round(daysRemaining)}d left
    </Badge>
  );
}

// Documents status badge
function DocsStatusBadge({ request }: { request: RequestWithDetails }) {
  const missingDocs = Array.isArray(request.missing_docs) ? request.missing_docs : [];
  const missingCount = missingDocs.length;
  
  if (missingCount === 0) {
    return (
      <span className="text-xs text-success flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Complete
      </span>
    );
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="bg-warning/10 text-warning border-0 text-xs gap-1 cursor-help">
          <FileQuestion className="w-3 h-3" />
          {missingCount} missing
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium text-xs mb-1">Missing Documents:</p>
        <ul className="text-xs space-y-0.5">
          {(missingDocs as string[]).slice(0, 5).map((doc, i) => (
            <li key={i}>• {doc}</li>
          ))}
          {missingCount > 5 && <li className="text-muted-foreground">+{missingCount - 5} more</li>}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

// Type-aware primary value cell
function PrimaryValueCell({ request }: { request: RequestWithDetails }) {
  const category = getRequestCategory(request);
  
  switch (category) {
    case 'leave':
      // Show date range for leave
      const startDate = (request as any).start_date;
      const endDate = (request as any).end_date;
      const duration = (request as any).duration_days;
      if (startDate && endDate) {
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              <span className="text-muted-foreground">→</span>
              <span>{new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
            {duration && (
              <span className="text-xs text-muted-foreground">{duration} days</span>
            )}
          </div>
        );
      }
      // Fallback to amount if no dates
      break;
      
    case 'support':
      // Show priority for support/questions
      const priority = request.priority;
      if (priority) {
        const priorityColors: Record<string, string> = {
          high: 'text-destructive',
          urgent: 'text-destructive',
          medium: 'text-warning',
          normal: 'text-foreground',
          low: 'text-muted-foreground',
        };
        return (
          <span className={cn('text-sm font-medium', priorityColors[priority] || '')}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </span>
        );
      }
      break;
  }
  
  // Default: show amount for claims/pre-approval/general
  if (request.amount) {
    const isHighValue = request.amount >= 5000;
    return (
      <span className={cn(
        'font-mono text-sm',
        isHighValue && 'text-amber-600 font-medium'
      )}>
        {request.currency || 'AED'} {request.amount.toLocaleString()}
      </span>
    );
  }
  
  // No value to display
  return null;
}

const REJECTION_REASONS = [
  { value: 'incomplete_docs', label: 'Incomplete Documentation' },
  { value: 'exceeds_limit', label: 'Exceeds Entitlement' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'duplicate', label: 'Duplicate Claim' },
  { value: 'policy_violation', label: 'Policy Violation' },
];

export const ClaimQueueRow = memo(function ClaimQueueRow({
  request,
  isSelected,
  onSelect,
  onView,
  onApprove,
  onReject,
  onRequestDocs,
  slaEnabled,
  canProcess,
}: ClaimQueueRowProps) {
  const daysInQueue = request.daysInQueue || 0;
  const isProcessable = ['pending', 'submitted', 'in_review'].includes(request.status || '');
  
  return (
    <tr
      className={cn(
        'border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors',
        isSelected && 'bg-primary/5'
      )}
      onClick={() => onView(request.id)}
    >
      {/* Checkbox */}
      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(request.id)}
        />
      </td>
      
      {/* Employee */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{request.employeeName || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {request.employeeCode || request.employeeDepartment || request.user_id.slice(0, 8)}
            </p>
          </div>
        </div>
      </td>
      
      {/* Type & Subject */}
      <td className="py-3 px-3">
        <div className="max-w-[200px]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <ClaimsTypeChip requestType={request.request_type} size="sm" showTooltip={false} />
            <span className="text-xs text-muted-foreground truncate">{request.category}</span>
          </div>
          <p className="text-sm truncate" title={request.subject}>{request.subject}</p>
        </div>
      </td>
      
      {/* Primary Value (type-aware) */}
      <td className="py-3 px-3">
        <PrimaryValueCell request={request} />
      </td>
      
      {/* Days in Queue */}
      <td className="py-3 px-2 text-center">
        <span className={cn(
          'text-sm font-medium',
          daysInQueue >= 5 && 'text-destructive',
          daysInQueue >= 3 && daysInQueue < 5 && 'text-warning'
        )}>
          {daysInQueue}d
        </span>
      </td>
      
      {/* SLA (if enabled) */}
      {slaEnabled && (
        <td className="py-3 px-3">
          <SLABadge request={request} slaEnabled={slaEnabled} />
        </td>
      )}
      
      {/* Docs Status */}
      <td className="py-3 px-3">
        <DocsStatusBadge request={request} />
      </td>
      
      {/* Status + Waiting On */}
      <td className="py-3 px-3">
        <div className="flex flex-col gap-1">
          <Badge className={cn('w-fit text-xs', getStatusBadgeClasses(request.status as any))}>
            {getStatusLabel(request.status as any)}
          </Badge>
          <WaitingOnBadge status={request.status} variant="compact" perspective="hr" />
        </div>
      </td>
      
      {/* Actions */}
      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(request.id)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {canProcess && isProcessable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  className="text-success gap-2"
                  onClick={() => onApprove?.(request.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2"
                  onClick={() => onRequestDocs?.(request.id)}
                >
                  <Mail className="w-4 h-4" />
                  Request Docs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {REJECTION_REASONS.map(reason => (
                  <DropdownMenuItem 
                    key={reason.value}
                    className="text-destructive gap-2 text-xs"
                    onClick={() => onReject?.(request.id, reason.label)}
                  >
                    <XCircle className="w-3 h-3" />
                    Reject: {reason.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </td>
    </tr>
  );
});

export default ClaimQueueRow;
