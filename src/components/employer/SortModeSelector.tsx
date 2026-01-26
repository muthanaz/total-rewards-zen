/**
 * Sort Mode Selector
 * 
 * Dropdown for selecting queue sorting mode:
 * - Risk-first (default)
 * - Value-first
 * - Oldest-first
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDownWideNarrow, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SORT_MODE_OPTIONS, type SortMode } from '@/lib/hrOps/priorityScoring';

interface SortModeSelectorProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  className?: string;
}

const SORT_ICONS: Record<SortMode, typeof AlertTriangle> = {
  risk_first: AlertTriangle,
  value_first: DollarSign,
  oldest_first: Clock,
};

export function SortModeSelector({ value, onChange, className }: SortModeSelectorProps) {
  const Icon = SORT_ICONS[value];

  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortMode)}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <div className="flex items-center gap-2">
          <ArrowDownWideNarrow className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Sort by..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        {SORT_MODE_OPTIONS.map((option) => {
          const OptionIcon = SORT_ICONS[option.value];
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <OptionIcon className="w-4 h-4" />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-[10px] text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export default SortModeSelector;
