/**
 * Employer Setup Checklist Page
 * 
 * Guides new clients through platform configuration with 8 clear steps.
 * 2-column layout: Steps list (left) + Next Step & Go-Live panels (right).
 */

import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSetupProgress } from '@/hooks/useSetupProgress';
import { 
  SetupProgressHeader, 
  SetupStepRow,
  SetupNextStepPanel,
  SetupGoLivePanel 
} from '@/components/employer/setup';
import { Skeleton } from '@/components/ui/skeleton';

export default function SetupPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const { steps, progress, checks, isLoading } = useSetupProgress();

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  // Find the first incomplete step (next step)
  const nextStepIndex = steps.findIndex(s => s.status !== 'done');
  const nextStep = nextStepIndex >= 0 ? steps[nextStepIndex] : null;

  // Build go-live conditions from checks
  const goLiveConditions = checks ? [
    {
      key: 'data_quality',
      label: 'Data quality score ≥ 80%',
      labelAr: 'درجة جودة البيانات ≥ 80%',
      passed: checks.dataQualityScore >= 80,
    },
    {
      key: 'policy',
      label: 'At least 1 policy published',
      labelAr: 'سياسة واحدة منشورة على الأقل',
      passed: checks.hasPublishedPolicy,
    },
    {
      key: 'workflow',
      label: 'At least 1 workflow active',
      labelAr: 'سير عمل واحد نشط على الأقل',
      passed: checks.hasActiveWorkflow,
    },
    {
      key: 'test_claim',
      label: 'At least 1 test claim processed',
      labelAr: 'مطالبة تجريبية واحدة معالجة على الأقل',
      passed: checks.hasProcessedClaim,
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-[1200px] mx-auto', isRTL && 'text-right')}>
      <SetupProgressHeader progress={progress} />

      <div className={cn('grid grid-cols-1 lg:grid-cols-12 gap-6', isRTL && 'direction-rtl')}>
        {/* Left Column: Steps List (70%) */}
        <div className="lg:col-span-8 space-y-3">
          {steps.map((step, index) => (
            <SetupStepRow
              key={step.id}
              step={step}
              isNextStep={index === nextStepIndex}
            />
          ))}
        </div>

        {/* Right Column: Panels (30%) */}
        <div className="lg:col-span-4 space-y-4">
          <SetupNextStepPanel step={nextStep} />
          <SetupGoLivePanel 
            conditions={goLiveConditions} 
            isReady={progress.isGoLiveReady} 
          />
        </div>
      </div>
    </div>
  );
}
