/**
 * Go-Live Readiness Panel - Shows pass/fail checklist for launch conditions
 */

import { CheckCircle2, XCircle, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GoLiveCondition {
  key: string;
  label: string;
  labelAr: string;
  passed: boolean;
}

interface SetupGoLivePanelProps {
  conditions: GoLiveCondition[];
  isReady: boolean;
}

export function SetupGoLivePanel({ conditions, isReady }: SetupGoLivePanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <CardTitle className="text-base">
            {t('Go-Live Readiness', 'جاهزية الإطلاق')}
          </CardTitle>
          {isReady ? (
            <Badge className="bg-success text-success-foreground text-xs">
              {t('Ready', 'جاهز')}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400">
              {t('Not Ready', 'غير جاهز')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {conditions.map((condition) => (
          <div
            key={condition.key}
            className={cn(
              'flex items-center gap-2 text-sm py-1',
              isRTL && 'flex-row-reverse'
            )}
          >
            {condition.passed ? (
              <CheckCircle2 className="size-4 text-success shrink-0" />
            ) : (
              <XCircle className="size-4 text-destructive shrink-0" />
            )}
            <span className={cn(
              condition.passed ? 'text-muted-foreground' : 'text-foreground',
              isRTL && 'text-right'
            )}>
              {t(condition.label, condition.labelAr)}
            </span>
          </div>
        ))}

        {isReady && (
          <Button className="w-full mt-3 gap-2" variant="default">
            <Rocket className="size-4" />
            {t('Launch Platform', 'إطلاق المنصة')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
