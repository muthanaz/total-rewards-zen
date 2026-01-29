/**
 * Admin Error Display Component
 * Provides consistent error messaging pattern: What happened + Why + What to do
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  LucideIcon 
} from 'lucide-react';
import { ERROR_PATTERNS, ErrorPattern } from '@/lib/admin/constants';

interface AdminErrorDisplayProps {
  errorCode?: string;
  what?: string;
  why?: string;
  action?: string;
  severity?: 'warning' | 'error';
  onRetry?: () => void;
  onViewDocs?: () => void;
  className?: string;
}

export function AdminErrorDisplay({
  errorCode,
  what,
  why,
  action,
  severity = 'error',
  onRetry,
  onViewDocs,
  className
}: AdminErrorDisplayProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  // Try to get error pattern from constants
  const pattern = errorCode ? ERROR_PATTERNS[errorCode] : null;

  const displayWhat = what || (pattern ? (isArabic ? pattern.whatAr : pattern.what) : 'Something went wrong');
  const displayWhy = why || (pattern ? (isArabic ? pattern.whyAr : pattern.why) : 'An unexpected error occurred');
  const displayAction = action || (pattern ? (isArabic ? pattern.actionAr : pattern.action) : 'Try again or contact support if the issue persists');

  const Icon = severity === 'error' ? XCircle : AlertTriangle;

  return (
    <Alert 
      variant={severity === 'error' ? 'destructive' : 'default'}
      className={cn(
        "border-l-4",
        severity === 'error' ? 'border-l-destructive' : 'border-l-warning',
        className
      )}
    >
      <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
        <div className={cn("flex-1 space-y-2", isRTL && "text-right")}>
          <AlertTitle className="font-semibold">
            {displayWhat}
            {errorCode && (
              <span className="ms-2 text-xs font-mono opacity-70">
                ({errorCode})
              </span>
            )}
          </AlertTitle>
          
          <AlertDescription className="space-y-2">
            {/* Why */}
            <div className="text-sm">
              <span className="font-medium">{isArabic ? 'السبب: ' : 'Why: '}</span>
              <span className="text-muted-foreground">{displayWhy}</span>
            </div>
            
            {/* What to do */}
            <div className="text-sm">
              <span className="font-medium">{isArabic ? 'الحل: ' : 'Fix: '}</span>
              <span className="text-muted-foreground">{displayAction}</span>
            </div>

            {/* Action buttons */}
            {(onRetry || onViewDocs) && (
              <div className={cn("flex gap-2 pt-2", isRTL && "flex-row-reverse")}>
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    <RefreshCw className="w-3 h-3 me-1" />
                    {isArabic ? 'إعادة المحاولة' : 'Retry'}
                  </Button>
                )}
                {onViewDocs && (
                  <Button variant="ghost" size="sm" onClick={onViewDocs}>
                    <ExternalLink className="w-3 h-3 me-1" />
                    {isArabic ? 'عرض الوثائق' : 'View Docs'}
                  </Button>
                )}
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

/**
 * Inline error message for table rows or cards
 */
export function AdminErrorInline({
  message,
  code,
  className
}: {
  message: string;
  code?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-sm text-destructive",
      className
    )}>
      <XCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
      {code && (
        <span className="text-xs font-mono opacity-70">({code})</span>
      )}
    </div>
  );
}
