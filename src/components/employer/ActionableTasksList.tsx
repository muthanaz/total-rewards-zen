/**
 * Actionable Tasks List
 * 
 * Upcoming tasks with one-click actions: open item, assign owner, set due date.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Users, 
  FileCheck, 
  TrendingUp, 
  ExternalLink,
  MoreVertical,
  UserPlus,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export type TaskType = 'meeting' | 'policy' | 'report' | 'contract' | 'review' | 'deadline';

interface Task {
  id: string;
  title: string;
  date: string;
  type: TaskType;
  dueDate?: Date;
  owner?: string;
  link?: string;
  priority?: 'low' | 'normal' | 'high';
}

interface ActionableTasksListProps {
  tasks: Task[];
  owners?: { id: string; name: string }[];
  onAssign?: (taskId: string, ownerId: string) => void;
  onSetDueDate?: (taskId: string, date: Date) => void;
  onComplete?: (taskId: string) => void;
}

const typeConfig: Record<TaskType, { icon: typeof Users; bgColor: string; textColor: string }> = {
  meeting: { icon: Users, bgColor: 'bg-info/10', textColor: 'text-info' },
  policy: { icon: FileCheck, bgColor: 'bg-warning/10', textColor: 'text-warning' },
  report: { icon: TrendingUp, bgColor: 'bg-chart-3/10', textColor: 'text-chart-3' },
  contract: { icon: FileCheck, bgColor: 'bg-primary/10', textColor: 'text-primary' },
  review: { icon: FileCheck, bgColor: 'bg-success/10', textColor: 'text-success' },
  deadline: { icon: Clock, bgColor: 'bg-destructive/10', textColor: 'text-destructive' },
};

export function ActionableTasksList({ 
  tasks, 
  owners = [],
  onAssign,
  onSetDueDate,
  onComplete,
}: ActionableTasksListProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleAssign = (taskId: string, ownerId: string) => {
    onAssign?.(taskId, ownerId);
    setOpenPopover(null);
  };

  const handleSetDueDate = (taskId: string, date: Date | undefined) => {
    if (date) {
      onSetDueDate?.(taskId, date);
    }
    setOpenPopover(null);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => {
          const config = typeConfig[task.type] || typeConfig.meeting;
          const Icon = config.icon;

          return (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 group transition-colors"
            >
              <div className={cn("p-1.5 rounded-lg shrink-0", config.bgColor)}>
                <Icon className={cn("w-3.5 h-3.5", config.textColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{task.date}</span>
                  {task.owner && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{task.owner}</span>
                    </>
                  )}
                  {task.priority === 'high' && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-0">
                      High
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.link && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link to={task.link}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                )}
                <Popover open={openPopover === task.id} onOpenChange={(open) => setOpenPopover(open ? task.id : null)}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 p-2">
                    <div className="space-y-2">
                      {owners.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground px-2">Assign to</span>
                          <Select onValueChange={(v) => handleAssign(task.id, v)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select owner" />
                            </SelectTrigger>
                            <SelectContent>
                              {owners.map((owner) => (
                                <SelectItem key={owner.id} value={owner.id}>
                                  {owner.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground px-2">Set due date</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start">
                              <CalendarIcon className="w-3 h-3 mr-2" />
                              {task.dueDate ? format(task.dueDate, 'MMM d, yyyy') : 'Pick date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={task.dueDate}
                              onSelect={(date) => handleSetDueDate(task.id, date)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-xs justify-start text-success"
                        onClick={() => onComplete?.(task.id)}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-2" />
                        Mark complete
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No upcoming tasks
          </div>
        )}
      </CardContent>
    </Card>
  );
}
