/**
 * Transport Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Section Order: Summary → Policy highlights → How it works → 
 *                Transport components (Fuel, Car, Flight) → Docs → Activity
 */

import { Car } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { TransportBenefitCards } from '@/components/employee/BenefitSpecificContent';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Fuel allowance is auto-credited to your salary on the 25th',
  'Car allowance requires submitting loan/lease statement',
  'Book annual flights through the travel portal or claim later',
  'Submit receipts within 60 days for reimbursement',
];

const FALLBACK_ELIGIBLE_ITEMS = [
  'Monthly fuel for personal vehicle',
  'Car loan or lease payments',
  'Annual return flights to home country',
  'Airport parking during business travel',
];

export default function TransportBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('transport');
  
  // Mock component data - would come from policy in real app
  const fuelAllowance = 1500; // Example: AED 1,500/month
  const carAllowance = policyData?.perTransactionCap ? policyData.perTransactionCap * 0.4 : null;
  const flightAllowance = policyData?.entitlement?.annualValue 
    ? Math.round(policyData.entitlement.annualValue * 0.3) 
    : null;
  
  return (
    <BenefitDetailTemplate
      categoryKey="transport"
      title="Transport & Mobility"
      description="Fuel, car allowance, and annual flight tickets"
      icon={Car}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      // Policy meta
      transactionModel={policyData?.transactionModel || 'claim_only'}
      sla="72 hours"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency || 'monthly'}
      enforcementMode="soft"
      // How it works
      howItWorksTitle="How your transport benefit works"
      howItWorksVariant="horizontal"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      // Eligible items
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_ELIGIBLE_ITEMS}
      eligibleItemsTitle="Eligible expenses"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Transport Components: Fuel, Car, Flight */}
      <TransportBenefitCards
        fuelAllowance={fuelAllowance}
        carAllowance={carAllowance}
        flightAllowance={flightAllowance}
        flightClass="Economy"
        dependentTickets={2}
      />
    </BenefitDetailTemplate>
  );
}
