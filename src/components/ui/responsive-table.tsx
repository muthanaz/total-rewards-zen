/**
 * ResponsiveTable - Mobile-friendly table that converts to card/accordion on small screens
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Types
interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  isPrimary?: boolean; // Shows as card header on mobile
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  className?: string;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  className,
  emptyState,
  onRowClick,
  stickyHeader = false,
}: ResponsiveTableProps<T>) {
  const primaryColumn = columns.find(c => c.isPrimary) || columns[0];
  const otherColumns = columns.filter(c => c !== primaryColumn);

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className={cn(
        "hidden md:block overflow-x-auto rounded-xl border border-border/60",
        stickyHeader && "max-h-[600px] overflow-y-auto",
        className
      )}>
        <table className="w-full caption-bottom text-sm">
          <thead className={cn(
            "[&_tr]:border-b",
            stickyHeader && "sticky top-0 z-10 bg-muted/90 backdrop-blur-sm"
          )}>
            <tr className="border-b transition-colors">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={cn(
                  "border-b transition-colors hover:bg-muted/50",
                  onRowClick && "cursor-pointer focus-within:bg-muted/50"
                )}
                onClick={() => onRowClick?.(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("p-4 align-middle", col.className)}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card/Accordion View */}
      <div className={cn("md:hidden space-y-3", className)}>
        {data.map((row) => (
          <MobileRowCard
            key={keyExtractor(row)}
            row={row}
            primaryColumn={primaryColumn}
            otherColumns={otherColumns.filter(c => !c.hideOnMobile)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          />
        ))}
      </div>
    </>
  );
}

interface MobileRowCardProps<T> {
  row: T;
  primaryColumn: Column<T>;
  otherColumns: Column<T>[];
  onClick?: () => void;
}

function MobileRowCard<T>({
  row,
  primaryColumn,
  otherColumns,
  onClick,
}: MobileRowCardProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {/* Card Header - Primary content + expand trigger */}
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-between p-4 text-left",
              "hover:bg-muted/50 transition-colors focus-visible:ring-inset",
              onClick && "cursor-pointer"
            )}
            onClick={(e) => {
              if (onClick) {
                e.preventDefault();
                onClick();
              }
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">
                {primaryColumn.header}
              </div>
              <div className="font-medium truncate">
                {primaryColumn.cell(row)}
              </div>
            </div>
            <ChevronDown 
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform shrink-0 ml-2",
                isOpen && "rotate-180"
              )} 
            />
          </button>
        </CollapsibleTrigger>

        {/* Expandable Details */}
        <CollapsibleContent>
          <div className="border-t border-border/40 px-4 py-3 space-y-3 bg-muted/20">
            {otherColumns.map((col) => (
              <div 
                key={col.key}
                className="flex items-start justify-between gap-4"
              >
                <span className="text-sm text-muted-foreground shrink-0">
                  {col.header}
                </span>
                <span className="text-sm text-right">
                  {col.cell(row)}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Helper hook for keyboard navigation in tables
export function useTableKeyboardNav(
  rowCount: number,
  onSelect: (index: number) => void
) {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, rowCount - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(focusedIndex);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(rowCount - 1);
        break;
    }
  }, [rowCount, focusedIndex, onSelect]);

  return { focusedIndex, setFocusedIndex, handleKeyDown };
}

export default ResponsiveTable;
