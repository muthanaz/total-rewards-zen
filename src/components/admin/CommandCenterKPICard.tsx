/**
 * CommandCenterKPICard
 * 
 * Enhanced KPI card with tooltip, sparkline, and delta vs previous period.
 */

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SparklineData {
  value: number;
}

interface CommandCenterKPICardProps {
  label: string;
  labelAr: string;
  value: string;
  previousValue?: string;
  change: number;
  icon: LucideIcon;
  sparklineData?: SparklineData[];
  tooltip: {
    definition: string;
    formula: string;
    source: string;
  };
  colorIndex: number;
}

const colorConfigs = [
  { bg: 'from-card to-primary/5', iconBg: 'bg-primary/10', iconColor: 'text-primary', sparkColor: 'hsl(var(--primary))' },
  { bg: 'from-card to-accent/5', iconBg: 'bg-accent/10', iconColor: 'text-accent', sparkColor: 'hsl(var(--accent))' },
  { bg: 'from-card to-success/5', iconBg: 'bg-success/10', iconColor: 'text-success', sparkColor: 'hsl(var(--success))' },
  { bg: 'from-card to-warning/5', iconBg: 'bg-warning/10', iconColor: 'text-warning', sparkColor: 'hsl(var(--warning))' },
];

function MiniSparkline({ data, color }: { data: SparklineData[]; color: string }) {
  if (!data || data.length < 2) return null;
  
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const padding = 2;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommandCenterKPICard({
  label,
  labelAr,
  value,
  previousValue,
  change,
  icon: Icon,
  sparklineData,
  tooltip,
  colorIndex,
}: CommandCenterKPICardProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const color = colorConfigs[colorIndex % colorConfigs.length];

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground';
  const badgeColor = change > 0 
    ? 'bg-success/10 text-success border-success/30' 
    : change < 0 
      ? 'bg-destructive/10 text-destructive border-destructive/30' 
      : 'bg-muted text-muted-foreground border-border';

  return (
    <Card className={cn("border-border/40 bg-gradient-to-br overflow-hidden", color.bg)}>
      <CardContent className="p-5">
        {/* Header: Icon + Tooltip */}
        <div className={cn("flex items-start justify-between mb-3", isRTL && "flex-row-reverse")}>
          <div className={cn("p-2.5 rounded-xl", color.iconBg)}>
            <Icon className={cn("w-5 h-5", color.iconColor)} />
          </div>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="p-1 rounded-full hover:bg-muted/50 transition-colors"
                  aria-label="Metric info"
                >
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 space-y-2 text-left" side="bottom">
                <p className="font-semibold text-sm">{language === 'ar' ? labelAr : label}</p>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Definition</p>
                  <p className="text-xs">{tooltip.definition}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Formula</p>
                  <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">{tooltip.formula}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Data Source</p>
                  <p className="text-xs text-muted-foreground">{tooltip.source}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Value + Sparkline */}
        <div className={cn("flex items-end justify-between gap-3", isRTL && "flex-row-reverse")}>
          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {language === 'ar' ? labelAr : label}
            </p>
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <MiniSparkline data={sparklineData} color={color.sparkColor} />
          )}
        </div>

        {/* Delta vs Previous */}
        <div className={cn(
          "flex items-center gap-2 mt-3 pt-3 border-t border-border/50",
          isRTL && "flex-row-reverse"
        )}>
          <Badge variant="outline" className={cn("text-xs", badgeColor)}>
            <TrendIcon className="w-3 h-3 me-1" />
            {change > 0 ? '+' : ''}{change}%
          </Badge>
          {previousValue && (
            <span className="text-xs text-muted-foreground">
              {language === 'ar' ? 'من' : 'from'} {previousValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
