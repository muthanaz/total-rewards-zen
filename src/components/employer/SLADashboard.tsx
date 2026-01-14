import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Timer
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SLAStats {
  onTrack: number;
  atRisk: number;
  breached: number;
  avgProcessingTime: number; // in hours
  targetTime: number; // in hours
}

interface SLADashboardProps {
  stats: SLAStats;
  className?: string;
}

export function SLADashboard({ stats, className }: SLADashboardProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const total = stats.onTrack + stats.atRisk + stats.breached;
  const complianceRate = total > 0 ? ((stats.onTrack / total) * 100).toFixed(0) : 100;
  const processingEfficiency = stats.targetTime > 0 
    ? Math.min(100, (stats.targetTime / stats.avgProcessingTime) * 100).toFixed(0) 
    : 100;

  const slaItems = [
    {
      label: isRTL ? 'في الموعد' : 'On Track',
      count: stats.onTrack,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      label: isRTL ? 'معرض للخطر' : 'At Risk',
      sublabel: isRTL ? '< 24 ساعة' : '< 24h',
      count: stats.atRisk,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      label: isRTL ? 'تجاوز الموعد' : 'Breached',
      count: stats.breached,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20'
    }
  ];

  return (
    <Card className={cn("border-border/50 bg-gradient-to-r from-card to-primary/5", className)}>
      <CardContent className="p-4">
        <div className={cn(
          "flex flex-wrap items-stretch gap-4",
          isRTL && "flex-row-reverse"
        )}>
          {/* SLA Status Badges */}
          <div className={cn(
            "flex items-center gap-3 flex-1",
            isRTL && "flex-row-reverse"
          )}>
            {slaItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border",
                  item.border, item.bg
                )}
              >
                <item.icon className={cn("w-4 h-4", item.color)} />
                <div className={isRTL ? "text-right" : ""}>
                  <p className={cn("text-lg font-bold tabular-nums", item.color)}>
                    {item.count}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {item.label}
                    {item.sublabel && (
                      <span className="opacity-70"> ({item.sublabel})</span>
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-border/50" />

          {/* Processing Metrics */}
          <div className={cn(
            "flex items-center gap-4",
            isRTL && "flex-row-reverse"
          )}>
            {/* Average Processing Time */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30",
              isRTL && "flex-row-reverse"
            )}>
              <Timer className="w-4 h-4 text-primary" />
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-sm font-bold tabular-nums">
                  {stats.avgProcessingTime.toFixed(1)}h
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? "متوسط المعالجة" : "Avg. Processing"}
                </p>
              </div>
            </div>

            {/* SLA Compliance Rate */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              Number(complianceRate) >= 90 
                ? "bg-emerald-500/10" 
                : Number(complianceRate) >= 75 
                  ? "bg-amber-500/10" 
                  : "bg-red-500/10"
            )}>
              <TrendingUp className={cn(
                "w-4 h-4",
                Number(complianceRate) >= 90 
                  ? "text-emerald-600" 
                  : Number(complianceRate) >= 75 
                    ? "text-amber-600" 
                    : "text-red-600"
              )} />
              <div className={isRTL ? "text-right" : ""}>
                <p className={cn(
                  "text-sm font-bold tabular-nums",
                  Number(complianceRate) >= 90 
                    ? "text-emerald-600" 
                    : Number(complianceRate) >= 75 
                      ? "text-amber-600" 
                      : "text-red-600"
                )}>
                  {complianceRate}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? "معدل الامتثال" : "SLA Compliance"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
