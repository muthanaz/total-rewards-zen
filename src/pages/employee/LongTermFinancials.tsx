import { Wallet } from 'lucide-react';
import { BenefitDetailTemplate } from '@/components/employee/BenefitDetailTemplate';

const HOW_IT_WORKS = [
  'Bonus projection based on current performance rating',
  'Gratuity accrues per UAE Labor Law (21 days/year first 5 years)',
  'Equity vests quarterly after 1-year cliff',
  'All values are projections until actual payout',
];

export default function LongTermFinancialsPage() {
  return (
    <BenefitDetailTemplate
      category="financial"
      name="Long-Term Financials"
      description="Your bonus, gratuity, savings, and equity compensation"
      icon={Wallet}
      iconClassName="from-accent to-accent/80 shadow-accent/25"
      howItWorksBullets={HOW_IT_WORKS}
      showMarketplaceLink={false}
    />
  );
}
