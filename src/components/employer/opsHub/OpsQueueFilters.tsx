/**
 * Operations Hub Filters Bar
 * 
 * Comprehensive filter controls for the queue:
 * - Type (claim/request/document)
 * - Benefit category
 * - Amount range
 * - SLA status
 * - Missing docs
 * - Assigned to
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QueueFilters, TeamMember } from './types';

interface OpsQueueFiltersProps {
  filters: QueueFilters;
  onFiltersChange: (filters: QueueFilters) => void;
  teamMembers: TeamMember[];
  categories: string[];
  activeFiltersCount: number;
  onClearAll: () => void;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'claim', label: 'Claims (Reimbursement)' },
  { value: 'request', label: 'Requests (Pre-approval)' },
];

const SLA_OPTIONS = [
  { value: 'all', label: 'All SLA Status' },
  { value: 'on_track', label: '✓ On Track' },
  { value: 'at_risk', label: '⚠ At Risk (<24h)' },
  { value: 'breached', label: '✕ Breached' },
];

const DOCS_OPTIONS = [
  { value: 'all', label: 'All Doc Status' },
  { value: 'has_missing', label: 'Missing Docs' },
  { value: 'complete', label: 'Docs Complete' },
];

export function OpsQueueFilters({
  filters,
  onFiltersChange,
  teamMembers,
  categories,
  activeFiltersCount,
  onClearAll,
}: OpsQueueFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = <K extends keyof QueueFilters>(key: K, value: QueueFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-3">
      {/* Primary Row: Search + Quick Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, employee, category..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select value={filters.type} onValueChange={(v) => updateFilter('type', v as QueueFilters['type'])}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* SLA Status */}
        <Select value={filters.slaStatus} onValueChange={(v) => updateFilter('slaStatus', v as QueueFilters['slaStatus'])}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="SLA Status" />
          </SelectTrigger>
          <SelectContent>
            {SLA_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "shrink-0",
                activeFiltersCount > 0 && "border-primary text-primary"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4 bg-popover">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Advanced Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClearAll}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Docs Status */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Document Status</Label>
                <Select 
                  value={filters.missingDocs} 
                  onValueChange={(v) => updateFilter('missingDocs', v as QueueFilters['missingDocs'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Assigned To</Label>
                <Select 
                  value={filters.assignedTo} 
                  onValueChange={(v) => updateFilter('assignedTo', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Team Members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team Members</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="me">Assigned to Me</SelectItem>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Amount Range (AED)</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount ?? ''}
                      onChange={(e) => updateFilter('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                      className="pl-6 h-8 text-sm"
                    />
                  </div>
                  <span className="text-muted-foreground">–</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount ?? ''}
                      onChange={(e) => updateFilter('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                      className="pl-6 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Pills */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.type === 'claim' ? 'Claims' : 'Requests'}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('type', 'all')} 
              />
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('category', 'all')} 
              />
            </Badge>
          )}
          {filters.slaStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              SLA: {filters.slaStatus.replace('_', ' ')}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('slaStatus', 'all')} 
              />
            </Badge>
          )}
          {filters.missingDocs !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.missingDocs === 'has_missing' ? 'Missing Docs' : 'Docs Complete'}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('missingDocs', 'all')} 
              />
            </Badge>
          )}
          {filters.assignedTo !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Assigned: {filters.assignedTo === 'unassigned' ? 'None' : filters.assignedTo}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('assignedTo', 'all')} 
              />
            </Badge>
          )}
          {(filters.minAmount !== undefined || filters.maxAmount !== undefined) && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Amount: {filters.minAmount ?? 0} - {filters.maxAmount ?? '∞'}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  onFiltersChange({ ...filters, minAmount: undefined, maxAmount: undefined });
                }} 
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

export default OpsQueueFilters;
