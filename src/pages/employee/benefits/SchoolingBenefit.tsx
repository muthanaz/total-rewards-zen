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

const POLICY_HIGHLIGHTS = [
  'AED 30,000 allowance per child per year',
  'Each child can attend different schools',
  'Direct payment to approved schools',
  { text: 'Submit: School invoice + proof of payment (term-by-term or annually)', type: 'tip' as const },
  'Allowances do not combine between children',
  'Excess fees deducted from monthly salary',
  'Covers tuition, registration, and books',
  { text: 'Extracurricular activities may require approval', type: 'warning' as const },
];

const FALLBACK_HOW_IT_WORKS = [
  'Per-Child Allowance — Each child receives AED 30,000 per year — allowances are separate and do not combine',
  'Different Schools OK — Each child can attend a different school — you choose what\'s best for their age and needs',
  'Top-Up If Needed — If school fees exceed AED 30,000, the extra is deducted from your salary automatically',
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
      eligibilityHighlights={POLICY_HIGHLIGHTS}
      // How it works
      howItWorksTitle="How Your Schooling Allowance Works"
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
