/**
 * Wizard Step 3: Estimate & Rules
 * 
 * Shows entitlement, cap, remaining, and estimated payable.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Currency } from '@/components/ui/Currency';
import { HelpCircle, ChevronDown, AlertTriangle, Info } from 'lucide-react';
import { BenefitPolicyData } from '@/hooks/useBenefitPolicy';
import { cn } from '@/lib/utils';

interface WizardStepEstimateProps {
  policyData: BenefitPolicyData | null;
  claimedAmount: number | null;
  isRequest: boolean;
  blockers: { message: string; details?: string }[];
  warnings: { message: string }[];
}

export function WizardStepEstimate({
  policyData,
  claimedAmount,
  isRequest,
  blockers,
  warnings,
}: WizardStepEstimateProps) {
  const entitlement = policyData?.entitlement;
  const annualCap = policyData?.annualCap;
  const utilized = entitlement?.utilized || 0;
  const remaining = entitlement?.remaining || (annualCap ? annualCap - utilized : null);
  
  // Calculate estimate reliability
  const estimateReliability = (() => {
    if (!policyData?.hasPolicyPublished) return { level: 'low' as const, reason: 'No policy found' };
    if (!claimedAmount && !isRequest) return { level: 'low' as const, reason: 'Enter claim amount' };
    if (!annualCap) return { level: 'medium' as const, reason: null };
    if (entitlement?.isEstimated) return { level: 'medium' as const, reason: null };
    return { level: 'high' as const, reason: null };
  })();

  // Calculate estimated payable
  const estimatedPayable = (() => {
    if (!claimedAmount || isRequest) return null;
    if (!remaining) return claimedAmount;
    return Math.min(claimedAmount, remaining);
  })();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">
          {isRequest ? 'Your Entitlement' : 'Eligibility & Estimate'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isRequest 
            ? 'Review your current allowance status.' 
            : 'Review your coverage and estimated reimbursement.'}
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="h-full min-h-[100px]">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <span className="text-xs text-muted-foreground">Annual Limit</span>
            <span className="text-lg font-semibold tabular-nums">
              {annualCap ? <Currency amount={annualCap} size="lg" /> : '—'}
            </span>
          </CardContent>
        </Card>

        <Card className="h-full min-h-[100px]">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <span className="text-xs text-muted-foreground">Used So Far</span>
            <span className="text-lg font-semibold tabular-nums">
              <Currency amount={utilized} size="lg" />
            </span>
          </CardContent>
        </Card>

        <Card className="h-full min-h-[100px]">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <span className="text-xs text-muted-foreground">Remaining</span>
            <span className="text-lg font-semibold tabular-nums text-success">
              {remaining != null ? <Currency amount={remaining} size="lg" /> : '—'}
            </span>
          </CardContent>
        </Card>

        {!isRequest && (
          <Card className="h-full min-h-[100px] border-primary/50 bg-primary/5">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Estimated Payable</span>
                {estimateReliability.level !== 'low' && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] px-1 py-0",
                      estimateReliability.level === 'high' 
                        ? 'border-success/50 text-success' 
                        : 'border-warning/50 text-warning'
                    )}
                  >
                    {estimateReliability.level === 'high' ? 'High' : 'Medium'}
                  </Badge>
                )}
              </div>
              {estimateReliability.level === 'low' ? (
                <span className="text-sm text-muted-foreground">
                  Unavailable — {estimateReliability.reason}
                </span>
              ) : (
                <span className="text-lg font-semibold tabular-nums text-primary">
                  <Currency amount={estimatedPayable || 0} size="lg" />
                </span>
              )}
            </CardContent>
          </Card>
        )}

        {isRequest && (
          <Card className="h-full min-h-[100px]">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <span className="text-xs text-muted-foreground">Request Type</span>
              <span className="text-lg font-semibold">Pre-approval</span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* What affects estimate */}
      {!isRequest && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="h-4 w-4" />
            What affects this estimate?
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 p-4 rounded-lg bg-muted/50 text-sm space-y-2">
            <p>• Your grade-based annual limit</p>
            <p>• Prior approved claims this year</p>
            <p>• Co-payment rules (if applicable)</p>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Final payable may change after HR review.
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Blockers */}
      {blockers.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cannot submit:</strong> {blockers[0].message}
            {blockers[0].details && (
              <span className="block text-sm mt-1">{blockers[0].details}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {warnings.length > 0 && blockers.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {warnings[0].message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default WizardStepEstimate;
