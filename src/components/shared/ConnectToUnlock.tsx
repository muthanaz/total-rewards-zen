/**
 * Connect To Unlock Component
 * 
 * Empty state for when data is missing or coverage is below threshold.
 * Shows expected benefits and CTA to fix the issue.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Link2,
  Database,
  BarChart3,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

type ConnectReason = 'integration_missing' | 'low_coverage' | 'stale_data' | 'no_data';

interface ConnectToUnlockProps {
  reason: ConnectReason;
  domain: string;
  expectedBenefits?: string[];
  fixRoute?: string;
  fixLabel?: string;
  coveragePercent?: number;
  requiredCoverage?: number;
  className?: string;
  variant?: 'card' | 'inline' | 'banner';
}

const REASON_CONFIG: Record<ConnectReason, {
  icon: typeof Link2;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  ctaLabel: string;
  ctaLabelAr: string;
}> = {
  integration_missing: {
    icon: Link2,
    title: 'Connect to Unlock',
    titleAr: 'اتصل للفتح',
    description: 'This insight requires connecting a data source.',
    descriptionAr: 'تتطلب هذه الرؤية ربط مصدر بيانات.',
    ctaLabel: 'Connect Integration',
    ctaLabelAr: 'ربط التكامل',
  },
  low_coverage: {
    icon: BarChart3,
    title: 'More Data Needed',
    titleAr: 'مطلوب المزيد من البيانات',
    description: 'Current data coverage is below the required threshold.',
    descriptionAr: 'تغطية البيانات الحالية أقل من الحد المطلوب.',
    ctaLabel: 'Improve Coverage',
    ctaLabelAr: 'تحسين التغطية',
  },
  stale_data: {
    icon: AlertTriangle,
    title: 'Data Outdated',
    titleAr: 'البيانات قديمة',
    description: 'The last sync was too long ago for reliable insights.',
    descriptionAr: 'آخر مزامنة كانت منذ وقت طويل.',
    ctaLabel: 'Run Sync',
    ctaLabelAr: 'تشغيل المزامنة',
  },
  no_data: {
    icon: Database,
    title: 'No Data Available',
    titleAr: 'لا تتوفر بيانات',
    description: 'Start by connecting your systems to see insights.',
    descriptionAr: 'ابدأ بربط أنظمتك لرؤية الرؤى.',
    ctaLabel: 'Get Started',
    ctaLabelAr: 'ابدأ',
  },
};

const DEFAULT_BENEFITS = [
  'Accurate utilization metrics',
  'Real-time cost tracking',
  'Automated compliance checks',
  'Trend analysis over time',
];

export function ConnectToUnlock({
  reason,
  domain,
  expectedBenefits = DEFAULT_BENEFITS,
  fixRoute = '/employer/integrations',
  fixLabel,
  coveragePercent,
  requiredCoverage = 80,
  className,
  variant = 'card',
}: ConnectToUnlockProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  const config = REASON_CONFIG[reason];
  const Icon = config.icon;
  
  if (variant === 'banner') {
    return (
      <div className={cn(
        'flex items-center justify-between gap-4 p-4 rounded-lg border border-warning/30 bg-warning/5',
        isRTL && 'flex-row-reverse text-right',
        className
      )}>
        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
          <div className="p-2 rounded-full bg-warning/10">
            <Icon className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {language === 'ar' ? config.titleAr : config.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? config.descriptionAr : config.description}
            </p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link to={fixRoute} className="gap-1.5">
            {fixLabel || (language === 'ar' ? config.ctaLabelAr : config.ctaLabel)}
            <ArrowRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
          </Link>
        </Button>
      </div>
    );
  }
  
  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center gap-2 text-muted-foreground',
        isRTL && 'flex-row-reverse',
        className
      )}>
        <Lock className="h-4 w-4" />
        <span className="text-sm">{language === 'ar' ? config.titleAr : config.title}</span>
        <Button variant="link" size="sm" className="h-auto p-0" asChild>
          <Link to={fixRoute}>
            {fixLabel || (language === 'ar' ? config.ctaLabelAr : config.ctaLabel)}
          </Link>
        </Button>
      </div>
    );
  }
  
  // Card variant (default)
  return (
    <Card className={cn(
      'border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/30 to-muted/10',
      className
    )}>
      <CardContent className="py-8">
        <div className={cn(
          'flex flex-col items-center text-center max-w-md mx-auto',
          isRTL && 'text-right items-end'
        )}>
          {/* Icon */}
          <div className="relative mb-4">
            <div className="p-4 rounded-full bg-muted/50 border border-muted-foreground/20">
              <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-warning/20 border border-warning/30">
              <Lock className="h-3.5 w-3.5 text-warning" />
            </div>
          </div>
          
          {/* Title & Description */}
          <h3 className="text-lg font-semibold mb-1">
            {language === 'ar' ? config.titleAr : config.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'ar' ? config.descriptionAr : config.description}
          </p>
          
          {/* Coverage indicator if applicable */}
          {coveragePercent !== undefined && (
            <div className="w-full mb-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{t('Current coverage', 'التغطية الحالية')}</span>
                <span className="font-medium">{coveragePercent}% / {requiredCoverage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all',
                    coveragePercent >= requiredCoverage ? 'bg-success' : 'bg-warning'
                  )}
                  style={{ width: `${Math.min(100, (coveragePercent / requiredCoverage) * 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Expected benefits */}
          <div className="w-full mb-5">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {t('Once connected, you will unlock:', 'بعد الربط، ستفتح:')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {expectedBenefits.slice(0, 4).map((benefit, i) => (
                <div 
                  key={i}
                  className={cn(
                    'flex items-center gap-1.5 text-xs text-muted-foreground',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <TrendingUp className="h-3 w-3 text-success shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA */}
          <Button asChild className="gap-1.5">
            <Link to={fixRoute}>
              {fixLabel || (language === 'ar' ? config.ctaLabelAr : config.ctaLabel)}
              <ArrowRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
            </Link>
          </Button>
          
          {/* Domain badge */}
          <Badge variant="outline" className="mt-4 text-xs">
            {t(`${domain} insights`, `رؤى ${domain}`)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Wrapper for use in metric cards
 */
export function MetricConnectGate({
  children,
  isConnected,
  reason = 'integration_missing',
  domain,
  fixRoute,
}: {
  children: React.ReactNode;
  isConnected: boolean;
  reason?: ConnectReason;
  domain: string;
  fixRoute?: string;
}) {
  if (isConnected) {
    return <>{children}</>;
  }
  
  return (
    <ConnectToUnlock
      reason={reason}
      domain={domain}
      fixRoute={fixRoute}
      variant="card"
    />
  );
}
