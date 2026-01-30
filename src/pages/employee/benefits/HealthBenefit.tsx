/**
 * Health Insurance Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Section Order: Summary → Policy highlights → How it works → 
 *                Network providers link → Coverage details → Docs → Activity
 */

import { Heart } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { HealthNetworkCard } from '@/components/employee/BenefitSpecificContent';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const POLICY_HIGHLIGHTS = [
  'Comprehensive medical coverage for you and family',
  'In-network providers: Direct billing — no upfront payment',
  'Out-of-network: 80% reimbursement after deductible',
  { text: 'Pre-authorization required for planned procedures', type: 'tip' as const },
  'Prescription medications covered at 80%',
  'Dental and optical included (annual sub-limits apply)',
  'Maternity coverage after 10-month waiting period',
  { text: 'Submit out-of-network claims within 60 days', type: 'warning' as const },
];

const FALLBACK_HOW_IT_WORKS = [
  'Find a Provider — Use your insurance card at any in-network clinic or hospital',
  'Direct Billing — In-network care uses direct billing — no upfront payment required',
  'Pre-Authorization — Get pre-approval for elective procedures and surgeries',
  'Out-of-Network Claims — Pay first, then submit receipts within 60 days for 80% reimbursement',
];

const FALLBACK_COVERAGE = [
  'Outpatient consultations and diagnostics',
  'Prescription medications (80% covered)',
  'Dental services (annual sub-limit applies)',
  'Optical services (glasses, contacts)',
  'Inpatient care and surgeries',
  'Maternity coverage (after waiting period)',
];

export default function HealthBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('health');
  
  return (
    <BenefitDetailTemplate
      categoryKey="health"
      title="Health Insurance"
      description="Comprehensive coverage for you and your family"
      icon={Heart}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      // Policy meta
      transactionModel={policyData?.transactionModel || 'claim_only'}
      eligibilityHighlights={POLICY_HIGHLIGHTS}
      // How it works
      howItWorksTitle="How Your Health Insurance Works"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      // Coverage items
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_COVERAGE}
      eligibleItemsTitle="Coverage included"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Network Providers Link */}
      <HealthNetworkCard />
    </BenefitDetailTemplate>
  );
}
