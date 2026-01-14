import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface CommandBarMetrics {
  programScore: number;
  scoreChange: number;
  totalBudget: number;
  utilizationRate: number;
  utilizationTarget: number;
  pendingActions: number;
  period: string;
}

interface ExecutiveCommandBarProps {
  metrics: CommandBarMetrics;
}

export function ExecutiveCommandBar({ metrics }: ExecutiveCommandBarProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(0)}M`;
    }
    return `AED ${(value / 1000).toFixed(0)}K`;
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { color: 'emerald', label: 'Excellent', icon: CheckCircle2 };
    if (score >= 65) return { color: 'amber', label: 'Good', icon: AlertTriangle };
    return { color: 'red', label: 'Needs Attention', icon: AlertTriangle };
  };

  const getUtilizationStatus = () => {
    if (metrics.utilizationRate >= metrics.utilizationTarget) return 'On Track';
    if (metrics.utilizationRate >= metrics.utilizationTarget - 10) return 'Slightly Below';
    return 'Below Target';
  };

  const scoreStatus = getScoreStatus(metrics.programScore);
  const ScoreIcon = scoreStatus.icon;

  return (
    <div className="bg-gradient-to-r from-primary via-primary to-primary/90 rounded-2xl p-1 shadow-xl">
      <div className="bg-gradient-to-r from-primary/95 via-primary to-primary/90 rounded-xl p-4">
        <div className={cn(
          "grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6",
          isRTL && "direction-rtl"
        )}>
          {/* Program Health Score */}
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl",
              scoreStatus.color === 'emerald' && "bg-emerald-500/20 text-emerald-400",
              scoreStatus.color === 'amber' && "bg-amber-500/20 text-amber-400",
              scoreStatus.color === 'red' && "bg-red-500/20 text-red-400"
            )}>
              {metrics.programScore}
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-primary-foreground/70 text-xs uppercase tracking-wider font-medium">Program Health</p>
              <div className={cn("flex items-center gap-1.5 mt-0.5", isRTL && "flex-row-reverse")}>
                <ScoreIcon className={cn(
                  "w-3.5 h-3.5",
                  scoreStatus.color === 'emerald' && "text-emerald-400",
                  scoreStatus.color === 'amber' && "text-amber-400",
                  scoreStatus.color === 'red' && "text-red-400"
                )} />
                <span className="text-primary-foreground font-medium text-sm">{scoreStatus.label}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5 py-0 border-0",
                    metrics.scoreChange >= 0 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/20 text-red-400"
                  )}
                >
                  {metrics.scoreChange >= 0 ? '+' : ''}{metrics.scoreChange}pts
                </Badge>
              </div>
            </div>
          </div>

          {/* Total Budget */}
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">AED</span>
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-primary-foreground/70 text-xs uppercase tracking-wider font-medium">Annual Budget</p>
              <p className="text-primary-foreground font-bold text-xl">{formatCurrency(metrics.totalBudget)}</p>
            </div>
          </div>

          {/* Utilization Rate */}
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl",
              metrics.utilizationRate >= metrics.utilizationTarget 
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400"
            )}>
              {metrics.utilizationRate}%
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-primary-foreground/70 text-xs uppercase tracking-wider font-medium">Utilization</p>
              <div className={cn("flex items-center gap-1.5 mt-0.5", isRTL && "flex-row-reverse")}>
                {metrics.utilizationRate >= metrics.utilizationTarget ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="text-primary-foreground font-medium text-sm">{getUtilizationStatus()}</span>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl",
              metrics.pendingActions > 10 
                ? "bg-red-500/20 text-red-400"
                : metrics.pendingActions > 5 
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-emerald-500/20 text-emerald-400"
            )}>
              {metrics.pendingActions}
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-primary-foreground/70 text-xs uppercase tracking-wider font-medium">Pending Actions</p>
              <div className={cn("flex items-center gap-1.5 mt-0.5", isRTL && "flex-row-reverse")}>
                <Clock className="w-3.5 h-3.5 text-primary-foreground/70" />
                <span className="text-primary-foreground font-medium text-sm">{metrics.period}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
