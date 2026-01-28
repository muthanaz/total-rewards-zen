import { differenceInDays, differenceInHours, isToday, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CountdownBadgeProps {
  date: Date;
  isCompleted?: boolean;
}

export function CountdownBadge({ date, isCompleted }: CountdownBadgeProps) {
  if (isCompleted) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
        Completed
      </Badge>
    );
  }

  const now = new Date();
  const daysUntil = differenceInDays(date, now);
  const hoursUntil = differenceInHours(date, now);

  if (isPast(date) && !isToday(date)) {
    const daysOverdue = Math.abs(daysUntil);
    return (
      <Badge variant="destructive" className="animate-pulse">
        {daysOverdue}d overdue
      </Badge>
    );
  }

  if (isToday(date)) {
    return (
      <Badge variant="destructive">
        Due Today
      </Badge>
    );
  }

  if (daysUntil <= 3) {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
        {daysUntil}d left
      </Badge>
    );
  }

  if (daysUntil <= 7) {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
        {daysUntil}d left
      </Badge>
    );
  }

  if (daysUntil <= 30) {
    return (
      <Badge variant="secondary">
        {daysUntil} days
      </Badge>
    );
  }

  const weeks = Math.floor(daysUntil / 7);
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {weeks}w away
    </Badge>
  );
}
