import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
  className,
}: FilterBarProps) {
  return (
    <Card className={cn("border-border/50 bg-muted/30", className)}>
      <CardContent className="py-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {onSearchChange !== undefined && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          )}
          {children && (
            <div className="flex flex-wrap gap-2">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
