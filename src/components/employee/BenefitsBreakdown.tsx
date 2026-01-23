/**
 * Benefits Breakdown by Value Type
 * 
 * Replaces misleading single "Total Benefits Value" with truthful breakdown:
 * A) Cash Entitlements (AED) - truly spendable
 * B) Reimbursement Caps (AED) - potential, not guaranteed
 * C) Coverage & Access (count) - non-monetary
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Receipt, Shield, Key, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { BenefitValueType } from '@/lib/taxonomy';
import { VALUE_TYPE_METADATA } from '@/lib/benefitValueTypes';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================================
// TYPES
// ============================================================================

interface BenefitItem {
  name: string;
  valueType: BenefitValueType;
  annualValue: number;
  utilized: number;
}

interface BenefitsBreakdownProps {
  benefits: BenefitItem[];
  className?: string;
  /** Show employer cost section (for employer dashboards) */
  showEmployerCost?: boolean;
  /** Total employer cost (if different from sum of benefits) */
  totalEmployerCost?: number;
}

interface CategorySummary {
  valueType: BenefitValueType;
  totalValue: number;
  totalUtilized: number;
  count: number;
  benefits: BenefitItem[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BenefitsBreakdown({
  benefits,
  className,
  showEmployerCost = false,
  totalEmployerCost,
}: BenefitsBreakdownProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  // Group benefits by value type
  const breakdown = useMemo(() => {
    const groups: Record<BenefitValueType, CategorySummary> = {
      cash: { valueType: 'cash', totalValue: 0, totalUtilized: 0, count: 0, benefits: [] },
      reimbursement: { valueType: 'reimbursement', totalValue: 0, totalUtilized: 0, count: 0, benefits: [] },
      coverage: { valueType: 'coverage', totalValue: 0, totalUtilized: 0, count: 0, benefits: [] },
      access: { valueType: 'access', totalValue: 0, totalUtilized: 0, count: 0, benefits: [] },
    };
    
    benefits.forEach(benefit => {
      const group = groups[benefit.valueType];
      group.totalValue += benefit.annualValue;
      group.totalUtilized += benefit.utilized;
      group.count += 1;
      group.benefits.push(benefit);
    });
    
    return groups;
  }, [benefits]);
  
  const cashTotal = breakdown.cash.totalValue;
  const reimbursementTotal = breakdown.reimbursement.totalValue;
  const nonMonetaryCount = breakdown.coverage.count + breakdown.access.count;
  
  const cashUtilization = cashTotal > 0 
    ? Math.round((breakdown.cash.totalUtilized / cashTotal) * 100) 
    : 0;
  const reimbursementUtilization = reimbursementTotal > 0 
    ? Math.round((breakdown.reimbursement.totalUtilized / reimbursementTotal) * 100) 
    : 0;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              {isRTL ? 'ملخص المزايا' : 'Benefits Summary'}
            </CardTitle>
            <CardDescription className="mt-1">
              {isRTL 
                ? 'تفصيل حسب نوع القيمة'
                : 'Breakdown by value type'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cash Entitlements */}
        {cashTotal > 0 && (
          <BreakdownRow
            icon={Wallet}
            label={isRTL ? 'الاستحقاقات النقدية' : 'Cash Entitlements'}
            sublabel={isRTL ? 'تُدفع مباشرة مع الراتب' : 'Paid directly with salary'}
            amount={cashTotal}
            utilized={breakdown.cash.totalUtilized}
            utilization={cashUtilization}
            showProgress
            colorClass="text-emerald-600"
            badgeClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            isRTL={isRTL}
          />
        )}
        
        {/* Reimbursement Caps */}
        {reimbursementTotal > 0 && (
          <BreakdownRow
            icon={Receipt}
            label={isRTL ? 'سقف التعويضات' : 'Reimbursement Caps'}
            sublabel={isRTL ? 'الحد الأقصى المحتمل (يتطلب مطالبة)' : 'Maximum potential (requires claim)'}
            amount={reimbursementTotal}
            utilized={breakdown.reimbursement.totalUtilized}
            utilization={reimbursementUtilization}
            showProgress
            colorClass="text-blue-600"
            badgeClass="bg-blue-500/10 text-blue-600 border-blue-500/20"
            isRTL={isRTL}
            disclaimer={isRTL 
              ? 'التعويض يخضع للموافقة'
              : 'Reimbursement subject to approval'
            }
          />
        )}
        
        {/* Coverage & Access */}
        {nonMonetaryCount > 0 && (
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed",
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-600" />
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <p className="font-medium text-sm">
                  {isRTL ? 'التغطية والوصول' : 'Coverage & Access'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRTL 
                    ? 'برامج مدفوعة من صاحب العمل (ليست قيمة نقدية للموظف)'
                    : 'Employer-paid programs (not employee cash value)'
                  }
                </p>
              </div>
            </div>
            
            <div className={cn("text-right", isRTL && "text-left")}>
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
                {nonMonetaryCount} {isRTL ? 'برامج' : 'programs'}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 mt-1 cursor-help">
                    <Info className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {isRTL ? 'لماذا لا يوجد AED؟' : 'Why no AED?'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    {isRTL 
                      ? 'التغطية والوصول هي برامج يدفعها صاحب العمل نيابة عنك. هذه ليست قيمة نقدية يمكنك إنفاقها.'
                      : 'Coverage and access are programs your employer pays for on your behalf. These are not cash values you can spend.'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
        
        {/* Employer Cost (optional - for employer dashboards) */}
        {showEmployerCost && (
          <>
            <div className="border-t my-4" />
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg bg-muted/50",
              isRTL && "flex-row-reverse"
            )}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'إجمالي تكلفة صاحب العمل' : 'Total Employer Cost'}
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {isRTL 
                        ? 'المبلغ الذي يستثمره صاحب العمل في مزاياك'
                        : 'Amount your employer invests in your benefits'
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-semibold">
                <Currency 
                  amount={totalEmployerCost || (cashTotal + reimbursementTotal + breakdown.coverage.totalValue + breakdown.access.totalValue)} 
                  abbreviate={false} 
                />
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface BreakdownRowProps {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  amount: number;
  utilized: number;
  utilization: number;
  showProgress?: boolean;
  colorClass: string;
  badgeClass: string;
  isRTL: boolean;
  disclaimer?: string;
}

function BreakdownRow({
  icon: Icon,
  label,
  sublabel,
  amount,
  utilized,
  utilization,
  showProgress,
  colorClass,
  badgeClass,
  isRTL,
  disclaimer,
}: BreakdownRowProps) {
  return (
    <div className="space-y-2">
      <div className={cn(
        "flex items-center justify-between",
        isRTL && "flex-row-reverse"
      )}>
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", badgeClass.replace('text-', 'bg-').split(' ')[0])}>
            <Icon className={cn("w-5 h-5", colorClass)} />
          </div>
          <div className={isRTL ? "text-right" : ""}>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          </div>
        </div>
        
        <div className={cn("text-right", isRTL && "text-left")}>
          <p className="font-semibold">
            <Currency amount={amount} abbreviate={false} />
          </p>
          <Badge variant="outline" className={cn("text-xs", badgeClass)}>
            {utilization}% {isRTL ? 'مستخدم' : 'utilized'}
          </Badge>
        </div>
      </div>
      
      {showProgress && (
        <Progress value={utilization} className="h-1.5" />
      )}
      
      {disclaimer && (
        <p className={cn("text-[10px] text-muted-foreground/70 flex items-center gap-1", isRTL && "flex-row-reverse")}>
          <Info className="w-3 h-3" />
          {disclaimer}
        </p>
      )}
    </div>
  );
}

export default BenefitsBreakdown;
