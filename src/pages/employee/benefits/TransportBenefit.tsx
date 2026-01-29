/**
 * Transport Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 */

import { Car } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Fuel allowance paid monthly with salary',
  'Car allowance for eligible grades',
  'Annual flight tickets for you and dependents',
  'Business class available for senior grades',
];

const FALLBACK_WHAT_YOU_CAN_CLAIM = [
  'Fuel expenses (monthly auto-credit)',
  'Car loan/lease contributions',
  'Annual return flights to home country',
  'Local transportation during business travel',
];

export default function TransportBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('transport');
  
  return (
    <BenefitDetailTemplate
      categoryKey="transport"
      title="Transport & Mobility"
      description="Fuel, car allowance, and annual flight tickets"
      icon={Car}
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
