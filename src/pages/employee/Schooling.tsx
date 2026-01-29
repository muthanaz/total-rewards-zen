import { GraduationCap } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/employee/BenefitDetailTemplate';

const HOW_IT_WORKS = [
  'Each child receives AED 30,000 per year — allowances are separate',
  'Each child can attend a different school',
  'Excess fees deducted from monthly salary automatically',
  'Direct payment to approved schools',
];

export default function SchoolingPage() {
  return (
    <BenefitDetailTemplate
      category="schooling"
      name="Schooling Allowance"
      description="Education allowance for each of your children"
      icon={GraduationCap}
      iconClassName="from-chart-4 to-chart-4/80 shadow-chart-4/25"
      howItWorksBullets={HOW_IT_WORKS}
      showMarketplaceLink={true}
    />
  );
}
