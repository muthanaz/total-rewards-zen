import { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, Database, HelpCircle } from 'lucide-react';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'not_integrated';

interface ConfidenceGateProps {
  confidence: ConfidenceLevel;
  children: ReactNode;
  fallback?: ReactNode;
  showEstimatedLabel?: boolean;
  metricName?: string;
  className?: string;
}

/**
 * ConfidenceGate - Enforces confidence rules in UI
 * 
 * - high: Shows content as-is
 * - medium: Shows content with "Estimated" label
 * - low: Shows "Data required" message instead of content
 * - not_integrated: Shows "Not integrated" message
 */
export function ConfidenceGate({
  confidence,
  children,
  fallback,
  showEstimatedLabel = true,
  metricName,
  className,
}: ConfidenceGateProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  // High confidence - show content directly
  if (confidence === 'high') {
    return <>{children}</>;
  }

  // Medium confidence - show with estimated label
  if (confidence === 'medium') {
    return (
      <div className={cn("relative", className)}>
        {showEstimatedLabel && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="absolute -top-2 right-0 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 z-10"
                >
                  <Info className="w-2.5 h-2.5" />
                  {isArabic ? 'تقديري' : 'Estimated'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  {isArabic 
                    ? 'هذه القيمة تقديرية بناءً على البيانات المتاحة. قد تختلف النتائج الفعلية.'
                    : 'This value is estimated based on available data. Actual results may vary.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {children}
      </div>
    );
  }

  // Low confidence or not integrated - show fallback or message
  if (fallback) {
    return <>{fallback}</>;
  }

  const isNotIntegrated = confidence === 'not_integrated';

  return (
    <div className={cn(
      "rounded-lg border p-4 text-center",
      isNotIntegrated 
        ? "bg-muted/50 border-muted-foreground/20" 
        : "bg-amber-500/5 border-amber-500/20",
      className
    )}>
      <div className={cn("flex flex-col items-center gap-2", isRTL && "text-right")}>
        {isNotIntegrated ? (
          <>
            <Database className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'غير متكامل' : 'Not Integrated'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metricName 
                  ? (isArabic 
                      ? `${metricName} يتطلب تكامل إضافي`
                      : `${metricName} requires additional integration`)
                  : (isArabic 
                      ? 'هذا المقياس يتطلب تكامل مع نظام خارجي'
                      : 'This metric requires integration with an external system')}
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {isArabic ? 'البيانات مطلوبة' : 'Data Required'}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                {isArabic 
                  ? 'بيانات غير كافية لعرض هذا المقياس بدقة'
                  : 'Insufficient data to display this metric accurately'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * ConfidenceBadge - Inline badge for confidence indication
 */
interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const configs = {
    high: { 
      label: isArabic ? 'موثوق' : 'Verified', 
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: null,
    },
    medium: { 
      label: isArabic ? 'تقديري' : 'Estimated', 
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: Info,
    },
    low: { 
      label: isArabic ? 'بيانات منخفضة' : 'Low Data', 
      color: 'bg-red-500/10 text-red-600 border-red-500/20',
      icon: AlertTriangle,
    },
    not_integrated: { 
      label: isArabic ? 'غير متكامل' : 'Not Integrated', 
      color: 'bg-muted text-muted-foreground border-muted-foreground/20',
      icon: Database,
    },
  };

  const config = configs[confidence];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("text-[10px] gap-1", config.color, className)}>
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {config.label}
    </Badge>
  );
}

/**
 * useConfidenceCheck - Hook to determine if metric should be shown
 */
export function useConfidenceCheck(confidence: ConfidenceLevel) {
  return {
    canShowProjections: confidence === 'high' || confidence === 'medium',
    canShowBenchmarks: confidence === 'high',
    shouldShowEstimated: confidence === 'medium',
    isLowConfidence: confidence === 'low',
    isNotIntegrated: confidence === 'not_integrated',
    requiresData: confidence === 'low' || confidence === 'not_integrated',
  };
}
