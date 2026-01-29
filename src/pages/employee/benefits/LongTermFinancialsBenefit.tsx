/**
 * Long-Term Financials Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Note: This is a deferred-value benefit (bonus, gratuity, equity)
 * with special handling for projected values
 */

import { PiggyBank } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hourglass } from 'lucide-react';

const FALLBACK_HOW_IT_WORKS = [
  'Annual bonus based on performance rating',
  'Gratuity calculated per UAE Labor Law',
  'Equity vests over 4 years with 1-year cliff',
  'Savings plan with 5% employer match',
];

const FALLBACK_WHAT_YOU_CAN_CLAIM = [
  'Performance bonus (paid annually in March)',
  'End-of-service gratuity (upon exit)',
  'Vested equity options (at liquidity events)',
];

export default function LongTermFinancialsBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('financial');
  
  return (
    <BenefitDetailTemplate
      categoryKey="financial"
      title="Long-Term Financials"
      description="Bonus, gratuity, savings, and equity compensation"
      icon={PiggyBank}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_WHAT_YOU_CAN_CLAIM}
      requiredDocs={policyData?.requiredDocs || []}
      transactionModel="claim_only"
      annualCap={policyData?.annualCap}
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Deferred Value Banner */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Hourglass className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">Deferred Value</span>
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-700">Future</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                These values are projected and conditional. They will be realized when vesting and employment conditions are met.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </BenefitDetailTemplate>
  );
}
