import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { Car, Fuel, Plane, CreditCard, CheckCircle, Wallet, TrendingDown, Percent } from 'lucide-react';

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
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  const totalAnnual = allowances.reduce((sum, a) => sum + a.annual, 0);
  const totalUtilized = allowances.reduce((sum, a) => sum + a.utilized, 0);
  const totalRemaining = totalAnnual - totalUtilized;
  const totalUtilization = Math.round((totalUtilized / totalAnnual) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Car className="w-7 h-7 text-accent" />
          Transport & Mobility
        </h1>
        <p className="text-muted-foreground mt-1">
          Fuel, car allowance, and annual flight tickets
        </p>
      </div>

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

      {/* How It Works */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Car className="w-5 h-5 text-accent" />
            How Your Transport Benefits Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">1</div>
              <div>
                <p className="font-medium text-sm">Automatic Credit</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fuel and car allowances are <span className="font-semibold text-accent">auto-credited</span> to your salary monthly
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">2</div>
              <div>
                <p className="font-medium text-sm">Flight Booking</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Book annual tickets through the approved travel portal or HR
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">3</div>
              <div>
                <p className="font-medium text-sm">Family Included</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Flight tickets cover you and your registered dependents
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allowance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {allowances.map((allowance) => {
          const remaining = allowance.annual - allowance.utilized;
          const utilization = Math.round((allowance.utilized / allowance.annual) * 100);

          return (
            <Card key={allowance.name} className="benefit-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-display flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <allowance.icon className="w-5 h-5 text-accent" />
                  </div>
                  {allowance.name}
                </CardTitle>
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">How to Use Your Transport Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Fuel className="w-4 h-4 text-accent" />
                Fuel Allowance
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatically credited to your salary each month. No action required.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Car className="w-4 h-4 text-accent" />
                Car Allowance
              </h4>
              <p className="text-sm text-muted-foreground">
                Submit car lease/loan documents to HR for monthly credit, or request lump sum for purchase.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Plane className="w-4 h-4 text-accent" />
                Flight Tickets
              </h4>
              <p className="text-sm text-muted-foreground">
                Book through the approved travel portal or contact HR for travel agent details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Policy Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Fuel allowance paid monthly with salary
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Car allowance for Grade 5+ employees
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Annual tickets to home country for family
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Business class available for Grade 8+
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Unused ticket allowance non-encashable
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Advance booking recommended for best fares
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* View Full Policy */}
      <div className="text-center">
        <Button variant="outline">View Full Transport Policy</Button>
      </div>
    </div>
  );
}
