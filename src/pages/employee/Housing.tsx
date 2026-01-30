/**
 * Housing Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Section Order: Summary → Policy highlights → How it works → 
 *                Market browser link → Eligible uses → Docs → Activity
 */

import { Home } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { HousingMarketCard } from '@/components/employee/BenefitSpecificContent';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

// Fallback content if no policy published
const FALLBACK_HOW_IT_WORKS = [
  'Housing allowance is paid monthly with your salary',
  'Submit your tenancy contract once a year for records',
  'Choose any residential area within your budget',
  'Top-up from salary if rent exceeds allowance',
];

const FALLBACK_ELIGIBLE_USES = [
  'Rent payments for residential property',
  'Mortgage payments (with documentation)',
  'Accommodation during relocation period',
  'Serviced apartments (up to 3 months)',
];

export default function HousingPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('housing');
  
  return (
    <BenefitDetailTemplate
      categoryKey="housing"
      title="Housing Allowance"
      description="Monthly housing allowance paid with your salary"
      icon={Home}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      // Policy meta
      transactionModel={policyData?.transactionModel || 'request_only'}
      sla="48 hours"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency}
      enforcementMode="soft"
      // How it works
      howItWorksTitle="How your housing allowance works"
      howItWorksVariant="vertical"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      // Eligible items
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_ELIGIBLE_USES}
      eligibleItemsTitle="Eligible uses"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Housing Market Browser Link */}
      <HousingMarketCard />
    </BenefitDetailTemplate>
  );
}
