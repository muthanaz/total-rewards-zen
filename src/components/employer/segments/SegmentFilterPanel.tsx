/**
 * Segment Filter Panel (The "Slicer")
 * 
 * Left panel with all segment definition filters.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bookmark, RotateCcw, Filter } from 'lucide-react';
import { 
  SegmentFilters, 
  DEPARTMENTS, 
  NATIONALITIES, 
  GRADES, 
  TENURE_OPTIONS,
  SALARY_MIN,
  SALARY_MAX,
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Segment Definitions
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 text-xs gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 pb-4">
            {/* Department Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Department
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {DEPARTMENTS.map(dept => (
                  <label
                    key={dept}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors text-sm",
                      filters.departments.includes(dept)
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    <Checkbox
                      checked={filters.departments.includes(dept)}
                      onCheckedChange={() => toggleArrayFilter('departments', dept)}
                    />
                    {dept}
                  </label>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Nationality Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
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
            
            <Separator />
            
            {/* Grade/Level Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Grade / Level
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {GRADES.map(grade => (
                  <button
                    key={grade}
                    onClick={() => toggleArrayFilter('grades', grade)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
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
            
            <Separator />
            
            {/* Salary Band Filter */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
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
            
            <Separator />
            
            {/* Tenure Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Tenure
              </Label>
              <RadioGroup
                value={filters.tenure || ''}
                onValueChange={(value) => onFilterChange('tenure', value || null)}
              >
                <div className="grid grid-cols-2 gap-2">
                  {TENURE_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors text-sm",
                        filters.tenure === option.value
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <RadioGroupItem value={option.value} />
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
                  Clear tenure filter
                </Button>
              )}
            </div>
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
