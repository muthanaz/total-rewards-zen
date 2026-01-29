/**
 * DataTrustPanel
 * 
 * Explainable data confidence panel for executive and HR ops pages.
 * Shows Coverage, Freshness, Confidence band, and Limitations.
 * 
 * PROMPT 03 Spec:
 * - Collapsible by default (expanded if confidence == Low)
 * - Deterministic confidence rules
 * - No vague "confidence" without explanation
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  Database,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { DataTrustPanelProps, ConfidenceBand } from './types';
import { useDataTrust, formatDataTrust } from './useDataTrust';

// Confidence band styling
const CONFIDENCE_STYLES: Record<ConfidenceBand, {
  bg: string;
  border: string;
  text: string;
  icon: typeof ShieldCheck;
  label: string;
  labelAr: string;
}> = {
  high: {
    bg: 'bg-success/5',
    border: 'border-success/20',
    text: 'text-success',
    icon: ShieldCheck,
    label: 'High Confidence',
    labelAr: 'ثقة عالية',
  },
  medium: {
    bg: 'bg-warning/5',
    border: 'border-warning/20',
    text: 'text-warning',
    icon: ShieldAlert,
    label: 'Medium Confidence',
    labelAr: 'ثقة متوسطة',
  },
  low: {
    bg: 'bg-destructive/5',
    border: 'border-destructive/20',
    text: 'text-destructive',
    icon: AlertTriangle,
    label: 'Low Confidence',
    labelAr: 'ثقة منخفضة',
  },
};

export function DataTrustPanel({
  state: externalState,
  pageName,
  defaultExpanded,
  className,
}: DataTrustPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  // Use external state or compute from hook
  const hookState = useDataTrust({ pageName });
  const state = externalState || hookState;
  const formatted = formatDataTrust(state);
  
  // Auto-expand for Low confidence
  const [isOpen, setIsOpen] = useState(
    defaultExpanded ?? state.confidenceBand === 'low'
  );
  
  // Update expansion when confidence changes
  useEffect(() => {
    if (state.confidenceBand === 'low' && !isOpen) {
      setIsOpen(true);
    }
  }, [state.confidenceBand]);
  
  const style = CONFIDENCE_STYLES[state.confidenceBand];
  const ConfidenceIcon = style.icon;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        'transition-all duration-200',
        style.bg,
        style.border,
        className
      )}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center justify-between p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors',
              isRTL && 'flex-row-reverse text-right'
            )}
          >
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className={cn('p-2 rounded-lg', style.bg)}>
                <ConfidenceIcon className={cn('w-5 h-5', style.text)} />
              </div>
              <div>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <span className="font-semibold text-sm">
                    {t('Data Trust', 'ثقة البيانات')}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', style.text, style.border)}
                  >
                    {t(style.label, style.labelAr)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatted.coverage} {t('sources connected', 'مصادر متصلة')} · {formatted.coveragePercent} {t('coverage', 'تغطية')}
                </p>
              </div>
            </div>
            
            <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {t('Last sync:', 'آخر مزامنة:')} {formatted.lastSync}
              </span>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/50">
              {/* Coverage Section */}
              <div className="space-y-2">
                <div className={cn('flex items-center gap-2 text-xs font-medium text-muted-foreground', isRTL && 'flex-row-reverse')}>
                  <Database className="w-3.5 h-3.5" />
                  {t('Coverage', 'التغطية')}
                </div>
                <div className="space-y-1.5">
                  <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                    <span className="text-sm font-medium">
                      {state.sourcesConnected}/{state.sourcesExpected} {t('sources', 'مصادر')}
                    </span>
                    <span className={cn(
                      'text-xs font-medium',
                      state.coveragePercent >= 90 ? 'text-success' :
                      state.coveragePercent >= 70 ? 'text-warning' : 'text-destructive'
                    )}>
                      {formatted.coveragePercent}
                    </span>
                  </div>
                  
                  {state.missingSources.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="text-destructive font-medium">{t('Missing:', 'مفقود:')}</span>{' '}
                      {state.missingSources.slice(0, 2).join(', ')}
                      {state.missingSources.length > 2 && ` +${state.missingSources.length - 2}`}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Freshness Section */}
              <div className="space-y-2">
                <div className={cn('flex items-center gap-2 text-xs font-medium text-muted-foreground', isRTL && 'flex-row-reverse')}>
                  <Clock className="w-3.5 h-3.5" />
                  {t('Freshness', 'الحداثة')}
                </div>
                <div className="space-y-1.5">
                  <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                    <span className="text-xs text-muted-foreground">{t('Last sync', 'آخر مزامنة')}</span>
                    <span className={cn(
                      'text-sm font-medium',
                      state.dataAgeHours <= 24 ? 'text-success' :
                      state.dataAgeHours <= 168 ? 'text-warning' : 'text-destructive'
                    )}>
                      {formatted.lastSync}
                    </span>
                  </div>
                  <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                    <span className="text-xs text-muted-foreground">{t('Next sync', 'المزامنة التالية')}</span>
                    <span className="text-sm">
                      {formatted.nextSync}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Confidence & Quality Section */}
              <div className="space-y-2">
                <div className={cn('flex items-center gap-2 text-xs font-medium text-muted-foreground', isRTL && 'flex-row-reverse')}>
                  <Zap className="w-3.5 h-3.5" />
                  {t('Confidence', 'الثقة')}
                </div>
                <div className="space-y-1.5">
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', style.text, style.border)}
                    >
                      {formatted.confidenceBandLabel}
                    </Badge>
                    {state.criticalViolations > 0 && (
                      <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                        {state.criticalViolations} {t('critical', 'حرج')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {state.confidenceReason}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Limitations */}
            {state.limitations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className={cn('flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2', isRTL && 'flex-row-reverse')}>
                  <Info className="w-3.5 h-3.5" />
                  {t('Limitations', 'القيود')}
                </div>
                <ul className="space-y-1">
                  {state.limitations.map((limitation, idx) => (
                    <li key={idx} className={cn('text-xs text-muted-foreground flex items-start gap-2', isRTL && 'flex-row-reverse')}>
                      <span className="text-muted-foreground/50 mt-0.5">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Actions for Low confidence */}
            {state.confidenceBand === 'low' && (
              <div className={cn('mt-4 pt-3 border-t border-border/50 flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <p className="text-xs text-destructive font-medium">
                  {t('Insights on this page may be incomplete.', 'قد تكون الرؤى في هذه الصفحة غير مكتملة.')}
                </p>
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline" 
                  className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Link to="/employer/integrations?view=ops">
                    <RefreshCw className="w-3 h-3" />
                    {t('Connect Data', 'ربط البيانات')}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/**
 * Inline estimate reliability indicator for Low confidence
 */
export function EstimateReliabilityBadge({
  confidenceBand,
  missingData,
  className,
}: {
  confidenceBand: ConfidenceBand;
  missingData?: string[];
  className?: string;
}) {
  const { language } = useLanguage();
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  if (confidenceBand !== 'low') return null;
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs text-destructive',
      className
    )}>
      <AlertTriangle className="w-3 h-3" />
      {t('Estimate reliability: Low', 'موثوقية التقدير: منخفضة')}
      {missingData && missingData.length > 0 && (
        <span className="text-muted-foreground">
          — {t('missing', 'مفقود')} {missingData.slice(0, 2).join(', ')}
        </span>
      )}
    </span>
  );
}

export default DataTrustPanel;
