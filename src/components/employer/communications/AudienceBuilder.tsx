import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Filter, 
  Globe,
  Building2,
  MapPin,
  Briefcase,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudienceSegment, AudienceFilter } from './types';

interface AudienceBuilderProps {
  segments: AudienceSegment[];
  audienceType: 'segment' | 'filter' | 'all';
  selectedSegmentId?: string;
  filters?: AudienceFilter;
  onAudienceTypeChange: (type: 'segment' | 'filter' | 'all') => void;
  onSegmentChange: (segmentId: string) => void;
  onFiltersChange: (filters: AudienceFilter) => void;
  estimatedCount: number;
}

const GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];
const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
const LOCATIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Remote'];
const BENEFITS = ['Healthcare', 'Education', 'Housing', 'Transportation', 'Professional Development'];

export function AudienceBuilder({
  segments,
  audienceType,
  selectedSegmentId,
  filters = {},
  onAudienceTypeChange,
  onSegmentChange,
  onFiltersChange,
  estimatedCount,
}: AudienceBuilderProps) {
  const [localFilters, setLocalFilters] = useState<AudienceFilter>(filters);

  const updateFilter = (key: keyof AudienceFilter, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: 'grades' | 'departments' | 'locations' | 'benefitEligibility', value: string) => {
    const current = localFilters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Audience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audience Type Selection */}
        <RadioGroup
          value={audienceType}
          onValueChange={(v) => onAudienceTypeChange(v as any)}
          className="grid grid-cols-3 gap-2"
        >
          <Label
            htmlFor="all"
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
              audienceType === 'all' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <RadioGroupItem value="all" id="all" />
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">All Employees</span>
          </Label>
          <Label
            htmlFor="segment"
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
              audienceType === 'segment' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <RadioGroupItem value="segment" id="segment" />
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Segment</span>
          </Label>
          <Label
            htmlFor="filter"
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
              audienceType === 'filter' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <RadioGroupItem value="filter" id="filter" />
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Custom Filter</span>
          </Label>
        </RadioGroup>

        {/* Segment Selection */}
        {audienceType === 'segment' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Select Segment</Label>
            <Select value={selectedSegmentId} onValueChange={onSegmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a segment..." />
              </SelectTrigger>
              <SelectContent>
                {segments.map(seg => (
                  <SelectItem key={seg.id} value={seg.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{seg.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {seg.estimatedCount}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSegmentId && (
              <p className="text-xs text-muted-foreground">
                {segments.find(s => s.id === selectedSegmentId)?.description}
              </p>
            )}
          </div>
        )}

        {/* Custom Filters */}
        {audienceType === 'filter' && (
          <div className="space-y-4 pt-2 border-t">
            {/* Grades */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                Grades
              </Label>
              <div className="flex flex-wrap gap-2">
                {GRADES.map(grade => (
                  <Badge
                    key={grade}
                    variant={localFilters.grades?.includes(grade) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('grades', grade)}
                  >
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Departments
              </Label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map(dept => (
                  <Badge
                    key={dept}
                    variant={localFilters.departments?.includes(dept) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('departments', dept)}
                  >
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Locations
              </Label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(loc => (
                  <Badge
                    key={loc}
                    variant={localFilters.locations?.includes(loc) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('locations', loc)}
                  >
                    {loc}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Benefit Eligibility */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Benefit Eligibility
              </Label>
              <div className="flex flex-wrap gap-2">
                {BENEFITS.map(benefit => (
                  <Badge
                    key={benefit}
                    variant={localFilters.benefitEligibility?.includes(benefit) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('benefitEligibility', benefit)}
                  >
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Estimated Recipients */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <span className="text-sm text-muted-foreground">Estimated Recipients</span>
          <span className="text-lg font-bold tabular-nums">{estimatedCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
