/**
 * PolicyMetaCard
 * 
 * A standardized card for displaying policy meta-information in a 2-column key-value grid.
 * Shows transaction type, SLA, caps, frequency, eligibility, and enforcement mode.
 * Renders only non-null values and adapts responsively.
 * 
 * This is distinct from PolicyHighlightsCard which shows policy bullets with a view-policy sheet.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Hourglass } from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { TransactionModel } from '@/lib/policyEngine';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export interface PolicyMetaCardProps {
  /** Transaction model type */
  transactionModel?: TransactionModel | 'informational';
  /** SLA in hours or days (e.g., "48 hours", "3 days") */
  sla?: string | null;
  /** Per-transaction cap amount */
  perTransactionCap?: number | null;
  /** Frequency: monthly, annual, or one-time */
  frequency?: 'monthly' | 'annual' | 'one-time' | null;
  /** Max 3 eligibility highlights */
  eligibilityHighlights?: string[];
  /** Enforcement mode: soft or strict */
  enforcementMode?: 'soft' | 'strict' | null;
  /** Whether this is a deferred-value benefit */
  isDeferredValue?: boolean;
  /** Custom className */
  className?: string;
}

const transactionModelLabels: Record<string, string> = {
  'claim_only': 'Claim',
  'request_only': 'Request',
  'request_and_claim': 'Hybrid (Request → Claim)',
  'informational': 'Informational',
};

const frequencyLabels: Record<string, string> = {
  'monthly': 'Monthly',
  'annual': 'Annual',
  'one-time': 'One-time',
};

export function PolicyMetaCard({
  transactionModel,
  sla,
  perTransactionCap,
  frequency,
  eligibilityHighlights = [],
  enforcementMode,
  isDeferredValue = false,
  className,
}: PolicyMetaCardProps) {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  // Build key-value pairs, only include non-null values
  const highlights: { key: string; value: React.ReactNode }[] = [];

  if (transactionModel) {
    highlights.push({
      key: 'Transaction type',
      value: transactionModelLabels[transactionModel] || transactionModel,
    });
  }

  if (sla) {
    highlights.push({
      key: 'SLA',
      value: sla,
    });
  }

  if (perTransactionCap != null) {
    highlights.push({
      key: 'Per transaction cap',
      value: formatCurrency(perTransactionCap),
    });
  }

  if (frequency) {
    highlights.push({
      key: 'Frequency',
      value: frequencyLabels[frequency] || frequency,
    });
  }

  if (enforcementMode && transactionModel !== 'informational') {
    highlights.push({
      key: 'Enforcement',
      value: (
        <Badge 
          variant={enforcementMode === 'strict' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {enforcementMode === 'strict' ? 'Strict' : 'Soft'}
        </Badge>
      ),
    });
  }

  // Don't render if no highlights
  if (highlights.length === 0 && eligibilityHighlights.length === 0 && !isDeferredValue) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Info className="w-5 h-5 text-muted-foreground" />
          Policy highlights
          {isDeferredValue && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="ml-2 text-xs border-amber-500/30 text-amber-700 gap-1">
                    <Hourglass className="w-3 h-3" />
                    Deferred value
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px]">
                  <p className="text-xs">
                    These values are projected and conditional. They will be realized when vesting and employment conditions are met.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key-value grid */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            {highlights.map((item, i) => (
              <div key={i} className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{item.key}</p>
                <p className="text-sm font-medium tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Eligibility highlights (max 3 bullets) */}
        {eligibilityHighlights.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Eligibility</p>
            <ul className="space-y-1.5">
              {eligibilityHighlights.slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
