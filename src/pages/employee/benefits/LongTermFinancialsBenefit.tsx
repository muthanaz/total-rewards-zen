/**
 * Long-Term Financials Benefit Page
 * Layout: Summary → Policy Highlights → 4 Tabs (EOSB, Bonus, Savings, Equity)
 */

import { PiggyBank } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { LongTermFinancialsTabs } from '@/components/employee/longterm/LongTermFinancialsTabs';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const POLICY_HIGHLIGHTS = [
  'End of Service: 21-30 days basic salary per year',
  'Annual bonus: Performance-based (0-200% of target)',
  'Savings plan: Company matches up to 5% contribution',
  { text: 'EOSB payable upon termination or resignation', type: 'tip' as const },
  'Bonus paid annually in March after appraisal',
  'Equity vesting: 25% per year over 4 years',
  'Savings withdrawable after 2 years of service',
  { text: 'Early withdrawal may forfeit matching contributions', type: 'warning' as const },
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
      transactionModel="informational"
      hidePrimaryCta={true}
      isDeferredValue={true}
      eligibilityHighlights={POLICY_HIGHLIGHTS}
      howItWorks={[]}
      whatYouCanClaim={[]}
      requiredDocs={[]}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      <LongTermFinancialsTabs yearsOfService={3} basicSalary={25000} />
    </BenefitDetailTemplate>
  );
}
