/**
 * Learning & Development Benefit Page
 * Layout: Summary → Policy Highlights → Categories & Listings
 */

import { BookOpen } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { LearningCategoriesListings } from '@/components/employee/learning/LearningCategoriesListings';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const POLICY_HIGHLIGHTS = [
  'AED 10,000 annual allowance for professional development',
  'Industry certifications fully covered',
  'Online courses and platforms included',
  { text: 'Pre-approval required for programs over AED 3,000', type: 'tip' as const },
  'Conference attendance and workshops eligible',
  'Language courses covered (job-related)',
  'Books and learning materials reimbursable',
  { text: 'Completion certificates required for reimbursement', type: 'warning' as const },
];

const FALLBACK_HOW_IT_WORKS = [
  'Find a Course — Browse approved courses or request new provider approval',
  'Get Pre-Approval — Submit request for programs over AED 3,000',
  'Complete Course — Finish the course and obtain certification',
  'Submit Claim — Upload certificate and receipt for reimbursement',
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
      transactionModel={policyData?.transactionModel || 'request_and_claim'}
      eligibilityHighlights={POLICY_HIGHLIGHTS}
      howItWorksTitle="How Your Learning Allowance Works"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={[]}
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      <LearningCategoriesListings />
    </BenefitDetailTemplate>
  );
}
