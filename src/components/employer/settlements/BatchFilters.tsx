import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { BatchFilters as FilterType } from './types';

interface BatchFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
  onReset: () => void;
}

export function BatchFilters({ filters, onChange, onReset }: BatchFiltersProps) {
  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.reconciliation !== 'all' || 
    filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg border">
      <Filter className="w-4 h-4 text-muted-foreground" />
      
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search batch ID, period..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9 h-9"
        />
      </div>

      <Select
        value={filters.status || 'all'}
        onValueChange={(v) => onChange({ ...filters, status: v as any })}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ready">Ready</SelectItem>
          <SelectItem value="exported">Exported</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.reconciliation || 'all'}
        onValueChange={(v) => onChange({ ...filters, reconciliation: v as any })}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Reconciliation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Reconciliation</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="matched">Matched</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
          <SelectItem value="unmatched">Unmatched</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 gap-1 text-muted-foreground"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
