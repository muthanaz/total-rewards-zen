import { ReactNode, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Download, Maximize2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConfidenceGate, type ConfidenceLevel } from '@/components/employer/ConfidenceGate';

interface ChartWrapperProps {
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  period?: string;
  periodAr?: string;
  confidence?: ConfidenceLevel;
  lastUpdated?: string;
  dataSource?: string;
  dataSourceAr?: string;
  sampleSize?: number;
  minSampleSize?: number;
  definition?: string;
  definitionAr?: string;
  units?: string;
  unitsAr?: string;
  onExport?: () => void;
  onExpand?: () => void;
  children: ReactNode;
  className?: string;
  compact?: boolean;
  emptyState?: ReactNode;
  hasData?: boolean;
  missingDataMessage?: string;
  missingDataMessageAr?: string;
}

export function ChartWrapper({
  title,
  titleAr,
  description,
  descriptionAr,
  period,
  periodAr,
  confidence = 'high',
  lastUpdated,
  dataSource,
  dataSourceAr,
  sampleSize,
  minSampleSize = 30,
  definition,
  definitionAr,
  units,
  unitsAr,
  onExport,
  onExpand,
  children,
  className,
  compact = false,
  emptyState,
  hasData = true,
  missingDataMessage,
  missingDataMessageAr,
}: ChartWrapperProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const insufficientSample = sampleSize !== undefined && sampleSize < minSampleSize;

  const showMissingDataState = useMemo(() => {
    return !hasData || insufficientSample;
  }, [hasData, insufficientSample]);

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className={cn("pb-2", compact && "py-3 px-4")}>
        <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex-1", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <CardTitle className={cn("text-sm font-medium", compact && "text-xs")}>
                {isArabic && titleAr ? titleAr : title}
              </CardTitle>
              
              {period && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {isArabic && periodAr ? periodAr : period}
                </Badge>
              )}
              
              {units && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                  {isArabic && unitsAr ? unitsAr : units}
                </Badge>
              )}
              
              {definition && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side={isRTL ? "left" : "right"} className="max-w-xs">
                      <p className="text-xs">
                        {isArabic && definitionAr ? definitionAr : definition}
                      </p>
                      {dataSource && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {isArabic ? 'المصدر:' : 'Source:'} {isArabic && dataSourceAr ? dataSourceAr : dataSource}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {description && !compact && (
              <CardDescription className="text-xs mt-0.5">
                {isArabic && descriptionAr ? descriptionAr : description}
              </CardDescription>
            )}
          </div>

          <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
            {confidence !== 'high' && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[9px] px-1.5 py-0",
                  confidence === 'medium' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                  confidence === 'low' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                  "bg-gray-500/10 text-gray-600 border-gray-500/20"
                )}
              >
                {confidence === 'medium' && (isArabic ? 'تقديري' : 'Est.')}
                {confidence === 'low' && (isArabic ? 'منخفض' : 'Low')}
                {confidence === 'not_integrated' && (isArabic ? 'غير متصل' : 'N/A')}
              </Badge>
            )}
            
            {onExport && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExport}>
                <Download className="w-3 h-3" />
              </Button>
            )}
            
            {onExpand && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExpand}>
                <Maximize2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(compact && "px-4 pb-4")}>
        {showMissingDataState ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {insufficientSample ? (
              <>
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'عينة غير كافية' : 'Insufficient Sample'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic 
                    ? `يتطلب ${minSampleSize} نقطة بيانات على الأقل (الحالي: ${sampleSize})`
                    : `Requires at least ${minSampleSize} data points (current: ${sampleSize})`}
                </p>
              </>
            ) : emptyState ? (
              emptyState
            ) : (
              <>
                <Info className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  {isArabic 
                    ? missingDataMessageAr || 'لا توجد بيانات متاحة' 
                    : missingDataMessage || 'No data available'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic 
                    ? 'تحقق من مصادر البيانات أو الفترة المحددة'
                    : 'Check data sources or selected period'}
                </p>
              </>
            )}
          </div>
        ) : (
          <ConfidenceGate confidence={confidence} showEstimatedLabel={confidence === 'medium'}>
            {children}
          </ConfidenceGate>
        )}

        {/* Chart footer with metadata */}
        {hasData && !insufficientSample && (
          <div className={cn(
            "flex items-center justify-between mt-3 pt-2 border-t border-border/30 text-[10px] text-muted-foreground",
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              {dataSource && (
                <span>
                  {isArabic ? 'المصدر:' : 'Source:'} {isArabic && dataSourceAr ? dataSourceAr : dataSource}
                </span>
              )}
              {sampleSize !== undefined && (
                <span>n={sampleSize.toLocaleString()}</span>
              )}
            </div>
            {lastUpdated && (
              <span>
                {isArabic ? 'آخر تحديث:' : 'Updated:'} {new Date(lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
