/**
 * Setup Progress Header Component - Compact summary with progress bar
 */

import { Rocket, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SetupProgress } from './types';

interface SetupProgressHeaderProps {
  progress: SetupProgress;
}

export function SetupProgressHeader({ progress }: SetupProgressHeaderProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className={cn('flex items-start justify-between gap-4 mb-4', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Rocket className="size-5 text-primary" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <h1 className="text-lg font-semibold">
                {t('Setup Your Benefits Platform', 'إعداد منصة المزايا الخاصة بك')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('Complete all steps to launch your employee benefits portal', 'أكمل جميع الخطوات لإطلاق بوابة مزايا الموظفين')}
              </p>
            </div>
          </div>

          {progress.isGoLiveReady && (
            <Badge className="bg-success text-success-foreground gap-1.5 shrink-0">
              <CheckCircle2 className="size-3.5" />
              {t('Ready', 'جاهز')}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className={cn('flex items-center justify-between text-sm', isRTL && 'flex-row-reverse')}>
            <span className="font-medium">
              {progress.completedSteps} {t('of', 'من')} {progress.totalSteps} {t('completed', 'مكتملة')}
            </span>
            <span className="text-muted-foreground font-medium">{progress.percentComplete}%</span>
          </div>
          <Progress value={progress.percentComplete} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
