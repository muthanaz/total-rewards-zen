/**
 * StandardListCard - Universal list display component
 * 
 * Enforces consistent structure:
 * - Header: Title + small scope label
 * - Body: Fixed row height list (ALWAYS 5 rows; fill with "Other" if fewer)
 * - Footer: Optional single CTA ("View details") aligned bottom-right
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CardVariant = 'employee' | 'hr_ops' | 'executive';

export interface ListItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Primary value (right-aligned) */
  value: string | number;
  /** Optional secondary value */
  secondaryValue?: string;
  /** Optional percentage */
  percent?: number;
  /** Optional icon */
  icon?: LucideIcon;
  /** Optional badge color */
  badgeColor?: string;
  /** Click handler */
  onClick?: () => void;
}

export interface StandardListCardProps {
  /** Card title */
  title: string;
  /** Title icon */
  icon?: LucideIcon;
  /** Scope label (small text beside title) */
  scopeLabel?: string;
  /** List items (will be padded to 5 with "Other" if needed) */
  items: ListItem[];
  /** Total value for calculating "Other" row */
  total?: number;
  /** Value key for "Other" calculation */
  getItemValue?: (item: ListItem) => number;
  /** Format function for values */
  formatValue?: (value: number) => string;
  /** Footer CTA label */
  ctaLabel?: string;
  /** Footer CTA click handler */
  onCtaClick?: () => void;
  /** Portal variant for styling */
  variant?: CardVariant;
  /** Additional className */
  className?: string;
  /** Show rank numbers */
  showRank?: boolean;
  /** Header actions (right side) */
  headerAction?: React.ReactNode;
}

// Fixed row height for consistent list rhythm
const ROW_HEIGHT = 'min-h-[52px]';
const REQUIRED_ROWS = 5;

// Minimum heights per variant
const MIN_HEIGHTS = {
  employee: 'min-h-[380px]',
  hr_ops: 'min-h-[340px]',
  executive: 'min-h-[380px]',
};

export function StandardListCard({
  title,
  icon: Icon,
  scopeLabel,
  items,
  total,
  getItemValue,
  formatValue = (v) => v.toLocaleString(),
  ctaLabel,
  onCtaClick,
  variant = 'executive',
  className,
  showRank = true,
  headerAction,
}: StandardListCardProps) {
  const minHeight = MIN_HEIGHTS[variant];

  // Prepare items - ensure exactly 5 rows
  const displayItems = React.useMemo(() => {
    if (items.length >= REQUIRED_ROWS) {
      // Take first 4 and aggregate rest into "Other"
      const top4 = items.slice(0, 4);
      const remaining = items.slice(4);
      
      if (remaining.length > 0 && total && getItemValue) {
        const otherValue = remaining.reduce((sum, item) => sum + getItemValue(item), 0);
        const otherItem: ListItem = {
          id: 'other',
          label: 'Other',
          value: formatValue(otherValue),
          percent: total > 0 ? (otherValue / total) * 100 : 0,
        };
        return [...top4, otherItem];
      }
      
      return items.slice(0, REQUIRED_ROWS);
    }

    // Pad with empty rows if fewer than 5
    const padded = [...items];
    while (padded.length < REQUIRED_ROWS) {
      padded.push({
        id: `empty-${padded.length}`,
        label: '—',
        value: '—',
      });
    }
    return padded;
  }, [items, total, getItemValue, formatValue]);

  return (
    <Card className={cn('border-border/50 flex flex-col', minHeight, className)}>
      {/* Header: Title + Scope Label */}
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {scopeLabel && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {scopeLabel}
              </span>
            )}
          </div>
          {headerAction}
        </div>
      </CardHeader>

      {/* Body: Fixed 5-row list */}
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-between">
          {displayItems.map((item, index) => {
            const ItemIcon = item.icon;
            const isEmpty = item.label === '—';
            const isOther = item.id === 'other';

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between py-3 border-b border-border/30 last:border-0',
                  ROW_HEIGHT,
                  item.onClick && 'cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded',
                  isEmpty && 'opacity-30'
                )}
                onClick={item.onClick}
              >
                {/* Left side: Rank + Icon + Label */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {showRank && (
                    <span className={cn(
                      'text-xs font-medium w-5 text-muted-foreground tabular-nums',
                      !isEmpty && 'text-foreground'
                    )}>
                      {index + 1}
                    </span>
                  )}
                  {ItemIcon && (
                    <div className={cn(
                      'p-1.5 rounded shrink-0',
                      item.badgeColor || 'bg-muted'
                    )}>
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className={cn(
                    'text-sm font-medium truncate',
                    isOther && 'text-muted-foreground italic'
                  )}>
                    {item.label}
                  </span>
                </div>

                {/* Right side: Values (right-aligned) */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  {item.secondaryValue && (
                    <span className="text-xs text-muted-foreground">
                      {item.secondaryValue}
                    </span>
                  )}
                  {item.percent !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums w-12">
                      {item.percent.toFixed(1)}%
                    </span>
                  )}
                  <span className={cn(
                    'text-sm font-semibold tabular-nums',
                    isEmpty && 'font-normal'
                  )}>
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Footer: Optional CTA aligned bottom-right */}
      {ctaLabel && onCtaClick && (
        <div className="px-4 pb-4 flex justify-end flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-primary hover:text-primary"
            onClick={onCtaClick}
          >
            {ctaLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </Card>
  );
}

export default StandardListCard;
