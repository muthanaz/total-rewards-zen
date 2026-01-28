import { useState, useMemo } from 'react';
import { CalendarDays, CalendarCheck, Plus, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { differenceInDays, isPast, isToday, isFuture } from 'date-fns';

import {
  CalendarStats,
  CalendarFilters,
  EventCard,
  CutoffChecklistDrawer,
  mockCalendarEvents,
  CalendarEvent,
  EventType,
  EventStatus,
} from '@/components/employer/calendar';

export default function CalendarPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  // Filter state
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');

  // Checklist drawer state
  const [checklistEvent, setChecklistEvent] = useState<CalendarEvent | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);

  const hasActiveFilters = selectedType !== 'all' || selectedStatus !== 'all';

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let events = [...mockCalendarEvents];

    // Apply type filter
    if (selectedType !== 'all') {
      events = events.filter(e => e.type === selectedType);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      events = events.filter(e => {
        if (selectedStatus === 'overdue') {
          return isPast(e.date) && !isToday(e.date) && e.status !== 'completed';
        }
        if (selectedStatus === 'due_today') {
          return isToday(e.date) && e.status !== 'completed';
        }
        if (selectedStatus === 'upcoming') {
          return isFuture(e.date) && e.status !== 'completed';
        }
        return e.status === selectedStatus;
      });
    }

    // Sort by urgency: overdue first, then by date
    return events.sort((a, b) => {
      // Completed items last
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;

      // Priority weight
      const priorityWeight = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];

      // Overdue items first
      const aOverdue = isPast(a.date) && !isToday(a.date);
      const bOverdue = isPast(b.date) && !isToday(b.date);
      if (aOverdue && !bOverdue) return -1;
      if (bOverdue && !aOverdue) return 1;

      // Then by date
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;

      // Then by priority
      return aPriority - bPriority;
    });
  }, [selectedType, selectedStatus]);

  // Group events
  const groupedEvents = useMemo(() => {
    const groups = {
      urgent: [] as CalendarEvent[],
      thisWeek: [] as CalendarEvent[],
      upcoming: [] as CalendarEvent[],
      completed: [] as CalendarEvent[],
    };

    filteredEvents.forEach(event => {
      if (event.status === 'completed') {
        groups.completed.push(event);
        return;
      }

      const daysUntil = differenceInDays(event.date, new Date());

      if (isPast(event.date) || isToday(event.date) || daysUntil <= 3) {
        groups.urgent.push(event);
      } else if (daysUntil <= 7) {
        groups.thisWeek.push(event);
      } else {
        groups.upcoming.push(event);
      }
    });

    return groups;
  }, [filteredEvents]);

  const handleSyncCalendar = () => {
    toast.success('Calendar sync initiated', {
      description: 'iCal feed URL copied to clipboard. Add to Outlook or Google Calendar.',
    });
  };

  const handleOpenChecklist = (event: CalendarEvent) => {
    setChecklistEvent(event);
    setChecklistOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedType('all');
    setSelectedStatus('all');
  };

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
              Track payroll cutoffs, policy renewals, and operational deadlines
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Stats */}
        <CalendarStats events={mockCalendarEvents} />

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CalendarFilters
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onTypeChange={setSelectedType}
            onStatusChange={setSelectedStatus}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
          <p className="text-sm text-muted-foreground">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Urgent / Due Soon */}
        {groupedEvents.urgent.length > 0 && (
          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <CalendarDays className="w-5 h-5" />
                Urgent / Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedEvents.urgent.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onOpenChecklist={handleOpenChecklist} 
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* This Week */}
        {groupedEvents.thisWeek.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <CalendarDays className="w-5 h-5" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedEvents.thisWeek.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onOpenChecklist={handleOpenChecklist} 
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming */}
        {groupedEvents.upcoming.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-5 h-5" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedEvents.upcoming.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onOpenChecklist={handleOpenChecklist} 
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Completed */}
        {groupedEvents.completed.length > 0 && (
          <Card className="opacity-75">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-5 h-5" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedEvents.completed.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onOpenChecklist={handleOpenChecklist} 
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-1">No events found</h3>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters 
                  ? 'Try adjusting your filters'
                  : 'Add your first calendar event to get started'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cutoff Checklist Drawer */}
        <CutoffChecklistDrawer
          event={checklistEvent}
          open={checklistOpen}
          onOpenChange={setChecklistOpen}
        />
      </div>
    </TooltipProvider>
  );
}
