import { useState } from 'react';
import { CalendarDays, Clock, AlertTriangle, CheckCircle2, FileText, Wallet, CalendarCheck, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const upcomingEvents = [
  {
    id: '1',
    title: 'Payroll Cutoff - January',
    date: '2026-01-25',
    type: 'payroll',
    status: 'upcoming',
    daysUntil: 0,
  },
  {
    id: '2',
    title: 'Health Insurance Policy Renewal',
    date: '2026-02-15',
    type: 'policy',
    status: 'upcoming',
    daysUntil: 19,
  },
  {
    id: '3',
    title: 'Q1 Benefits Review Deadline',
    date: '2026-03-31',
    type: 'deadline',
    status: 'upcoming',
    daysUntil: 63,
  },
  {
    id: '4',
    title: 'Education Allowance Claims Expiry',
    date: '2026-04-30',
    type: 'expiry',
    status: 'warning',
    daysUntil: 93,
  },
  {
    id: '5',
    title: 'Annual Leave Balance Reset',
    date: '2026-01-01',
    type: 'policy',
    status: 'completed',
    daysUntil: -26,
  },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'payroll':
      return <Wallet className="w-5 h-5 text-blue-500" />;
    case 'policy':
      return <FileText className="w-5 h-5 text-purple-500" />;
    case 'deadline':
      return <Clock className="w-5 h-5 text-amber-500" />;
    case 'expiry':
      return <AlertTriangle className="w-5 h-5 text-destructive" />;
    default:
      return <CalendarDays className="w-5 h-5 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string, daysUntil: number) => {
  if (status === 'completed') {
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Completed</Badge>;
  }
  if (daysUntil <= 3) {
    return <Badge variant="destructive">Due Today</Badge>;
  }
  if (daysUntil <= 7) {
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">This Week</Badge>;
  }
  return <Badge variant="secondary">{daysUntil} days</Badge>;
};

export default function CalendarPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const thisMonth = upcomingEvents.filter(e => e.daysUntil >= 0 && e.daysUntil <= 30);
  const upcoming = upcomingEvents.filter(e => e.daysUntil > 30);
  const past = upcomingEvents.filter(e => e.status === 'completed');

  const handleSyncCalendar = () => {
    // In production, this would generate an iCal feed URL
    toast.success('Calendar sync initiated', {
      description: 'iCal feed URL copied to clipboard. Add to Outlook or Google Calendar.',
    });
  };

  const handleSendReminder = (event: typeof upcomingEvents[0]) => {
    // In production, this would trigger an email workflow
    toast.success('Reminder scheduled', {
      description: `Email reminder for "${event.title}" will be sent to relevant employees.`,
    });
  };

  const isActionableEvent = (type: string) => type === 'deadline' || type === 'expiry';

  return (
    <TooltipProvider>
      <div className={cn('space-y-6 animate-fade-in', isRTL && 'text-right')}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              Benefits Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              Track payroll cutoffs, policy renewals, and expiration dates
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleSyncCalendar} className="gap-2">
                <CalendarCheck className="w-4 h-4" />
                Sync to Calendar
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Subscribe to iCal feed (Outlook/Google)</p>
            </TooltipContent>
          </Tooltip>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-xs text-muted-foreground">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This Month */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {thisMonth.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActionableEvent(event.type) && hoveredEventId === event.id && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(event)}
                          className="gap-1.5 text-primary hover:text-primary"
                        >
                          <Mail className="w-4 h-4" />
                          Send Reminder
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send email reminder to relevant employees</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {getStatusBadge(event.status, event.daysUntil)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-5 h-5" />
            Upcoming
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcoming.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors"
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActionableEvent(event.type) && hoveredEventId === event.id && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(event)}
                          className="gap-1.5 text-primary hover:text-primary"
                        >
                          <Mail className="w-4 h-4" />
                          Send Reminder
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send email reminder to relevant employees</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {getStatusBadge(event.status, event.daysUntil)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Events */}
      {past.length > 0 && (
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {past.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                  {getStatusBadge(event.status, event.daysUntil)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
}
