/**
 * SpendForecastKPIs - Premium KPI Row for Spend & Forecast
 * 
 * 4 Core KPIs using MetricsContract:
 * 1. Annual Budget (AED)
 * 2. YTD Spend (AED)
 * 3. Forecast Year-End (AED)
 * 4. Variance vs Budget (AED and %)
 */

import { DollarSign, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { MetricsContract, MetricsContractGrid } from '@/components/shared/MetricsContract';
import { formatCurrencyAED, formatPercent } from '@/lib/utils';

export interface SpendForecastKPIData {
  annualBudget: number;
  ytdSpend: number;
  forecastYearEnd: number;
  priorYearSpend?: number;
}

interface SpendForecastKPIsProps {
  data: SpendForecastKPIData;
  onKPIClick?: (kpiId: string) => void;
}

export function SpendForecastKPIs({ data, onKPIClick }: SpendForecastKPIsProps) {
  const variance = data.forecastYearEnd - data.annualBudget;
  const variancePercent = data.annualBudget > 0 
    ? ((variance / data.annualBudget) * 100) 
    : 0;
  const isOverBudget = variance > 0;
  
  // YoY change
  const yoyChange = data.priorYearSpend && data.priorYearSpend > 0
    ? ((data.ytdSpend - data.priorYearSpend) / data.priorYearSpend) * 100
    : null;

  return (
    <MetricsContractGrid columns={4}>
      {/* Annual Budget */}
      <MetricsContract
        title="Annual Budget"
        value={formatCurrencyAED(data.annualBudget)}
        icon={DollarSign}
        iconClassName="bg-primary/10 text-primary"
        metadata={{
          definition: "Total allocated budget for employee benefits this fiscal year",
          formula: "SUM(org_budgets.annual_budget) WHERE fiscal_year = current_year",
          source: "org_budgets",
          lastUpdated: new Date(),
          confidence: 'high',
          confidenceReason: "Direct from approved budget allocation"
        }}
        subtitle="FY 2025 Allocation"
        onClick={() => onKPIClick?.('annualBudget')}
        size="md"
      />

      {/* YTD Spend */}
      <MetricsContract
        title="YTD Spend"
        value={formatCurrencyAED(data.ytdSpend)}
        icon={Target}
        iconClassName="bg-chart-2/10 text-chart-2"
        trend={yoyChange !== null ? {
          value: Number(yoyChange.toFixed(1)),
          label: 'vs prior year',
          higherIsBetter: false,
        } : undefined}
        metadata={{
          definition: "Total claims paid and approved year-to-date",
          formula: "SUM(requests.amount) WHERE status IN ('approved', 'paid') AND year = current_year",
          source: "requests + utilization_events",
          lastUpdated: new Date(),
          confidence: 'high',
        }}
        subtitle={`${formatPercent((data.ytdSpend / data.annualBudget) * 100)} of budget`}
        onClick={() => onKPIClick?.('ytdSpend')}
        size="md"
      />

      {/* Forecast Year-End */}
      <MetricsContract
        title="Forecast Year-End"
        value={formatCurrencyAED(data.forecastYearEnd)}
        icon={TrendingUp}
        iconClassName="bg-accent/10 text-accent"
        metadata={{
          definition: "Projected total spend by end of fiscal year based on current run-rate",
          formula: "YTD Spend + (Monthly Run Rate × Remaining Months)",
          source: "Calculated projection",
          lastUpdated: new Date(),
          confidence: 'medium',
          confidenceReason: "Projection based on 8 months of actuals"
        }}
        subtitle="Based on current run-rate"
        onClick={() => onKPIClick?.('forecastYearEnd')}
        size="md"
      />

      {/* Variance vs Budget */}
      <MetricsContract
        title="Variance vs Budget"
        value={`${isOverBudget ? '+' : ''}${formatCurrencyAED(variance)}`}
        icon={AlertTriangle}
        iconClassName={isOverBudget ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}
        trend={{
          value: Number(variancePercent.toFixed(1)),
          higherIsBetter: false,
        }}
        metadata={{
          definition: isOverBudget 
            ? "Projected overspend vs annual budget" 
            : "Projected surplus vs annual budget",
          formula: "Forecast Year-End - Annual Budget",
          source: "Calculated",
          lastUpdated: new Date(),
          confidence: 'medium',
        }}
        subtitle={isOverBudget ? 'Projected Deficit' : 'Projected Surplus'}
        onClick={() => onKPIClick?.('variance')}
        size="md"
        variant={isOverBudget ? 'gradient' : 'default'}
      />
    </MetricsContractGrid>
  );
}
