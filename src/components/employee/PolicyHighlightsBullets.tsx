/**
 * PolicyHighlightsBullets
 * 
 * A nicely designed bullet points section for key policy highlights.
 * Shows informative policy details with icons and clean layout.
 * Consistent design across all benefit pages.
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
  FileCheck,
  AlertCircle,
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

const transactionModelConfig: Record<string, { label: string; description: string; icon: LucideIcon; color: string }> = {
  'claim_only': { 
    label: 'Claim-based', 
    description: 'Submit receipts after payment for reimbursement',
    icon: Banknote, 
    color: 'text-emerald-600' 
  },
  'request_only': { 
    label: 'Pre-approval required', 
    description: 'Get approval before incurring expenses',
    icon: Shield, 
    color: 'text-blue-600' 
  },
  'request_and_claim': { 
    label: 'Request then claim', 
    description: 'Pre-approval needed, then submit for reimbursement',
    icon: FileCheck, 
    color: 'text-violet-600' 
  },
  'informational': { 
    label: 'View-only', 
    description: 'No claims or requests needed for this benefit',
    icon: Info, 
    color: 'text-muted-foreground' 
  },
};

const frequencyLabels: Record<string, { label: string; description: string }> = {
  'monthly': { label: 'Monthly cycle', description: 'Allowance resets every month' },
  'annual': { label: 'Annual cycle', description: 'Allowance resets every year' },
  'one-time': { label: 'One-time benefit', description: 'Single use entitlement' },
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
  const highlights: { 
    icon: LucideIcon; 
    label: string;
    description: string;
    iconClassName: string;
    badge?: { text: string; className: string };
  }[] = [];

  // Transaction model
  if (transactionModel) {
    const config = transactionModelConfig[transactionModel];
    if (config) {
      highlights.push({
        icon: config.icon,
        label: config.label,
        description: config.description,
        iconClassName: config.color,
      });
    }
  }

  // SLA
  if (sla) {
    highlights.push({
      icon: Clock,
      label: 'Processing time',
      description: `Typically processed within ${sla}`,
      iconClassName: 'text-amber-600',
    });
  }

  // Per-transaction cap
  if (perTransactionCap != null) {
    highlights.push({
      icon: Banknote,
      label: 'Per-claim limit',
      description: `Maximum ${formatCurrency(perTransactionCap)} per submission`,
      iconClassName: 'text-emerald-600',
    });
  }

  // Frequency
  if (frequency) {
    const freqConfig = frequencyLabels[frequency];
    if (freqConfig) {
      highlights.push({
        icon: CalendarDays,
        label: freqConfig.label,
        description: freqConfig.description,
        iconClassName: 'text-blue-600',
      });
    }
  }

  // Enforcement
  if (enforcementMode && transactionModel !== 'informational') {
    highlights.push({
      icon: Shield,
      label: enforcementMode === 'strict' ? 'Strict enforcement' : 'Flexible enforcement',
      description: enforcementMode === 'strict' 
        ? 'All required documents must be submitted'
        : 'Claims can be submitted with missing documents',
      iconClassName: enforcementMode === 'strict' ? 'text-destructive' : 'text-muted-foreground',
      badge: enforcementMode === 'strict' 
        ? { text: 'Strict', className: 'bg-destructive/10 text-destructive border-0' }
        : undefined,
    });
  }

  // Deferred value
  if (isDeferredValue) {
    highlights.push({
      icon: Hourglass,
      label: 'Deferred value',
      description: 'Benefits realized upon vesting or termination',
      iconClassName: 'text-amber-600',
    });
  }

  // Add custom highlights
  customHighlights.forEach(item => {
    highlights.push({
      icon: item.icon || CheckCircle2,
      label: item.label,
      description: typeof item.value === 'string' ? item.value : '',
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
          <Info className="w-5 h-5 text-primary" />
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
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors"
              >
                <div className={cn(
                  "p-2 rounded-md bg-background shrink-0",
                  item.iconClassName
                )}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.badge && (
                      <Badge className={cn("text-[10px] h-4", item.badge.className)}>
                        {item.badge.text}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
