import { useRequestEvents, type RequestEvent } from '@/hooks/useRequests';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send, 
  Eye, 
  CreditCard, 
  Archive,
  FileEdit,
  User
} from 'lucide-react';

interface RequestTimelineProps {
  requestId: string | null;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  draft: { icon: FileEdit, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  submitted: { icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  in_review: { icon: Eye, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  approved: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-500/10' },
  paid: { icon: CreditCard, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
  closed: { icon: Archive, color: 'text-slate-600', bgColor: 'bg-slate-500/10' },
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    pending: 'Pending',
    in_review: 'In Review',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
    closed: 'Closed',
  };
  return labels[status] || status;
}

export function RequestTimeline({ requestId }: RequestTimelineProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { data: events, isLoading, error } = useRequestEvents(requestId);

  if (!requestId) return null;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        {isArabic ? 'فشل في تحميل التاريخ' : 'Failed to load history'}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        {isArabic ? 'لا يوجد سجل بعد' : 'No history yet'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground">
        {isArabic ? 'الجدول الزمني' : 'Timeline'}
      </h4>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {events.map((event, index) => {
            const config = statusConfig[event.to_status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const actorName = event.actor_profile
              ? `${event.actor_profile.first_name || ''} ${event.actor_profile.last_name || ''}`.trim()
              : 'System';

            return (
              <div key={event.id} className="relative flex gap-3 pl-1">
                {/* Status Icon */}
                <div className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                  config.bgColor
                )}>
                  <StatusIcon className={cn('h-4 w-4', config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {getStatusLabel(event.to_status)}
                    </Badge>
                    {event.from_status && (
                      <span className="text-xs text-muted-foreground">
                        ← {getStatusLabel(event.from_status)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <User className="h-3 w-3" />
                    <span>{actorName}</span>
                    <span>•</span>
                    <span title={format(new Date(event.created_at), 'PPpp')}>
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Notes */}
                  {event.notes_employee_visible && (
                    <div className="mt-2 text-sm bg-muted/50 rounded-lg p-2">
                      <p className="text-foreground">{event.notes_employee_visible}</p>
                    </div>
                  )}

                  {/* Internal notes - only visible to employers */}
                  {event.notes_internal && (
                    <div className="mt-2 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                      <p className="text-xs font-medium text-amber-600 mb-1">
                        {isArabic ? 'ملاحظات داخلية' : 'Internal Note'}
                      </p>
                      <p className="text-foreground">{event.notes_internal}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
