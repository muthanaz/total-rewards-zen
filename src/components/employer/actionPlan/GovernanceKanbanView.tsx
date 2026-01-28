/**
 * Governance Kanban View
 * 
 * Four-column Kanban: Backlog → In Progress → Waiting → Done
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  CircleDot, 
  PlayCircle, 
  Clock, 
  CheckCircle2,
  MoreHorizontal,
  ArrowRight,
  Pause,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GovernanceAction, KanbanColumn } from './types';
import { GovernanceActionCard } from './GovernanceActionCard';

interface GovernanceKanbanViewProps {
  actions: GovernanceAction[];
  onActionClick: (action: GovernanceAction) => void;
  onStatusChange: (actionId: string, newStatus: KanbanColumn) => void;
}

const columnConfig: Record<KanbanColumn, { 
  label: string; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string;
  wipLimit?: number;
}> = {
  backlog: { 
    label: 'Backlog', 
    icon: CircleDot, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
  },
  in_progress: { 
    label: 'In Progress', 
    icon: PlayCircle, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/5',
    wipLimit: 5,
  },
  waiting: { 
    label: 'Waiting', 
    icon: Clock, 
    color: 'text-warning',
    bgColor: 'bg-warning/5',
  },
  done: { 
    label: 'Done', 
    icon: CheckCircle2, 
    color: 'text-success',
    bgColor: 'bg-success/5',
  },
};

const COLUMNS: KanbanColumn[] = ['backlog', 'in_progress', 'waiting', 'done'];

export function GovernanceKanbanView({ 
  actions, 
  onActionClick, 
  onStatusChange 
}: GovernanceKanbanViewProps) {
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((column) => {
        const config = columnConfig[column];
        const columnActions = actions.filter(a => a.status === column);
        const Icon = config.icon;
        const isOverWip = config.wipLimit && columnActions.length > config.wipLimit;
        
        return (
          <div key={column} className="space-y-3">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <h3 className="font-medium text-sm">{config.label}</h3>
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  isOverWip && "bg-warning/10 text-warning"
                )}
              >
                {columnActions.length}
                {config.wipLimit && (
                  <span className="text-muted-foreground">/{config.wipLimit}</span>
                )}
              </Badge>
            </div>
            
            {/* Column Content */}
            <div className={cn(
              "space-y-3 min-h-[300px] p-3 rounded-lg",
              config.bgColor,
              isOverWip && "ring-1 ring-warning/30"
            )}>
              {columnActions.map((action) => (
                <div key={action.id} className="relative group">
                  <GovernanceActionCard
                    action={action}
                    onClick={() => onActionClick(action)}
                    compact
                  />
                  
                  {/* Quick actions overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        {column !== 'in_progress' && (
                          <DropdownMenuItem onClick={() => onStatusChange(action.id, 'in_progress')}>
                            <PlayCircle className="h-4 w-4 mr-2 text-blue-500" />
                            Start Progress
                          </DropdownMenuItem>
                        )}
                        {column !== 'waiting' && column !== 'done' && (
                          <DropdownMenuItem onClick={() => onStatusChange(action.id, 'waiting')}>
                            <Pause className="h-4 w-4 mr-2 text-warning" />
                            Mark Waiting
                          </DropdownMenuItem>
                        )}
                        {column !== 'done' && (
                          <DropdownMenuItem onClick={() => onStatusChange(action.id, 'done')}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                            Mark Done
                          </DropdownMenuItem>
                        )}
                        {column !== 'backlog' && column !== 'done' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onStatusChange(action.id, 'backlog')}>
                              <CircleDot className="h-4 w-4 mr-2" />
                              Move to Backlog
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              
              {columnActions.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No actions
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
