/**
 * Schooling Benefit Page
 * Uses BenefitDetailTemplate connected to policy_versions
 * 
 * Section Order: Summary → Policy highlights → How it works → 
 *                Children overview → Eligible expenses → Docs → Activity
 */

import { GraduationCap } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/templates/BenefitDetailTemplate';
import { SchoolingChildrenCards } from '@/components/employee/BenefitSpecificContent';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';

const FALLBACK_HOW_IT_WORKS = [
  'Each child receives their own separate allowance',
  'Register your children and their school details',
  'Submit fee invoice before the school deadline',
  'Direct payment to school or reimbursement to you',
];

const FALLBACK_ELIGIBLE_EXPENSES = [
  'Tuition fees for accredited schools',
  'Registration and enrollment fees',
  'Required textbooks and materials',
  'School uniforms (where required)',
  'School bus transportation',
  'Exam and assessment fees',
];

export default function SchoolingBenefitPage() {
  const { data: policyData, isLoading } = useBenefitPolicy('schooling');
  
  // Mock children data - would come from user profile in real app
  const mockChildren = [
    { 
      name: 'Sarah', 
      grade: 'Grade 5', 
      school: 'GEMS Wellington Academy',
      allowanceUsed: 18000,
      allowanceTotal: 30000,
    },
    { 
      name: 'Omar', 
      grade: 'Grade 2', 
      school: 'Dubai International Academy',
      allowanceUsed: 12000,
      allowanceTotal: 30000,
    },
  ];
  
  return (
    <BenefitDetailTemplate
      categoryKey="schooling"
      title="Schooling Allowance"
      description="Education support for your dependents"
      icon={GraduationCap}
      policyRef={policyData?.policyRef}
      entitlement={policyData?.entitlement}
      // Policy meta
      transactionModel={policyData?.transactionModel || 'request_and_claim'}
      sla="5 business days"
      perTransactionCap={policyData?.perTransactionCap || 30000}
      frequency={policyData?.frequency || 'annual'}
      enforcementMode="strict"
      eligibilityHighlights={[
        'Per-child allowance (not shared)',
        'Accredited schools only',
        'Documentation required annually',
      ]}
      // How it works
      howItWorksTitle="How your schooling allowance works"
      howItWorksVariant="horizontal"
      howItWorks={policyData?.howItWorks?.length ? policyData.howItWorks : FALLBACK_HOW_IT_WORKS}
      // Eligible items
      whatYouCanClaim={policyData?.whatYouCanClaim?.length ? policyData.whatYouCanClaim : FALLBACK_ELIGIBLE_EXPENSES}
      eligibleItemsTitle="Eligible expenses"
      requiredDocs={policyData?.requiredDocs || []}
      recentClaims={policyData?.recentClaims || []}
      isLoading={isLoading}
      hasPolicyPublished={policyData?.hasPolicyPublished ?? true}
      hasEntitlementData={policyData?.hasEntitlementData ?? true}
    >
      {/* Children Overview Cards */}
      <SchoolingChildrenCards 
        children={mockChildren}
        perChildAllowance={30000}
      />
    </BenefitDetailTemplate>
  );
}
