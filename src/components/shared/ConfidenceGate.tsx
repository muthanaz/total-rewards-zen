import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, EyeOff, Database, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConfidenceGateProps {
  children: ReactNode;
  sampleSize: number;
  minSampleSize: number;
  lastUpdated?: Date;
  maxStaleDays?: number;
  requiredFields?: string[];
  presentFields?: string[];
  mode?: 'blur' | 'hide' | 'warn';
  className?: string;
  metricName?: string;
}

export function ConfidenceGate({
  children,
  sampleSize,
  minSampleSize,
  lastUpdated,
  maxStaleDays = 30,
  requiredFields = [],
  presentFields = [],
  mode = 'blur',
  className,
  metricName,
}: ConfidenceGateProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Evaluate confidence criteria
  const sampleSizeOk = sampleSize >= minSampleSize;
  
  const freshnessOk = !lastUpdated || (() => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= maxStaleDays;
  })();
  
  const completenessOk = requiredFields.length === 0 || 
    requiredFields.every(field => presentFields.includes(field));

  const isConfident = sampleSizeOk && freshnessOk && completenessOk;

  // Build reasons list
  const reasons: string[] = [];
  if (!sampleSizeOk) {
    reasons.push(t(
      `Sample size (${sampleSize}) below minimum (${minSampleSize})`,
      `حجم العينة (${sampleSize}) أقل من الحد الأدنى (${minSampleSize})`
    ));
  }
  if (!freshnessOk && lastUpdated) {
    const daysAgo = Math.floor((new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    reasons.push(t(
      `Data is ${daysAgo} days old (max ${maxStaleDays} days)`,
      `البيانات عمرها ${daysAgo} يوم (الحد الأقصى ${maxStaleDays} يوم)`
    ));
  }
  if (!completenessOk) {
    const missing = requiredFields.filter(f => !presentFields.includes(f));
    reasons.push(t(
      `Missing fields: ${missing.join(', ')}`,
      `الحقول المفقودة: ${missing.join('، ')}`
    ));
  }

  // If confident, render normally
  if (isConfident) {
    return <>{children}</>;
  }

  // Handle different modes
  if (mode === 'hide') {
    return (
      <Card className={cn("border-dashed border-warning/50", className)}>
        <CardContent className="py-8">
          <div className={cn("flex flex-col items-center justify-center text-center gap-3", isRTL && "text-right")}>
            <div className="p-3 rounded-full bg-warning/10">
              <EyeOff className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">
                {metricName ? `${metricName} - ` : ''}{t('Insufficient Data', 'بيانات غير كافية')}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t(
                  'This metric is hidden because it does not meet minimum confidence thresholds.',
                  'هذا المقياس مخفي لأنه لا يستوفي الحد الأدنى لعتبات الثقة.'
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {reasons.map((reason, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/20">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'warn') {
    return (
      <div className={cn("relative", className)}>
        <div className="mb-3">
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {t('Low Confidence Data', 'بيانات منخفضة الثقة')}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {reasons[0]}
          </p>
        </div>
        {children}
      </div>
    );
  }

  // Default: blur mode
  return (
    <div className={cn("relative", className)}>
      <div className="blur-sm pointer-events-none select-none opacity-60">
        {children}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px] rounded-lg">
        <div className={cn("text-center p-4 max-w-sm", isRTL && "text-right")}>
          <div className="mx-auto mb-3 p-3 rounded-full bg-warning/10 w-fit">
            <Lock className="w-5 h-5 text-warning" />
          </div>
          <h4 className="font-semibold text-sm">
            {t('Low Confidence Data', 'بيانات منخفضة الثقة')}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t(
              'This data does not meet minimum confidence requirements.',
              'هذه البيانات لا تستوفي الحد الأدنى من متطلبات الثقة.'
            )}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {reasons.map((reason, idx) => (
              <Badge key={idx} variant="outline" className="text-[9px] bg-warning/5 text-warning border-warning/20">
                {reason}
              </Badge>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4 gap-1.5 text-xs">
            <Database className="w-3 h-3" />
            {t('Improve Data Quality', 'تحسين جودة البيانات')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Utility hook for checking confidence
export function useConfidenceCheck({
  sampleSize,
  minSampleSize,
  lastUpdated,
  maxStaleDays = 30,
}: {
  sampleSize: number;
  minSampleSize: number;
  lastUpdated?: Date;
  maxStaleDays?: number;
}) {
  const sampleSizeOk = sampleSize >= minSampleSize;
  
  const freshnessOk = !lastUpdated || (() => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= maxStaleDays;
  })();

  const confidence: 'high' | 'medium' | 'low' = 
    sampleSizeOk && freshnessOk ? 'high' :
    sampleSizeOk || freshnessOk ? 'medium' : 'low';

  return {
    isConfident: sampleSizeOk && freshnessOk,
    confidence,
    sampleSizeOk,
    freshnessOk,
  };
}
