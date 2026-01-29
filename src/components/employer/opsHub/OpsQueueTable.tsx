/**
 * Operations Hub Queue Table
 * 
 * Fixed columns:
 * Claim ID | Employee | Category | Submitted | Status | SLA (time left) | Payable | Assignee | Blockers | Open
 * 
 * SLA shows consistent format: "12h 20m" or "Paused" when waiting on employee
 * Blockers column shows icons for: missing docs, policy mismatch, cap exceeded, data missing
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { QueueEmptyState } from '@/components/ui/empty-state';
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
  Eye,
  Flag,
  FileX,
  ShieldAlert,
  TrendingUp,
  Database,
  ExternalLink,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';
import type { QueueItemRow, InlineAction, TeamMember, Blocker, BlockerType } from './types';

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

// Blocker icons
const blockerIcons: Record<BlockerType, React.ReactNode> = {
  missing_docs: <FileX className="w-3.5 h-3.5" />,
  policy_mismatch: <ShieldAlert className="w-3.5 h-3.5" />,
  cap_exceeded: <TrendingUp className="w-3.5 h-3.5" />,
  data_missing: <Database className="w-3.5 h-3.5" />,
  unverified_docs: <FileQuestion className="w-3.5 h-3.5" />,
};

function SlaTimerCell({ slaInfo }: { slaInfo: QueueItemRow['slaInfo'] }) {
  if (!slaInfo) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (slaInfo.isPaused) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Pause className="w-3.5 h-3.5" />
            <span className="font-medium">Paused</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">SLA paused while awaiting employee response</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-medium tabular-nums",
          slaInfo.isOverdue ? "text-destructive" : 
          slaInfo.isUrgent ? "text-warning" : 
          "text-success"
        )}>
          <Timer className="w-3.5 h-3.5" />
          <span>{slaInfo.displayFormat}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          {slaInfo.isOverdue 
            ? `SLA breached ${slaInfo.displayFormat.replace('-', '')} ago` 
            : `${slaInfo.displayFormat} remaining`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function BlockersCell({ blockers }: { blockers: Blocker[] }) {
  if (blockers.length === 0) {
    return (
      <span className="text-xs text-success flex items-center gap-1">
        <CheckCircle className="w-3.5 h-3.5" />
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {blockers.slice(0, 3).map((blocker, idx) => (
        <Tooltip key={idx}>
          <TooltipTrigger asChild>
            <div className={cn(
              "w-6 h-6 rounded flex items-center justify-center",
              blocker.severity === 'error' 
                ? "bg-destructive/10 text-destructive" 
                : "bg-warning/10 text-warning"
            )}>
              {blockerIcons[blocker.type]}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium text-xs">{blocker.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{blocker.description}</p>
            <p className="text-xs text-primary mt-1">→ {blocker.resolutionHint}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      {blockers.length > 3 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-[10px] h-5">
              +{blockers.length - 3}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{blockers.length - 3} more blocker(s)</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
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
      <QueueEmptyState 
        queueType="all_queue" 
        onRefresh={undefined}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-28">Claim ID</TableHead>
              <TableHead className="min-w-[180px]">Employee</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-24">Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">SLA</TableHead>
              <TableHead className="text-right w-28">Payable</TableHead>
              <TableHead className="w-32">Assignee</TableHead>
              <TableHead className="w-24">Blockers</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow 
                key={item.id}
                data-state={selectedIds.includes(item.id) ? "selected" : undefined}
                className={cn(
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
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm">{item.category}</span>
                </TableCell>
                
                <TableCell>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {item.submittedAt ? format(new Date(item.submittedAt), 'd MMM') : '—'}
                  </span>
                </TableCell>
                
                <TableCell>
                  <Badge className={cn('text-xs', getStatusStyle(item.status))}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <SlaTimerCell slaInfo={item.slaInfo} />
                </TableCell>
                
                <TableCell className="text-right">
                  {item.payableAmount !== null ? (
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrencyAED(item.payableAmount)}
                    </span>
                  ) : item.amount !== null ? (
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatCurrencyAED(item.amount)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {item.assignedToName ? (
                    <span className="text-xs truncate max-w-[100px] block">
                      {item.assignedToName}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Unassigned</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <BlockersCell blockers={item.blockers} />
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onViewDetails(item.id)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open Details</TooltipContent>
                    </Tooltip>

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
