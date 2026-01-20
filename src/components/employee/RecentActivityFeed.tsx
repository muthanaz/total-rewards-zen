import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, Clock, FileText, Gift, AlertCircle, Bell,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatRelativeTime } from '@/lib/crossPortalContract';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'claim_approved' | 'claim_pending' | 'policy_update' | 'offer_new' | 'document_ready' | 'reminder';
  title: string;
  description?: string;
  timestamp: string;
  actionUrl?: string;
}

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  className?: string;
}

// Demo activities
const demoActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'claim_approved',
    title: 'Transport claim approved',
    description: 'AED 420 reimbursement processed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/employee/requests',
  },
  {
    id: '2',
    type: 'policy_update',
    title: 'Health policy updated',
    description: 'Dental coverage increased to AED 5,000',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/employee/health',
  },
  {
    id: '3',
    type: 'offer_new',
    title: 'New gym offer available',
    description: '25% off at Fitness First',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/employee/marketplace',
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Schooling claim deadline',
    description: 'Submit receipts by Jan 31',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/employee/schooling',
  },
];

const activityConfig: Record<ActivityItem['type'], { icon: React.ElementType; color: string }> = {
  claim_approved: { icon: CheckCircle, color: 'text-emerald-500' },
  claim_pending: { icon: Clock, color: 'text-amber-500' },
  policy_update: { icon: FileText, color: 'text-blue-500' },
  offer_new: { icon: Gift, color: 'text-violet-500' },
  document_ready: { icon: FileText, color: 'text-cyan-500' },
  reminder: { icon: AlertCircle, color: 'text-amber-500' },
};

export function RecentActivityFeed({ activities = demoActivities, className }: RecentActivityFeedProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const navigate = useNavigate();

  return (
    <Card className={cn('border-border/40', className)}>
      <CardHeader className="pb-3">
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <CardTitle className={cn('text-base font-display flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <Bell className="w-4 h-4 text-muted-foreground" />
            {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {activities.length} {language === 'ar' ? 'تحديثات' : 'updates'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {activities.slice(0, 4).map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <button
              key={activity.id}
              onClick={() => activity.actionUrl && navigate(activity.actionUrl)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group',
                isRTL && 'flex-row-reverse text-right'
              )}
            >
              <div className={cn('p-1.5 rounded-lg bg-muted shrink-0', config.color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                )}
              </div>
              <div className={cn('flex items-center gap-1 shrink-0', isRTL && 'flex-row-reverse')}>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(activity.timestamp)}
                </span>
                <ChevronRight className={cn(
                  'w-3 h-3 text-muted-foreground/50 group-hover:text-foreground transition-colors',
                  isRTL && 'rotate-180'
                )} />
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
