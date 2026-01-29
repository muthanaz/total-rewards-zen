import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Car, Fuel, Plane, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrencyAED } from '@/lib/utils';
import { BenefitDetailTemplate } from '@/components/employee/BenefitDetailTemplate';

const allowances = [
  {
    name: 'Fuel Allowance',
    icon: Fuel,
    annual: 12000,
    utilized: 9000,
    claimType: 'fuel',
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
    claimType: 'car',
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
    claimType: 'flight',
    bullets: [
      'Return tickets to home country',
      'For employee and dependents',
      'Economy class (business for Grade 8+)',
      'Book through approved travel agent',
    ],
  },
];

const HOW_IT_WORKS = [
  'Fuel and car allowances auto-credited monthly to your salary',
  'Book annual tickets through the approved travel portal or HR',
  'Flight tickets cover you and registered dependents',
  'Business class available for Grade 8+ employees',
];

export default function TransportPage() {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  const handleSubmitClaim = (claimType: string, allowanceName: string) => {
    toast.success(`Claim for ${allowanceName}`, {
      description: 'Redirecting to claim form...',
    });
  };

  return (
    <BenefitDetailTemplate
      category="transport"
      name="Transport & Mobility"
      description="Fuel, car allowance, and annual flight tickets"
      icon={Car}
      iconClassName="from-chart-2 to-chart-2/80 shadow-chart-2/25"
      howItWorksBullets={HOW_IT_WORKS}
      showMarketplaceLink={true}
    >
      {/* Allowance Cards with Submit Claim buttons */}
      <div className="grid md:grid-cols-3 gap-6">
        {allowances.map((allowance) => {
          const remaining = allowance.annual - allowance.utilized;
          const utilization = Math.round((allowance.utilized / allowance.annual) * 100);

          return (
            <Card key={allowance.name} className="benefit-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-display flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <allowance.icon className="w-5 h-5 text-accent" />
                    </div>
                    {allowance.name}
                  </CardTitle>
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
                  <p className="text-xs font-medium text-muted-foreground mb-2">Policy Details</p>
                  <ul className="space-y-1.5">
                    {allowance.bullets.map((bullet, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 text-success mt-0.5 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className="w-full mt-2" 
                  size="sm"
                  onClick={() => handleSubmitClaim(allowance.claimType, allowance.name)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit {allowance.name === 'Annual Flight Tickets' ? 'Ticket Request' : 'Claim'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </BenefitDetailTemplate>
  );
}
