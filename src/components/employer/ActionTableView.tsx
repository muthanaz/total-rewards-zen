import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CircleDot, PlayCircle, PauseCircle, CheckCircle2, XCircle,
  FileText, Settings, Megaphone, Store, BarChart3, ArrowUpDown, MoreHorizontal,
  UserPlus, Trash2, CheckSquare, AlertTriangle
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import type { ActionItem, Status, Priority, ActionType, Confidence, SourceType } from '@/hooks/useEmployerActions';

const typeConfig: Record<ActionType, { label: string; icon: React.ElementType; color: string }> = {
  policy: { label: 'Policy', icon: FileText, color: 'text-purple-500' },
  process: { label: 'Process', icon: Settings, color: 'text-blue-500' },
  comms: { label: 'Comms', icon: Megaphone, color: 'text-green-500' },
  vendor: { label: 'Vendor', icon: Store, color: 'text-orange-500' },
  analytics: { label: 'Analytics', icon: BarChart3, color: 'text-teal-500' },
};

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; sortOrder: number }> = {
  P0: { label: 'P0', color: 'text-red-600', bgColor: 'bg-red-500/10', sortOrder: 0 },
  P1: { label: 'P1', color: 'text-amber-600', bgColor: 'bg-amber-500/10', sortOrder: 1 },
  P2: { label: 'P2', color: 'text-blue-600', bgColor: 'bg-blue-500/10', sortOrder: 2 },
};

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string }> = {
  backlog: { label: 'Backlog', icon: CircleDot, color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-blue-500' },
  blocked: { label: 'Blocked', icon: PauseCircle, color: 'text-red-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-muted-foreground' },
};

const confidenceConfig: Record<Confidence, { label: string; color: string }> = {
  high: { label: 'High', color: 'text-green-600' },
  medium: { label: 'Med', color: 'text-amber-600' },
  low: { label: 'Low', color: 'text-red-500' },
};

const sourceLabels: Record<SourceType, string> = {
  zombie_spend: 'Zombie',
  segments: 'Segments',
  claims: 'Claims',
  policies: 'Policies',
  survey: 'Survey',
  manual: 'Manual',
};

type SortField = 'priority' | 'dueDate' | 'impact' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface ActionTableViewProps {
  actions: ActionItem[];
  onOpenAction: (action: ActionItem) => void;
  onStatusChange: (actionId: string, status: Status) => void;
  onBulkAction: (actionIds: string[], action: 'complete' | 'assign' | 'delete') => void;
}

export function ActionTableView({ actions, onOpenAction, onStatusChange, onBulkAction }: ActionTableViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.size === actions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(actions.map(a => a.id)));
    }
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort actions
  const sortedActions = [...actions].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'priority':
        return (priorityConfig[a.priority].sortOrder - priorityConfig[b.priority].sortOrder) * dir;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1 * dir;
        if (!b.dueDate) return -1 * dir;
        return (a.dueDate.getTime() - b.dueDate.getTime()) * dir;
      case 'impact':
        return ((b.expectedImpact.costAvoidance || 0) - (a.expectedImpact.costAvoidance || 0)) * dir;
      case 'updatedAt':
        return (b.updatedAt.getTime() - a.updatedAt.getTime()) * dir;
      default:
        return 0;
    }
  });
  
  const hasSelection = selectedIds.size > 0;
  
  return (
    <Card>
      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="px-4 py-2 bg-accent/10 border-b flex items-center justify-between">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction(Array.from(selectedIds), 'complete')}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction(Array.from(selectedIds), 'assign')}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Assign
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === actions.length && actions.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[50px]">
                <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => handleSort('priority')}>
                  P
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="w-[90px]">Type</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[110px]">Owner</TableHead>
              <TableHead className="w-[90px]">
                <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => handleSort('dueDate')}>
                  Due
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]">Source</TableHead>
              <TableHead className="w-[100px]">
                <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => handleSort('impact')}>
                  Impact
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="w-[70px]">Conf.</TableHead>
              <TableHead className="w-[90px]">
                <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => handleSort('updatedAt')}>
                  Updated
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedActions.map((action) => {
              const TypeIcon = typeConfig[action.type].icon;
              const StatusIcon = statusConfig[action.status].icon;
              const isOverdue = action.dueDate && isPast(action.dueDate) && !['completed', 'cancelled'].includes(action.status);
              const hasBlockers = action.blockers.length > 0;
              
              return (
                <TableRow 
                  key={action.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onOpenAction(action)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(action.id)}
                      onCheckedChange={() => toggleSelect(action.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={`${priorityConfig[action.priority].bgColor} ${priorityConfig[action.priority].color} border-0 text-xs`}>
                      {action.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[280px]">
                      <p className="font-medium text-sm line-clamp-1">{action.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
                      {hasBlockers && (
                        <Badge variant="outline" className="text-[10px] mt-1 text-red-500 border-red-500/30">
                          {action.blockers.length} blocker{action.blockers.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TypeIcon className={`h-3.5 w-3.5 ${typeConfig[action.type].color}`} />
                      <span className="text-xs">{typeConfig[action.type].label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${statusConfig[action.status].color} text-xs`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[action.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className={`text-[9px] ${!action.ownerId ? 'bg-amber-500/10 text-amber-600' : ''}`}>
                          {action.ownerId ? action.owner.split(' ').map(n => n[0]).join('') : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs truncate max-w-[70px]">
                        {action.ownerId ? action.owner.split(' ')[0] : 'None'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {action.dueDate ? (
                      <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                        {format(action.dueDate, 'MMM d')}
                        {isOverdue && ' ⚠'}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-[10px]">
                            {sourceLabels[action.sourceType]}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs capitalize">Source: {action.sourceType.replace('_', ' ')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {action.expectedImpact.costAvoidance ? (
                      <span className="text-xs text-green-600 font-medium">
                        {formatCurrencyAED(action.expectedImpact.costAvoidance, { abbreviate: true })}
                      </span>
                    ) : action.expectedImpact.utilizationChange ? (
                      <span className="text-xs text-green-600 font-medium">
                        +{action.expectedImpact.utilizationChange}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${confidenceConfig[action.confidence].color}`}>
                      {confidenceConfig[action.confidence].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(action.updatedAt, { addSuffix: false })}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpenAction(action)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {action.status !== 'completed' && (
                          <DropdownMenuItem onClick={() => onStatusChange(action.id, 'completed')}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {sortedActions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No actions match the current filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
