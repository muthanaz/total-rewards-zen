/**
 * Housing Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 */

import { Home } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';
import { BENEFIT_CATEGORIES } from '@/lib/benefitCategories';

// Fallback content if no policy published
const FALLBACK_HOW_IT_WORKS = [
  'Paid monthly with your salary as a cash allowance',
  'Can be used for rent or mortgage payments',
  'Submit tenancy contract annually for records',
  'Allowance based on your grade and location',
];

const FALLBACK_WHAT_YOU_CAN_CLAIM = [
  'Rent payments for residential property',
  'Mortgage payments (with documentation)',
  'Accommodation during relocation period',
];

export default function HousingBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('housing');
  const category = BENEFIT_CATEGORIES.housing;
  
  return (
    <BenefitDetailTemplate
      categoryKey="housing"
      title="Housing Allowance"
      description="Monthly housing allowance paid with your salary"
      icon={Home}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_WHAT_YOU_CAN_CLAIM}
      requiredDocs={policyData?.requiredDocs || []}
      transactionModel={policyData?.transactionModel || 'claim_only'}
      annualCap={policyData?.annualCap}
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    />
  );
}
