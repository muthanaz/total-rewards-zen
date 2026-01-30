/**
 * Transport Benefit Page
 * Layout: Summary → Policy Highlights → 3 Component Boxes (Fuel/Car/Flight) → Required Docs
 */

import { Car } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { TransportComponentBoxes } from '@/components/employee/transport/TransportComponentBoxes';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const POLICY_HIGHLIGHTS = [
  'Fuel allowance: AED 1,500 per month auto-credited',
  'Car allowance: AED 2,500 per month with salary',
  'Annual flight tickets: Economy class for you + 2 dependents',
  { text: 'Submit fuel receipts for reimbursement claims', type: 'tip' as const },
  'Flight bookings require pre-approval',
  'Unused flight allowance does not carry forward',
  'Car allowance covers parking and tolls',
  { text: 'Keep all receipts for audit purposes', type: 'warning' as const },
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
      transactionModel={policyData?.transactionModel || 'claim_only'}
      eligibilityHighlights={POLICY_HIGHLIGHTS}
      howItWorks={[]}
      whatYouCanClaim={[]}
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      <TransportComponentBoxes
        fuelAllowance={1500}
        carAllowance={2500}
        flightAllowance={15000}
        flightClass="Economy"
        dependentTickets={2}
      />
    </BenefitDetailTemplate>
  );
}
