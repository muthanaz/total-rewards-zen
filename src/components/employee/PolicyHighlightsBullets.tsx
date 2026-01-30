/**
 * PolicyHighlightsBullets
 * 
 * A nicely designed bullet points section for key policy highlights.
 * Shows informative policy details with icons and clean layout.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  Clock, 
  Banknote, 
  CalendarDays, 
  Shield, 
  CheckCircle2,
  Hourglass,
  LucideIcon
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { TransactionModel } from '@/lib/policyEngine';
import { cn } from '@/lib/utils';

export interface PolicyHighlight {
  icon?: LucideIcon;
  label: string;
  value: string | React.ReactNode;
  iconClassName?: string;
}

export interface PolicyHighlightsBulletsProps {
  /** Transaction model type */
  transactionModel?: TransactionModel | 'informational';
  /** SLA in hours or days (e.g., "48 hours", "3 days") */
  sla?: string | null;
  /** Per-transaction cap amount */
  perTransactionCap?: number | null;
  /** Frequency: monthly, annual, or one-time */
  frequency?: 'monthly' | 'annual' | 'one-time' | null;
  /** Enforcement mode: soft or strict */
  enforcementMode?: 'soft' | 'strict' | null;
  /** Whether this is a deferred-value benefit */
  isDeferredValue?: boolean;
  /** Additional custom highlights */
  customHighlights?: PolicyHighlight[];
  /** Custom className */
  className?: string;
}

const transactionModelConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  'claim_only': { label: 'Submit receipts to claim', icon: Banknote, color: 'text-success' },
  'request_only': { label: 'Pre-approval required', icon: Shield, color: 'text-primary' },
  'request_and_claim': { label: 'Request first, then claim', icon: Shield, color: 'text-primary' },
  'informational': { label: 'View-only benefit', icon: Info, color: 'text-muted-foreground' },
};

const frequencyLabels: Record<string, string> = {
  'monthly': 'Monthly cycle',
  'annual': 'Annual cycle',
  'one-time': 'One-time benefit',
};

export function PolicyHighlightsBullets({
  transactionModel,
  sla,
  perTransactionCap,
  frequency,
  enforcementMode,
  isDeferredValue = false,
  customHighlights = [],
  className,
}: PolicyHighlightsBulletsProps) {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  // Build highlight items
  const highlights: { icon: LucideIcon; text: string; subtext?: string; iconClassName: string }[] = [];

  // Transaction model
  if (transactionModel) {
    const config = transactionModelConfig[transactionModel];
    if (config) {
      highlights.push({
        icon: config.icon,
        text: config.label,
        iconClassName: config.color,
      });
    }
  }

  // SLA
  if (sla) {
    highlights.push({
      icon: Clock,
      text: `Processing time: ${sla}`,
      iconClassName: 'text-amber-500',
    });
  }

  // Per-transaction cap
  if (perTransactionCap != null) {
    highlights.push({
      icon: Banknote,
      text: `Up to ${formatCurrency(perTransactionCap)} per claim`,
      iconClassName: 'text-emerald-500',
    });
  }

  // Frequency
  if (frequency) {
    highlights.push({
      icon: CalendarDays,
      text: frequencyLabels[frequency] || frequency,
      iconClassName: 'text-blue-500',
    });
  }

  // Enforcement
  if (enforcementMode && transactionModel !== 'informational') {
    highlights.push({
      icon: Shield,
      text: enforcementMode === 'strict' 
        ? 'Strict policy enforcement' 
        : 'Flexible policy enforcement',
      iconClassName: enforcementMode === 'strict' ? 'text-destructive' : 'text-muted-foreground',
    });
  }

  // Deferred value
  if (isDeferredValue) {
    highlights.push({
      icon: Hourglass,
      text: 'Deferred value — realized upon vesting',
      iconClassName: 'text-amber-600',
    });
  }

  // Add custom highlights
  customHighlights.forEach(item => {
    highlights.push({
      icon: item.icon || CheckCircle2,
      text: typeof item.value === 'string' ? `${item.label}: ${item.value}` : item.label,
      iconClassName: item.iconClassName || 'text-muted-foreground',
    });
  });

  // Don't render if no highlights
  if (highlights.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Info className="w-5 h-5 text-muted-foreground" />
          Policy highlights
          {isDeferredValue && (
            <Badge variant="outline" className="ml-2 text-xs border-amber-500/30 text-amber-700 gap-1">
              <Hourglass className="w-3 h-3" />
              Deferred
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-3">
          {highlights.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
              >
                <div className={cn("mt-0.5 shrink-0", item.iconClassName)}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{item.text}</p>
                  {item.subtext && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.subtext}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
