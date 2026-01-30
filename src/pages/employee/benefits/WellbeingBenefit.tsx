/**
 * Wellbeing Benefit Page
 * Layout: Summary → Policy Highlights → Categories & Listings
 */

import { Dumbbell } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { WellbeingCategoriesListings } from '@/components/employee/wellbeing/WellbeingCategoriesListings';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

export default function WellbeingBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('wellbeing');
  
  return (
    <BenefitDetailTemplate
      categoryKey="wellbeing"
      title="Wellbeing Program"
      description="Health and wellness benefits for mind and body"
      icon={Dumbbell}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      transactionModel={policyData?.transactionModel || 'claim_only'}
      sla="48 hours"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency || 'annual'}
      enforcementMode="soft"
      howItWorks={[]}
      whatYouCanClaim={[]}
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      <WellbeingCategoriesListings />
    </BenefitDetailTemplate>
  );
}
