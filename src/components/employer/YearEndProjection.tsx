import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface YearEndProjectionProps {
  currentSpend: number;
  budget: number;
  projectedSpend: number;
  currentUtilization: number;
  monthsRemaining: number;
}

export function YearEndProjection({
  currentSpend,
  budget,
  projectedSpend,
  currentUtilization,
  monthsRemaining
}: YearEndProjectionProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [scenarioUtilization, setScenarioUtilization] = useState(currentUtilization);
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(1)}M`;
    }
    return `AED ${(value / 1000).toFixed(0)}K`;
  };

  const projectedPercent = ((projectedSpend / budget) * 100).toFixed(1);
  const variance = projectedSpend - budget;
  const isOverBudget = variance > 0;
  const variancePercent = Math.abs((variance / budget) * 100).toFixed(1);
  
  // Calculate scenario projection based on slider
  const calculateScenarioSpend = (utilizationRate: number) => {
    const dailyRate = currentSpend / ((12 - monthsRemaining) * 30);
    const adjustedRate = dailyRate * (utilizationRate / currentUtilization);
    const projectedRemaining = adjustedRate * monthsRemaining * 30;
    return currentSpend + projectedRemaining;
  };

  const scenarioSpend = calculateScenarioSpend(scenarioUtilization);
  const scenarioVariance = scenarioSpend - budget;
  const scenarioSavings = projectedSpend - scenarioSpend;

  const getRiskLevel = () => {
    if (variance > budget * 0.1) return { level: 'high', color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (variance > 0) return { level: 'medium', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    if (variance > -budget * 0.1) return { level: 'low', color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    return { level: 'under', color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
  };

  const risk = getRiskLevel();

  return (
    <Card className={cn("border-border/50 flex-1 flex flex-col", risk.border)}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "text-lg font-display font-semibold flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("p-1.5 rounded-lg", risk.bg)}>
            <Target className={cn("w-5 h-5", risk.color)} />
          </div>
          {isRTL ? "توقعات نهاية العام" : "Year-End Projection"}
          <Badge variant="outline" className={cn("ml-auto text-[10px]", risk.bg, risk.color, risk.border)}>
            {monthsRemaining} {isRTL ? "أشهر متبقية" : "months left"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 flex-1 flex flex-col">
        {/* Current Trajectory */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl border",
            risk.border,
            "bg-gradient-to-r from-card to-transparent"
          )}
        >
          <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-sm text-muted-foreground mb-1">
                {isRTL ? "الإنفاق المتوقع نهاية العام" : "Projected Year-End Spend"}
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(projectedSpend)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isRTL 
                  ? `${formatCurrency(currentSpend)} منفق + ${formatCurrency(projectedSpend - currentSpend)} متبقي`
                  : `${formatCurrency(currentSpend)} spent + ${formatCurrency(projectedSpend - currentSpend)} remaining`
                }
              </p>
            </div>
            
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              risk.bg
            )}>
              {isOverBudget ? (
                <TrendingUp className={cn("w-4 h-4", risk.color)} />
              ) : (
                <TrendingDown className={cn("w-4 h-4", risk.color)} />
              )}
              <span className={cn("text-sm font-semibold", risk.color)}>
                {projectedPercent}% of budget
              </span>
            </div>
          </div>

          <div className={cn(
            "mt-3 pt-3 border-t border-border/50 flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            {isOverBudget ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">
                  {isRTL 
                    ? `تجاوز متوقع بقيمة ${formatCurrency(variance)}`
                    : `Projected to exceed budget by ${formatCurrency(variance)}`
                  }
                </span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  {isRTL 
                    ? `متوقع أن يكون أقل من الميزانية بـ ${formatCurrency(Math.abs(variance))}`
                    : `Projected to be ${formatCurrency(Math.abs(variance))} under budget`
                  }
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Scenario Slider */}
        <div className="space-y-3">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium">
                {isRTL ? "محاكاة السيناريو" : "Scenario Simulation"}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/20">
              {scenarioUtilization}% {isRTL ? "استخدام" : "utilization"}
            </Badge>
          </div>

          <div className="px-1">
            <Slider
              value={[scenarioUtilization]}
              onValueChange={(value) => setScenarioUtilization(value[0])}
              min={40}
              max={95}
              step={5}
              className="py-2"
            />
            <div className={cn(
              "flex justify-between text-[10px] text-muted-foreground mt-1",
              isRTL && "flex-row-reverse"
            )}>
              <span>40%</span>
              <span>{isRTL ? "الحالي" : "Current"}: {currentUtilization}%</span>
              <span>95%</span>
            </div>
          </div>

          {scenarioUtilization !== currentUtilization && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className={cn(
                "flex items-center justify-between text-sm",
                isRTL && "flex-row-reverse"
              )}>
                <span className="text-muted-foreground">
                  {isRTL ? "الإنفاق المتوقع المعدل" : "Adjusted Projected Spend"}
                </span>
                <span className="font-semibold">{formatCurrency(scenarioSpend)}</span>
              </div>
              {scenarioSavings > 0 && (
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-emerald-600",
                  isRTL && "flex-row-reverse"
                )}>
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {isRTL 
                      ? `توفير محتمل ${formatCurrency(scenarioSavings)}`
                      : `Potential savings of ${formatCurrency(scenarioSavings)}`
                    }
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          className="w-full border-primary/30 text-primary hover:bg-primary/10"
        >
          {isRTL ? "عرض التوقعات التفصيلية" : "View Detailed Forecast"}
          <ChevronRight className={cn("w-4 h-4", isRTL ? "mr-2 rotate-180" : "ml-2")} />
        </Button>
      </CardContent>
    </Card>
  );
}
