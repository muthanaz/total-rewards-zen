// Status Strip - Shows confidence, data freshness, and period at top of pages
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePeriod } from '@/contexts/PeriodContext';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database, 
  Calendar,
  RefreshCw,
  Info
} from 'lucide-react';
import { ConfidenceLevel } from '@/components/employer/ConfidenceGate';
import { formatDistanceToNow } from 'date-fns';

export interface StatusStripProps {
  confidence?: ConfidenceLevel;
  lastUpdated?: Date | string | null;
  dataSource?: string;
  dataSourceAr?: string;
  sampleSize?: number;
  minSampleSize?: number;
  className?: string;
  showPeriod?: boolean;
}

export function StatusStrip({
  confidence = 'high',
  lastUpdated,
  dataSource,
  dataSourceAr,
  sampleSize,
  minSampleSize = 30,
  className,
  showPeriod = true,
}: StatusStripProps) {
  const { language, direction } = useLanguage();
  const { period, formatPeriodLabel } = usePeriod();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const periodLabel = formatPeriodLabel();
  const getConfidenceConfig = (level: ConfidenceLevel) => {
    const configs = {
      high: {
        icon: CheckCircle2,
        label: isArabic ? 'موثوق' : 'Verified',
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        description: isArabic ? 'بيانات موثوقة ومتكاملة' : 'Reliable and complete data',
      },
      medium: {
        icon: Info,
        label: isArabic ? 'تقديري' : 'Estimated',
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        description: isArabic ? 'بيانات جزئية - قد تختلف النتائج' : 'Partial data - results may vary',
      },
      low: {
        icon: AlertTriangle,
        label: isArabic ? 'بيانات منخفضة' : 'Low Data',
        color: 'bg-red-500/10 text-red-600 border-red-500/20',
        description: isArabic ? 'بيانات غير كافية للتحليل الدقيق' : 'Insufficient data for accurate analysis',
      },
      not_integrated: {
        icon: Database,
        label: isArabic ? 'غير متكامل' : 'Not Integrated',
        color: 'bg-muted text-muted-foreground border-muted-foreground/20',
        description: isArabic ? 'يتطلب تكامل مع نظام خارجي' : 'Requires external system integration',
      },
    };
    return configs[level];
  };

  const config = getConfidenceConfig(confidence);
  const ConfidenceIcon = config.icon;

  const formatLastUpdated = () => {
    if (!lastUpdated) return isArabic ? 'غير متوفر' : 'N/A';
    const date = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const sampleSizeOk = !sampleSize || !minSampleSize || sampleSize >= minSampleSize;

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/30 border border-border/50",
      isRTL && "flex-row-reverse",
      className
    )}>
      {/* Confidence Badge */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn("gap-1.5 cursor-help", config.color)}>
              <ConfidenceIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Data Freshness */}
      {lastUpdated && (
        <>
          <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
            <RefreshCw className="w-3 h-3" />
            <span>{isArabic ? 'آخر تحديث:' : 'Updated:'}</span>
            <span className="font-medium text-foreground">{formatLastUpdated()}</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
        </>
      )}

      {/* Sample Size Warning */}
      {sampleSize !== undefined && !sampleSizeOk && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20 cursor-help">
                  <AlertTriangle className="w-3 h-3" />
                  {isArabic ? `عينة: ${sampleSize}/${minSampleSize}` : `Sample: ${sampleSize}/${minSampleSize}`}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  {isArabic 
                    ? `حجم العينة أقل من الحد الأدنى المطلوب (${minSampleSize}). النتائج قد لا تكون موثوقة.`
                    : `Sample size is below minimum threshold (${minSampleSize}). Results may not be statistically significant.`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="h-4 w-px bg-border hidden sm:block" />
        </>
      )}

      {/* Period */}
      {showPeriod && period && (
        <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
          <Calendar className="w-3 h-3" />
          <span className="font-medium text-foreground">{periodLabel}</span>
        </div>
      )}

      {/* Data Source */}
      {dataSource && (
        <>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
            <Database className="w-3 h-3" />
            <span>{isArabic && dataSourceAr ? dataSourceAr : dataSource}</span>
          </div>
        </>
      )}
    </div>
  );
}
