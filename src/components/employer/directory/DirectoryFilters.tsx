import { Search, Building2, MapPin, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeStatus, STATUS_CONFIG } from './types';

interface DirectoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  locationFilter: string;
  onLocationChange: (loc: string) => void;
  statusFilter: EmployeeStatus | 'all';
  onStatusChange: (status: EmployeeStatus | 'all') => void;
  departments: string[];
  locations: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function DirectoryFilters({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  locationFilter,
  onLocationChange,
  statusFilter,
  onStatusChange,
  departments,
  locations,
  onClearFilters,
  hasActiveFilters,
}: DirectoryFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Department Filter */}
      <Select value={departmentFilter} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-[160px] h-9">
          <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map(dept => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Location Filter */}
      <Select value={locationFilter} onValueChange={onLocationChange}>
        <SelectTrigger className="w-[140px] h-9">
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map(loc => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as EmployeeStatus | 'all')}>
        <SelectTrigger className="w-[130px] h-9">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>{config.label}</SelectItem>
          ))}
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
