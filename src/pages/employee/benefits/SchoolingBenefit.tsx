/**
 * Schooling Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
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
