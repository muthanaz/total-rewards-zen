/**
 * Learning & Development Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Section Order: Summary → Policy highlights → How it works → 
 *                Learning categories → Eligible items → Docs → Activity
 */

import { BookOpen } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { LearningCategoryCards } from '@/components/employee/BenefitSpecificContent';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Browse approved learning platforms or submit custom requests',
  'Courses under AED 2,000 are usually auto-approved',
  'Pre-approval required for courses over AED 2,000',
  'Submit completion certificate for reimbursement',
];

const FALLBACK_ELIGIBLE_ITEMS = [
  'Online courses and e-learning subscriptions',
  'Professional certifications (PMP, AWS, CFA, etc.)',
  'Industry conferences and workshops',
  'Technical books and learning materials',
  'Language learning programs',
  'Leadership development courses',
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
      // Policy meta
      transactionModel={policyData?.transactionModel || 'request_and_claim'}
      sla="5 business days"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency || 'annual'}
      enforcementMode="soft"
      // How it works
      howItWorksTitle="How your learning benefit works"
      howItWorksVariant="horizontal"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      // Eligible items
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_ELIGIBLE_ITEMS}
      eligibleItemsTitle="Eligible learning activities"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Learning Categories */}
      <LearningCategoryCards />
    </BenefitDetailTemplate>
  );
}
