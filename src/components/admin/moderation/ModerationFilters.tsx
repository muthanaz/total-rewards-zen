/**
 * ModerationFilters
 * 
 * Advanced filter controls for the moderation queue.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  ArrowUpDown, 
  User, 
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ModerationFiltersState {
  itemType: string[];
  priority: string[];
  status: string[];
  age: string;
  vendor: string;
  organization: string;
  sortBy: 'oldest' | 'priority' | 'newest';
  myQueue: boolean;
}

interface ModerationFiltersProps {
  filters: ModerationFiltersState;
  onFiltersChange: (filters: ModerationFiltersState) => void;
  activeFiltersCount: number;
  currentUserId?: string;
}

const ITEM_TYPES = [
  { value: 'vendor', label: 'Vendor', labelAr: 'بائع' },
  { value: 'offer', label: 'Offer', labelAr: 'عرض' },
  { value: 'image', label: 'Image', labelAr: 'صورة' },
  { value: 'copy', label: 'Copy', labelAr: 'نص' },
];

const PRIORITIES = [
  { value: 'high', label: 'High', labelAr: 'عالي' },
  { value: 'medium', label: 'Medium', labelAr: 'متوسط' },
  { value: 'low', label: 'Low', labelAr: 'منخفض' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending', labelAr: 'معلق' },
  { value: 'in_review', label: 'In Review', labelAr: 'قيد المراجعة' },
  { value: 'changes_requested', label: 'Changes Requested', labelAr: 'تغييرات مطلوبة' },
];

const AGE_OPTIONS = [
  { value: 'all', label: 'Any Age', labelAr: 'أي عمر' },
  { value: '24h', label: '> 24 hours', labelAr: '> 24 ساعة' },
  { value: '48h', label: '> 48 hours', labelAr: '> 48 ساعة' },
  { value: '7d', label: '> 7 days', labelAr: '> 7 أيام' },
];

const SORT_OPTIONS = [
  { value: 'oldest', label: 'Oldest First', labelAr: 'الأقدم أولاً' },
  { value: 'priority', label: 'Priority First', labelAr: 'الأولوية أولاً' },
  { value: 'newest', label: 'Newest First', labelAr: 'الأحدث أولاً' },
];

export function ModerationFilters({
  filters,
  onFiltersChange,
  activeFiltersCount,
  currentUserId,
}: ModerationFiltersProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [isOpen, setIsOpen] = useState(false);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const updateFilter = <K extends keyof ModerationFiltersState>(
    key: K,
    value: ModerationFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'itemType' | 'priority' | 'status', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearFilters = () => {
    onFiltersChange({
      itemType: [],
      priority: [],
      status: [],
      age: 'all',
      vendor: '',
      organization: '',
      sortBy: 'oldest',
      myQueue: false,
    });
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
      {/* My Queue Toggle */}
      <Button
        variant={filters.myQueue ? "default" : "outline"}
        size="sm"
        onClick={() => updateFilter('myQueue', !filters.myQueue)}
        className="h-8"
      >
        <User className="w-3.5 h-3.5 me-1.5" />
        {t('My Queue', 'قائمتي')}
      </Button>

      {/* Sort Dropdown */}
      <Select
        value={filters.sortBy}
        onValueChange={(v) => updateFilter('sortBy', v as ModerationFiltersState['sortBy'])}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <ArrowUpDown className="w-3.5 h-3.5 me-1.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {language === 'ar' ? opt.labelAr : opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Age Filter */}
      <Select
        value={filters.age}
        onValueChange={(v) => updateFilter('age', v)}
      >
        <SelectTrigger className="h-8 w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {language === 'ar' ? opt.labelAr : opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced Filters Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="w-3.5 h-3.5 me-1.5" />
            {t('Filters', 'تصفية')}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ms-1.5 h-5 min-w-5 px-1.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className="w-3 h-3 ms-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Item Type */}
            <div>
              <p className="text-sm font-medium mb-2">{t('Item Type', 'نوع العنصر')}</p>
              <div className="flex flex-wrap gap-2">
                {ITEM_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer text-sm transition-colors",
                      filters.itemType.includes(type.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={filters.itemType.includes(type.value)}
                      onCheckedChange={() => toggleArrayFilter('itemType', type.value)}
                      className="sr-only"
                    />
                    {language === 'ar' ? type.labelAr : type.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <p className="text-sm font-medium mb-2">{t('Priority', 'الأولوية')}</p>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((pri) => (
                  <label
                    key={pri.value}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer text-sm transition-colors",
                      filters.priority.includes(pri.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={filters.priority.includes(pri.value)}
                      onCheckedChange={() => toggleArrayFilter('priority', pri.value)}
                      className="sr-only"
                    />
                    {language === 'ar' ? pri.labelAr : pri.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-sm font-medium mb-2">{t('Status', 'الحالة')}</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <label
                    key={status.value}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer text-sm transition-colors",
                      filters.status.includes(status.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={filters.status.includes(status.value)}
                      onCheckedChange={() => toggleArrayFilter('status', status.value)}
                      className="sr-only"
                    />
                    {language === 'ar' ? status.labelAr : status.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Button */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={clearFilters}
              >
                <X className="w-3.5 h-3.5 me-1.5" />
                {t('Clear All Filters', 'مسح جميع الفلاتر')}
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {filters.itemType.length > 0 && (
        <Badge variant="secondary" className="h-6">
          {filters.itemType.length} {t('types', 'أنواع')}
          <button
            onClick={() => updateFilter('itemType', [])}
            className="ms-1 hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}
      {filters.priority.length > 0 && (
        <Badge variant="secondary" className="h-6">
          {filters.priority.length} {t('priorities', 'أولويات')}
          <button
            onClick={() => updateFilter('priority', [])}
            className="ms-1 hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}
