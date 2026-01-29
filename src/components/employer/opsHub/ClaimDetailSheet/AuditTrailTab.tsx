/**
 * ClaimDetailSheet - Audit Trail Tab
 * 
 * Read-only timeline of all events (sanitized for display)
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Circle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Send,
  ArrowRight,
  Eye,
  EyeOff,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { AuditEvent } from './types';

interface AuditTrailTabProps {
  events: AuditEvent[];
  isLoading?: boolean;
}

const actionIcons: Record<string, React.ElementType> = {
  'status_changed': ArrowRight,
  'created': Circle,
  'submitted': Send,
  'approved': CheckCircle,
  'rejected': XCircle,
  'info_requested': FileText,
  'doc_uploaded': FileText,
  'doc_verified': CheckCircle,
  'doc_rejected': XCircle,
  'note_added': MessageSquare,
  'assigned': User,
  'escalated': Clock,
};

const actionLabels: Record<string, string> = {
  'status_changed': 'Status Changed',
  'created': 'Claim Created',
  'submitted': 'Claim Submitted',
  'approved': 'Claim Approved',
  'rejected': 'Claim Rejected',
  'info_requested': 'Information Requested',
  'doc_uploaded': 'Document Uploaded',
  'doc_verified': 'Document Verified',
  'doc_rejected': 'Document Rejected',
  'note_added': 'Note Added',
  'assigned': 'Claim Assigned',
  'escalated': 'Claim Escalated',
};

function getActionColor(action: string): string {
  if (action.includes('approved') || action.includes('verified')) return 'text-success';
  if (action.includes('rejected')) return 'text-destructive';
  if (action.includes('info') || action.includes('request')) return 'text-warning';
  return 'text-muted-foreground';
}

export function AuditTrailTab({ events, isLoading }: AuditTrailTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No audit events recorded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border" />

        {events.map((event, index) => {
          const Icon = actionIcons[event.action] || Circle;
          const label = actionLabels[event.action] || event.action;
          const colorClass = getActionColor(event.action);

          return (
            <div key={event.id} className="relative pl-10 pb-4">
              {/* Timeline dot */}
              <div className={cn(
                'absolute left-0 w-6 h-6 rounded-full bg-background border-2 flex items-center justify-center',
                colorClass === 'text-success' && 'border-success',
                colorClass === 'text-destructive' && 'border-destructive',
                colorClass === 'text-warning' && 'border-warning',
                colorClass === 'text-muted-foreground' && 'border-muted-foreground'
              )}>
                <Icon className={cn('w-3 h-3', colorClass)} />
              </div>

              {/* Event content */}
              <Card className="border-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{label}</span>
                        {event.fromStatus && event.toStatus && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px] px-1">
                              {event.fromStatus}
                            </Badge>
                            <ArrowRight className="w-3 h-3" />
                            <Badge variant="outline" className="text-[10px] px-1">
                              {event.toStatus}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{event.actorName}</span>
                        <span>•</span>
                        <span>{event.actorRole}</span>
                        <span>•</span>
                        <span>{format(new Date(event.timestamp), 'dd MMM yyyy, HH:mm')}</span>
                      </div>

                      {event.notes && (
                        <p className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                          {event.notes}
                        </p>
                      )}
                    </div>

                    {/* Visibility indicator */}
                    <div className="shrink-0">
                      {event.isEmployeeVisible ? (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Eye className="w-3 h-3" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <EyeOff className="w-3 h-3" />
                          Internal
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
