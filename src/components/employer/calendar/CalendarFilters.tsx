import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventType, EventStatus, EVENT_TYPE_CONFIG } from './types';

interface CalendarFiltersProps {
  selectedType: EventType | 'all';
  selectedStatus: EventStatus | 'all';
  onTypeChange: (type: EventType | 'all') => void;
  onStatusChange: (status: EventStatus | 'all') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function CalendarFilters({
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
}: CalendarFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span>Filter:</span>
      </div>

      {/* Event Type Filter */}
      <Select value={selectedType} onValueChange={(v) => onTypeChange(v as EventType | 'all')}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Event Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={selectedStatus} onValueChange={(v) => onStatusChange(v as EventStatus | 'all')}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="due_today">Due Today</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 gap-1.5"
          onClick={onClearFilters}
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
