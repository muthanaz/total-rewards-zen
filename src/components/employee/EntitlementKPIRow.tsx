/**
 * Entitlement KPI Row
 * 
 * Top-level summary of employee entitlements showing:
 * - Total Eligible (Annual)
 * - Used (YTD)
 * - Remaining
 * - Pending / In Review
 * Plus data confidence badge and last updated timestamp
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Clock, 
  ShieldCheck,
  Info,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { DataProvenance, SOURCE_TYPE_LABELS, CONFIDENCE_LABELS } from '@/lib/dataProvenance';

interface EntitlementKPIRowProps {
  totalEligible: number;
  usedYTD: number;
  remaining: number;
  pendingCount: number;
  pendingAmount?: number;
  provenance?: DataProvenance;
  isRTL?: boolean;
  className?: string;
}

interface KPIItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning';
  isRTL?: boolean;
}

function KPIItem({ icon: Icon, label, value, sublabel, variant = 'default', isRTL }: KPIItemProps) {
  const variantStyles = {
    default: 'bg-muted/30',
    accent: 'bg-accent/8 border-accent/15',
    success: 'bg-success/8 border-success/15',
    warning: 'bg-warning/8 border-warning/15',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl border border-border/40",
      variantStyles[variant],
      isRTL && "flex-row-reverse"
    )}>
      <div className={cn(
        "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
        variant === 'default' ? 'bg-muted' : `bg-${variant}/10`
      )}>
        <Icon className={cn("w-5 h-5", iconStyles[variant])} />
      </div>
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <p className="text-[13px] text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-bold tracking-tight tabular-nums">{value}</p>
        {sublabel && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

export function EntitlementKPIRow({
  totalEligible,
  usedYTD,
  remaining,
  pendingCount,
  pendingAmount = 0,
  provenance,
  isRTL = false,
  className,
}: EntitlementKPIRowProps) {
  const utilizationPercent = totalEligible > 0 ? Math.round((usedYTD / totalEligible) * 100) : 0;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with confidence badge */}
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <h2 className="text-lg font-display font-semibold tracking-tight">
          {isRTL ? 'ملخص الاستحقاقات' : 'My Entitlements'}
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 text-[12px]",
                isRTL && "flex-row-reverse"
              )}>
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                <span className="text-muted-foreground">
                  {provenance?.confidence_level === 'high' 
                    ? (isRTL ? 'موثوق' : 'Verified')
                    : provenance?.confidence_level === 'medium'
                    ? (isRTL ? 'تقديري' : 'Estimated')
                    : (isRTL ? 'غير مؤكد' : 'Provisional')
                  }
                </span>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-muted-foreground">
                  {formatDate(provenance?.last_updated_at)}
                </span>
                <Info className="w-3 h-3 text-muted-foreground/50" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-2 text-xs">
                <p className="font-medium">
                  {provenance?.source_label || SOURCE_TYPE_LABELS[provenance?.source_type || 'system']}
                </p>
                <p className="text-muted-foreground">
                  {CONFIDENCE_LABELS[provenance?.confidence_level || 'medium']}
                </p>
                {provenance?.assumptions && provenance.assumptions.length > 0 && (
                  <div className="pt-1 border-t">
                    <p className="font-medium mb-1">Assumptions:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {provenance.assumptions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPIItem
          icon={Wallet}
          label={isRTL ? 'الإجمالي السنوي' : 'Total Eligible (Annual)'}
          value={formatCurrencyAED(totalEligible)}
          sublabel={isRTL ? 'من جميع المزايا' : 'Across all benefits'}
          variant="default"
          isRTL={isRTL}
        />
        <KPIItem
          icon={TrendingUp}
          label={isRTL ? 'مستخدم (السنة الحالية)' : 'Used (YTD)'}
          value={formatCurrencyAED(usedYTD)}
          sublabel={`${utilizationPercent}% ${isRTL ? 'مستخدم' : 'utilized'}`}
          variant="accent"
          isRTL={isRTL}
        />
        <KPIItem
          icon={PiggyBank}
          label={isRTL ? 'المتبقي' : 'Remaining'}
          value={formatCurrencyAED(remaining)}
          sublabel={isRTL ? 'متاح للاستخدام' : 'Available to use'}
          variant="success"
          isRTL={isRTL}
        />
        <KPIItem
          icon={Clock}
          label={isRTL ? 'قيد المراجعة' : 'Pending / In Review'}
          value={pendingCount > 0 ? `${pendingCount} ${isRTL ? 'طلبات' : 'requests'}` : (isRTL ? 'لا يوجد' : 'None')}
          sublabel={pendingAmount > 0 ? formatCurrencyAED(pendingAmount) : undefined}
          variant={pendingCount > 0 ? 'warning' : 'default'}
          isRTL={isRTL}
        />
      </div>
    </div>
  );
}
