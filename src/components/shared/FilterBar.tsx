/**
 * Premium Filter Bar v2.0
 * 
 * Standardized filter UI for tables and lists.
 * RTL-ready, accessible, with search and filter support.
 */

import * as React from 'react';
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, X, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface FilterOption {
  label: string;
  labelAr?: string;
  value: string;
}

interface FilterConfig {
  id: string;
  label: string;
  labelAr?: string;
  options: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filters (new)
  filters?: FilterConfig[];
  
  // Legacy children support
  children?: ReactNode;
  
  // Clear
  onClear?: () => void;
  showClear?: boolean;
  activeFilterCount?: number;
  
  // Actions
  onRefresh?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
  actions?: ReactNode;
  
  // Styling
  className?: string;
  compact?: boolean;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  children,
  onClear,
  showClear = false,
  activeFilterCount = 0,
  onRefresh,
  onExport,
  isRefreshing = false,
  actions,
  className,
  compact = false,
}: FilterBarProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  const hasActiveFilters = activeFilterCount > 0 || (searchValue && searchValue.length > 0);

  return (
    <Card className={cn('border-border/50 bg-muted/30', className)}>
      <CardContent className={cn('py-3', compact ? 'px-3' : 'sm:py-4')}>
        <div 
          className={cn(
            'flex flex-col sm:flex-row gap-3',
            isRTL && 'sm:flex-row-reverse'
          )}
          role="search"
          aria-label="Filter controls"
        >
          {/* Search Input */}
          {onSearchChange !== undefined && (
            <div className="relative flex-1 min-w-0 max-w-sm">
              <Search 
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none',
                  isRTL ? 'right-3' : 'left-3'
                )} 
                aria-hidden="true"
              />
              <Input 
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  'bg-background h-9',
                  isRTL ? 'pr-9 pl-9' : 'pl-9 pr-9'
                )}
                aria-label={searchPlaceholder}
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 h-6 w-6 p-0',
                    isRTL ? 'left-2' : 'right-2'
                  )}
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}

          {/* Filter Dropdowns */}
          {filters.map((filter) => (
            <Select
              key={filter.id}
              value={filter.value || 'all'}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className="h-9 w-auto min-w-[120px] bg-background">
                <SelectValue placeholder={t(filter.label, filter.labelAr)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t(`All ${filter.label}`, filter.labelAr ? `كل ${filter.labelAr}` : undefined)}
                </SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.label, option.labelAr)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Legacy children support */}
          {children && (
            <div 
              className={cn(
                'flex flex-wrap gap-2 items-center overflow-x-auto scrollbar-hide -mx-1 px-1',
                isRTL && 'flex-row-reverse'
              )}
              role="group"
              aria-label="Filter options"
            >
              {children}
            </div>
          )}

          {/* Clear Filters */}
          {(showClear || hasActiveFilters) && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-9 gap-2 text-muted-foreground hover:text-foreground shrink-0"
            >
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <span className="text-xs">{t('Clear', 'مسح')}</span>
              <X className="w-3 h-3" />
            </Button>
          )}

          {/* Spacer */}
          <div className="flex-1 hidden sm:block" />

          {/* Action Buttons */}
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Refresh"
              >
                <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              </Button>
            )}

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t('Export', 'تصدير')}</span>
              </Button>
            )}

            {actions}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============= STATUS TABS =============

interface StatusTab {
  id: string;
  label: string;
  labelAr?: string;
  count?: number;
  variant?: 'default' | 'warning' | 'success' | 'destructive';
}

interface StatusTabsProps {
  tabs: StatusTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function StatusTabs({ tabs, activeTab, onTabChange, className }: StatusTabsProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  const variantStyles = {
    default: 'text-muted-foreground',
    warning: 'text-warning',
    success: 'text-success',
    destructive: 'text-destructive',
  };

  return (
    <div className={cn(
      'flex gap-1 p-1 rounded-lg bg-muted/50 w-fit overflow-x-auto',
      isRTL && 'flex-row-reverse',
      className
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
            'flex items-center gap-2',
            activeTab === tab.id
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          <span>{t(tab.label, tab.labelAr)}</span>
          {tab.count !== undefined && (
            <Badge 
              variant={activeTab === tab.id ? 'secondary' : 'outline'}
              className={cn(
                'h-5 px-1.5 text-[10px] font-semibold',
                tab.variant && variantStyles[tab.variant]
              )}
            >
              {tab.count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
