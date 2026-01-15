import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { SubmitClaimButton } from '@/components/employee/SubmitClaimButton';
import { BenefitGuide } from '@/components/employee/BenefitGuide';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { Car, Fuel, Plane, CreditCard, CheckCircle, Wallet, TrendingDown, Percent } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const allowances = [
  {
    name: 'Fuel Allowance',
    icon: Fuel,
    annual: 12000,
    utilized: 9000,
    bullets: [
      'Paid monthly with salary (AED 1,000/month)',
      'For personal vehicle fuel expenses',
      'Receipts not required',
      'Taxable as cash allowance',
    ],
  },
  {
    name: 'Car Allowance',
    icon: Car,
    annual: 8000,
    utilized: 6000,
    bullets: [
      'Monthly contribution towards car lease/loan',
      'Or lump sum towards purchase',
      'Eligibility: Grade 5+',
      'Subject to 2-year commitment',
    ],
  },
  {
    name: 'Annual Flight Tickets',
    icon: Plane,
    annual: 15000,
    utilized: 15000,
    bullets: [
      'Return tickets to home country',
      'For employee and dependents',
      'Economy class (business for Grade 8+)',
      'Book through approved travel agent',
    ],
  },
];

export default function TransportPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  const totalAnnual = allowances.reduce((sum, a) => sum + a.annual, 0);
  const totalUtilized = allowances.reduce((sum, a) => sum + a.utilized, 0);
  const totalRemaining = totalAnnual - totalUtilized;
  const totalUtilization = Math.round((totalUtilized / totalAnnual) * 100);

  const guideSteps = [
    {
      title: 'Automatic Credit',
      description: 'Fuel and car allowances are auto-credited to your salary monthly',
      highlight: 'auto-credited',
    },
    {
      title: 'Flight Booking',
      description: 'Book annual tickets through the approved travel portal or HR',
    },
    {
      title: 'Family Included',
      description: 'Flight tickets cover you and your registered dependents',
    },
  ];

  const policyPoints = [
    'Fuel allowance paid monthly with salary',
    'Car allowance for Grade 5+ employees',
    'Annual tickets to home country for family',
    'Business class available for Grade 8+',
    'Unused ticket allowance non-encashable',
    'Advance booking recommended for best fares',
  ];

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Header */}
      <PageHeader
        title={isArabic ? 'النقل والتنقل' : 'Transport & Mobility'}
        titleAr="النقل والتنقل"
        subtitle={isArabic ? 'بدل الوقود، بدل السيارة، وتذاكر الطيران السنوية' : 'Fuel, car allowance, and annual flight tickets'}
        subtitleAr="بدل الوقود، بدل السيارة، وتذاكر الطيران السنوية"
        icon={Car}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStatsCard
          icon={CreditCard}
          value={formatCurrency(totalAnnual)}
          label="Total Annual"
          formula="Sum of all transport allowances"
          dataSource="HR Policy"
          variant="primary"
        />
        <SummaryStatsCard
          icon={Wallet}
          value={formatCurrency(totalUtilized)}
          label="Utilized"
          formula="Amount paid/used YTD"
          dataSource="Payroll"
          variant="utilized"
        />
        <SummaryStatsCard
          icon={TrendingDown}
          value={formatCurrency(totalRemaining)}
          label="Remaining"
          formula="Total - Utilized"
          dataSource="System"
          variant="remaining"
        />
        <SummaryStatsCard
          icon={Percent}
          value={`${totalUtilization}%`}
          label="Utilization"
          formula="(Utilized / Total) × 100"
          dataSource="System"
          variant="utilization"
          progress={totalUtilization}
        />
      </div>

      {/* Comprehensive Benefit Guide */}
      <BenefitGuide
        icon={Car}
        title="Transport Benefits Guide"
        steps={guideSteps}
        policyPoints={policyPoints}
        policyButtonText="View Transport Policy"
      />

      {/* Allowance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {allowances.map((allowance) => {
          const remaining = allowance.annual - allowance.utilized;
          const utilization = Math.round((allowance.utilized / allowance.annual) * 100);

          return (
            <Card key={allowance.name} className="benefit-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-display flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <allowance.icon className="w-5 h-5 text-accent" />
                    </div>
                    {allowance.name}
                  </CardTitle>
                  <SubmitClaimButton 
                    category={allowance.name} 
                    buttonText="Claim"
                    buttonSize="sm"
                    showIcon={false}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Allowance</span>
                    <span className="font-medium">{formatCurrency(allowance.annual)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilized</span>
                    <span className="font-medium">{formatCurrency(allowance.utilized)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium text-accent">{formatCurrency(remaining)}</span>
                  </div>
                  <Progress value={utilization} className="h-2" />
                  <p className="text-xs text-right text-muted-foreground">{utilization}% utilized</p>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Details</p>
                  <ul className="space-y-1.5">
                    {allowance.bullets.map((bullet, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 text-success mt-0.5 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
