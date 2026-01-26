/**
 * Decision Audit Trail Drawer
 * 
 * Shows complete history of a request including:
 * - Every status change
 * - Assignments
 * - Approvals/Rejections
 * - Information requests
 * - Document uploads
 * 
 * Immutable audit trail for compliance.
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
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  UserPlus,
  Flag,
  FileText,
  Send,
  Eye,
  Edit2,
  DollarSign,
  Upload,
  ArrowRight,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useRequestTimeline } from '@/hooks/useSharedRequests';

// ============================================================================
// TYPES
// ============================================================================

interface AuditEvent {
  id: string;
  timestamp: Date;
  actor: {
    id: string;
    name: string;
    role?: string;
    initials?: string;
  };
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  visibility: 'internal' | 'employee_visible';
  notesInternal?: string | null;
  notesEmployeeVisible?: string | null;
  meta?: Record<string, unknown>;
}

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
  paid: { icon: DollarSign, label: 'Paid', color: 'text-success', bgColor: 'bg-success/10' },
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
// COMPONENTS
// ============================================================================

interface AuditEventItemProps {
  event: AuditEvent;
  isLast: boolean;
}

function AuditEventItem({ event, isLast }: AuditEventItemProps) {
  const config = getActionConfig(event.action);
  const Icon = config.icon;

  const notes = event.notesEmployeeVisible || event.notesInternal;
  const meta = event.meta as Record<string, unknown> | undefined;

  return (
    <div className="flex gap-4 relative">
      {/* Timeline connector */}
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
              {event.fromStatus && event.toStatus && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">{event.fromStatus}</Badge>
                  <ArrowRight className="w-3 h-3" />
                  <Badge variant="secondary" className="text-[10px]">{event.toStatus}</Badge>
                </span>
              )}
            </div>
            
            {/* Actor info */}
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {event.actor.initials || event.actor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {event.actor.name}
                {event.actor.role && ` (${event.actor.role})`}
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
        {notes && (
          <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            {notes}
          </div>
        )}

        {/* Meta info */}
        {meta?.assignee_name && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <UserPlus className="w-3 h-3" />
            Assigned to: <span className="font-medium">{String(meta.assignee_name)}</span>
          </div>
        )}
        {meta?.missing_docs && Array.isArray(meta.missing_docs) && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Documents requested:</span>
            <ul className="mt-1 space-y-0.5">
              {(meta.missing_docs as string[]).map((doc, i) => (
                <li key={i}>• {doc}</li>
              ))}
            </ul>
          </div>
        )}
        {meta?.reason && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Reason:</span> {String(meta.reason)}
          </div>
        )}
        {meta?.payment_reference && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Payment Ref:</span> {String(meta.payment_reference)}
          </div>
        )}
      </div>
    </div>
  );
}

interface DecisionAuditTrailDrawerProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  requestRef?: string;
}

export function DecisionAuditTrailDrawer({
  requestId,
  isOpen,
  onClose,
  requestRef,
}: DecisionAuditTrailDrawerProps) {
  const { data: timeline, isLoading } = useRequestTimeline(requestId);

  // Transform timeline data to AuditEvent format
  const auditEvents = useMemo<AuditEvent[]>(() => {
    if (!timeline) return [];

    return timeline.map((event) => ({
      id: event.id,
      timestamp: new Date(event.created_at),
      actor: {
        id: event.actor_user_id || 'system',
        name: event.actor_name || 'System',
        role: event.actor_role || undefined,
      },
      action: event.action,
      fromStatus: event.from_status,
      toStatus: event.to_status,
      visibility: (event.visibility === 'employee_visible' ? 'employee_visible' : 'internal') as 'internal' | 'employee_visible',
      notesInternal: event.notes_internal,
      notesEmployeeVisible: event.notes_employee_visible,
      meta: event.meta as Record<string, unknown> | undefined,
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [timeline]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Decision Audit Trail
          </SheetTitle>
          <SheetDescription>
            Complete history for {requestRef || 'this request'}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-180px)]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : auditEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No activity recorded</p>
            </div>
          ) : (
            <div className="relative">
              {auditEvents.map((event, index) => (
                <AuditEventItem
                  key={event.id}
                  event={event}
                  isLast={index === auditEvents.length - 1}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Summary stats */}
        {auditEvents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{auditEvents.length}</p>
                <p className="text-[10px] text-muted-foreground">Total Events</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {auditEvents.filter(e => e.action === 'status_changed').length}
                </p>
                <p className="text-[10px] text-muted-foreground">Status Changes</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {new Set(auditEvents.map(e => e.actor.id)).size}
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

export default DecisionAuditTrailDrawer;
