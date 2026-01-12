import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Slider } from '@/components/ui/slider';
import { PiggyBank, TrendingUp, Wallet, Target, Calculator, CheckCircle } from 'lucide-react';

const MONTHLY_SALARY = 35000;
const EMPLOYER_MATCH_PERCENT = 5;

export default function FinancialPage() {
  const [savingsPercent, setSavingsPercent] = useState([10]);
  
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  const monthlySavings = Math.round(MONTHLY_SALARY * (savingsPercent[0] / 100));
  const employerMatch = Math.round(MONTHLY_SALARY * (Math.min(savingsPercent[0], EMPLOYER_MATCH_PERCENT) / 100));
  const totalMonthly = monthlySavings + employerMatch;
  const annualSavings = totalMonthly * 12;

  // Demo savings history
  const savingsHistory = [
    { month: 'Jul', employee: 3500, employer: 1750 },
    { month: 'Aug', employee: 3500, employer: 1750 },
    { month: 'Sep', employee: 3500, employer: 1750 },
    { month: 'Oct', employee: 3500, employer: 1750 },
    { month: 'Nov', employee: 3500, employer: 1750 },
    { month: 'Dec', employee: 3500, employer: 1750 },
  ];

  const totalContributed = savingsHistory.reduce((sum, m) => sum + m.employee + m.employer, 0);
  const totalEmployerMatch = savingsHistory.reduce((sum, m) => sum + m.employer, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <PiggyBank className="w-7 h-7 text-accent" />
          Financial Planning
        </h1>
        <p className="text-muted-foreground mt-1">
          Savings plan with employer matching contribution
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Wallet className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Total contributions YTD" dataSource="Savings Plan" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(totalContributed)}</p>
          <p className="stat-label">Total Saved (YTD)</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <TrendingUp className="w-5 h-5 text-success" />
            <InfoTooltip formula="Employer matching up to 5%" dataSource="HR Policy" />
          </div>
          <p className="stat-value mt-3 text-success">{formatCurrency(totalEmployerMatch)}</p>
          <p className="stat-label">Free Money (Match)</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Target className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Your + employer monthly total" dataSource="System" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(totalMonthly)}</p>
          <p className="stat-label">Monthly Total</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <PiggyBank className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Monthly × 12" dataSource="Projection" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(annualSavings)}</p>
          <p className="stat-label">Annual Savings</p>
        </Card>
      </div>

      {/* Savings Calculator */}
      <Card className="bg-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            Savings Calculator (Demo)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Your Contribution</span>
              <span className="text-lg font-bold">{savingsPercent[0]}%</span>
            </div>
            <Slider
              value={savingsPercent}
              onValueChange={setSavingsPercent}
              min={0}
              max={20}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-success">5% (max match)</span>
              <span>20%</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground mb-1">Your Monthly</p>
              <p className="text-xl font-bold">{formatCurrency(monthlySavings)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground mb-1">Employer Match</p>
              <p className="text-xl font-bold text-success">+{formatCurrency(employerMatch)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground mb-1">Total Monthly</p>
              <p className="text-xl font-bold text-accent">{formatCurrency(totalMonthly)}</p>
            </div>
          </div>

          {savingsPercent[0] < 5 && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
              <p className="text-warning font-medium">💡 Tip: Increase to 5% to get the full employer match!</p>
              <p className="text-muted-foreground mt-1">You're leaving {formatCurrency((5 - savingsPercent[0]) / 100 * MONTHLY_SALARY)} of free money on the table each month.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contribution History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Contribution History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium">Month</th>
                  <th className="text-right py-3 px-2 font-medium">Your Contribution</th>
                  <th className="text-right py-3 px-2 font-medium">Employer Match</th>
                  <th className="text-right py-3 px-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {savingsHistory.map((month) => (
                  <tr key={month.month} className="border-b border-border/50">
                    <td className="py-3 px-2">{month.month} 2025</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(month.employee)}</td>
                    <td className="py-3 px-2 text-right text-success">+{formatCurrency(month.employer)}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatCurrency(month.employee + month.employer)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50">
                  <td className="py-3 px-2 font-medium">Total</td>
                  <td className="py-3 px-2 text-right font-medium">{formatCurrency(savingsHistory.reduce((s, m) => s + m.employee, 0))}</td>
                  <td className="py-3 px-2 text-right font-medium text-success">+{formatCurrency(totalEmployerMatch)}</td>
                  <td className="py-3 px-2 text-right font-bold">{formatCurrency(totalContributed)}</td>
                </tr>
              </tfoot>
            </table>
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
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              5% employer match on your contributions
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Multiple fund options (conservative to aggressive)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Quarterly rebalancing available
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Vesting: 2 years for full employer match
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Withdrawal allowed after 1 year (conditions apply)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Tax-efficient structure
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* View Full Policy */}
      <div className="text-center">
        <Button variant="outline">View Full Savings Plan Policy</Button>
      </div>
    </div>
  );
}
