/**
 * MoneySnapshotCard
 * 
 * Compact dashboard card showing Money Snapshot summary.
 * Shows Net Pay, Fixed Commitments, and Discretionary Room.
 * 
 * IMPORTANT:
 * - Uses AED formatting everywhere
 * - Shows confidence and source via tooltips
 * - Never mixes benefits with payroll deductions
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wallet, Info, ChevronRight, HelpCircle } from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useEmployeeBudgetItems, DEMO_BUDGET_ITEMS } from '@/hooks/useEmployeeBudgetItems';
import { MoneySnapshotSheet } from './MoneySnapshotSheet';
import { DEMO_FALLBACKS } from '@/lib/metrics/computations';
import { 
  computeMoneySnapshot, 
  getConfidenceLabel, 
  getSourceLabel,
  getHowCalculatedText,
  type MoneySnapshotData 
} from '@/lib/money/moneySnapshot';
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge';
import { mapToMetricConfidence } from '@/lib/money/moneySnapshot';
import { useLanguage } from '@/contexts/LanguageContext';

interface MoneySnapshotCardProps {
  monthlySalary: number;
  salaryFromPayroll?: boolean;
  isDemo?: boolean;
  isRTL?: boolean;
  showViewBreakdown?: boolean;
  compact?: boolean;
}

export function MoneySnapshotCard({ 
  monthlySalary, 
  salaryFromPayroll = false,
  isDemo = false, 
  isRTL = false,
  showViewBreakdown = true,
  compact = false,
}: MoneySnapshotCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { language, direction } = useLanguage();
  const rtl = isRTL || direction === 'rtl';
  const { totalCommitments, savingsAmount, items, isLoading, commitments } = useEmployeeBudgetItems();

  // Use real data if available
  const hasRealData = items.length > 0;
  const useDemo = isDemo || !hasRealData;

  // Compute snapshot using the utility
  const snapshot = computeMoneySnapshot({
    monthlySalary: monthlySalary > 0 ? monthlySalary : null,
    salaryFromPayroll,
    commitments: useDemo 
      ? [] 
      : commitments.map(c => ({
          id: c.id,
          category: c.category,
          amount: c.amount,
          source: 'employee_input' as const,
          confidence: 'employee_reported' as const,
        })),
    savingsGoalAmount: useDemo ? null : savingsAmount,
    isDemo: useDemo,
  });

  const lang = rtl ? 'ar' : 'en';

  return (
    <>
      <Card 
        className={cn(
          'group cursor-pointer border border-border/40 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300',
          compact ? 'p-3' : 'p-4',
          rtl && 'text-right'
        )}
        onClick={() => setSheetOpen(true)}
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between mb-3', rtl && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-2', rtl && 'flex-row-reverse')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-semibold text-sm">
              {rtl ? 'لمحة مالية' : 'Money Snapshot'}
            </span>
          </div>
          <div className={cn('flex items-center gap-1.5', rtl && 'flex-row-reverse')}>
            {useDemo && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/50 text-muted-foreground border-muted">
                Demo
              </Badge>
            )}
            {/* Info popover */}
            <Popover>
              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-72 text-sm" 
                align={rtl ? 'start' : 'end'}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={cn("space-y-3", rtl && "text-right")}>
                  <p className="font-medium text-xs uppercase text-muted-foreground">
                    {rtl ? 'مصادر البيانات' : 'Data Sources'}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span>{snapshot.netPay.label}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {getSourceLabel(snapshot.netPay.source, lang)} • {getConfidenceLabel(snapshot.netPay.confidence, lang)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{snapshot.totalCommitments.label}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {getSourceLabel(snapshot.totalCommitments.source, lang)} • {getConfidenceLabel(snapshot.totalCommitments.confidence, lang)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-2 border-t">
                    {rtl 
                      ? 'هذه البيانات خاصة بك فقط. صاحب العمل لا يمكنه رؤيتها.' 
                      : 'This data is private to you. Your employer cannot see it.'}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Values */}
        <div className="space-y-2">
          {/* Net Pay */}
          <MoneyRow
            label={rtl ? 'صافي الراتب' : 'Net Pay'}
            amount={snapshot.netPay.amount}
            confidence={snapshot.netPay.confidence}
            howCalculated={getHowCalculatedText('netPay', snapshot, lang)}
            rtl={rtl}
            lang={lang}
          />

          {/* Commitments */}
          <MoneyRow
            label={rtl ? 'الالتزامات' : 'Commitments'}
            amount={snapshot.totalCommitments.amount}
            confidence={snapshot.totalCommitments.confidence}
            howCalculated={getHowCalculatedText('commitments', snapshot, lang)}
            isNegative
            rtl={rtl}
            lang={lang}
          />

          {/* Discretionary Room */}
          <div className="border-t border-border/40 pt-2">
            <div className={cn('flex items-center justify-between', rtl && 'flex-row-reverse')}>
              <div className={cn('flex items-center gap-1.5', rtl && 'flex-row-reverse')}>
                <span className="text-xs font-medium text-muted-foreground">
                  {rtl ? 'المبلغ المتاح للإنفاق' : 'Safe to Spend'}
                </span>
                <HowCalculatedPopover 
                  text={getHowCalculatedText('discretionary', snapshot, lang)} 
                  rtl={rtl}
                />
              </div>
              <div className={cn('flex items-center gap-1.5', rtl && 'flex-row-reverse')}>
                <span className={cn(
                  'text-base font-bold tabular-nums',
                  snapshot.discretionaryRoom.amount >= 0 ? 'text-emerald-600' : 'text-destructive'
                )}>
                  {formatCurrencyAED(snapshot.discretionaryRoom.amount)}
                </span>
                <ConfidenceBadge 
                  level={mapToMetricConfidence(snapshot.discretionaryRoom.confidence)}
                  size="sm"
                  showLabel={false}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {rtl ? 'هذا الشهر' : 'This month'}
            </p>
          </div>
        </div>

        {/* CTA */}
        {showViewBreakdown && (
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              'w-full mt-3 text-xs h-7 gap-1 text-accent hover:text-accent/80',
              rtl && 'flex-row-reverse'
            )}
          >
            {rtl ? 'عرض التفاصيل' : 'View breakdown'}
            <ChevronRight className={cn('w-3.5 h-3.5', rtl && 'rotate-180')} />
          </Button>
        )}
      </Card>

      <MoneySnapshotSheet 
        open={sheetOpen} 
        onOpenChange={setSheetOpen}
        monthlySalary={snapshot.netPay.amount}
        isDemo={useDemo}
        isRTL={rtl}
      />
    </>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface MoneyRowProps {
  label: string;
  amount: number;
  confidence: 'measured' | 'employee_reported' | 'estimated' | 'missing';
  howCalculated: string;
  isNegative?: boolean;
  rtl?: boolean;
  lang?: 'en' | 'ar';
}

function MoneyRow({ label, amount, confidence, howCalculated, isNegative, rtl, lang }: MoneyRowProps) {
  return (
    <div className={cn('flex items-center justify-between text-xs', rtl && 'flex-row-reverse')}>
      <div className={cn('flex items-center gap-1', rtl && 'flex-row-reverse')}>
        <span className="text-muted-foreground">{label}</span>
        <HowCalculatedPopover text={howCalculated} rtl={rtl} />
      </div>
      <div className={cn('flex items-center gap-1.5', rtl && 'flex-row-reverse')}>
        <span className={cn('font-medium tabular-nums', isNegative && 'text-destructive')}>
          {isNegative ? '−' : ''}{formatCurrencyAED(amount)}
        </span>
      </div>
    </div>
  );
}

function HowCalculatedPopover({ text, rtl }: { text: string; rtl?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
          <HelpCircle className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-56 text-xs" 
        align={rtl ? 'start' : 'end'}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-medium mb-1">{rtl ? 'كيف يتم الحساب' : 'How calculated'}</p>
        <p className="text-muted-foreground">{text}</p>
      </PopoverContent>
    </Popover>
  );
}

export default MoneySnapshotCard;
