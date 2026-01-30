/**
 * Housing Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * Market browsing moved to /employee/housing/market
 * 
 * Section Order: Summary → Policy highlights → How it works → Eligible uses → 
 *                Required docs → Market link → Recent activity
 */

import { Home, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';
import { Link } from 'react-router-dom';

// Fallback content if no policy published
const FALLBACK_HOW_IT_WORKS = [
  'Paid monthly with your salary as a cash allowance',
  'Can be used for rent or mortgage payments',
  'Submit tenancy contract annually for records',
  'Allowance based on your grade and location',
];

const FALLBACK_ELIGIBLE_USES = [
  'Rent payments for residential property',
  'Mortgage payments (with documentation)',
  'Accommodation during relocation period',
];

export default function HousingPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('housing');
  
  return (
    <BenefitDetailTemplate
      categoryKey="housing"
      title="Housing Allowance"
      description="Monthly housing allowance paid with your salary"
      icon={Home}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      // Policy meta for PolicyMetaCard
      transactionModel={policyData?.transactionModel || 'request_only'}
      sla="48 hours"
      perTransactionCap={policyData?.perTransactionCap}
      frequency={policyData?.frequency}
      enforcementMode="soft"
      // Content sections
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_ELIGIBLE_USES}
      eligibleItemsTitle="Eligible uses"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Explore Housing Market Card */}
      <Card className="border-border/40 hover:border-primary/30 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base">Explore housing market</h3>
                <p className="text-sm text-muted-foreground">
                  Browse listings and compare rental prices across Dubai areas
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/employee/housing/market" className="gap-2">
                Browse listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </BenefitDetailTemplate>
  );
}
