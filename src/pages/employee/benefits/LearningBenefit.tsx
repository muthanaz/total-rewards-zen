/**
 * Learning & Development Benefit Page
 * Layout: Summary → Policy Highlights → Categories & Listings
 */

import { BookOpen } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { LearningCategoriesListings } from '@/components/employee/learning/LearningCategoriesListings';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

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
      sla="5 business days"
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
      <LearningCategoriesListings />
    </BenefitDetailTemplate>
  );
}
