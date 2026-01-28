/**
 * Operations Hub Queue Table
 * 
 * High-speed queue table with:
 * - Request ID, Employee (Name (Grade)), Category, Amount, Status, SLA timer, Missing docs badge
 * - Inline actions: Approve / Reject / Request Docs / Assign / View Timeline
 * - Bulk selection support
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
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  XCircle,
  FileQuestion,
  UserPlus,
  History,
  MoreVertical,
  Timer,
  Clock,
  Pause,
  AlertTriangle,
  User,
  Eye,
  Flag,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';
import type { QueueItemRow, InlineAction, TeamMember } from './types';

interface OpsQueueTableProps {
  items: QueueItemRow[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onAction: (action: InlineAction, itemId: string) => void;
  onViewDetails: (itemId: string) => void;
  teamMembers: TeamMember[];
  isLoading?: boolean;
}

// Status badge styling
const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    submitted: 'bg-warning/10 text-warning border-warning/20',
    in_review: 'bg-primary/10 text-primary border-primary/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    info_requested: 'bg-amber-100 text-amber-700 border-amber-200',
    pending_employee: 'bg-amber-100 text-amber-700 border-amber-200',
    paid: 'bg-success/10 text-success border-success/20',
    escalated: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return styles[status] || 'bg-muted text-muted-foreground';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    submitted: 'Submitted',
    in_review: 'In Review',
    approved: 'Approved',
    rejected: 'Rejected',
    info_requested: 'Awaiting Info',
    pending_employee: 'Awaiting Employee',
    paid: 'Paid',
    escalated: 'Escalated',
  };
  return labels[status] || status;
};

function SlaTimerCell({ slaInfo, isPaused }: { slaInfo: QueueItemRow['slaInfo']; isPaused: boolean }) {
  if (!slaInfo) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (isPaused) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Pause className="w-3 h-3" />
            <span>Paused</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">SLA paused while awaiting employee response</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const absHours = Math.abs(slaInfo.hoursRemaining);
  const display = absHours < 24 
    ? `${Math.round(absHours)}h` 
    : `${Math.round(absHours / 24)}d`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          slaInfo.isOverdue ? "text-destructive" : 
          slaInfo.isUrgent ? "text-warning" : 
          "text-success"
        )}>
          <Timer className="w-3 h-3" />
          {slaInfo.isOverdue ? `-${display}` : display}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          {slaInfo.isOverdue 
            ? `SLA breached ${display} ago` 
            : `${display} remaining`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function MissingDocsBadge({ hasMissing, count, docs }: { hasMissing: boolean; count: number; docs: string[] }) {
  if (!hasMissing) {
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
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs gap-1 cursor-help">
          <FileQuestion className="w-3 h-3" />
          {count} missing
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium text-xs mb-1">Missing Documents:</p>
        <ul className="text-xs space-y-0.5">
          {docs.map((doc, i) => (
            <li key={i}>• {doc}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

export function OpsQueueTable({
  items,
  selectedIds,
  onSelectionChange,
  onAction,
  onViewDetails,
  teamMembers,
  isLoading,
}: OpsQueueTableProps) {
  const allSelected = items.length > 0 && items.every(item => selectedIds.includes(item.id));
  const someSelected = items.some(item => selectedIds.includes(item.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const isProcessable = (status: string) => {
    return ['pending', 'submitted', 'in_review'].includes(status);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-medium text-lg">Queue is empty</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No items match the current filters
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-24">Request ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">SLA</TableHead>
              <TableHead>Docs</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow 
                key={item.id}
                className={cn(
                  "transition-colors",
                  selectedIds.includes(item.id) && "bg-primary/5",
                  item.slaInfo?.isOverdue && "bg-destructive/5"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => toggleSelectItem(item.id)}
                    aria-label={`Select ${item.requestRef}`}
                  />
                </TableCell>
                
                <TableCell>
                  <button 
                    onClick={() => onViewDetails(item.id)}
                    className="font-mono text-xs text-primary hover:underline cursor-pointer"
                  >
                    {item.requestRef}
                  </button>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {item.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.employeeName}
                        <span className="text-muted-foreground font-normal ml-1">
                          ({item.employeeGrade})
                        </span>
                      </p>
                      {item.requestType && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] h-4",
                            item.requestType === 'request' 
                              ? 'bg-info/10 text-info border-info/20' 
                              : 'bg-primary/10 text-primary border-primary/20'
                          )}
                        >
                          {item.requestType === 'request' ? 'Pre-approval' : 'Reimbursement'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm">{item.category}</span>
                </TableCell>
                
                <TableCell className="text-right">
                  {item.amount !== null ? (
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatCurrencyAED(item.amount)}
                      </p>
                      {item.capLimit && (
                        <p className={cn(
                          "text-[10px] tabular-nums",
                          item.amount > item.capLimit ? "text-destructive" : "text-muted-foreground"
                        )}>
                          / {formatCurrencyAED(item.capLimit)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <Badge className={cn('text-xs', getStatusStyle(item.status))}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <SlaTimerCell slaInfo={item.slaInfo} isPaused={item.isPaused} />
                </TableCell>
                
                <TableCell>
                  <MissingDocsBadge 
                    hasMissing={item.hasMissingDocs} 
                    count={item.missingDocsCount}
                    docs={item.missingDocs}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    {isProcessable(item.status) && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-success hover:text-success hover:bg-success/10"
                              onClick={() => onAction('approve', item.id)}
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
                              onClick={() => onAction('reject', item.id)}
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
                      <DropdownMenuContent align="end" className="w-48 bg-popover">
                        <DropdownMenuItem onClick={() => onViewDetails(item.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction('view_timeline', item.id)}>
                          <History className="w-4 h-4 mr-2" />
                          View Timeline
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onAction('request_docs', item.id)}>
                          <FileQuestion className="w-4 h-4 mr-2" />
                          Request Documents
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction('assign', item.id)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign / Reassign
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onAction('escalate', item.id)}
                          className="text-warning"
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Escalate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}

export default OpsQueueTable;
