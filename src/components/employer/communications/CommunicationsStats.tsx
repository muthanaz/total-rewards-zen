import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, 
  Mail, 
  Eye, 
  MousePointerClick,
  Calendar,
  FileEdit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsProps {
  stats: {
    totalCampaigns: number;
    sentCount: number;
    scheduledCount: number;
    draftCount: number;
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalActions: number;
    avgOpenRate: number;
    avgActionRate: number;
  };
}

export function CommunicationsStats({ stats }: StatsProps) {
  const metrics = [
    {
      label: 'Campaigns Sent',
      value: stats.sentCount,
      subValue: `${stats.totalSent} messages`,
      icon: Send,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Scheduled',
      value: stats.scheduledCount,
      subValue: 'upcoming',
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Avg. Open Rate',
      value: `${stats.avgOpenRate.toFixed(1)}%`,
      subValue: `${stats.totalOpened} opened`,
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Avg. Action Rate',
      value: `${stats.avgActionRate.toFixed(1)}%`,
      subValue: `${stats.totalActions} actions`,
      icon: MousePointerClick,
      color: 'text-purple-600',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', metric.bg)}>
                  <Icon className={cn('w-4 h-4', metric.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-xl font-bold tabular-nums">{metric.value}</p>
                  <p className="text-[10px] text-muted-foreground">{metric.subValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
