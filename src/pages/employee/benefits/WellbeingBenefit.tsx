/**
 * Wellbeing Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Section Order: Summary → Policy highlights → How it works → 
 *                Program categories → Eligible items → Docs → Activity
 */

import { Dumbbell } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { WellbeingProgramCards } from '@/components/employee/BenefitSpecificContent';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Choose any program or service within your annual budget',
  'Pay upfront or use direct billing with partners',
  'Submit receipts and proof of payment for reimbursement',
  'Mental health sessions are 100% confidential',
];

const FALLBACK_ELIGIBLE_ITEMS = [
  'Gym and fitness center memberships',
  'Wellness app subscriptions (Calm, Headspace, etc.)',
  'Counseling and therapy sessions',
  'Nutrition consultation services',
  'Yoga and meditation classes',
  'Health coaching programs',
];

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
      // Policy meta
      transactionModel={policyData?.transactionModel || 'claim_only'}
      sla="48 hours"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency || 'annual'}
      enforcementMode="soft"
      // How it works
      howItWorksTitle="How your wellbeing benefit works"
      howItWorksVariant="vertical"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      // Eligible items
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_ELIGIBLE_ITEMS}
      eligibleItemsTitle="Eligible programs"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Wellbeing Program Categories */}
      <WellbeingProgramCards />
    </BenefitDetailTemplate>
  );
}
