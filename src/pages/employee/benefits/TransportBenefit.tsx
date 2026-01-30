/**
 * Transport Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Section Order: Summary → Policy highlights → How it works → 
 *                Transport components → Required docs → Recent activity
 */

import { Car } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { TransportComponentCards } from '@/components/employee/TransportComponentCards';
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
  
  // Calculate required docs count for the component cards
  const requiredDocsCount = policyData?.requiredDocs?.filter(d => d.is_required)?.length || 0;
  
  // Auto-credit amount: use per-transaction cap as proxy, or null
  const autoCreditAmount = policyData?.perTransactionCap ?? null;
  
  return (
    <BenefitDetailTemplate
      categoryKey="transport"
      title="Transport & Mobility"
      description="Fuel, car allowance, and annual flight tickets"
      icon={Car}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      // Policy meta for PolicyMetaCard
      transactionModel={policyData?.transactionModel || 'claim_only'}
      sla="72 hours"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency || 'monthly'}
      enforcementMode="soft"
      // Content sections
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_WHAT_YOU_CAN_CLAIM}
      eligibleItemsTitle="Eligible expenses"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Transport Components Section */}
      <TransportComponentCards
        autoCreditAmount={autoCreditAmount}
        autoCreditFrequency={policyData?.frequency || 'monthly'}
        autoCreditNote="Automatically credited to your salary account on the 25th of each month"
        perTransactionCap={policyData?.perTransactionCap}
        requiredDocsCount={requiredDocsCount}
        hasReimbursableClaims={true}
      />
    </BenefitDetailTemplate>
  );
}
