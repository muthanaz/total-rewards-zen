/**
 * Setup Progress Header Component
 * Shows overall progress and go-live status
 */

import { Rocket, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <CardHeader className="pb-3">
        <div className={cn('flex items-center justify-between flex-wrap gap-4', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <CardTitle className="text-xl">
                {t('Setup Your Benefits Platform', 'إعداد منصة المزايا الخاصة بك')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('Complete these steps to go live', 'أكمل هذه الخطوات للإطلاق')}
              </p>
            </div>
          </div>

          {progress.isGoLiveReady ? (
            <Badge className="bg-success text-success-foreground gap-1.5 px-3 py-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {t('Ready to Go Live', 'جاهز للإطلاق')}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm border-amber-300 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              {t('Setup In Progress', 'الإعداد قيد التنفيذ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className={cn('flex items-center justify-between text-sm', isRTL && 'flex-row-reverse')}>
            <span className="font-medium">
              {progress.completedSteps} {t('of', 'من')} {progress.totalSteps} {t('steps completed', 'خطوات مكتملة')}
            </span>
            <span className="text-muted-foreground">{progress.percentComplete}%</span>
          </div>
          <Progress value={progress.percentComplete} className="h-3" />
        </div>

        {/* Blockers */}
        {!progress.isGoLiveReady && progress.goLiveBlockers.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className={cn('text-sm font-medium text-amber-800 dark:text-amber-200 mb-2', isRTL && 'text-right')}>
              {t('To go live, complete:', 'للإطلاق، أكمل:')}
            </p>
            <ul className="space-y-1">
              {progress.goLiveBlockers.map((blocker, i) => (
                <li
                  key={i}
                  className={cn('text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2', isRTL && 'flex-row-reverse text-right')}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {blocker}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
