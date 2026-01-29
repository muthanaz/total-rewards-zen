/**
 * Health Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 */

import { Heart } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'In-network care with direct billing — no upfront payment',
  'Spouse and children under 18 covered',
  'Pre-authorization required for planned procedures',
  'Out-of-network: submit receipts within 60 days',
];

const FALLBACK_WHAT_YOU_CAN_CLAIM = [
  'Outpatient consultations and diagnostics',
  'Prescription medications (80% covered)',
  'Dental and optical services (with sub-limits)',
  'Inpatient care and surgeries',
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
