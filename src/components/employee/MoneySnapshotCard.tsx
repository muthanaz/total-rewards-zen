import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wallet, Info, ChevronRight } from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useEmployeeBudgetItems, DEMO_BUDGET_ITEMS } from '@/hooks/useEmployeeBudgetItems';
import { MoneySnapshotSheet } from './MoneySnapshotSheet';
import { DEMO_FALLBACKS } from '@/lib/metrics/computations';

interface MoneySnapshotCardProps {
  monthlySalary: number;
  isDemo?: boolean;
  isRTL?: boolean;
}

export function MoneySnapshotCard({ monthlySalary, isDemo = false, isRTL = false }: MoneySnapshotCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { totalCommitments, savingsAmount, items, isLoading } = useEmployeeBudgetItems();

  // Use demo data if no real items or in demo mode
  const hasRealData = items.length > 0;
  const useDemo = isDemo || !hasRealData;

  // Calculate values
  const income = monthlySalary > 0 ? monthlySalary : DEMO_FALLBACKS.employeeMonthlySalary;
  
  const commitments = useDemo 
    ? DEMO_BUDGET_ITEMS.filter(i => i.item_type === 'commitment').reduce((s, i) => s + i.amount, 0)
    : totalCommitments;
  
  const savings = useDemo
    ? DEMO_BUDGET_ITEMS.find(i => i.item_type === 'savings_goal')?.amount || 0
    : savingsAmount;

  const safeToSpend = income - commitments - savings;

  // Source info for tooltip
  const incomeSource = monthlySalary > 0 ? 'Payroll • Measured' : 'Demo • Estimated';
  const commitmentsSource = hasRealData ? 'Your input • Reported' : 'Demo • Estimated';

  return (
    <>
      <Card 
        className={cn(
          'group cursor-pointer border border-border/40 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 p-4',
          isRTL && 'text-right'
        )}
        onClick={() => setSheetOpen(true)}
      >
        <div className={cn('flex items-center justify-between mb-3', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-semibold text-sm">Money Snapshot</span>
          </div>
          <div className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
            {useDemo && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/50 text-muted-foreground border-muted">
                Demo
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[200px]">
                  <p className="font-medium mb-1">Data Sources</p>
                  <p>Income: {incomeSource}</p>
                  <p>Commitments: {commitmentsSource}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-2">
          <div className={cn('flex items-center justify-between text-xs', isRTL && 'flex-row-reverse')}>
            <span className="text-muted-foreground">Monthly Income</span>
            <span className="font-medium">{formatCurrencyAED(income)}</span>
          </div>
          <div className={cn('flex items-center justify-between text-xs', isRTL && 'flex-row-reverse')}>
            <span className="text-muted-foreground">Commitments</span>
            <span className="font-medium text-destructive">−{formatCurrencyAED(commitments)}</span>
          </div>
          <div className="border-t border-border/40 pt-2">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <span className="text-xs font-medium text-muted-foreground">Safe to Spend</span>
              <span className={cn(
                'text-base font-bold',
                safeToSpend >= 0 ? 'text-emerald-600' : 'text-destructive'
              )}>
                {formatCurrencyAED(safeToSpend)}
              </span>
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            'w-full mt-3 text-xs h-7 gap-1 text-accent hover:text-accent/80',
            isRTL && 'flex-row-reverse'
          )}
        >
          Review
          <ChevronRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-180')} />
        </Button>
      </Card>

      <MoneySnapshotSheet 
        open={sheetOpen} 
        onOpenChange={setSheetOpen}
        monthlySalary={income}
        isDemo={useDemo}
        isRTL={isRTL}
      />
    </>
  );
}
