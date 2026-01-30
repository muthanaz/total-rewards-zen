/**
 * Long-Term Financials Benefit Page
 * Layout: Summary → 4 Tabs (EOSB, Bonus, Savings, Equity) with tab-specific content
 */

import { PiggyBank } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { LongTermFinancialsTabs } from '@/components/employee/longterm/LongTermFinancialsTabs';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

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
      sla={null}
      perTransactionCap={null}
      frequency="annual"
      enforcementMode={null}
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
