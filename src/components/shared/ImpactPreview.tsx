/**
 * Impact Preview Component
 * 
 * Shows projected confidence improvement if specific issues are resolved.
 * "If you fix these 2 issues, confidence goes from X → Y and unlocks these insights"
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  Zap,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { IssueImpact } from '@/lib/trustSystem';

interface ImpactPreviewProps {
  impact: IssueImpact;
  selectedIssueCount?: number;
  onFixIssues?: () => void;
  className?: string;
}

export function ImpactPreview({
  impact,
  selectedIssueCount = 0,
  onFixIssues,
  className,
}: ImpactPreviewProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  const scoreImprovement = impact.projectedScore - impact.currentScore;
  const hasSignificantImpact = scoreImprovement >= 5;
  
  if (!impact.canCompute) {
    return (
      <Card className={cn('border-dashed border-muted-foreground/30', className)}>
        <CardContent className="py-4">
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="p-2 rounded-full bg-muted">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm font-medium text-muted-foreground">
                {t('Impact Unknown', 'التأثير غير معروف')}
              </p>
              <p className="text-xs text-muted-foreground">
                {impact.computeReason || t(
                  'Insufficient data to compute projected impact',
                  'بيانات غير كافية لحساب التأثير المتوقع'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn(
      'overflow-hidden',
      hasSignificantImpact 
        ? 'border-success/30 bg-success/5' 
        : 'border-primary/20 bg-primary/5',
      className
    )}>
      <CardContent className="py-4">
        <div className="space-y-4">
          {/* Header with score projection */}
          <div className={cn('flex items-center justify-between gap-4', isRTL && 'flex-row-reverse')}>
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className={cn(
                'p-2 rounded-full',
                hasSignificantImpact ? 'bg-success/20' : 'bg-primary/20'
              )}>
                <Sparkles className={cn(
                  'h-5 w-5',
                  hasSignificantImpact ? 'text-success' : 'text-primary'
                )} />
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm font-medium">
                  {selectedIssueCount > 0 
                    ? t(
                        `Fix ${selectedIssueCount} issue${selectedIssueCount > 1 ? 's' : ''} to improve`,
                        `إصلاح ${selectedIssueCount} مشكلة للتحسين`
                      )
                    : t('Potential Improvement', 'تحسين محتمل')
                  }
                </p>
                <div className={cn('flex items-center gap-2 mt-1', isRTL && 'flex-row-reverse')}>
                  <span className="text-2xl font-bold tabular-nums">{impact.currentScore}%</span>
                  <ArrowRight className={cn('h-4 w-4 text-muted-foreground', isRTL && 'rotate-180')} />
                  <span className={cn(
                    'text-2xl font-bold tabular-nums',
                    hasSignificantImpact ? 'text-success' : 'text-primary'
                  )}>
                    {impact.projectedScore}%
                  </span>
                  <Badge variant="outline" className={cn(
                    'text-xs',
                    hasSignificantImpact 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-primary/10 text-primary border-primary/20'
                  )}>
                    +{scoreImprovement}%
                  </Badge>
                </div>
              </div>
            </div>
            
            {onFixIssues && (
              <Button 
                size="sm" 
                onClick={onFixIssues}
                className={cn(
                  'gap-1.5',
                  hasSignificantImpact && 'bg-success hover:bg-success/90'
                )}
              >
                <Zap className="h-4 w-4" />
                {t('Fix Now', 'إصلاح الآن')}
              </Button>
            )}
          </div>
          
          {/* Progress bar visualization */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('Current', 'الحالي')}</span>
              <span>{t('Projected', 'المتوقع')}</span>
            </div>
            <div className="relative">
              <Progress 
                value={impact.currentScore} 
                className="h-2 bg-muted"
              />
              <div 
                className={cn(
                  'absolute top-0 h-2 rounded-full transition-all opacity-50',
                  hasSignificantImpact ? 'bg-success' : 'bg-primary'
                )}
                style={{ 
                  width: `${impact.projectedScore}%`,
                  left: 0,
                }}
              />
            </div>
          </div>
          
          {/* Unlocked insights */}
          {impact.unlockedInsights.length > 0 && (
            <div className={cn('pt-2 border-t border-border/50', isRTL && 'text-right')}>
              <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {t('Unlocked insights:', 'الرؤى المفعّلة:')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {impact.unlockedInsights.slice(0, 4).map((insight, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="text-xs bg-background/50"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1 text-success" />
                    {insight}
                  </Badge>
                ))}
                {impact.unlockedInsights.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{impact.unlockedInsights.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for sidebar or summary
 */
export function ImpactPreviewCompact({
  currentScore,
  projectedScore,
  issueCount,
  onClick,
  className,
}: {
  currentScore: number;
  projectedScore: number;
  issueCount: number;
  onClick?: () => void;
  className?: string;
}) {
  const improvement = projectedScore - currentScore;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-left',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            Fix {issueCount} issue{issueCount > 1 ? 's' : ''}
          </span>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          +{improvement}%
        </Badge>
      </div>
    </button>
  );
}
