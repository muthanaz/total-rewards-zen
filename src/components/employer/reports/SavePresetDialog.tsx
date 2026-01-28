/**
 * Save Preset Dialog Component
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { BookMarked, Loader2 } from 'lucide-react';
import { ReportDefinition, ReportFilters, TIME_RANGE_OPTIONS } from './types';
import { MOCK_SEGMENTS, MOCK_GRADES } from './mockData';
import { toast } from 'sonner';

interface SavePresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportDefinition;
  filters: ReportFilters;
}

export function SavePresetDialog({
  open,
  onOpenChange,
  report,
  filters,
}: SavePresetDialogProps) {
  const [presetName, setPresetName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success(`Preset "${presetName}" saved successfully`);
    setIsSaving(false);
    setPresetName('');
    setIsDefault(false);
    onOpenChange(false);
  };

  const getFiltersSummary = () => {
    const items: string[] = [];
    
    if (filters.timeRange !== 'ytd') {
      const option = TIME_RANGE_OPTIONS.find((o) => o.value === filters.timeRange);
      if (option) items.push(option.label);
    }
    
    filters.segments?.forEach((s) => {
      const segment = MOCK_SEGMENTS.find((seg) => seg.id === s);
      if (segment) items.push(segment.name);
    });
    
    filters.grades?.forEach((g) => {
      const grade = MOCK_GRADES.find((gr) => gr.id === g);
      if (grade) items.push(grade.name);
    });
    
    return items;
  };

  const filterItems = getFiltersSummary();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-primary" />
            Save Filter Preset
          </DialogTitle>
          <DialogDescription>
            Save your current filter configuration for quick access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Name */}
          <div className="p-3 rounded-lg bg-muted/30 border">
            <p className="text-xs text-muted-foreground mb-1">Report</p>
            <p className="text-sm font-medium">{report.name}</p>
          </div>

          {/* Current Filters */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Filters to Save
            </Label>
            {filterItems.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {filterItems.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Default filters (Year to Date, All segments)
              </p>
            )}
          </div>

          {/* Preset Name */}
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              placeholder="e.g., Q1 Engineering Review"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>

          {/* Default Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-default"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <label
              htmlFor="is-default"
              className="text-sm cursor-pointer"
            >
              Set as default for this report
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <BookMarked className="w-4 h-4 mr-2" />
                Save Preset
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
