import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSizeOptions: number[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  showPageSizeSelector?: boolean;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  pageSizeOptions,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onPageSizeChange,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage,
  showPageSizeSelector = true,
  className,
}: PaginationControlsProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5; // Max pages to show
    
    if (totalPages <= showPages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-4 py-4",
      isRTL && "sm:flex-row-reverse",
      className
    )}>
      {/* Items info */}
      <div className={cn("text-sm text-muted-foreground", isRTL && "text-right")}>
        {isArabic 
          ? `عرض ${startIndex} - ${endIndex} من ${totalItems}`
          : `Showing ${startIndex} - ${endIndex} of ${totalItems}`}
      </div>

      {/* Controls */}
      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
        {/* Page size selector */}
        {showPageSizeSelector && (
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <span className="text-sm text-muted-foreground">
              {isArabic ? 'لكل صفحة:' : 'Per page:'}
            </span>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation */}
        <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onFirstPage}
            disabled={!hasPrevPage}
          >
            {isRTL ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onPrevPage}
            disabled={!hasPrevPage}
          >
            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {/* Page numbers */}
          <div className={cn("hidden sm:flex items-center gap-1", isRTL && "flex-row-reverse")}>
            {getPageNumbers().map((page, i) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          {/* Mobile page indicator */}
          <span className="sm:hidden text-sm px-2">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onNextPage}
            disabled={!hasNextPage}
          >
            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onLastPage}
            disabled={!hasNextPage}
          >
            {isRTL ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
