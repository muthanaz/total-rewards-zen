/**
 * Wellbeing Benefit Page
 * Layout: Summary → Policy Highlights → Categories & Listings
 */

import { Dumbbell } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { WellbeingCategoriesListings } from '@/components/employee/wellbeing/WellbeingCategoriesListings';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const POLICY_HIGHLIGHTS = [
  'AED 5,000 annual allowance for wellness activities',
  'Gym memberships at approved facilities',
  'Mental health and counseling sessions covered',
  { text: 'Pre-approval required for courses over AED 1,000', type: 'tip' as const },
  'Fitness equipment reimbursement up to AED 2,000',
  'Wellness apps and subscriptions included',
  'Sports club memberships eligible',
  { text: 'Receipts required within 30 days of purchase', type: 'warning' as const },
];

const FALLBACK_HOW_IT_WORKS = [
  'Browse Categories — Explore gym, mental health, sports, and wellness options',
  'Choose Provider — Select from approved vendors or request new provider approval',
  'Submit Claim — Upload receipt and proof of payment within 30 days',
  'Get Reimbursed — Claims processed within 48 hours',
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
      transactionModel={policyData?.transactionModel || 'claim_only'}
      eligibilityHighlights={POLICY_HIGHLIGHTS}
      howItWorksTitle="How Your Wellbeing Allowance Works"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
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
