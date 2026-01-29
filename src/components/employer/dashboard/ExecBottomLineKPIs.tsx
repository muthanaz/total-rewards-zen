/**
 * Executive Bottom Line KPIs (4 cards)
 * 
 * Uses StandardKpiCard with 4-row structure:
 * - Row 1: Label + tooltip
 * - Row 2: Primary value
 * - Row 3: Delta/confidence
 * - Row 4: Footer meta
 * 
 * Uses 12-column grid with gap-6 (Executive variant)
 */

import { DollarSign, TrendingUp, AlertTriangle, Wallet } from 'lucide-react';
import { StandardKpiCard } from '@/components/ui/StandardKpiCard';
import { StandardCardGrid } from '@/components/ui/StandardCard';
import { formatCurrencyAED } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SSOTTooltip, EstimatedBadge } from '@/components/shared/SSOTTooltip';
import { isMetricEstimated } from '@/lib/ssot';

export interface BottomLineMetrics {
  ytdSpend: number;
  projectedYearEnd: number;
  budgetAllocated: number;
  budgetLeakage: number;
  recoveryPotential: number;
  ytdDelta?: number;
  projectedDelta?: number;
  leakageDelta?: number;
}

interface ExecBottomLineKPIsProps {
  metrics: BottomLineMetrics;
  lastUpdated?: Date;
  onKPIClick?: (kpiId: string) => void;
  className?: string;
}

export function ExecBottomLineKPIs({
  metrics,
  lastUpdated = new Date(),
  onKPIClick,
  className,
}: ExecBottomLineKPIsProps) {
  const {
    ytdSpend,
    projectedYearEnd,
    budgetAllocated,
    budgetLeakage,
    recoveryPotential,
    ytdDelta = 8.2,
    projectedDelta = 5.4,
    leakageDelta = -12.4,
  } = metrics;

  // Calculate budget variance
  const budgetVariance = ytdSpend - budgetAllocated;
  const isOverBudget = budgetVariance > 0;
  const variancePercent = budgetAllocated > 0 
    ? ((budgetVariance / budgetAllocated) * 100).toFixed(1) 
    : '0';

  // Determine confidence levels based on data completeness
  const getConfidence = (key: string): 'high' | 'medium' | 'low' => {
    // In production, this would be driven by actual data quality metrics
    if (key === 'ytdSpend' || key === 'projected') return 'high';
    if (key === 'variance') return 'high';
    return 'medium';
  };

  // Helper to render KPI title with SSOT tooltip
  const renderKPITitle = (title: string, metricKey: string) => (
    <span className="inline-flex items-center gap-1.5">
      {title}
      <SSOTTooltip metricKey={metricKey} lastUpdated={lastUpdated} />
      {isMetricEstimated(metricKey) && <EstimatedBadge />}
    </span>
  );

  // Format last updated for footer
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Confidence footer component
  const ConfidenceFooter = ({ confidence }: { confidence: 'high' | 'medium' | 'low' }) => {
    const styles = {
      high: 'text-success',
      medium: 'text-warning',
      low: 'text-destructive',
    };
    const labels = { high: 'High', medium: 'Med', low: 'Low' };
    
    return (
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          Confidence: <span className={cn('font-medium', styles[confidence])}>{labels[confidence]}</span>
        </span>
        <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
      </div>
    );
  };

  return (
    <StandardCardGrid variant="executive" columns={4} className={className}>
      {/* 1. YTD Spend */}
      <StandardKpiCard
        label="YTD Total Spend"
        value={formatCurrencyAED(ytdSpend, { abbreviate: true })}
        icon={DollarSign}
        iconClassName="bg-primary/10 text-primary"
        tooltip="Total benefits expenditure year-to-date including claims and allowances"
        delta={ytdDelta}
        deltaLabel="vs last year"
        higherIsBetter={true}
        lastUpdated={lastUpdated}
        variant="executive"
        onClick={() => onKPIClick?.('ytdSpend')}
      />

      {/* 2. Projected Year-End Spend */}
      <StandardKpiCard
        label="Projected Year-End"
        value={formatCurrencyAED(projectedYearEnd, { abbreviate: true })}
        icon={TrendingUp}
        iconClassName="bg-accent/10 text-accent"
        tooltip="Forecasted total spend based on current run rate and seasonality"
        delta={projectedDelta}
        deltaLabel="vs budget"
        higherIsBetter={false}
        scope="Based on current run rate"
        lastUpdated={lastUpdated}
        variant="executive"
        onClick={() => onKPIClick?.('projected')}
      />

      {/* 3. Budget Variance */}
      <StandardKpiCard
        label="Budget Variance"
        value={`${isOverBudget ? '+' : ''}${formatCurrencyAED(Math.abs(budgetVariance), { abbreviate: true })}`}
        icon={Wallet}
        iconClassName={isOverBudget ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}
        tooltip="Difference between actual spend and allocated budget"
        scope={isOverBudget ? 'Over budget' : 'Under budget'}
        lastUpdated={lastUpdated}
        variant="executive"
        onClick={() => onKPIClick?.('variance')}
        footer={
          <div className="flex items-center justify-between">
            <span>Variance</span>
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px]',
                isOverBudget 
                  ? 'bg-destructive/10 text-destructive border-destructive/30' 
                  : 'bg-success/10 text-success border-success/30'
              )}
            >
              {variancePercent}%
            </Badge>
          </div>
        }
      />

      {/* 4. Budget Leakage + Recovery Potential */}
      <StandardKpiCard
        label="Budget Leakage"
        value={formatCurrencyAED(budgetLeakage, { abbreviate: true })}
        icon={AlertTriangle}
        iconClassName="bg-warning/10 text-warning"
        tooltip="Unutilized entitled benefits that could have been claimed"
        delta={leakageDelta}
        deltaLabel="vs last quarter"
        higherIsBetter={false}
        variant="executive"
        onClick={() => onKPIClick?.('leakage')}
        footer={
          <div className="flex items-center justify-between">
            <span>Recovery Potential</span>
            <span className="font-semibold text-success tabular-nums">
              {formatCurrencyAED(recoveryPotential, { abbreviate: true })}
            </span>
          </div>
        }
      />
    </StandardCardGrid>
  );
}
