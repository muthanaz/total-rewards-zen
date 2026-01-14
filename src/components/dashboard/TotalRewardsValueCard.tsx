import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Download,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TotalRewardsValueCardProps {
  totalValue: number;
  salaryValue: number;
  benefitsValue: number;
  variableValue: number;
  percentileRank?: number;
  trend?: { value: number; direction: 'up' | 'down' };
  isRTL?: boolean;
  isArabic?: boolean;
  onViewStatement?: () => void;
  onDownloadPDF?: () => void;
}

export function TotalRewardsValueCard({
  totalValue,
  salaryValue,
  benefitsValue,
  variableValue,
  percentileRank = 75,
  trend = { value: 8, direction: 'up' },
  isRTL = false,
  isArabic = false,
  onViewStatement,
  onDownloadPDF,
}: TotalRewardsValueCardProps) {
  const [isHidden, setIsHidden] = useState(false);

  const formatCurrency = (value: number) => {
    if (isHidden) return '•••,•••';
    return `AED ${value.toLocaleString()}`;
  };

  const formatShort = (value: number) => {
    if (isHidden) return '•••K';
    return `${(value / 1000).toFixed(0)}K`;
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // Calculate percentages for the visual breakdown
  const total = salaryValue + benefitsValue + variableValue;
  const salaryPercent = Math.round((salaryValue / total) * 100);
  const benefitsPercent = Math.round((benefitsValue / total) * 100);
  const variablePercent = Math.round((variableValue / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="rewards-value-card relative overflow-hidden border-0">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className={cn("flex items-start justify-between mb-6", isRTL && "flex-row-reverse")}>
            <div className={cn(isRTL && "text-right")}>
              <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wider">
                  {isArabic ? 'إجمالي مكافآتي' : 'My Total Rewards Value'}
                </h2>
              </div>
              <div className={cn("flex items-baseline gap-3", isRTL && "flex-row-reverse")}>
                <span className="text-4xl font-display font-bold text-primary-foreground">
                  {formatCurrency(totalValue)}
                </span>
                <span className="text-sm text-primary-foreground/60">
                  {isArabic ? '/ سنوياً' : '/ year'}
                </span>
              </div>
              
              {/* Trend Badge */}
              {trend && (
                <Badge className={cn(
                  "mt-2 border-0",
                  trend.direction === 'up' 
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                )}>
                  <ArrowUpRight className={cn(
                    "w-3 h-3 mr-1",
                    trend.direction === 'down' && "rotate-180"
                  )} />
                  {trend.value}% {isArabic ? 'من العام الماضي' : 'vs last year'}
                </Badge>
              )}
            </div>
            
            {/* Privacy Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHidden(!isHidden)}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 rounded-full"
            >
              {isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>
          </div>

          {/* Visual Breakdown Bar */}
          <div className="mb-6">
            <div className="h-3 rounded-full overflow-hidden flex bg-white/10">
              <motion.div 
                className="h-full bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${salaryPercent}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <motion.div 
                className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${benefitsPercent}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
              <motion.div 
                className="h-full bg-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${variablePercent}%` }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </div>
            
            {/* Legend */}
            <div className={cn("flex items-center justify-between mt-3 text-xs", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-primary-foreground/70">{isArabic ? 'الراتب' : 'Salary'}</span>
                <span className="text-primary-foreground font-semibold">{formatShort(salaryValue)}</span>
              </div>
              <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-primary-foreground/70">{isArabic ? 'المزايا' : 'Benefits'}</span>
                <span className="text-primary-foreground font-semibold">{formatShort(benefitsValue)}</span>
              </div>
              <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-primary-foreground/70">{isArabic ? 'متغير' : 'Variable'}</span>
                <span className="text-primary-foreground font-semibold">{formatShort(variableValue)}</span>
              </div>
            </div>
          </div>

          {/* Percentile Rank */}
          {percentileRank && (
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm mb-4",
              isRTL && "flex-row-reverse"
            )}>
              <div className="p-2 rounded-lg bg-accent/20">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-sm text-primary-foreground/80">
                  {isArabic 
                    ? `أنت في المئين ${percentileRank} لدورك ومستواك`
                    : `You're in the top ${100 - percentileRank}% for your role & level`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
            <Button
              variant="secondary"
              className="flex-1 bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
              onClick={onViewStatement}
            >
              {isArabic ? 'عرض الكشف الكامل' : 'View Full Statement'}
              <ChevronIcon className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
              onClick={onDownloadPDF}
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
