/**
 * Next Step Panel - Shows the single highest-priority incomplete step
 */

import { Link } from 'react-router-dom';
import { Clock, ArrowRight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SetupStep } from './types';

interface SetupNextStepPanelProps {
  step: SetupStep | null;
}

export function SetupNextStepPanel({ step }: SetupNextStepPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  if (!step) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-success">
            {t('All Steps Complete!', 'جميع الخطوات مكتملة!')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('Your platform is ready to go live.', 'منصتك جاهزة للإطلاق.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <CardTitle className="text-base">
            {t('Next Step', 'الخطوة التالية')}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {t('Step', 'خطوة')} {step.order}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <h4 className={cn('font-semibold', isRTL && 'text-right')}>
          {t(step.title, step.titleAr)}
        </h4>
        
        <p className={cn('text-sm text-muted-foreground', isRTL && 'text-right')}>
          {t(step.description, step.descriptionAr)}
        </p>

        {step.expectedMinutes && (
          <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
            <Clock className="size-3.5" />
            <span>~{step.expectedMinutes} {t('min', 'دقيقة')}</span>
          </div>
        )}

        <div className={cn('flex items-center gap-2 text-xs text-muted-foreground pt-1', isRTL && 'flex-row-reverse')}>
          <FileText className="size-3.5 shrink-0" />
          <span>{t(step.whyItMatters, step.whyItMattersAr)}</span>
        </div>

        <Button asChild className="w-full mt-2">
          <Link to={step.ctaPath} className={cn('gap-2', isRTL && 'flex-row-reverse')}>
            {t(step.ctaLabel, step.ctaLabelAr)}
            <ArrowRight className={cn('size-4', isRTL && 'rotate-180')} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
