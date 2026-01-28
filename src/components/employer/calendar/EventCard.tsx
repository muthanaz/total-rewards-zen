import { 
  Wallet, FileText, Download, Users, Building2, 
  ChevronRight, User, ListChecks, ExternalLink 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarEvent, EVENT_TYPE_CONFIG } from './types';
import { CountdownBadge } from './CountdownBadge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  event: CalendarEvent;
  onOpenChecklist: (event: CalendarEvent) => void;
}

const iconMap = {
  Wallet,
  FileText,
  Download,
  Users,
  Building2,
};

export function EventCard({ event, onOpenChecklist }: EventCardProps) {
  const navigate = useNavigate();
  const config = EVENT_TYPE_CONFIG[event.type];
  const Icon = iconMap[config.icon as keyof typeof iconMap];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const checklistProgress = event.checklist 
    ? {
        completed: event.checklist.filter(s => s.status === 'completed').length,
        total: event.checklist.length,
      }
    : null;

  return (
    <Card className={cn(
      'hover:shadow-md transition-all duration-200 group',
      event.status === 'completed' && 'opacity-60'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Event Type Icon */}
          <div className={cn('p-2.5 rounded-lg shrink-0', config.bgColor)}>
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm leading-tight">
                    {event.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                  <Badge className={cn('text-xs', getPriorityColor(event.priority))}>
                    {event.priority}
                  </Badge>
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {event.description}
                  </p>
                )}
              </div>
              <CountdownBadge date={event.date} isCompleted={event.status === 'completed'} />
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="tabular-nums">
                {format(event.date, 'MMM d, yyyy')}
              </span>
              {event.recurrence && event.recurrence !== 'once' && (
                <span className="capitalize">• {event.recurrence}</span>
              )}
            </div>

            {/* Owner & Actions Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-muted">
                          {getInitials(event.owner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {event.owner.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{event.owner.role}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                {/* Checklist Button */}
                {event.checklist && event.checklist.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1.5"
                        onClick={() => onOpenChecklist(event)}
                      >
                        <ListChecks className="w-3.5 h-3.5" />
                        <span className="text-xs tabular-nums">
                          {checklistProgress?.completed}/{checklistProgress?.total}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open cutoff checklist</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Linked Action */}
                {event.linkedAction && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 gap-1.5 text-xs"
                        onClick={() => navigate(event.linkedAction!.route)}
                      >
                        <span className="max-w-[120px] truncate">
                          {event.linkedAction.title}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Go to linked action</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
