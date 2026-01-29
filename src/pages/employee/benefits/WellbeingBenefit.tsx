/**
 * Wellbeing Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 */

import { Dumbbell } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Choose programs up to your annual budget',
  'Gym membership at partner facilities',
  'Wellness app subscriptions included',
  'Mental health sessions are 100% confidential',
];

const FALLBACK_WHAT_YOU_CAN_CLAIM = [
  'Gym and fitness center memberships',
  'Wellness app subscriptions (Calm, Headspace)',
  'Counseling and mental health sessions',
  'Nutrition consultation services',
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
