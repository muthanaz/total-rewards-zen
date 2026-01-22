/**
 * Benefit Entitlement Card
 * 
 * Each benefit card shows:
 * - Eligible / Used / Remaining
 * - Status badge
 * - Quick "View details / Submit" CTA
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, FileText, Receipt } from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface BenefitEntitlementCardProps {
  name: string;
  icon: LucideIcon;
  eligible: number;
  used: number;
  remaining: number;
  route: string;
  description?: string;
  canSubmitClaim?: boolean;
  isRTL?: boolean;
  index?: number;
}

type UtilizationStatus = 'complete' | 'on-track' | 'opportunity' | 'unused';

function getUtilizationStatus(utilizationPercent: number): UtilizationStatus {
  if (utilizationPercent >= 100) return 'complete';
  if (utilizationPercent >= 50) return 'on-track';
  if (utilizationPercent >= 10) return 'opportunity';
  return 'unused';
}

const statusStyles: Record<UtilizationStatus, { badge: string; progress: string; label: string; labelAr: string }> = {
  complete: {
    badge: 'bg-success/10 text-success border-success/20',
    progress: '[&>div]:bg-success',
    label: 'Fully Used',
    labelAr: 'مستخدم بالكامل',
  },
  'on-track': {
    badge: 'bg-info/10 text-info border-info/20',
    progress: '[&>div]:bg-info',
    label: 'On Track',
    labelAr: 'على المسار',
  },
  opportunity: {
    badge: 'bg-warning/10 text-warning border-warning/20',
    progress: '[&>div]:bg-warning',
    label: 'Opportunity',
    labelAr: 'فرصة',
  },
  unused: {
    badge: 'bg-muted text-muted-foreground border-border',
    progress: '[&>div]:bg-muted-foreground/50',
    label: 'Unused',
    labelAr: 'غير مستخدم',
  },
};

export function BenefitEntitlementCard({
  name,
  icon: Icon,
  eligible,
  used,
  remaining,
  route,
  description,
  canSubmitClaim = true,
  isRTL = false,
  index = 0,
}: BenefitEntitlementCardProps) {
  const navigate = useNavigate();
  const utilizationPercent = eligible > 0 ? Math.round((used / eligible) * 100) : 0;
  const status = getUtilizationStatus(utilizationPercent);
  const style = statusStyles[status];

  return (
    <Card 
      className={cn(
        "group cursor-pointer bg-card border border-border/40",
        "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
        "transition-all duration-300 overflow-hidden h-full flex flex-col"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => navigate(route)}
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Icon + Name + Arrow */}
        <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/10 transition-all duration-300 shrink-0">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
              <h3 className="font-semibold text-[15px] text-foreground group-hover:text-accent transition-colors leading-tight">
                {name}
              </h3>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0",
                isRTL && "rotate-180 group-hover:-translate-x-0.5"
              )} />
            </div>
            {description && (
              <p className="text-[13px] text-muted-foreground mt-1 line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Entitlement Stats */}
        <div className="space-y-3 mt-4">
          {/* Main values row */}
          <div className={cn("flex items-end justify-between gap-3", isRTL && "flex-row-reverse")}>
            <div className={cn(isRTL && "text-right")}>
              <p className="text-xl font-bold text-foreground tracking-tight tabular-nums">
                {formatCurrencyAED(eligible)}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {isRTL ? 'الاستحقاق السنوي' : 'Annual Eligible'}
              </p>
            </div>
            <Badge 
              variant="outline"
              className={cn("text-[11px] px-2 py-0.5 font-medium border", style.badge)}
            >
              {isRTL ? style.labelAr : style.label}
            </Badge>
          </div>

          {/* Progress bar */}
          <Progress 
            value={utilizationPercent} 
            className={cn("h-1.5 bg-muted/30 rounded-full", style.progress)}
          />

          {/* Used / Remaining row */}
          <div className={cn("flex items-center justify-between text-[12px]", isRTL && "flex-row-reverse")}>
            <span className="text-muted-foreground tabular-nums">
              {formatCurrencyAED(used)} {isRTL ? 'مستخدم' : 'used'} ({utilizationPercent}%)
            </span>
            <span className={cn(
              "font-medium tabular-nums",
              remaining > 0 ? "text-accent" : "text-success"
            )}>
              {remaining > 0 
                ? `${formatCurrencyAED(remaining)} ${isRTL ? 'متبقي' : 'left'}`
                : (isRTL ? 'مكتمل' : 'Complete')
              }
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className={cn("flex items-center gap-2 mt-4 pt-4 border-t border-border/40", isRTL && "flex-row-reverse")}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[12px] gap-1.5 flex-1"
            onClick={(e) => { e.stopPropagation(); navigate(route); }}
          >
            <FileText className="w-3.5 h-3.5" />
            {isRTL ? 'التفاصيل' : 'Details'}
          </Button>
          {canSubmitClaim && remaining > 0 && (
            <Button 
              variant="default" 
              size="sm" 
              className="h-8 text-[12px] gap-1.5 flex-1"
              onClick={(e) => { e.stopPropagation(); navigate('/employee/requests'); }}
            >
              <Receipt className="w-3.5 h-3.5" />
              {isRTL ? 'تقديم مطالبة' : 'Submit'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
