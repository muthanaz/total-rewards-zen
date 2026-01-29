import { CalendarDays, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarEvent } from './types';
import { differenceInDays, isToday, isPast, isFuture } from 'date-fns';

interface CalendarStatsProps {
  events: CalendarEvent[];
}

export function CalendarStats({ events }: CalendarStatsProps) {
  const dueToday = events.filter(e => isToday(e.date) && e.status !== 'completed').length;
  const thisWeek = events.filter(e => {
    const days = differenceInDays(e.date, new Date());
    return days >= 0 && days <= 7 && e.status !== 'completed';
  }).length;
  const overdue = events.filter(e => isPast(e.date) && e.status !== 'completed').length;
  const completed = events.filter(e => e.status === 'completed').length;

  const stats = [
    {
      label: 'Due Today',
      value: dueToday,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-l-destructive',
    },
    {
      label: 'This Week',
      value: thisWeek,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-l-amber-500',
    },
    {
      label: 'Upcoming',
      value: events.filter(e => isFuture(e.date) && e.status !== 'completed').length,
      icon: CalendarDays,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-l-blue-500',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-l-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border-l-4 ${stat.borderColor}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
