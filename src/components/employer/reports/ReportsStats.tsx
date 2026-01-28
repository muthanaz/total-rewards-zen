/**
 * Reports Stats Component
 */

import { Card, CardContent } from '@/components/ui/card';
import { FileText, Clock, Download, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportsStatsProps {
  totalReports: number;
  recentGenerations: number;
  savedPresets: number;
  scheduledReports: number;
}

export function ReportsStats({
  totalReports,
  recentGenerations,
  savedPresets,
  scheduledReports,
}: ReportsStatsProps) {
  const stats = [
    {
      label: 'Available Reports',
      value: totalReports,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Generated This Week',
      value: recentGenerations,
      icon: Download,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Saved Presets',
      value: savedPresets,
      icon: BookMarked,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Scheduled',
      value: scheduledReports,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
