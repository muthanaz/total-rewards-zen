import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
  onClear?: () => void;
  showClear?: boolean;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
  className,
  onClear,
  showClear = false,
}: FilterBarProps) {
  return (
    <Card className={cn("border-border/50 bg-muted/30", className)}>
      <CardContent className="py-3 sm:py-4">
        <div 
          className="flex flex-col sm:flex-row gap-3"
          role="search"
          aria-label="Filter controls"
        >
          {onSearchChange !== undefined && (
            <div className="relative flex-1 min-w-0">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                aria-hidden="true"
              />
              <Input 
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-9 bg-background h-10 sm:h-9"
                aria-label={searchPlaceholder}
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
          {children && (
            <div 
              className="flex flex-wrap gap-2 items-center overflow-x-auto scrollbar-hide -mx-1 px-1"
              role="group"
              aria-label="Filter options"
            >
              {children}
              {showClear && onClear && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
