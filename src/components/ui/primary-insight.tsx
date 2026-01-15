// Primary Insight - Hero insight component for page headers
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronRight, ChevronLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfidenceGate, ConfidenceLevel } from '@/components/employer/ConfidenceGate';

export interface PrimaryInsightProps {
  title: string;
  titleAr?: string;
  value: string | number;
  subtitle?: string;
  subtitleAr?: string;
  trend?: {
    value: number;
    label?: string;
    labelAr?: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  iconColor?: string;
  action?: {
    label: string;
    labelAr?: string;
    onClick: () => void;
  };
  confidence?: ConfidenceLevel;
  source?: string;
  sourceAr?: string;
  formula?: string;
  formulaAr?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function PrimaryInsight({
  title,
  titleAr,
  value,
  subtitle,
  subtitleAr,
  trend,
  icon: Icon,
  iconColor = 'text-accent',
  action,
  confidence = 'high',
  source,
  sourceAr,
  formula,
  formulaAr,
  variant = 'default',
  className,
}: PrimaryInsightProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const variantStyles = {
    default: 'from-accent/10 via-background to-primary/5 border-accent/20',
    success: 'from-emerald-500/10 via-background to-emerald-500/5 border-emerald-500/20',
    warning: 'from-amber-500/10 via-background to-amber-500/5 border-amber-500/20',
    danger: 'from-red-500/10 via-background to-red-500/5 border-red-500/20',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    const direction = trend.direction || (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral');
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    const direction = trend.direction || (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral');
    return direction === 'up' ? 'text-emerald-600' : direction === 'down' ? 'text-red-600' : 'text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(
        "overflow-hidden border-2",
        `bg-gradient-to-br ${variantStyles[variant]}`,
        className
      )}>
        <CardContent className="p-6">
          <ConfidenceGate confidence={confidence} showEstimatedLabel={confidence === 'medium'}>
            <div className={cn("flex flex-col lg:flex-row lg:items-center gap-6", isRTL && "lg:flex-row-reverse")}>
              {/* Main Content */}
              <div className={cn("flex-1", isRTL && "text-right")}>
                {/* Header */}
                <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                  {Icon && (
                    <div className="p-2.5 rounded-xl bg-accent/10">
                      <Icon className={cn("w-6 h-6", iconColor)} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {isArabic && titleAr ? titleAr : title}
                    </h2>
                    {source && (
                      <p className="text-xs text-muted-foreground/70">
                        {isArabic && sourceAr ? sourceAr : source}
                      </p>
                    )}
                  </div>
                </div>

                {/* Value */}
                <p className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-2">
                  {value}
                </p>

                {/* Subtitle & Trend */}
                <div className={cn("flex items-center gap-3 flex-wrap", isRTL && "flex-row-reverse")}>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {isArabic && subtitleAr ? subtitleAr : subtitle}
                    </p>
                  )}
                  {trend && (
                    <Badge variant="outline" className={cn("gap-1", getTrendColor())}>
                      {getTrendIcon()}
                      <span>
                        {trend.value > 0 ? '+' : ''}{trend.value}%
                        {trend.label && ` ${isArabic && trend.labelAr ? trend.labelAr : trend.label}`}
                      </span>
                    </Badge>
                  )}
                </div>

                {/* Formula */}
                {formula && (
                  <p className="text-xs text-muted-foreground/70 mt-2 font-mono">
                    {isArabic && formulaAr ? formulaAr : formula}
                  </p>
                )}
              </div>

              {/* Action */}
              {action && (
                <Button 
                  onClick={action.onClick}
                  className={cn("gap-2 shrink-0", isRTL && "flex-row-reverse")}
                >
                  {isArabic && action.labelAr ? action.labelAr : action.label}
                  <ChevronIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </ConfidenceGate>
        </CardContent>
      </Card>
    </motion.div>
  );
}
