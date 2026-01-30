/**
 * TransportComponentCards
 * 
 * Transport-specific component section showing:
 * 1. Auto-credited allowance (no claim CTA)
 * 2. Reimbursable claims (with doc requirements summary)
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Receipt, FileText, CheckCircle } from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';

export interface TransportComponentCardsProps {
  /** Auto-credited allowance amount (null if not defined) */
  autoCreditAmount?: number | null;
  /** Frequency of auto-credit */
  autoCreditFrequency?: 'monthly' | 'annual' | null;
  /** Note about auto-credit */
  autoCreditNote?: string;
  /** Per-transaction cap for reimbursable claims */
  perTransactionCap?: number | null;
  /** Required documents summary */
  requiredDocsCount?: number;
  /** Is reimbursable claims available */
  hasReimbursableClaims?: boolean;
}

export function TransportComponentCards({
  autoCreditAmount,
  autoCreditFrequency = 'monthly',
  autoCreditNote = 'Automatically credited to your salary account',
  perTransactionCap,
  requiredDocsCount = 0,
  hasReimbursableClaims = true,
}: TransportComponentCardsProps) {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  const frequencyLabel = autoCreditFrequency === 'monthly' ? 'Monthly' : 'Annual';

  return (
    <div className="space-y-4">
      <h3 className="text-base font-display font-semibold">Transport components</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Auto-credited allowance card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-success/10">
                <CreditCard className="w-4 h-4 text-success" />
              </div>
              Auto-credited allowance
            </CardTitle>
            <CardDescription className="text-xs">
              No action needed — credited automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium">{frequencyLabel}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium tabular-nums">
                  {autoCreditAmount != null ? formatCurrency(autoCreditAmount) : '—'}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                {autoCreditNote}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reimbursable claims card */}
        {hasReimbursableClaims && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Receipt className="w-4 h-4 text-primary" />
                </div>
                Reimbursable claims
              </CardTitle>
              <CardDescription className="text-xs">
                Submit receipts for eligible expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Per claim cap</span>
                  <span className="font-medium tabular-nums">
                    {perTransactionCap != null ? formatCurrency(perTransactionCap) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Documents needed</span>
                  <Badge variant="outline" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    {requiredDocsCount} required
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Use the "Submit Claim" button in the header to start
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
