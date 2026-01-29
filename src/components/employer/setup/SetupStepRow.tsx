/**
 * Setup Step Row - Compact single-row step display
 */

import { Link } from 'react-router-dom';
import { Check, Circle, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SetupStep, SetupStepStatus } from './types';

interface SetupStepRowProps {
  step: SetupStep;
  isNextStep?: boolean;
}

const statusConfig: Record<SetupStepStatus, { 
  variant: 'default' | 'secondary' | 'outline' | 'success' | 'warning';
  label: string; 
  labelAr: string;
}> = {
  done: { variant: 'success', label: 'Done', labelAr: 'تم' },
  in_progress: { variant: 'warning', label: 'In Progress', labelAr: 'قيد التنفيذ' },
  not_started: { variant: 'outline', label: 'Not Started', labelAr: 'لم يبدأ' },
};

export function SetupStepRow({ step, isNextStep }: SetupStepRowProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  const config = statusConfig[step.status];
  const isDone = step.status === 'done';

  return (
    <div 
      className={cn(
        'group flex flex-col gap-3 p-4 rounded-lg border bg-card transition-all duration-200',
        isNextStep && 'ring-2 ring-primary/40 border-primary/30 bg-primary/5',
        isDone && 'opacity-80'
      )}
    >
      {/* Header Row: Step number + Title + Status */}
      <div className={cn('flex items-center justify-between gap-4', isRTL && 'flex-row-reverse')}>
        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
          <div
            className={cn(
              'size-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
              isDone && 'bg-success text-success-foreground',
              step.status === 'in_progress' && 'bg-warning/20 text-warning border border-warning',
              step.status === 'not_started' && 'bg-muted text-muted-foreground border border-border'
            )}
          >
            {isDone ? <Check className="size-4" /> : step.order}
          </div>
          <div className={cn('flex items-center gap-2 flex-wrap', isRTL && 'flex-row-reverse')}>
            <span className={cn('font-medium', isDone && 'text-muted-foreground')}>
              {t(step.title, step.titleAr)}
            </span>
            {isNextStep && (
              <Badge className="text-[10px] h-5 bg-primary text-primary-foreground">
                {t('Next', 'التالي')}
              </Badge>
            )}
          </div>
        </div>

        <div className={cn('flex items-center gap-3 shrink-0', isRTL && 'flex-row-reverse')}>
          {step.expectedMinutes && !isDone && (
            <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
              <Clock className="size-3" />
              ~{step.expectedMinutes}m
            </span>
          )}
          <Badge variant={config.variant} className="text-xs">
            {t(config.label, config.labelAr)}
          </Badge>
        </div>
      </div>

      {/* Body Row: Why it matters + CTA */}
      <div className={cn('flex items-center justify-between gap-4', isRTL && 'flex-row-reverse')}>
        <p className={cn('text-sm text-muted-foreground flex-1', isRTL && 'text-right')}>
          {t(step.whyItMatters, step.whyItMattersAr)}
        </p>

        <Button
          asChild
          size="sm"
          variant={isNextStep ? 'default' : isDone ? 'ghost' : 'outline'}
          className={cn('shrink-0 gap-1.5', isRTL && 'flex-row-reverse')}
        >
          <Link to={step.ctaPath}>
            {isDone ? t('Review', 'مراجعة') : t(step.ctaLabel, step.ctaLabelAr)}
            <ArrowRight className={cn('size-3.5', isRTL && 'rotate-180')} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
