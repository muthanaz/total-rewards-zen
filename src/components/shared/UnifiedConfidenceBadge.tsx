/**
 * Unified Confidence Badge
 * 
 * Displays both Data Quality (Measured/Estimated/Partial) and
 * Confidence Level (High/Medium/Low) in a single component.
 */

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  Info,
  TrendingUp,
  Database,
  Clock,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  type DataQuality,
  type ConfidenceLevel,
  type TrustMetrics,
  QUALITY_CONFIG,
  CONFIDENCE_CONFIG,
} from '@/lib/trustSystem';

interface UnifiedConfidenceBadgeProps {
  quality: DataQuality;
  confidence: ConfidenceLevel;
  coveragePercent?: number;
  sampleSize?: number;
  lastSyncAt?: Date | null;
  reasons?: string[];
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const CONFIDENCE_ICONS = {
  high: ShieldCheck,
  medium: ShieldAlert,
  low: ShieldX,
};

export function UnifiedConfidenceBadge({
  quality,
  confidence,
  coveragePercent,
  sampleSize,
  lastSyncAt,
  reasons = [],
  showDetails = true,
  compact = false,
  className,
}: UnifiedConfidenceBadgeProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  const qualityConfig = QUALITY_CONFIG[quality];
  const confidenceConfig = CONFIDENCE_CONFIG[confidence];
  const ConfidenceIcon = CONFIDENCE_ICONS[confidence];
  
  const staleDays = lastSyncAt 
    ? Math.floor((Date.now() - lastSyncAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const badge = (
    <div className={cn(
      'inline-flex items-center gap-1.5',
      compact ? 'gap-1' : 'gap-1.5',
      className
    )}>
      {/* Quality Badge */}
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-medium',
          qualityConfig.bgColor,
          qualityConfig.color,
          qualityConfig.borderColor
        )}
      >
        {compact 
          ? (language === 'ar' ? qualityConfig.labelAr.charAt(0) : qualityConfig.label.charAt(0))
          : (language === 'ar' ? qualityConfig.labelAr : qualityConfig.label)
        }
      </Badge>
      
      {/* Confidence Badge */}
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-medium gap-1',
          confidenceConfig.bgColor,
          confidenceConfig.color,
          confidenceConfig.borderColor
        )}
      >
        <ConfidenceIcon className="h-3 w-3" />
        {!compact && (language === 'ar' ? confidenceConfig.labelAr : confidenceConfig.label)}
      </Badge>
    </div>
  );

  if (!showDetails) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {badge}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={isRTL ? 'left' : 'right'} 
          className="max-w-xs p-3"
        >
          <div className={cn('space-y-2', isRTL && 'text-right')}>
            {/* Quality explanation */}
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">
                  {language === 'ar' ? qualityConfig.labelAr : qualityConfig.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {qualityConfig.description}
                </p>
              </div>
            </div>
            
            {/* Confidence explanation */}
            <div className="flex items-start gap-2">
              <ConfidenceIcon className={cn('h-4 w-4 shrink-0 mt-0.5', confidenceConfig.color)} />
              <div>
                <p className="text-xs font-medium">
                  {t('Confidence:', 'الثقة:')} {language === 'ar' ? confidenceConfig.labelAr : confidenceConfig.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {confidenceConfig.description}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="pt-1 border-t border-border/50 space-y-1">
              {coveragePercent !== undefined && (
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span>{t('Coverage:', 'التغطية:')} {coveragePercent}%</span>
                </div>
              )}
              {sampleSize !== undefined && (
                <div className="flex items-center gap-2 text-xs">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>{t('Sample size:', 'حجم العينة:')} {sampleSize}</span>
                </div>
              )}
              {staleDays !== null && (
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>
                    {staleDays === 0 
                      ? t('Updated today', 'تم التحديث اليوم')
                      : t(`${staleDays} days ago`, `منذ ${staleDays} يوم`)
                    }
                  </span>
                </div>
              )}
            </div>
            
            {/* Reasons */}
            {reasons.length > 0 && (
              <div className="pt-1 border-t border-border/50">
                <p className="text-xs font-medium mb-1 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {t('Why:', 'لماذا:')}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {reasons.map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Simple variant for inline use
 */
export function ConfidencePill({
  confidence,
  className,
}: {
  confidence: ConfidenceLevel;
  className?: string;
}) {
  const config = CONFIDENCE_CONFIG[confidence];
  const Icon = CONFIDENCE_ICONS[confidence];
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full',
      config.bgColor,
      config.color,
      className
    )}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/**
 * Wrapper that computes badge from TrustMetrics
 */
export function TrustMetricsBadge({
  metrics,
  ...props
}: {
  metrics: TrustMetrics;
} & Omit<UnifiedConfidenceBadgeProps, 'quality' | 'confidence' | 'coveragePercent' | 'sampleSize' | 'lastSyncAt' | 'reasons'>) {
  return (
    <UnifiedConfidenceBadge
      quality={metrics.quality}
      confidence={metrics.confidence}
      coveragePercent={metrics.coveragePercent}
      sampleSize={metrics.sampleSize}
      lastSyncAt={metrics.lastSyncAt}
      reasons={metrics.reasons}
      {...props}
    />
  );
}
