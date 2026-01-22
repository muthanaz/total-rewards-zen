import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ChevronRight, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type InsightType = 'opportunity' | 'warning' | 'success' | 'info';

interface InsightCardProps {
  type: InsightType;
  title: string;
  what: string;
  why: string;
  action: {
    label: string;
    path: string;
  };
  value?: string;
  className?: string;
}

const typeConfig: Record<InsightType, { 
  icon: React.ElementType; 
  gradient: string;
  badge: string;
  badgeLabel: string;
}> = {
  opportunity: {
    icon: DollarSign,
    gradient: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    badgeLabel: 'Opportunity',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-rose-500/10 to-rose-500/5 border-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    badgeLabel: 'Action Needed',
  },
  success: {
    icon: TrendingUp,
    gradient: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    badgeLabel: 'On Track',
  },
  info: {
    icon: Lightbulb,
    gradient: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    badgeLabel: 'Tip',
  },
};

/**
 * Employee insight card following "What / Why / Next action" pattern
 */
export function InsightCard({ type, title, what, why, action, value, className }: InsightCardProps) {
  const navigate = useNavigate();
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card className={cn(
      'overflow-hidden border bg-gradient-to-br transition-all hover:shadow-md',
      config.gradient,
      className
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background/80 shrink-0">
              <Icon className="w-4 h-4 text-foreground" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', config.badge)}>
                  {config.badgeLabel}
                </Badge>
              </div>
              <h4 className="font-semibold text-sm">{title}</h4>
            </div>
          </div>
          {value && (
            <div className="text-right shrink-0">
              <span className="text-lg font-bold text-foreground">{value}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 pl-11">
          <div>
            <p className="text-xs font-medium text-foreground/80">What</p>
            <p className="text-sm text-muted-foreground">{what}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/80">Why it matters</p>
            <p className="text-sm text-muted-foreground">{why}</p>
          </div>
        </div>

        <div className="pl-11">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 px-3 gap-1 text-xs font-medium hover:bg-background/50"
            onClick={() => navigate(action.path)}
          >
            {action.label}
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Employee money-on-table insight (zombie spend concept for employees)
 */
export function MoneyOnTableInsight({ 
  amount, 
  topBenefit,
  daysRemaining,
}: { 
  amount: number; 
  topBenefit: string;
  daysRemaining: number;
}) {
  return (
    <InsightCard
      type="opportunity"
      title="You may be leaving money on the table"
      what={`You have ${formatCurrencyAED(amount, { abbreviate: false })} in unused benefits, with ${topBenefit} being the largest opportunity.`}
      why={`Only ${daysRemaining} days left in the year. These funds don't carry over and represent value you're entitled to.`}
      action={{
        label: `Explore ${topBenefit}`,
        path: `/employee/${topBenefit.toLowerCase().replace(/\s+/g, '-')}`,
      }}
      value={formatCurrencyAED(amount, { abbreviate: false })}
    />
  );
}
