/**
 * Long-Term Financials Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * This is an INFORMATIONAL benefit (no transactional CTA).
 * Shows structured component cards for EOSB, Bonus, Pension, Equity.
 * 
 * Section Order: Summary → Policy highlights (with Deferred Value badge) → 
 *                How it works → Long-term components → Recent activity
 */

import { PiggyBank, Award, Landmark, TrendingUp, Coins } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { LongTermComponentCard } from '@/components/employee/LongTermComponentCard';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Annual bonus based on performance rating',
  'Gratuity calculated per UAE Labor Law',
  'Equity vests over 4 years with 1-year cliff',
  'Savings plan with 5% employer match',
];

export default function LongTermFinancialsBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('financial');
  
  return (
    <BenefitDetailTemplate
      categoryKey="financial"
      title="Long-Term Financials"
      description="Bonus, gratuity, savings, and equity compensation"
      icon={PiggyBank}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      // This is an INFORMATIONAL benefit - no transactional CTA
      transactionModel="informational"
      hidePrimaryCta={true}
      isDeferredValue={true}
      // Policy meta - no SLA or caps for informational benefits
      sla={null}
      perTransactionCap={null}
      frequency="annual"
      enforcementMode={null}
      eligibilityHighlights={[
        'Gratuity accrual begins after 1 year of service',
        'Bonus eligibility requires performance rating',
        'Equity vests according to grant schedule',
      ]}
      // Content sections
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={[]} // No claim items for informational benefit
      requiredDocs={[]} // No docs needed
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Your Long-Term Components Section */}
      <div className="space-y-4">
        <h3 className="text-base font-display font-semibold">Your long-term components</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* EOSB Card - values will be null with "Definition pending" tooltip */}
          <LongTermComponentCard
            title="End-of-service gratuity (EOSB)"
            icon={Landmark}
            rows={[
              { label: 'Accrued value', value: null },
              { label: 'Calculation basis', value: 'UAE Labor Law' },
              { label: 'Years of service', value: null },
            ]}
            detailsLink="/employee/long-term-financials/eosb"
            status="active"
          />
          
          {/* Annual Bonus Card */}
          <LongTermComponentCard
            title="Annual bonus"
            icon={Award}
            rows={[
              { label: 'Target %', value: null },
              { label: 'Last payout', value: null },
              { label: 'Next cycle', value: 'March 2026' },
            ]}
            detailsLink="/employee/long-term-financials/bonus"
            status="active"
          />
          
          {/* Pension / Savings Card */}
          <LongTermComponentCard
            title="Pension / savings contributions"
            icon={Coins}
            rows={[
              { label: 'Employee contribution', value: null },
              { label: 'Employer match', value: null },
              { label: 'Total balance', value: null },
            ]}
            detailsLink="/employee/long-term-financials/savings"
            status="pending"
          />
          
          {/* Equity / Options Card */}
          <LongTermComponentCard
            title="Equity / options"
            icon={TrendingUp}
            rows={[
              { label: 'Granted', value: null },
              { label: 'Vested', value: null },
              { label: 'Next vesting', value: null },
            ]}
            detailsLink="/employee/long-term-financials/equity"
            status="not_eligible"
          />
        </div>
      </div>
    </BenefitDetailTemplate>
  );
}
