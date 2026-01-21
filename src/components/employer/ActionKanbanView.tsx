import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CircleDot, PlayCircle, PauseCircle, CheckCircle2, AlertTriangle,
  Calendar, MoreHorizontal, UserPlus, ArrowRight, Eye, Zap
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import type { ActionItem, Status, Priority, Confidence, SourceType } from '@/hooks/useEmployerActions';

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  backlog: { label: 'Backlog', icon: CircleDot, color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-blue-500', bgColor: 'bg-blue-500/5' },
  blocked: { label: 'Blocked', icon: PauseCircle, color: 'text-red-500', bgColor: 'bg-red-500/5' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/5' },
  cancelled: { label: 'Cancelled', icon: CircleDot, color: 'text-muted-foreground', bgColor: 'bg-muted/30' },
};

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  P0: { label: 'P0', color: 'text-red-600', bgColor: 'bg-red-500/10' },
  P1: { label: 'P1', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  P2: { label: 'P2', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
};

const confidenceConfig: Record<Confidence, { color: string }> = {
  high: { color: 'text-green-600' },
  medium: { color: 'text-amber-600' },
  low: { color: 'text-red-500' },
};

const sourceIcons: Record<SourceType, string> = {
  zombie_spend: '💀',
  segments: '👥',
  claims: '📋',
  policies: '📜',
  survey: '📊',
  manual: '✏️',
};

interface ActionKanbanCardProps {
  action: ActionItem;
  onClick: () => void;
  onQuickStatusChange: (status: Status) => void;
  onQuickAssign: () => void;
}

function ActionKanbanCard({ action, onClick, onQuickStatusChange, onQuickAssign }: ActionKanbanCardProps) {
  const isOverdue = action.dueDate && isPast(action.dueDate) && !['completed', 'cancelled'].includes(action.status);
  const hasImpact = action.expectedImpact.costAvoidance && action.expectedImpact.costAvoidance > 0;
  
  return (
    <div
      className="p-3 rounded-lg border bg-card hover:border-accent/50 cursor-pointer transition-all group relative"
      onClick={onClick}
    >
      {/* Quick actions on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onClick()}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickAssign()}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {action.status !== 'in_progress' && (
              <DropdownMenuItem onClick={() => onQuickStatusChange('in_progress')}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Move to In Progress
              </DropdownMenuItem>
            )}
            {action.status !== 'completed' && (
              <DropdownMenuItem onClick={() => onQuickStatusChange('completed')}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Header: Priority + Overdue + Source */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <Badge className={`${priorityConfig[action.priority].bgColor} ${priorityConfig[action.priority].color} border-0 text-[10px] h-5`}>
          {action.priority}
        </Badge>
        {isOverdue && (
          <Badge variant="destructive" className="text-[10px] h-5">
            <AlertTriangle className="h-3 w-3 mr-0.5" />
            Overdue
          </Badge>
        )}
        {action.blockers.length > 0 && (
          <Badge variant="outline" className="text-[10px] h-5 text-red-500 border-red-500/30">
            {action.blockers.length} blocker{action.blockers.length > 1 ? 's' : ''}
          </Badge>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs ml-auto">{sourceIcons[action.sourceType]}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs capitalize">{action.sourceType.replace('_', ' ')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Title */}
      <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-accent transition-colors pr-6">
        {action.title}
      </h4>
      
      {/* Impact */}
      {hasImpact && (
        <div className="flex items-center gap-1 mb-2">
          <Zap className="h-3 w-3 text-amber-500" />
          <span className={`text-xs font-medium ${confidenceConfig[action.confidence].color}`}>
            {formatCurrencyAED(action.expectedImpact.costAvoidance!, { abbreviate: true })}
          </span>
          <Badge variant="outline" className={`text-[10px] h-4 px-1 ${confidenceConfig[action.confidence].color} border-current/30`}>
            {action.confidence}
          </Badge>
        </div>
      )}
      
      {/* Footer: Owner + Due */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-2">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px]">
              {action.ownerId ? action.owner.split(' ').map(n => n[0]).join('') : '?'}
            </AvatarFallback>
          </Avatar>
          <span className="truncate max-w-[70px]">
            {action.ownerId ? action.owner.split(' ')[0] : 'Unassigned'}
          </span>
        </div>
        {action.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
            <Calendar className="h-3 w-3" />
            <span>{format(action.dueDate, 'MMM d')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ActionKanbanViewProps {
  actions: ActionItem[];
  onOpenAction: (action: ActionItem) => void;
  onStatusChange: (actionId: string, status: Status) => void;
  onQuickAssign: (action: ActionItem) => void;
}

export function ActionKanbanView({ actions, onOpenAction, onStatusChange, onQuickAssign }: ActionKanbanViewProps) {
  const columns: Array<{ status: Status; wipLimit?: number }> = [
    { status: 'backlog' },
    { status: 'in_progress', wipLimit: 5 },
    { status: 'blocked' },
    { status: 'completed' },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(({ status, wipLimit }) => {
        const columnActions = actions.filter(a => a.status === status);
        const StatusIcon = statusConfig[status].icon;
        const isOverWip = wipLimit && columnActions.length > wipLimit;
        
        return (
          <div key={status} className="space-y-3">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-4 w-4 ${statusConfig[status].color}`} />
                <h3 className="font-medium text-sm">{statusConfig[status].label}</h3>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className={`text-xs ${isOverWip ? 'bg-amber-500/10 text-amber-600' : ''}`}>
                  {columnActions.length}
                  {wipLimit && <span className="text-muted-foreground">/{wipLimit}</span>}
                </Badge>
              </div>
            </div>
            
            {/* Column Content */}
            <div className={`space-y-2 min-h-[200px] p-2 rounded-lg ${statusConfig[status].bgColor} ${isOverWip ? 'ring-1 ring-amber-500/30' : ''}`}>
              {columnActions.map((action) => (
                <ActionKanbanCard
                  key={action.id}
                  action={action}
                  onClick={() => onOpenAction(action)}
                  onQuickStatusChange={(newStatus) => onStatusChange(action.id, newStatus)}
                  onQuickAssign={() => onQuickAssign(action)}
                />
              ))}
              {columnActions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No items
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
