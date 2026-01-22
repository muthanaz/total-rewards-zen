import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { TrendingUp, Calendar, DollarSign, CheckCircle, Clock, Award, Gem } from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';

const TOTAL_SHARES = 5000;
const VESTED_SHARES = 2500;
const SHARE_PRICE = 12.50; // Demo share price

const vestingSchedule = [
  { date: 'Jan 2024', shares: 1250, status: 'vested' },
  { date: 'Jul 2024', shares: 1250, status: 'vested' },
  { date: 'Jan 2025', shares: 1250, status: 'upcoming' },
  { date: 'Jul 2025', shares: 1250, status: 'future' },
];

const grants = [
  { type: 'Initial Grant', date: 'Jan 2023', shares: 4000, cliff: '1 year', vesting: '4 years' },
  { type: 'Performance Grant', date: 'Jan 2024', shares: 1000, cliff: '6 months', vesting: '2 years' },
];

export default function EquityPage() {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });
  const vestedValue = VESTED_SHARES * SHARE_PRICE;
  const totalValue = TOTAL_SHARES * SHARE_PRICE;
  const vestedPercent = Math.round((VESTED_SHARES / TOTAL_SHARES) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-accent" />
          Equity & Share Options
        </h1>
        <p className="text-muted-foreground mt-1">
          Your ownership stake in the company
        </p>
      </div>

      {/* Summary Cards with SummaryStatsCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatsCard
          variant="primary"
          label="Total Shares"
          value={TOTAL_SHARES.toLocaleString()}
          icon={Award}
          formula="Sum of all share grants"
          dataSource="Equity System"
          index={0}
        />
        <SummaryStatsCard
          variant="utilized"
          label="Vested Shares"
          value={VESTED_SHARES.toLocaleString()}
          icon={CheckCircle}
          formula="Shares past vesting date"
          dataSource="Equity System"
          index={1}
        />
        <SummaryStatsCard
          variant="remaining"
          label="Vested Value"
          value={formatCurrency(vestedValue)}
          icon={DollarSign}
          formula="Vested × share price"
          dataSource="Latest Valuation"
          index={2}
        />
        <SummaryStatsCard
          variant="info"
          label="Total Value"
          value={formatCurrency(totalValue)}
          icon={Gem}
          formula="Total × share price"
          dataSource="Latest Valuation"
          index={3}
        />
      </div>

      {/* Vesting Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Vesting Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{vestedPercent}% vested</span>
            <span className="font-medium">{VESTED_SHARES.toLocaleString()} / {TOTAL_SHARES.toLocaleString()} shares</span>
          </div>
          <Progress value={vestedPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Vesting Schedule Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Vesting Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6 pl-12">
              {vestingSchedule.map((event, i) => (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[30px] w-4 h-4 rounded-full border-2 ${
                    event.status === 'vested' 
                      ? 'bg-success border-success' 
                      : event.status === 'upcoming'
                        ? 'bg-warning border-warning'
                        : 'bg-muted border-border'
                  }`} />
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
                    <div>
                      <p className="font-medium">{event.date}</p>
                      <p className="text-sm text-muted-foreground">{event.shares.toLocaleString()} shares</p>
                    </div>
                    <Badge className={
                      event.status === 'vested' 
                        ? 'bg-success/10 text-success border-0'
                        : event.status === 'upcoming'
                          ? 'bg-warning/10 text-warning border-0'
                          : 'bg-muted text-muted-foreground border-0'
                    }>
                      {event.status === 'vested' ? 'Vested' : event.status === 'upcoming' ? 'Upcoming' : 'Future'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grant Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Your Grants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grants.map((grant, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{grant.type}</h4>
                    <p className="text-sm text-muted-foreground">Granted: {grant.date}</p>
                  </div>
                  <Badge variant="secondary">{grant.shares.toLocaleString()} shares</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cliff Period</span>
                    <p className="font-medium">{grant.cliff}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Vesting</span>
                    <p className="font-medium">{grant.vesting}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">How Equity Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Share options give you the right to buy company shares
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Vesting happens over time (usually 4 years)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Cliff period: first vesting only after 1 year
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Exercise window: 90 days after leaving
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Value realized at exit event (IPO, acquisition)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Tax implications: consult a financial advisor
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* View Full Policy */}
      <div className="text-center">
        <Button variant="outline">View Full Equity Plan</Button>
      </div>
    </div>
  );
}
