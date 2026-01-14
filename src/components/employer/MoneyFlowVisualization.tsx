import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, DollarSign, Users, Sparkles, Recycle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface MoneyFlowProps {
  allocated: number;
  utilized: number;
  valueDelivered: number;
  wasteIdentified: number;
  recoverableThisQuarter: number;
  employeeValuationNote?: string;
}

export function MoneyFlowVisualization({ 
  allocated, 
  utilized, 
  valueDelivered, 
  wasteIdentified,
  recoverableThisQuarter,
  employeeValuationNote = "Based on employee valuations"
}: MoneyFlowProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(1)}M`;
    }
    return `AED ${(value / 1000).toFixed(0)}K`;
  };

  const utilizationRate = ((utilized / allocated) * 100).toFixed(0);
  const valueMultiplier = (valueDelivered / utilized).toFixed(1);

  const flowSteps = [
    {
      label: 'Allocated',
      value: allocated,
      icon: DollarSign,
      color: 'bg-primary/10 text-primary',
      borderColor: 'border-primary/20'
    },
    {
      label: 'Utilized',
      value: utilized,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600',
      borderColor: 'border-blue-500/20',
      badge: `${utilizationRate}%`
    },
    {
      label: 'Value Delivered',
      value: valueDelivered,
      icon: Sparkles,
      color: 'bg-emerald-500/10 text-emerald-600',
      borderColor: 'border-emerald-500/20',
      badge: `${valueMultiplier}x`,
      showTooltip: true,
      tooltipText: 'Calculated by multiplying utilized benefits by employee-perceived value ratings from satisfaction surveys. Formula: Σ(Utilized Amount × Value Rating) for each benefit category.'
    }
  ];

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className={cn(
          "text-lg font-display font-semibold flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <DollarSign className="w-5 h-5 text-primary" />
          The Money Story
          <Badge variant="outline" className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/20">
            FY 2024
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flow Visualization */}
        <div className={cn(
          "flex items-center justify-between gap-2",
          isRTL && "flex-row-reverse"
        )}>
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
              className="flex-1"
            >
              <div className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md",
                step.borderColor,
                "bg-gradient-to-br from-card to-transparent"
              )}>
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <div className={cn("p-1.5 rounded-lg", step.color)}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  {step.badge && (
                    <Badge variant="outline" className={cn("text-[10px]", step.color, step.borderColor)}>
                      {step.badge}
                    </Badge>
                  )}
                </div>
                <div className={cn("flex items-center gap-1 mb-1", isRTL && "flex-row-reverse")}>
                  <p className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>{step.label}</p>
                  {step.showTooltip && (
                    <InfoTooltip formula={step.tooltipText} dataSource="Employee Valuations Survey" />
                  )}
                </div>
                <p className={cn("text-xl lg:text-2xl font-bold tracking-tight", isRTL && "text-right")}>
                  {formatCurrency(step.value)}
                </p>
              </div>
              
              {/* Arrow between steps */}
              {index < flowSteps.length - 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 -right-3 hidden lg:block">
                  <ArrowRight className={cn("w-5 h-5 text-muted-foreground/50", isRTL && "rotate-180")} />
                </div>
              )}
            </motion.div>
          ))}
        </div>


        {/* Waste Recovery Section */}
        <div className="pt-4 border-t border-border/50">
          <div className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
            isRTL && "sm:flex-row-reverse"
          )}>
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Recycle className="w-4 h-4 text-amber-500" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <p className="text-xs text-muted-foreground">Waste Identified</p>
                  <p className="font-bold text-amber-600">{formatCurrency(wasteIdentified)}</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-border/50" />
              
              <div className={isRTL ? "text-right" : ""}>
                <p className="text-xs text-muted-foreground">Recoverable This Quarter</p>
                <p className="font-bold text-emerald-600">{formatCurrency(recoverableThisQuarter)}</p>
              </div>
            </div>

            <Link to="/employer/zombie">
              <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                <Recycle className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                View Recovery Plan
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
