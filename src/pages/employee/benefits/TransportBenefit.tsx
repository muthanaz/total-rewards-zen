/**
 * Transport Benefit Page
 * Layout: Summary → Policy Highlights → 3 Component Boxes (Fuel/Car/Flight) → Required Docs
 */

import { Car } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { TransportComponentBoxes } from '@/components/employee/transport/TransportComponentBoxes';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

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
      sla="72 hours"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency || 'monthly'}
      enforcementMode="soft"
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
