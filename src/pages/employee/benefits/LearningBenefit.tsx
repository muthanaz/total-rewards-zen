/**
 * Learning Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 */

import { BookOpen } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Pre-approval required for courses over AED 2,000',
  'Courses under AED 2,000 usually auto-approved',
  'Submit completion certificate for reimbursement',
  'Study leave available for certifications',
];

const FALLBACK_WHAT_YOU_CAN_CLAIM = [
  'Online and in-person courses',
  'Professional certifications',
  'Industry conferences and workshops',
  'Books and learning materials',
];

export default function LearningBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('learning');
  
  return (
    <BenefitDetailTemplate
      categoryKey="learning"
      title="Learning & Development"
      description="Courses, certifications, and professional development"
      icon={BookOpen}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_WHAT_YOU_CAN_CLAIM}
      requiredDocs={policyData?.requiredDocs || []}
      transactionModel={policyData?.transactionModel || 'request_and_claim'}
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
