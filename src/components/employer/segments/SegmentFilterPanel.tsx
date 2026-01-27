/**
 * Segment Filter Panel (The "Slicer")
 * 
 * Left panel with collapsible filter groups for segment definition.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Bookmark, 
  RotateCcw, 
  Filter, 
  ChevronDown, 
  Users, 
  Briefcase, 
  Activity,
  X,
} from 'lucide-react';
import { 
  SegmentFilters, 
  DEPARTMENTS, 
  NATIONALITIES, 
  GRADES, 
  TENURE_OPTIONS,
  SALARY_MIN,
  SALARY_MAX,
  BENEFIT_TYPES,
  UTILIZATION_RANGES,
  RISK_LEVELS,
} from './types';
import { formatCurrencyAED } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SegmentFilterPanelProps {
  filters: SegmentFilters;
  onFilterChange: <K extends keyof SegmentFilters>(key: K, value: SegmentFilters[K]) => void;
  onReset: () => void;
  onSave: () => void;
  hasActiveFilters: boolean;
}

interface FilterGroupProps {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
  activeCount?: number;
}

function FilterGroup({ title, icon: Icon, defaultOpen = true, children, activeCount = 0 }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left hover:bg-muted/50 rounded-md px-2 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{title}</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {activeCount}
            </Badge>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SegmentFilterPanel({
  filters,
  onFilterChange,
  onReset,
  onSave,
  hasActiveFilters,
}: SegmentFilterPanelProps) {
  const toggleArrayFilter = (key: 'departments' | 'nationalities' | 'grades', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange(key, updated);
  };

  // Count active filters per group
  const demographicsCount = filters.nationalities.length;
  const employmentCount = 
    filters.departments.length + 
    filters.grades.length + 
    (filters.tenure ? 1 : 0) + 
    (filters.salaryRange[0] !== SALARY_MIN || filters.salaryRange[1] !== SALARY_MAX ? 1 : 0);
  const behaviorCount = 
    (filters.utilizationRange ? 1 : 0) + 
    (filters.riskLevel ? 1 : 0) +
    (filters.benefitType ? 1 : 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Segment Filters
          </CardTitle>
        </div>
        {/* Reset Button - Always visible at top */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full mt-2 gap-2 text-destructive hover:text-destructive"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All Filters
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-4">
            
            {/* Active Benefit Filter (from drill-down) */}
            {filters.benefitType && (
              <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Filtered by benefit</p>
                    <p className="font-medium text-accent">{filters.benefitType} Claims</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onFilterChange('benefitType', null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Demographics Group */}
            <FilterGroup 
              title="Demographics" 
              icon={Users} 
              activeCount={demographicsCount}
              defaultOpen={true}
            >
              {/* Nationality Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Nationality
                </Label>
                <div className="space-y-1.5">
                  {NATIONALITIES.map(nat => (
                    <label
                      key={nat}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors text-sm",
                        filters.nationalities.includes(nat)
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <Checkbox
                        checked={filters.nationalities.includes(nat)}
                        onCheckedChange={() => toggleArrayFilter('nationalities', nat)}
                      />
                      {nat}
                    </label>
                  ))}
                </div>
              </div>
            </FilterGroup>

            {/* Employment Group */}
            <FilterGroup 
              title="Employment" 
              icon={Briefcase}
              activeCount={employmentCount}
              defaultOpen={true}
            >
              {/* Department Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Department
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEPARTMENTS.map(dept => (
                    <label
                      key={dept}
                      className={cn(
                        "flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer transition-colors text-xs",
                        filters.departments.includes(dept)
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <Checkbox
                        checked={filters.departments.includes(dept)}
                        onCheckedChange={() => toggleArrayFilter('departments', dept)}
                        className="h-3.5 w-3.5"
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Grade Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Grade / Level
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {GRADES.map(grade => (
                    <button
                      key={grade}
                      onClick={() => toggleArrayFilter('grades', grade)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                        filters.grades.includes(grade)
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Salary Band Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Salary Band (Monthly)
                </Label>
                <div className="px-1">
                  <Slider
                    value={filters.salaryRange}
                    min={SALARY_MIN}
                    max={SALARY_MAX}
                    step={5000}
                    onValueChange={(value) => onFilterChange('salaryRange', value as [number, number])}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrencyAED(filters.salaryRange[0])}</span>
                  <span>{formatCurrencyAED(filters.salaryRange[1])}{filters.salaryRange[1] >= SALARY_MAX ? '+' : ''}</span>
                </div>
              </div>
              
              {/* Tenure Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Tenure
                </Label>
                <RadioGroup
                  value={filters.tenure || ''}
                  onValueChange={(value) => onFilterChange('tenure', value || null)}
                >
                  <div className="grid grid-cols-2 gap-1.5">
                    {TENURE_OPTIONS.map(option => (
                      <label
                        key={option.value}
                        className={cn(
                          "flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer transition-colors text-xs",
                          filters.tenure === option.value
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        <RadioGroupItem value={option.value} className="h-3.5 w-3.5" />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </RadioGroup>
                {filters.tenure && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterChange('tenure', null)}
                    className="h-6 text-xs w-full"
                  >
                    Clear tenure
                  </Button>
                )}
              </div>
            </FilterGroup>

            {/* Behavior Group */}
            <FilterGroup 
              title="Behavior" 
              icon={Activity}
              activeCount={behaviorCount}
              defaultOpen={false}
            >
              {/* Utilization Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Utilization %
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {UTILIZATION_RANGES.map(option => {
                    const isSelected = filters.utilizationRange && 
                      filters.utilizationRange[0] === option.range[0] && 
                      filters.utilizationRange[1] === option.range[1];
                    return (
                      <button
                        key={option.value}
                        onClick={() => onFilterChange('utilizationRange', isSelected ? null : option.range)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border",
                          isSelected
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-muted hover:bg-muted/80 border-transparent"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Risk Level */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Risk Status
                </Label>
                <div className="space-y-1.5">
                  {RISK_LEVELS.map(level => (
                    <button
                      key={level.value}
                      onClick={() => onFilterChange('riskLevel', filters.riskLevel === level.value ? null : level.value)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition-colors",
                        filters.riskLevel === level.value
                          ? level.className
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Benefit Type (shows what's filterable) */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Benefit Type
                </Label>
                <div className="flex flex-wrap gap-1">
                  {BENEFIT_TYPES.map(benefit => (
                    <button
                      key={benefit}
                      onClick={() => onFilterChange('benefitType', filters.benefitType === benefit ? null : benefit)}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs transition-colors",
                        filters.benefitType === benefit
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {benefit}
                    </button>
                  ))}
                </div>
              </div>
            </FilterGroup>
          </div>
        </ScrollArea>
        
        {/* Save Button */}
        <div className="p-4 border-t">
          <Button
            onClick={onSave}
            disabled={!hasActiveFilters}
            className="w-full gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Save as New Segment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}