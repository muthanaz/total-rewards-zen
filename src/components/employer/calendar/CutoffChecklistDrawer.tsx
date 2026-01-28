import { CheckCircle2, Circle, Clock, AlertTriangle, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarEvent, ChecklistStep } from './types';
import { CountdownBadge } from './CountdownBadge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CutoffChecklistDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Pending',
  },
  in_progress: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    label: 'In Progress',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    label: 'Completed',
  },
  blocked: {
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'Blocked',
  },
};

export function CutoffChecklistDrawer({ 
  event, 
  open, 
  onOpenChange 
}: CutoffChecklistDrawerProps) {
  if (!event || !event.checklist) return null;

  const checklist = event.checklist;
  const completedCount = checklist.filter(s => s.status === 'completed').length;
  const progressPercent = (completedCount / checklist.length) * 100;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleToggleStep = (step: ChecklistStep) => {
    const newStatus = step.status === 'completed' ? 'pending' : 'completed';
    toast.success(`Step marked as ${newStatus}`, {
      description: step.title,
    });
  };

  const handleMarkAllComplete = () => {
    toast.success('All steps marked as complete');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-lg">{event.title}</SheetTitle>
              <SheetDescription className="text-sm">
                Cutoff Checklist
              </SheetDescription>
            </div>
            <CountdownBadge date={event.date} isCompleted={event.status === 'completed'} />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">
                {completedCount} of {checklist.length} complete
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </SheetHeader>

        {/* Checklist Items */}
        <div className="py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
          {checklist.map((step, index) => {
            const config = statusConfig[step.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  'p-3 rounded-lg border transition-colors',
                  step.status === 'completed' && 'bg-muted/50 opacity-75',
                  step.status === 'blocked' && 'border-destructive/30 bg-destructive/5'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <Checkbox
                    checked={step.status === 'completed'}
                    onCheckedChange={() => handleToggleStep(step)}
                    className="mt-0.5"
                  />

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Step Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm font-medium leading-tight',
                        step.status === 'completed' && 'line-through text-muted-foreground'
                      )}>
                        {index + 1}. {step.title}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={cn('shrink-0 text-xs', config.color)}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>

                    {/* Responsible & Due Date */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px] bg-muted">
                            {getInitials(step.responsible.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{step.responsible.name}</span>
                      </div>
                      {step.dueDate && (
                        <span className="tabular-nums">
                          Due: {format(step.dueDate, 'MMM d')}
                        </span>
                      )}
                    </div>

                    {/* Blocker Notes */}
                    {step.status === 'blocked' && step.notes && (
                      <div className="flex items-start gap-1.5 p-2 rounded bg-destructive/10 text-xs text-destructive">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{step.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button 
            className="w-full" 
            onClick={handleMarkAllComplete}
            disabled={completedCount === checklist.length}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Complete
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
