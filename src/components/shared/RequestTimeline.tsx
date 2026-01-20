/**
 * RequestTimeline - Unified request/claim timeline across portals
 * 
 * Displays the same timeline in both Employee and Employer views,
 * with appropriate visibility controls for internal notes.
 */

import { useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, FileText, 
  Send, Eye, DollarSign, Archive, User, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  getStatusDisplayLabel, 
  getStatusBadgeStyle,
  formatRelativeTime 
} from '@/lib/crossPortalContract';
import { EmployeeChip } from './EntityChip';

// ============================================================================
// TYPES
// ============================================================================

export interface TimelineEvent {
  id: string;
  request_id: string;
  actor_user_id: string;
  from_status: string | null;
  to_status: string;
  notes_employee_visible?: string | null;
  notes_internal?: string | null;
  created_at: string;
  // Enriched data (optional)
  actorName?: string;
  actorRole?: 'employee' | 'employer' | 'system';
}

interface RequestTimelineProps {
  events: TimelineEvent[];
  /** Show internal notes (employer view only) */
  showInternalNotes?: boolean;
  /** Compact mode for sidebars */
  compact?: boolean;
  /** Loading state */
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// STATUS ICONS
// ============================================================================

const statusIcons: Record<string, typeof Clock> = {
  draft: FileText,
  pending: Clock,
  submitted: Send,
  in_review: Eye,
  approved: CheckCircle,
  rejected: XCircle,
  paid: DollarSign,
  closed: Archive,
};

const statusColors: Record<string, string> = {
  draft: 'text-slate-500 bg-slate-500/10',
  pending: 'text-amber-500 bg-amber-500/10',
  submitted: 'text-blue-500 bg-blue-500/10',
  in_review: 'text-violet-500 bg-violet-500/10',
  approved: 'text-emerald-500 bg-emerald-500/10',
  rejected: 'text-red-500 bg-red-500/10',
  paid: 'text-emerald-600 bg-emerald-500/10',
  closed: 'text-slate-600 bg-slate-500/10',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function RequestTimeline({
  events,
  showInternalNotes = false,
  compact = false,
  isLoading = false,
  className,
}: RequestTimelineProps) {
  // Sort events chronologically
  const sortedEvents = useMemo(() => 
    [...events].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
    [events]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      
      {/* Events */}
      <div className="space-y-4">
        {sortedEvents.map((event, index) => (
          <TimelineEventItem
            key={event.id}
            event={event}
            showInternalNotes={showInternalNotes}
            compact={compact}
            isFirst={index === 0}
            isLast={index === sortedEvents.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TIMELINE EVENT ITEM
// ============================================================================

interface TimelineEventItemProps {
  event: TimelineEvent;
  showInternalNotes: boolean;
  compact: boolean;
  isFirst: boolean;
  isLast: boolean;
}

function TimelineEventItem({
  event,
  showInternalNotes,
  compact,
  isFirst,
  isLast,
}: TimelineEventItemProps) {
  const Icon = statusIcons[event.to_status] || Clock;
  const colorClass = statusColors[event.to_status] || 'text-slate-500 bg-slate-500/10';
  const statusStyle = getStatusBadgeStyle(event.to_status);
  
  // Format the event description
  const getEventDescription = () => {
    const toLabel = getStatusDisplayLabel(event.to_status);
    
    if (event.from_status) {
      const fromLabel = getStatusDisplayLabel(event.from_status);
      return `Changed from ${fromLabel} to ${toLabel}`;
    }
    
    return `Set to ${toLabel}`;
  };

  return (
    <div className="relative flex gap-3 pl-0">
      {/* Icon */}
      <div className={cn(
        "relative z-10 flex items-center justify-center rounded-full shrink-0",
        compact ? "w-6 h-6" : "w-8 h-8",
        colorClass
      )}>
        <Icon className={compact ? "w-3 h-3" : "w-4 h-4"} />
      </div>
      
      {/* Content */}
      <div className={cn("flex-1 pb-4", compact && "pb-3")}>
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn("text-xs", statusStyle.className)}
          >
            {getStatusDisplayLabel(event.to_status)}
          </Badge>
          
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(event.created_at)}
          </span>
        </div>
        
        {/* Description */}
        {!compact && (
          <p className="text-sm text-muted-foreground mt-1">
            {getEventDescription()}
          </p>
        )}
        
        {/* Actor info */}
        {event.actorName && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              by {event.actorName}
            </span>
          </div>
        )}
        
        {/* Employee-visible notes */}
        {event.notes_employee_visible && (
          <div className="mt-2 p-2 rounded-md bg-muted/50 border border-border/50">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm">{event.notes_employee_visible}</p>
            </div>
          </div>
        )}
        
        {/* Internal notes (employer only) */}
        {showInternalNotes && event.notes_internal && (
          <div className="mt-2 p-2 rounded-md bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-600 mb-0.5">
                  Internal Note
                </p>
                <p className="text-sm">{event.notes_internal}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        {!compact && (
          <p className="text-xs text-muted-foreground mt-2">
            {format(new Date(event.created_at), 'MMM d, yyyy • h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT TIMELINE (for cards/sidebars)
// ============================================================================

interface CompactTimelineProps {
  events: TimelineEvent[];
  maxItems?: number;
  className?: string;
}

export function CompactTimeline({
  events,
  maxItems = 3,
  className,
}: CompactTimelineProps) {
  const recentEvents = useMemo(() => 
    [...events]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, maxItems),
    [events, maxItems]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {recentEvents.map((event) => {
        const Icon = statusIcons[event.to_status] || Clock;
        const colorClass = statusColors[event.to_status] || 'text-slate-500';
        
        return (
          <div key={event.id} className="flex items-center gap-2 text-xs">
            <Icon className={cn("w-3.5 h-3.5 shrink-0", colorClass)} />
            <span className="font-medium">
              {getStatusDisplayLabel(event.to_status)}
            </span>
            <span className="text-muted-foreground">
              {formatRelativeTime(event.created_at)}
            </span>
          </div>
        );
      })}
      
      {events.length > maxItems && (
        <p className="text-xs text-muted-foreground pl-5">
          +{events.length - maxItems} more events
        </p>
      )}
    </div>
  );
}
