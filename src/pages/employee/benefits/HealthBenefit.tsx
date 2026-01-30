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

const FALLBACK_HOW_IT_WORKS = [
  'Visit any in-network provider with your insurance card',
  'In-network care uses direct billing — no upfront payment',
  'Pre-authorization required for planned procedures',
  'Out-of-network: pay first, submit receipts within 60 days',
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
      sla="5 business days"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency || 'annual'}
      enforcementMode="soft"
      // How it works
      howItWorksTitle="How your health insurance works"
      howItWorksVariant="horizontal"
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
