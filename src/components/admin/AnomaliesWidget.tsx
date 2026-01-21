/**
 * AnomaliesWidget
 * 
 * Compact widget showing detected anomalies/spikes with links to Alerts Center.
 */

import { AlertOctagon, TrendingUp, ShieldAlert, Database, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface Anomaly {
  id: string;
  type: 'sync' | 'auth' | 'claims' | 'system';
  title: string;
  count: number;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

interface AnomaliesWidgetProps {
  anomalies: Anomaly[];
}

const typeConfig = {
  sync: { icon: Database, label: 'Sync Failure' },
  auth: { icon: ShieldAlert, label: 'Auth Issue' },
  claims: { icon: TrendingUp, label: 'Claims Spike' },
  system: { icon: AlertOctagon, label: 'System Alert' },
};

const severityConfig = {
  critical: { color: 'bg-destructive/10 text-destructive border-destructive/30', dot: 'bg-destructive' },
  warning: { color: 'bg-warning/10 text-warning border-warning/30', dot: 'bg-warning' },
  info: { color: 'bg-accent/10 text-accent border-accent/30', dot: 'bg-accent' },
};

export function AnomaliesWidget({ anomalies }: AnomaliesWidgetProps) {
  const { language, direction } = useLanguage();
  const navigate = useNavigate();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const warningCount = anomalies.filter(a => a.severity === 'warning').length;

  if (anomalies.length === 0) {
    return (
      <Card className="border-success/20 bg-gradient-to-br from-card to-success/5">
        <CardContent className="p-4">
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-success/10">
              <AlertOctagon className="w-4 h-4 text-success" />
            </div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <p className="text-sm font-medium">{t('No Anomalies Detected', 'لم يتم اكتشاف حالات شاذة')}</p>
              <p className="text-xs text-muted-foreground">{t('All systems operating normally', 'جميع الأنظمة تعمل بشكل طبيعي')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/20 bg-gradient-to-br from-card to-warning/5">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className={cn("flex items-center justify-between text-base", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-warning/10">
              <AlertOctagon className="w-4 h-4 text-warning" />
            </div>
            {t('Anomalies Detected', 'الحالات الشاذة المكتشفة')}
          </div>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            {criticalCount > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                {criticalCount} {t('Critical', 'حرج')}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                {warningCount} {t('Warning', 'تحذير')}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="space-y-2">
          {anomalies.slice(0, 3).map((anomaly) => {
            const typeInfo = typeConfig[anomaly.type];
            const severityInfo = severityConfig[anomaly.severity];
            const Icon = typeInfo.icon;

            return (
              <div
                key={anomaly.id}
                className={cn(
                  "flex items-center gap-2.5 p-2 rounded-lg bg-muted/30",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", severityInfo.dot)} />
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                  <p className="text-xs font-medium truncate">{anomaly.title}</p>
                  <p className="text-[10px] text-muted-foreground">{anomaly.timestamp}</p>
                </div>
                {anomaly.count > 1 && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    ×{anomaly.count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("w-full mt-3 text-xs", isRTL && "flex-row-reverse")}
          onClick={() => navigate('/admin/alerts')}
        >
          {t('View All in Alerts Center', 'عرض الكل في مركز التنبيهات')}
          <ArrowRight className={cn("w-3 h-3 ms-1", isRTL && "rotate-180")} />
        </Button>
      </CardContent>
    </Card>
  );
}
