/**
 * Setup Step Card Component
 * Displays a single onboarding step with status, description, and CTA
 */

import { Link } from 'react-router-dom';
import { Check, Circle, Clock, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SetupStep, SetupStepStatus } from './types';

interface SetupStepCardProps {
  step: SetupStep;
  isNextStep?: boolean;
}

const statusConfig: Record<SetupStepStatus, { icon: typeof Check; color: string; label: string; labelAr: string }> = {
  done: { icon: Check, color: 'text-success', label: 'Done', labelAr: 'تم' },
  in_progress: { icon: Clock, color: 'text-warning', label: 'In Progress', labelAr: 'قيد التنفيذ' },
  not_started: { icon: Circle, color: 'text-muted-foreground', label: 'Not Started', labelAr: 'لم يبدأ' },
};

export function SetupStepCard({ step, isNextStep }: SetupStepCardProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  const config = statusConfig[step.status];
  const StatusIcon = config.icon;
  const isDone = step.status === 'done';
  const isGatedAndLocked = step.isGated && step.status === 'not_started';

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        isNextStep && 'ring-2 ring-primary/50 shadow-md',
        isDone && 'opacity-75'
      )}
    >
      <CardContent className="p-4">
        <div className={cn('flex items-start gap-4', isRTL && 'flex-row-reverse')}>
          {/* Step Number & Status */}
          <div className="flex flex-col items-center gap-1 min-w-[48px]">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                isDone && 'bg-success text-success-foreground',
                step.status === 'in_progress' && 'bg-warning/20 text-warning border-2 border-warning',
                step.status === 'not_started' && 'bg-muted text-muted-foreground border-2 border-border'
              )}
            >
              {isDone ? (
                <Check className="w-5 h-5" />
              ) : isGatedAndLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                step.order
              )}
            </div>
            <span className={cn('text-[10px] font-medium', config.color)}>
              {t(config.label, config.labelAr)}
            </span>
          </div>

          {/* Content */}
          <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className={cn('font-semibold text-base', isDone && 'text-muted-foreground')}>
                {t(step.title, step.titleAr)}
              </h3>
              {step.expectedMinutes && (
                <Badge variant="outline" className="text-[10px] h-5 gap-1">
                  <Clock className="w-3 h-3" />
                  ~{step.expectedMinutes} min
                </Badge>
              )}
              {isNextStep && (
                <Badge className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
                  {t('Next Step', 'الخطوة التالية')}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {t(step.description, step.descriptionAr)}
            </p>

            {/* Why it matters */}
            <div className={cn('flex items-start gap-2 mb-3 p-2 bg-muted/50 rounded-md', isRTL && 'flex-row-reverse')}>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t('Why it matters:', 'لماذا يهم:')}</span>{' '}
                {t(step.whyItMatters, step.whyItMattersAr)}
              </p>
            </div>

            {/* Gate conditions for go-live */}
            {step.isGated && step.gateConditions && step.status !== 'done' && (
              <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                  {t('Requirements to unlock:', 'متطلبات الفتح:')}
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                  {step.gateConditions.map((condition, i) => (
                    <li key={i} className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                      <Circle className="w-2 h-2 fill-current" />
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            {!isDone && (
              <Button
                asChild
                size="sm"
                variant={isNextStep ? 'default' : 'outline'}
                disabled={isGatedAndLocked}
                className={cn('gap-2', isRTL && 'flex-row-reverse')}
              >
                <Link to={isGatedAndLocked ? '#' : step.ctaPath}>
                  {t(step.ctaLabel, step.ctaLabelAr)}
                  <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                </Link>
              </Button>
            )}

            {isDone && (
              <Button asChild size="sm" variant="ghost" className={cn('gap-2 text-muted-foreground', isRTL && 'flex-row-reverse')}>
                <Link to={step.ctaPath}>
                  {t('Review', 'مراجعة')}
                  <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
