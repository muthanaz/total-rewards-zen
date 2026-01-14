import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  ShieldAlert, 
  Smile,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PulseMetrics {
  roiScore: number;
  roiChange: number;
  roiBenchmark: number;
  financialHealth: {
    spent: number;
    budget: number;
    projectedYearEnd: number;
    trend: 'up' | 'down' | 'stable';
  };
  riskExposure: {
    wasteAmount: number;
    slaBreaches: number;
    policyGaps: number;
    totalAtRisk: number;
  };
  workforceSentiment: {
    score: number;
    change: number;
    responses: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface ExecutivePulseCardsProps {
  metrics: PulseMetrics;
}

export function ExecutivePulseCards({ metrics }: ExecutivePulseCardsProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(1)}M`;
    }
    return `AED ${(value / 1000).toFixed(0)}K`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    })
  };

  const utilizationPercent = (metrics.financialHealth.spent / metrics.financialHealth.budget) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Benefits ROI Score */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="border-border/50 bg-gradient-to-br from-card via-card to-emerald-500/5 hover:shadow-lg transition-all duration-300 h-full">
          <CardContent className="p-5">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  metrics.roiChange >= 0 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                )}
              >
                {metrics.roiChange >= 0 ? '+' : ''}{metrics.roiChange}%
              </Badge>
            </div>
            
            <div className={cn("mt-4", isRTL && "text-right")}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Benefits ROI Score</p>
              <div className={cn("flex items-baseline gap-2 mt-1", isRTL && "flex-row-reverse justify-end")}>
                <span className="text-3xl font-bold text-emerald-600">{metrics.roiScore}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className={cn("flex justify-between text-xs", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">vs Industry</span>
                <span className="font-medium text-emerald-600">+{metrics.roiScore - metrics.roiBenchmark}pts</span>
              </div>
              <Progress value={metrics.roiScore} className="h-1.5 [&>div]:bg-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Health */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="border-border/50 bg-gradient-to-br from-card via-card to-blue-500/5 hover:shadow-lg transition-all duration-300 h-full">
          <CardContent className="p-5">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  utilizationPercent <= 100 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                )}
              >
                {utilizationPercent.toFixed(0)}% deployed
              </Badge>
            </div>
            
            <div className={cn("mt-4", isRTL && "text-right")}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Financial Health</p>
              <div className={cn("flex items-baseline gap-2 mt-1", isRTL && "flex-row-reverse justify-end")}>
                <span className="text-3xl font-bold text-blue-600">{formatCurrency(metrics.financialHealth.spent)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className={cn("flex justify-between text-xs", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">Year-End Projection</span>
                <span className="font-medium">{formatCurrency(metrics.financialHealth.projectedYearEnd)}</span>
              </div>
              <Progress value={utilizationPercent} className="h-1.5 [&>div]:bg-blue-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Exposure */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 hover:shadow-lg transition-all duration-300 h-full">
          <CardContent className="p-5">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              </div>
              <Badge 
                variant="outline" 
                className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20"
              >
                {metrics.riskExposure.slaBreaches} SLA risks
              </Badge>
            </div>
            
            <div className={cn("mt-4", isRTL && "text-right")}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Risk Exposure</p>
              <div className={cn("flex items-baseline gap-2 mt-1", isRTL && "flex-row-reverse justify-end")}>
                <span className="text-3xl font-bold text-amber-600">{formatCurrency(metrics.riskExposure.totalAtRisk)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className={cn("flex justify-between text-xs", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">Waste identified</span>
                <span className="font-medium text-amber-600">{formatCurrency(metrics.riskExposure.wasteAmount)}</span>
              </div>
              <div className={cn("flex justify-between text-xs", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">Policy gaps</span>
                <span className="font-medium">{metrics.riskExposure.policyGaps} items</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Workforce Sentiment */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="border-border/50 bg-gradient-to-br from-card via-card to-violet-500/5 hover:shadow-lg transition-all duration-300 h-full">
          <CardContent className="p-5">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Smile className="w-5 h-5 text-violet-500" />
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  metrics.workforceSentiment.change >= 0 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                )}
              >
                {metrics.workforceSentiment.change >= 0 ? '+' : ''}{metrics.workforceSentiment.change}
              </Badge>
            </div>
            
            <div className={cn("mt-4", isRTL && "text-right")}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Workforce Sentiment</p>
              <div className={cn("flex items-baseline gap-2 mt-1", isRTL && "flex-row-reverse justify-end")}>
                <span className="text-3xl font-bold text-violet-600">{metrics.workforceSentiment.score}</span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
            </div>

            <div className="mt-4">
              <div className={cn("flex justify-between text-xs mb-1.5", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">Based on {metrics.workforceSentiment.responses} responses</span>
                {metrics.workforceSentiment.trend === 'up' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : metrics.workforceSentiment.trend === 'down' ? (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star} 
                    className={`h-1.5 flex-1 rounded-full ${star <= Math.round(metrics.workforceSentiment.score) ? 'bg-violet-500' : 'bg-muted'}`} 
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
