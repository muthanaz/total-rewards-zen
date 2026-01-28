/**
 * Request Timeline Drawer
 * 
 * Shows the complete audit trail for a request:
 * - All status changes from request_events table
 * - Assignments
 * - Notes
 * - Document uploads
 * 
 * Immutable timeline for compliance visibility.
 */

import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  UserPlus,
  Flag,
  FileText,
  Send,
  Upload,
  ArrowRight,
  AlertCircle,
  Shield,
  Eye,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useRequestTimeline } from '@/hooks/useSharedRequests';

// ============================================================================
// ACTION CONFIGURATION
// ============================================================================

const actionConfig: Record<string, { 
  icon: typeof Clock; 
  label: string; 
  color: string;
  bgColor: string;
}> = {
  submitted: { icon: FileText, label: 'Submitted', color: 'text-primary', bgColor: 'bg-primary/10' },
  created: { icon: FileText, label: 'Created', color: 'text-primary', bgColor: 'bg-primary/10' },
  viewed: { icon: Eye, label: 'Viewed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  status_changed: { icon: ArrowRight, label: 'Status Changed', color: 'text-info', bgColor: 'bg-info/10' },
  approved: { icon: CheckCircle, label: 'Approved', color: 'text-success', bgColor: 'bg-success/10' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  assigned: { icon: UserPlus, label: 'Assigned', color: 'text-info', bgColor: 'bg-info/10' },
  reassigned: { icon: UserPlus, label: 'Reassigned', color: 'text-info', bgColor: 'bg-info/10' },
  escalated: { icon: Flag, label: 'Escalated', color: 'text-warning', bgColor: 'bg-warning/10' },
  info_requested: { icon: Send, label: 'Info Requested', color: 'text-warning', bgColor: 'bg-warning/10' },
  note_added: { icon: MessageSquare, label: 'Note Added', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  document_uploaded: { icon: Upload, label: 'Document Uploaded', color: 'text-info', bgColor: 'bg-info/10' },
  document_verified: { icon: Shield, label: 'Document Verified', color: 'text-success', bgColor: 'bg-success/10' },
  document_rejected: { icon: AlertCircle, label: 'Document Rejected', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  sla_paused: { icon: Pause, label: 'SLA Paused', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  sla_resumed: { icon: Play, label: 'SLA Resumed', color: 'text-info', bgColor: 'bg-info/10' },
  paid: { icon: CheckCircle, label: 'Paid', color: 'text-success', bgColor: 'bg-success/10' },
  closed: { icon: CheckCircle, label: 'Closed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

const getActionConfig = (action: string) => {
  return actionConfig[action] || {
    icon: Clock,
    label: action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  };
};

// ============================================================================
// TIMELINE EVENT COMPONENT
// ============================================================================

interface TimelineEvent {
  id: string;
  timestamp: Date;
  action: string;
  actorName: string;
  actorRole?: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  visibility: 'internal' | 'employee_visible';
  notes?: string | null;
  meta?: Record<string, unknown>;
}

interface TimelineEventItemProps {
  event: TimelineEvent;
  isLast: boolean;
}

function TimelineEventItem({ event, isLast }: TimelineEventItemProps) {
  const config = getActionConfig(event.action);
  const Icon = config.icon;

  return (
    <div className="flex gap-4 relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div className={cn(
        "relative z-10 p-2 rounded-full shrink-0",
        config.bgColor
      )}>
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("font-medium text-sm", config.color)}>
                {config.label}
              </span>
              {event.visibility === 'internal' && (
                <Badge variant="outline" className="text-[10px] h-4">
                  Internal
                </Badge>
              )}
            </div>
            
            {/* Status transition */}
            {event.fromStatus && event.toStatus && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">
                  {event.fromStatus}
                </Badge>
                <ArrowRight className="w-3 h-3" />
                <Badge variant="secondary" className="text-[10px]">
                  {event.toStatus}
                </Badge>
              </div>
            )}
            
            {/* Actor */}
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {event.actorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {event.actorName}
                {event.actorRole && ` (${event.actorRole})`}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(event.timestamp, 'MMM d, h:mm a')}
            </span>
            <p className="text-[10px] text-muted-foreground/70">
              {formatDistanceToNow(event.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Notes */}
        {event.notes && (
          <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            {event.notes}
          </div>
        )}

        {/* Meta information */}
        {event.meta?.assignee_name && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <UserPlus className="w-3 h-3" />
            Assigned to: <span className="font-medium">{String(event.meta.assignee_name)}</span>
          </div>
        )}
        {event.meta?.reason && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Reason:</span> {String(event.meta.reason)}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface RequestTimelineDrawerProps {
  requestId: string | null;
  requestRef?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestTimelineDrawer({
  requestId,
  requestRef,
  isOpen,
  onClose,
}: RequestTimelineDrawerProps) {
  const { data: timeline, isLoading } = useRequestTimeline(requestId);

  const events = useMemo<TimelineEvent[]>(() => {
    if (!timeline) return [];

    return timeline.map((event) => ({
      id: event.id,
      timestamp: new Date(event.created_at),
      action: event.action,
      actorName: event.actor_name || 'System',
      actorRole: event.actor_role,
      fromStatus: event.from_status,
      toStatus: event.to_status,
      visibility: (event.visibility === 'employee_visible' ? 'employee_visible' : 'internal') as 'internal' | 'employee_visible',
      notes: event.notes_employee_visible || event.notes_internal,
      meta: event.meta as Record<string, unknown> | undefined,
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [timeline]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Request Timeline
          </SheetTitle>
          <SheetDescription>
            Complete history for {requestRef || 'this request'}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No activity recorded</p>
              <p className="text-sm mt-1">Timeline events will appear here</p>
            </div>
          ) : (
            <div className="relative">
              {events.map((event, index) => (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  isLast={index === events.length - 1}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Summary stats */}
        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold tabular-nums">{events.length}</p>
                <p className="text-[10px] text-muted-foreground">Total Events</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">
                  {events.filter(e => e.action === 'status_changed' || e.action.includes('approved') || e.action.includes('rejected')).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Status Changes</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums">
                  {new Set(events.map(e => e.actorName)).size}
                </p>
                <p className="text-[10px] text-muted-foreground">Actors</p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default RequestTimelineDrawer;
