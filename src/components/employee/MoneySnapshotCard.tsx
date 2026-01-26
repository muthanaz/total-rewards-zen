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
          'group relative cursor-pointer overflow-hidden transition-all duration-500',
          'bg-gradient-to-br from-emerald-500/[0.08] via-card to-card',
          'border border-emerald-500/20 hover:border-emerald-500/40',
          'shadow-sm hover:shadow-xl hover:shadow-emerald-500/10',
          'dark:from-emerald-500/[0.12] dark:via-card dark:to-card',
          compact ? 'p-3' : 'p-5',
          rtl && 'text-right'
        )}
        onClick={() => setSheetOpen(true)}
      >
        {/* Premium corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-xl translate-y-1/2 -translate-x-1/2 opacity-40" />
        
        {/* Header */}
        <div className={cn('flex items-center justify-between mb-4 relative z-10', rtl && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-3', rtl && 'flex-row-reverse')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">
                {rtl ? 'لمحة مالية' : 'Money Snapshot'}
              </span>
              <p className="text-[10px] text-muted-foreground/70 font-medium">
                {rtl ? 'هذا الشهر' : 'This month'}
              </p>
            </div>
          </div>
          <div className={cn('flex items-center gap-1.5', rtl && 'flex-row-reverse')}>
            {useDemo && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium">
                Demo
              </Badge>
            )}
            {/* Info popover */}
            <Popover>
              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-emerald-500/10">
                  <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-emerald-600 transition-colors" />
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

        {/* Values - Premium Layout */}
        <div className="space-y-3 relative z-10">
          {/* Net Pay */}
          <MoneyRow
            label={rtl ? 'صافي الراتب' : 'Net Pay'}
            amount={snapshot.netPay.amount}
            confidence={snapshot.netPay.confidence}
            howCalculated={getHowCalculatedText('netPay', snapshot, lang)}
            rtl={rtl}
            lang={lang}
            isPrimary
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

          {/* Discretionary Room - Hero Section */}
          <div className="relative mt-4 pt-4">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className={cn('flex items-center justify-between', rtl && 'flex-row-reverse')}>
              <div className={cn('flex items-center gap-2', rtl && 'flex-row-reverse')}>
                <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
                <div>
                  <span className="text-xs font-semibold text-foreground">
                    {rtl ? 'المبلغ المتاح للإنفاق' : 'Safe to Spend'}
                  </span>
                  <HowCalculatedPopover 
                    text={getHowCalculatedText('discretionary', snapshot, lang)} 
                    rtl={rtl}
                  />
                </div>
              </div>
              <div className={cn('flex items-center gap-2', rtl && 'flex-row-reverse')}>
                <span className={cn(
                  'text-xl font-bold tabular-nums tracking-tight',
                  snapshot.discretionaryRoom.amount >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-destructive'
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
          </div>
        </div>

        {/* CTA */}
        {showViewBreakdown && (
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              'w-full mt-4 text-xs h-8 gap-1.5 rounded-lg',
              'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10',
              'dark:text-emerald-400 dark:hover:text-emerald-300',
              'font-medium transition-all duration-300',
              rtl && 'flex-row-reverse'
            )}
          >
            {rtl ? 'عرض التفاصيل' : 'View breakdown'}
            <ChevronRight className={cn('w-4 h-4 group-hover:translate-x-0.5 transition-transform', rtl && 'rotate-180')} />
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
  isPrimary?: boolean;
  rtl?: boolean;
  lang?: 'en' | 'ar';
}

function MoneyRow({ label, amount, confidence, howCalculated, isNegative, isPrimary, rtl, lang }: MoneyRowProps) {
  return (
    <div className={cn(
      'flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg transition-colors',
      isPrimary && 'bg-muted/30',
      rtl && 'flex-row-reverse'
    )}>
      <div className={cn('flex items-center gap-1.5', rtl && 'flex-row-reverse')}>
        <span className={cn(
          'font-medium',
          isPrimary ? 'text-sm text-foreground' : 'text-xs text-muted-foreground'
        )}>{label}</span>
        <HowCalculatedPopover text={howCalculated} rtl={rtl} />
      </div>
      <div className={cn('flex items-center gap-1.5', rtl && 'flex-row-reverse')}>
        <span className={cn(
          'tabular-nums tracking-tight',
          isPrimary ? 'text-sm font-semibold text-foreground' : 'text-xs font-medium',
          isNegative && 'text-red-500 dark:text-red-400'
        )}>
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
