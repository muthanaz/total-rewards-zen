/**
 * Claim Audit Log Tab
 * 
 * Full audit trail showing time, actor, action, and notes.
 */

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  timestamp: Date;
  actor: {
    name: string;
    role?: string;
    initials?: string;
  };
  action: 'created' | 'viewed' | 'updated' | 'approved' | 'rejected' | 'assigned' | 'escalated' | 'info_requested' | 'note_added' | 'doc_received';
  note?: string;
  metadata?: Record<string, string>;
}

interface ClaimAuditLogProps {
  entries: AuditEntry[];
}

const actionConfig: Record<AuditEntry['action'], { 
  icon: typeof Clock; 
  label: string; 
  color: string;
  bgColor: string;
}> = {
  created: { icon: FileText, label: 'Claim submitted', color: 'text-primary', bgColor: 'bg-primary/10' },
  viewed: { icon: Eye, label: 'Viewed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  updated: { icon: Edit2, label: 'Updated', color: 'text-info', bgColor: 'bg-info/10' },
  approved: { icon: CheckCircle, label: 'Approved', color: 'text-success', bgColor: 'bg-success/10' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  assigned: { icon: UserPlus, label: 'Assigned', color: 'text-info', bgColor: 'bg-info/10' },
  escalated: { icon: Flag, label: 'Escalated', color: 'text-warning', bgColor: 'bg-warning/10' },
  info_requested: { icon: Send, label: 'Info requested', color: 'text-warning', bgColor: 'bg-warning/10' },
  note_added: { icon: MessageSquare, label: 'Note added', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  doc_received: { icon: FileText, label: 'Document received', color: 'text-success', bgColor: 'bg-success/10' },
};

export function ClaimAuditLog({ entries }: ClaimAuditLogProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No activity recorded</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {entries.map((entry, index) => {
          const config = actionConfig[entry.action];
          const Icon = config.icon;

          return (
            <div key={entry.id} className="flex gap-4 relative">
              {/* Icon */}
              <div className={cn(
                "relative z-10 p-2 rounded-full shrink-0",
                config.bgColor
              )}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium text-sm", config.color)}>
                        {config.label}
                      </span>
                      {entry.metadata?.priority && (
                        <Badge variant="outline" className="text-xs">
                          {entry.metadata.priority}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {entry.actor.initials || entry.actor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {entry.actor.name}
                        {entry.actor.role && ` (${entry.actor.role})`}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(entry.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>

                {entry.note && (
                  <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    {entry.note}
                  </div>
                )}

                {entry.metadata?.assignee && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Assigned to: <span className="font-medium">{entry.metadata.assignee}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
