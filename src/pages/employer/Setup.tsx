/**
 * Employer Setup Checklist Page
 * 
 * Guides new clients through platform configuration with 8 clear steps.
 * Gated go-live ensures quality before launch.
 */

import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSetupProgress } from '@/hooks/useSetupProgress';
import { SetupProgressHeader, SetupStepCard } from '@/components/employer/setup';
import { Skeleton } from '@/components/ui/skeleton';

export default function SetupPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const { steps, progress, isLoading } = useSetupProgress();

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  // Find the first incomplete step (next step)
  const nextStepIndex = steps.findIndex(s => s.status !== 'done');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto', isRTL && 'text-right')}>
      <SetupProgressHeader progress={progress} />

      <div className="space-y-4">
        {steps.map((step, index) => (
          <SetupStepCard
            key={step.id}
            step={step}
            isNextStep={index === nextStepIndex}
          />
        ))}
      </div>
    </div>
  );
}
