/**
 * Multi-Step Progress Indicator
 * 
 * A visual indicator for multi-step forms and wizards.
 * Supports both horizontal and vertical layouts, with RTL support.
 */

import * as React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Step {
  id: string;
  label: string;
  labelAr?: string;
  description?: string;
  descriptionAr?: string;
}

interface MultiStepProgressProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onStepClick?: (stepIndex: number) => void;
  allowClickPrevious?: boolean;
}

export function MultiStepProgress({
  steps,
  currentStep,
  orientation = 'horizontal',
  className,
  onStepClick,
  allowClickPrevious = false,
}: MultiStepProgressProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (index: number) => {
    if (!onStepClick) return;
    if (index < currentStep && allowClickPrevious) {
      onStepClick(index);
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-0', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          const isClickable = allowClickPrevious && index < currentStep && onStepClick;

          return (
            <div key={step.id} className="flex gap-3">
              {/* Indicator column */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    status === 'completed' && 'bg-success text-success-foreground',
                    status === 'current' && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    status === 'upcoming' && 'bg-muted text-muted-foreground border-2 border-border',
                    isClickable && 'cursor-pointer hover:ring-2 hover:ring-primary/30'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[2rem] transition-colors',
                      status === 'completed' ? 'bg-success' : 'bg-border'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'font-medium text-sm',
                    status === 'current' && 'text-foreground',
                    status === 'completed' && 'text-muted-foreground',
                    status === 'upcoming' && 'text-muted-foreground/70'
                  )}
                >
                  {t(step.label, step.labelAr)}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(step.description, step.descriptionAr)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          const isClickable = allowClickPrevious && index < currentStep && onStepClick;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    status === 'completed' && 'bg-success text-success-foreground',
                    status === 'current' && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    status === 'upcoming' && 'bg-muted text-muted-foreground border-2 border-border',
                    isClickable && 'cursor-pointer hover:ring-2 hover:ring-primary/30'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <div className="text-center">
                  <p
                    className={cn(
                      'text-xs font-medium whitespace-nowrap',
                      status === 'current' && 'text-foreground',
                      status === 'completed' && 'text-muted-foreground',
                      status === 'upcoming' && 'text-muted-foreground/70'
                    )}
                  >
                    {t(step.label, step.labelAr)}
                  </p>
                </div>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    index < currentStep ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Compact inline progress for smaller spaces
export function StepProgressInline({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const { language } = useLanguage();
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i < current ? 'bg-primary' : i === current ? 'bg-primary/50' : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {t(`Step ${current + 1} of ${total}`, `الخطوة ${current + 1} من ${total}`)}
      </span>
    </div>
  );
}
