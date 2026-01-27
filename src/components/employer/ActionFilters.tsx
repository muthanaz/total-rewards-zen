import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import type { Status, Priority, ActionType, Confidence, SourceType } from '@/hooks/useEmployerActions';

interface ActionFiltersProps {
  statusFilter: Status | 'all';
  priorityFilter: Priority | 'all';
  typeFilter: ActionType | 'all';
  sourceFilter: SourceType | 'all';
  confidenceFilter: Confidence | 'all';
  ownerFilter: string | 'all';
  onStatusChange: (value: Status | 'all') => void;
  onPriorityChange: (value: Priority | 'all') => void;
  onTypeChange: (value: ActionType | 'all') => void;
  onSourceChange: (value: SourceType | 'all') => void;
  onConfidenceChange: (value: Confidence | 'all') => void;
  onOwnerChange: (value: string | 'all') => void;
  onClearAll: () => void;
  owners: Array<{ id: string | null; name: string }>;
}

export function ActionFilters({
  statusFilter,
  priorityFilter,
  typeFilter,
  sourceFilter,
  confidenceFilter,
  ownerFilter,
  onStatusChange,
  onPriorityChange,
  onTypeChange,
  onSourceChange,
  onConfidenceChange,
  onOwnerChange,
  onClearAll,
  owners,
}: ActionFiltersProps) {
  const hasActiveFilters = 
    statusFilter !== 'all' || 
    priorityFilter !== 'all' || 
    typeFilter !== 'all' || 
    sourceFilter !== 'all' || 
    confidenceFilter !== 'all' || 
    ownerFilter !== 'all';
  
  const activeFilterCount = [
    statusFilter !== 'all',
    priorityFilter !== 'all',
    typeFilter !== 'all',
    sourceFilter !== 'all',
    confidenceFilter !== 'all',
    ownerFilter !== 'all',
  ].filter(Boolean).length;
  
  return (
    <div className="space-y-3">
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>
        
        {/* Status */}
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as Status | 'all')}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Priority */}
        <Select value={priorityFilter} onValueChange={(v) => onPriorityChange(v as Priority | 'all')}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="P0">P0 - Critical</SelectItem>
            <SelectItem value="P1">P1 - High</SelectItem>
            <SelectItem value="P2">P2 - Medium</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Type */}
        <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as ActionType | 'all')}>
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="process">Process</SelectItem>
            <SelectItem value="comms">Comms</SelectItem>
            <SelectItem value="vendor">Vendor</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Source */}
        <Select value={sourceFilter} onValueChange={(v) => onSourceChange(v as SourceType | 'all')}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="zombie_spend">Budget Leakage</SelectItem>
            <SelectItem value="segments">Segments</SelectItem>
            <SelectItem value="claims">Claims</SelectItem>
            <SelectItem value="policies">Policies</SelectItem>
            <SelectItem value="survey">Survey</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Confidence */}
        <Select value={confidenceFilter} onValueChange={(v) => onConfidenceChange(v as Confidence | 'all')}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confidence</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Owner */}
        <Select value={ownerFilter} onValueChange={onOwnerChange}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {owners.filter(o => o.id).map((owner) => (
              <SelectItem key={owner.id} value={owner.id!}>
                {owner.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Clear All */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onClearAll}>
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>
      
      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {statusFilter.replace('_', ' ')}
              <button className="ml-1 hover:text-destructive" onClick={() => onStatusChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priorityFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Priority: {priorityFilter}
              <button className="ml-1 hover:text-destructive" onClick={() => onPriorityChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Type: {typeFilter}
              <button className="ml-1 hover:text-destructive" onClick={() => onTypeChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {sourceFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Source: {sourceFilter.replace('_', ' ')}
              <button className="ml-1 hover:text-destructive" onClick={() => onSourceChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {confidenceFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Confidence: {confidenceFilter}
              <button className="ml-1 hover:text-destructive" onClick={() => onConfidenceChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {ownerFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Owner: {ownerFilter === 'unassigned' ? 'Unassigned' : owners.find(o => o.id === ownerFilter)?.name}
              <button className="ml-1 hover:text-destructive" onClick={() => onOwnerChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
