import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, TrendingUp, TrendingDown, Minus, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface BenchmarkMetric {
  id: string;
  name: string;
  yourValue: number;
  industryAvg: number;
  topPerformers: number;
  unit: string;
  higherIsBetter: boolean;
}

interface CompetitiveBenchmarkProps {
  metrics: BenchmarkMetric[];
  industryName?: string;
}

export function CompetitiveBenchmark({ metrics, industryName = "Financial Services" }: CompetitiveBenchmarkProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const getStatus = (metric: BenchmarkMetric) => {
    const { yourValue, industryAvg, topPerformers, higherIsBetter } = metric;
    
    if (higherIsBetter) {
      if (yourValue >= topPerformers * 0.95) return { status: 'excellent', label: 'Top Performer', color: 'emerald' };
      if (yourValue >= industryAvg) return { status: 'good', label: 'Above Avg', color: 'blue' };
      return { status: 'below', label: 'Below Avg', color: 'amber' };
    } else {
      if (yourValue <= topPerformers * 1.05) return { status: 'excellent', label: 'Top Performer', color: 'emerald' };
      if (yourValue <= industryAvg) return { status: 'good', label: 'Above Avg', color: 'blue' };
      return { status: 'below', label: 'Below Avg', color: 'amber' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return Trophy;
      case 'good': return TrendingUp;
      case 'below': return TrendingDown;
      default: return Minus;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value}%`;
    if (unit === 'AED') return `AED ${(value / 1000).toFixed(0)}K`;
    if (unit === '/5') return `${value}/5`;
    return `${value}${unit}`;
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "text-lg font-display font-semibold flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          Competitive Position
          <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/20">
            vs {industryName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn("border-b border-border/50", isRTL && "text-right")}>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-left">
                  {isRTL ? "المقياس" : "Metric"}
                </th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                  {isRTL ? "أنت" : "You"}
                </th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                  {isRTL ? "متوسط الصناعة" : "Industry Avg"}
                </th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                  {isRTL ? "أفضل 10%" : "Top 10%"}
                </th>
                <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                  {isRTL ? "الحالة" : "Status"}
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => {
                const { status, label, color } = getStatus(metric);
                const StatusIcon = getStatusIcon(status);
                
                return (
                  <motion.tr
                    key={metric.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className={cn("py-3 text-sm font-medium", isRTL && "text-right")}>
                      {metric.name}
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "font-bold text-lg",
                        color === 'emerald' && "text-emerald-600",
                        color === 'blue' && "text-blue-600",
                        color === 'amber' && "text-amber-600"
                      )}>
                        {formatValue(metric.yourValue, metric.unit)}
                      </span>
                    </td>
                    <td className="py-3 text-center text-sm text-muted-foreground">
                      {formatValue(metric.industryAvg, metric.unit)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-sm text-emerald-600 font-medium">
                        {formatValue(metric.topPerformers, metric.unit)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          color === 'emerald' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                          color === 'blue' && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                          color === 'amber' && "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {label}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className={cn(
          "mt-4 pt-4 border-t border-border/50 flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {isRTL 
                ? `أنت في أفضل ${Math.round((metrics.filter(m => getStatus(m).status === 'excellent').length / metrics.length) * 100)}% في ${metrics.filter(m => getStatus(m).status === 'excellent').length} مقاييس`
                : `You're in the top tier for ${metrics.filter(m => getStatus(m).status === 'excellent').length} of ${metrics.length} metrics`
              }
            </span>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {Math.round((metrics.filter(m => getStatus(m).status !== 'below').length / metrics.length) * 100)}% Above Average
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
