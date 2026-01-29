/**
 * SpendForecastKPIs - Premium KPI Row for Spend & Forecast
 * 
 * Uses StandardKpiCard with 4-row structure and Executive variant (gap-6)
 */

import { DollarSign, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { StandardKpiCard } from '@/components/ui/StandardKpiCard';
import { StandardCardGrid } from '@/components/ui/StandardCard';
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
    <StandardCardGrid variant="executive" columns={4}>
      {/* Annual Budget */}
      <StandardKpiCard
        label="Annual Budget"
        value={formatCurrencyAED(data.annualBudget)}
        icon={DollarSign}
        iconClassName="bg-primary/10 text-primary"
        tooltip="Total allocated budget for employee benefits this fiscal year"
        scope="FY 2025 Allocation"
        confidence="high"
        variant="executive"
        onClick={() => onKPIClick?.('annualBudget')}
      />

      {/* YTD Spend */}
      <StandardKpiCard
        label="YTD Spend"
        value={formatCurrencyAED(data.ytdSpend)}
        icon={Target}
        iconClassName="bg-chart-2/10 text-chart-2"
        tooltip="Total claims paid and approved year-to-date"
        delta={yoyChange !== null ? Number(yoyChange.toFixed(1)) : undefined}
        deltaLabel="vs prior year"
        higherIsBetter={false}
        scope={`${formatPercent((data.ytdSpend / data.annualBudget) * 100)} of budget`}
        variant="executive"
        onClick={() => onKPIClick?.('ytdSpend')}
      />

      {/* Forecast Year-End */}
      <StandardKpiCard
        label="Forecast Year-End"
        value={formatCurrencyAED(data.forecastYearEnd)}
        icon={TrendingUp}
        iconClassName="bg-accent/10 text-accent"
        tooltip="Projected total spend by end of fiscal year based on current run-rate"
        scope="Based on current run-rate"
        confidence="medium"
        variant="executive"
        onClick={() => onKPIClick?.('forecastYearEnd')}
      />

      {/* Variance vs Budget */}
      <StandardKpiCard
        label="Variance vs Budget"
        value={`${isOverBudget ? '+' : ''}${formatCurrencyAED(variance)}`}
        icon={AlertTriangle}
        iconClassName={isOverBudget ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}
        tooltip={isOverBudget ? "Projected overspend vs annual budget" : "Projected surplus vs annual budget"}
        delta={Number(variancePercent.toFixed(1))}
        higherIsBetter={false}
        scope={isOverBudget ? 'Projected Deficit' : 'Projected Surplus'}
        variant="executive"
        onClick={() => onKPIClick?.('variance')}
      />
    </StandardCardGrid>
  );
}
