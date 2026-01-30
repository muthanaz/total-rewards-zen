/**
 * Housing Benefit Page
 * Layout: Summary → Policy Highlights → How it works → Required Docs → Area Prices → Listings
 */

import { Home } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { HousingAreaPrices } from '@/components/employee/housing/HousingAreaPrices';
import { HousingListingsDirectory } from '@/components/employee/housing/HousingListingsDirectory';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Monthly Payment — Allowance is paid directly with your salary each month',
  'Submit Contract — Upload tenancy contract once a year for company records',
  'Choose Your Area — Any residential area within budget is eligible',
  'Top-Up Available — Excess rent is automatically deducted from salary',
];

const POLICY_HIGHLIGHTS = [
  'AED 120,000 annual allowance based on your grade',
  'Paid monthly as cash with your salary',
  'Covers rent for any approved residential area',
  'Tenancy contract required once per year',
  'Can be used for rent or mortgage payments',
  'Excess rent can be topped-up from salary',
];

export default function HousingPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('housing');
  const annualAllowance = policyData?.entitlement?.annualValue || 120000;
  
  return (
    <BenefitDetailTemplate
      categoryKey="housing"
      title="Housing Allowance"
      description="Monthly housing allowance paid with your salary"
      icon={Home}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      transactionModel={policyData?.transactionModel || 'request_only'}
      eligibilityHighlights={POLICY_HIGHLIGHTS}
      howItWorksTitle="How Your Housing Allowance Works"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={[]}
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      <HousingAreaPrices annualAllowance={annualAllowance} />
      <HousingListingsDirectory annualAllowance={annualAllowance} />
    </BenefitDetailTemplate>
  );
}
