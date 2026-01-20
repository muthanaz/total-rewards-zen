import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Lightbulb } from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BenefitCategoryTileProps {
  name: string;
  icon: React.ElementType;
  route: string;
  entitlement: number;
  utilized: number;
  lastClaimDate?: string;
  recommendation?: string;
  className?: string;
}

/**
 * Enhanced benefit category tile with entitlement details and recommendations
 */
export function BenefitCategoryTile({
  name,
  icon: Icon,
  route,
  entitlement,
  utilized,
  lastClaimDate,
  recommendation,
  className,
}: BenefitCategoryTileProps) {
  const navigate = useNavigate();
  const remaining = entitlement - utilized;
  const utilizationRate = entitlement > 0 ? (utilized / entitlement) * 100 : 0;

  const getStatusStyle = (rate: number) => {
    if (rate >= 80) return { badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', progress: '[&>div]:bg-emerald-500', label: 'On Track' };
    if (rate >= 40) return { badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20', progress: '[&>div]:bg-blue-500', label: 'Moderate' };
    if (rate >= 10) return { badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20', progress: '[&>div]:bg-amber-500', label: 'Under-utilized' };
    return { badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20', progress: '[&>div]:bg-slate-400', label: 'Unused' };
  };

  const status = getStatusStyle(utilizationRate);

  return (
    <Card 
      className={cn(
        'group cursor-pointer border border-border/40 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 overflow-hidden',
        className
      )}
      onClick={() => navigate(route)}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/10 transition-all shrink-0">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base group-hover:text-accent transition-colors truncate">
                {name}
              </h3>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border', status.badge)}>
                {status.label}
              </Badge>
              {lastClaimDate && (
                <span className="text-[10px] text-muted-foreground">
                  Last claim: {lastClaimDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Entitlement Stats */}
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xl font-bold text-foreground tracking-tight">
                {formatCurrencyAED(entitlement)}
              </p>
              <p className="text-[11px] text-muted-foreground">Annual Entitlement</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-accent">{formatCurrencyAED(remaining)}</p>
              <p className="text-[10px] text-muted-foreground">Remaining</p>
            </div>
          </div>

          <Progress 
            value={utilizationRate} 
            className={cn('h-1.5 bg-muted/40 rounded-full', status.progress)}
          />

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {formatCurrencyAED(utilized)} used ({formatPercent(utilizationRate, 0)})
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] gap-1"
              onClick={(e) => { e.stopPropagation(); navigate(`${route}?view=policy`); }}
            >
              <FileText className="w-3 h-3" />
              View Policy
            </Button>
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Next step:</span> {recommendation}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
