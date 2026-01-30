/**
 * Housing Benefit Page
 * Layout: Summary → Policy Highlights → How it works → Required Docs → Area Prices → Listings
 */

import { Home } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { HousingAreaPrices } from '@/components/employee/housing/HousingAreaPrices';
import { HousingListingsDirectory } from '@/components/employee/housing/HousingListingsDirectory';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Housing allowance is paid monthly with your salary',
  'Submit your tenancy contract once a year for records',
  'Choose any residential area within your budget',
  'Top-up from salary if rent exceeds allowance',
];

export default function HousingPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('housing');
  const annualAllowance = policyData?.entitlement?.annualValue || 120000;
  
  return (
    <BenefitDetailTemplate
      categoryKey="housing"
      title="Housing Allowance"
      description="Monthly housing allowance paid with your salary"
      icon={Home}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      transactionModel={policyData?.transactionModel || 'request_only'}
      sla="48 hours"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency}
      enforcementMode="soft"
      howItWorksTitle="How your housing allowance works"
      howItWorksVariant="vertical"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={[]}
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      <HousingAreaPrices annualAllowance={annualAllowance} />
      <HousingListingsDirectory annualAllowance={annualAllowance} />
    </BenefitDetailTemplate>
  );
}
