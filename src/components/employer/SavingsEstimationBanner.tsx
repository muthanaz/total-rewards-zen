/**
 * SavingsEstimationBanner
 * 
 * Top banner explaining savings methodology when data is estimated.
 * Shows inputs used, what's excluded, and confidence level.
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Calculator,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export type SavingsConfidence = 'high' | 'medium' | 'low';

interface SavingsEstimationBannerProps {
  /** Overall confidence level */
  confidence: SavingsConfidence;
  /** Inputs used for calculation */
  inputs: {
    label: string;
    value: string;
    isEstimated?: boolean;
  }[];
  /** What's excluded from calculation */
  exclusions: string[];
  /** Reason for confidence level */
  confidenceReason: string;
  /** Callback to open methodology drawer */
  onOpenMethodology?: () => void;
  className?: string;
}

const CONFIDENCE_CONFIG: Record<SavingsConfidence, {
  label: string;
  labelAr: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof AlertTriangle | typeof Info;
}> = {
  high: {
    label: 'High Confidence',
    labelAr: 'ثقة عالية',
    color: 'text-success',
    bgColor: 'bg-success/5',
    borderColor: 'border-success/30',
    icon: Info,
  },
  medium: {
    label: 'Estimated',
    labelAr: 'مقدر',
    color: 'text-warning',
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/30',
    icon: AlertTriangle,
  },
  low: {
    label: 'Low Confidence',
    labelAr: 'ثقة منخفضة',
    color: 'text-destructive',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/30',
    icon: AlertTriangle,
  },
};

export function SavingsEstimationBanner({
  confidence,
  inputs,
  exclusions,
  confidenceReason,
  onOpenMethodology,
  className,
}: SavingsEstimationBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const config = CONFIDENCE_CONFIG[confidence];
  const Icon = config.icon;

  return (
    <Card className={cn(
      'border',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <CardContent className="py-3 px-4">
        {/* Main row */}
        <div className={cn(
          'flex items-center gap-3',
          isRTL && 'flex-row-reverse'
        )}>
          <Icon className={cn('w-5 h-5 shrink-0', config.color)} />
          
          <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
            <div className={cn(
              'flex items-center gap-2 flex-wrap',
              isRTL && 'flex-row-reverse'
            )}>
              <span className="text-sm font-medium">
                {t('Savings figures are estimated', 'أرقام التوفيرات مقدرة')}
              </span>
              <Badge variant="outline" className={cn('text-xs gap-1', config.color, config.borderColor)}>
                <Calculator className="w-3 h-3" />
                {t(config.label, config.labelAr)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {confidenceReason}
            </p>
          </div>

          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            {onOpenMethodology && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onOpenMethodology}
                className="gap-1 text-xs h-8"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {t('Methodology', 'المنهجية')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="gap-1 text-xs h-8"
            >
              {expanded ? t('Less', 'أقل') : t('Details', 'التفاصيل')}
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className={cn(
            'mt-4 pt-4 border-t border-border/50 grid md:grid-cols-2 gap-4',
            isRTL && 'text-right'
          )}>
            {/* Inputs used */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                {t('Inputs Used', 'المدخلات المستخدمة')}
              </h4>
              <div className="space-y-1.5">
                {inputs.map((input, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      'flex items-center justify-between text-xs',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <span className="text-muted-foreground">{input.label}</span>
                    <span className={cn(
                      'font-medium',
                      input.isEstimated && 'text-warning'
                    )}>
                      {input.value}
                      {input.isEstimated && (
                        <span className="text-warning ms-1">*</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              {inputs.some(i => i.isEstimated) && (
                <p className="text-xs text-warning mt-2">
                  * {t('Estimated value', 'قيمة مقدرة')}
                </p>
              )}
            </div>

            {/* Exclusions */}
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                {t('Not Included', 'غير مشمول')}
              </h4>
              <ul className={cn(
                'space-y-1 text-xs text-muted-foreground',
                isRTL ? 'pr-4' : 'pl-4'
              )}>
                {exclusions.map((item, idx) => (
                  <li key={idx} className="list-disc">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SavingsEstimationBanner;
