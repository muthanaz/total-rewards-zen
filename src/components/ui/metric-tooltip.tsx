import { HelpCircle, Clock, Database, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMetricDefinition } from '@/hooks/useMetricDefinition';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

interface MetricTooltipProps {
  metricKey: string;
  confidence?: 'high' | 'medium' | 'low' | 'not_integrated';
  lastUpdated?: string;
  className?: string;
}

export function MetricTooltip({ 
  metricKey, 
  confidence,
  lastUpdated,
  className 
}: MetricTooltipProps) {
  const { metric, isLoading } = useMetricDefinition(metricKey);
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const getConfidenceBadge = () => {
    if (!confidence) return null;
    
    const configs = {
      high: { label: isArabic ? 'موثوقية عالية' : 'High Confidence', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      medium: { label: isArabic ? 'موثوقية متوسطة' : 'Medium Confidence', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      low: { label: isArabic ? 'موثوقية منخفضة' : 'Low Confidence', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
      not_integrated: { label: isArabic ? 'غير متكامل' : 'Not Integrated', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    };
    
    const config = configs[confidence];
    
    return (
      <Badge variant="outline" className={cn('text-[10px]', config.color)}>
        {confidence === 'low' || confidence === 'not_integrated' ? (
          <AlertTriangle className="w-2.5 h-2.5 mr-1" />
        ) : null}
        {config.label}
      </Badge>
    );
  };

  if (isLoading || !metric) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className={cn("w-3.5 h-3.5 text-muted-foreground cursor-help", className)} />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'جارٍ التحميل...' : 'Loading...'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={cn("w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors", className)} />
        </TooltipTrigger>
        <TooltipContent 
          side={isRTL ? "left" : "right"} 
          className="max-w-sm p-3 space-y-2"
        >
          <div className={cn("space-y-1.5", isRTL && "text-right")}>
            <p className="font-medium text-sm">{metric.name}</p>
            <p className="text-xs text-muted-foreground">{metric.definition}</p>
          </div>
          
          <div className={cn("pt-2 border-t border-border space-y-1.5", isRTL && "text-right")}>
            <div className={cn("flex items-start gap-1.5", isRTL && "flex-row-reverse")}>
              <span className="text-[10px] font-medium text-primary shrink-0">
                {isArabic ? 'الصيغة:' : 'Formula:'}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {metric.formula}
              </span>
            </div>
            
            <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <Database className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground">
                {isArabic ? 'المصدر:' : 'Source:'} {metric.source}
              </span>
            </div>
            
            {lastUpdated && (
              <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground">
                  {isArabic ? 'آخر تحديث:' : 'Updated:'} {
                    format(new Date(lastUpdated), 'MMM d, yyyy HH:mm')
                  }
                </span>
              </div>
            )}
          </div>
          
          {confidence && (
            <div className={cn("pt-2 border-t border-border", isRTL && "text-right")}>
              {getConfidenceBadge()}
              {(confidence === 'low' || confidence === 'not_integrated') && (
                <p className="text-[10px] text-amber-600 mt-1">
                  {confidence === 'not_integrated' 
                    ? (isArabic ? 'هذا المقياس يتطلب تكاملاً إضافياً' : 'This metric requires additional integration')
                    : (isArabic ? 'بيانات غير كافية للدقة الكاملة' : 'Insufficient data for full accuracy')
                  }
                </p>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
