/**
 * Schooling Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Section Order: Summary → Policy highlights → How it works → 
 *                Eligible items → Required docs → Recent activity
 */

import { GraduationCap } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'AED 30,000 allowance per child per year',
  'Each child gets their own separate allowance',
  'Direct payment to approved schools',
  'Excess fees deducted from monthly salary',
];

const FALLBACK_WHAT_YOU_CAN_CLAIM = [
  'Tuition fees for accredited schools',
  'Registration and enrollment fees',
  'Required textbooks and materials',
  'School uniforms (where required)',
];

export default function SchoolingBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('schooling');
  
  return (
    <BenefitDetailTemplate
      categoryKey="schooling"
      title="Schooling Allowance"
      description="Education support for your dependents"
      icon={GraduationCap}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      // Policy meta for PolicyMetaCard
      transactionModel={policyData?.transactionModel || 'request_and_claim'}
      sla="5 business days"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency || 'annual'}
      enforcementMode="strict"
      eligibilityHighlights={[
        'Per-child allowance (not shared)',
        'Accredited schools only',
        'Documentation required annually',
      ]}
      // Content sections
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_WHAT_YOU_CAN_CLAIM}
      eligibleItemsTitle="Eligible expenses"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    />
  );
}
