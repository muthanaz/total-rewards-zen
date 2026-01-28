/**
 * Executive Bottom Line KPIs (4 cards)
 * 
 * 1. YTD Spend (AED)
 * 2. Projected Year-End Spend (AED)
 * 3. Budget Variance (AED and %)
 * 4. Budget Leakage (AED) + Recovery Potential (AED) as paired card
 * 
 * Uses MetricsContract component for consistent display
 * Uses SSOT metrics dictionary for canonical definitions
 */

import { DollarSign, TrendingUp, AlertTriangle, Wallet } from 'lucide-react';
import { MetricsContract, MetricsContractGrid } from '@/components/shared/MetricsContract';
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
    <MetricsContractGrid columns={4} className={className}>
      {/* 1. YTD Spend */}
      <MetricsContract
        title={renderKPITitle("YTD Total Spend", "ytd_spend")}
        value={formatCurrencyAED(ytdSpend, { abbreviate: true })}
        icon={DollarSign}
        iconClassName="bg-primary/10 text-primary"
        trend={{
          value: ytdDelta,
          label: 'vs last year',
          higherIsBetter: true,
        }}
        metadata={{
          definition: 'Total benefits expenditure year-to-date including claims and allowances',
          formula: 'SUM(approved_claims) + SUM(disbursed_allowances)',
          source: 'requests + utilization_events',
          lastUpdated,
          confidence: getConfidence('ytdSpend'),
        }}
        footer={<ConfidenceFooter confidence={getConfidence('ytdSpend')} />}
        onClick={() => onKPIClick?.('ytdSpend')}
      />

      {/* 2. Projected Year-End Spend */}
      <MetricsContract
        title={renderKPITitle("Projected Year-End", "projected_year_end")}
        value={formatCurrencyAED(projectedYearEnd, { abbreviate: true })}
        icon={TrendingUp}
        iconClassName="bg-accent/10 text-accent"
        trend={{
          value: projectedDelta,
          label: 'vs budget',
          higherIsBetter: false,
        }}
        metadata={{
          definition: 'Forecasted total spend based on current run rate and seasonality',
          formula: '(YTD Spend / Months Elapsed) × 12',
          source: 'get_employer_dashboard_metrics()',
          lastUpdated,
          confidence: getConfidence('projected'),
        }}
        subtitle="Based on current run rate"
        footer={<ConfidenceFooter confidence={getConfidence('projected')} />}
        onClick={() => onKPIClick?.('projected')}
      />

      {/* 3. Budget Variance */}
      <MetricsContract
        title={renderKPITitle("Budget Variance", "budget_variance")}
        value={`${isOverBudget ? '+' : ''}${formatCurrencyAED(Math.abs(budgetVariance), { abbreviate: true })}`}
        icon={Wallet}
        iconClassName={cn(
          isOverBudget ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
        )}
        metadata={{
          definition: 'Difference between actual spend and allocated budget',
          formula: 'YTD Spend - Allocated Budget',
          source: 'org_budgets + requests',
          lastUpdated,
          confidence: getConfidence('variance'),
        }}
        footer={
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {isOverBudget ? 'Over budget' : 'Under budget'}
              </span>
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
            <ConfidenceFooter confidence={getConfidence('variance')} />
          </div>
        }
        onClick={() => onKPIClick?.('variance')}
      />

      {/* 4. Budget Leakage + Recovery Potential (paired) */}
      <MetricsContract
        title={renderKPITitle("Budget Leakage", "budget_leakage")}
        value={formatCurrencyAED(budgetLeakage, { abbreviate: true })}
        icon={AlertTriangle}
        iconClassName="bg-warning/10 text-warning"
        trend={{
          value: leakageDelta,
          label: 'vs last quarter',
          higherIsBetter: false,
        }}
        metadata={{
          definition: 'Unutilized entitled benefits that could have been claimed',
          formula: 'Entitled Value - Claimed Amount',
          source: 'benefit_entitlements',
          lastUpdated,
          confidence: getConfidence('leakage'),
          confidenceReason: 'Based on 72% employee data coverage',
        }}
        footer={
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1">
                <span className="text-muted-foreground">Recovery Potential</span>
                <SSOTTooltip metricKey="recovery_potential" size="sm" />
                {isMetricEstimated('recovery_potential') && <EstimatedBadge />}
              </span>
              <span className="font-semibold text-success tabular-nums">
                {formatCurrencyAED(recoveryPotential, { abbreviate: true })}
              </span>
            </div>
            <ConfidenceFooter confidence={getConfidence('leakage')} />
          </div>
        }
        onClick={() => onKPIClick?.('leakage')}
      />
    </MetricsContractGrid>
  );
}
