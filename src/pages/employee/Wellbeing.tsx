import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PolicyHighlightsCard } from '@/components/employee/PolicyHighlightsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { BenefitCrossLinks } from '@/components/employee/BenefitCrossLinks';
import { formatCurrencyAED, formatPercent } from '@/lib/utils';
import { Dumbbell, Heart, Brain, Leaf, Moon, CheckCircle, ExternalLink, Wallet, TrendingDown, Percent } from 'lucide-react';

const ANNUAL_VALUE = 6000;
const UTILIZED = 3200;

const programs = [
  {
    name: 'Gym Membership',
    icon: Dumbbell,
    value: 3600,
    status: 'active',
    description: 'Premium gym access at partner facilities',
    features: ['Fitness First, GymNation, or Fitness 360', 'Unlimited access', 'Group classes included'],
  },
  {
    name: 'Wellness App',
    icon: Heart,
    value: 600,
    status: 'active',
    description: 'Mental and physical wellness app subscription',
    features: ['Calm or Headspace premium', 'Sleep stories', 'Meditation courses'],
  },
  {
    name: 'Mental Health Support',
    icon: Brain,
    value: 1200,
    status: 'available',
    description: 'Confidential counseling sessions',
    features: ['6 sessions per year', 'In-person or virtual', 'Licensed therapists'],
  },
  {
    name: 'Nutrition Consultation',
    icon: Leaf,
    value: 600,
    status: 'available',
    description: 'Personalized nutrition planning',
    features: ['Initial assessment', '3 follow-up sessions', 'Meal planning support'],
  },
];

const tips = [
  { icon: Moon, title: 'Sleep Better', tip: 'Use the Calm app sleep stories to improve your sleep quality.' },
  { icon: Dumbbell, title: 'Stay Active', tip: 'Try the new yoga classes at Fitness First - included in your membership.' },
  { icon: Brain, title: 'Mental Health', tip: 'Book a counseling session if you need support. It\'s confidential.' },
];

const wellbeingPolicies = [
  'AED 6,000 annual wellbeing budget',
  'Gym membership fully covered',
  'Mental health support is confidential',
  'Can mix and match programs',
  'Unused budget doesn\'t roll over',
  'Family members may join gym (extra cost)',
];

export default function WellbeingPage() {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });
  const remaining = ANNUAL_VALUE - UTILIZED;
  const utilizationPercent = Math.round((UTILIZED / ANNUAL_VALUE) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Using PageHeader pattern */}
      <PageHeader
        title="Wellbeing Program"
        description="Your health and wellness benefits for mind and body"
        icon={Dumbbell}
        iconClassName="from-chart-6 to-chart-6/80 shadow-chart-6/25"
      />

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStatsCard
          icon={Dumbbell}
          value={formatCurrency(ANNUAL_VALUE)}
          label="Annual Value"
          formula="Total wellbeing budget"
          dataSource="HR Policy"
          variant="primary"
        />
        <SummaryStatsCard
          icon={Wallet}
          value={formatCurrency(UTILIZED)}
          label="Utilized"
          formula="Active subscriptions value"
          dataSource="Benefits System"
          variant="utilized"
        />
        <SummaryStatsCard
          icon={TrendingDown}
          value={formatCurrency(remaining)}
          label="Available"
          formula="Annual - Utilized"
          dataSource="System"
          variant="remaining"
        />
        <SummaryStatsCard
          icon={Percent}
          value={`${utilizationPercent}%`}
          label="Utilization"
          formula="(Utilized / Annual) × 100"
          dataSource="System"
          variant="utilization"
          progress={utilizationPercent}
        />
      </div>

      {/* 2. Policy Highlights - Tips integrated */}
      <PolicyHighlightsCard
        title="Wellbeing Policy Highlights"
        policies={[
          ...wellbeingPolicies,
          '💡 Mix & match programs up to your total budget',
          '🔒 Mental health sessions are 100% confidential',
        ]}
        category="Wellbeing"
        actionLabel="Submit Claim"
        policyLabel="View Full Policy"
      />

      {/* 3. How It Works */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-accent" />
            How Your Wellbeing Program Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">1</div>
              <div>
                <p className="font-medium text-sm">Choose Programs</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Activate any combination of programs up to your <span className="font-semibold text-accent">AED 6,000</span> budget
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">2</div>
              <div>
                <p className="font-medium text-sm">Instant Access</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Once activated, access your programs immediately via app or partner locations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">3</div>
              <div>
                <p className="font-medium text-sm">Confidential Support</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mental health sessions are 100% confidential — employer sees only utilization
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-links */}
      <BenefitCrossLinks benefitCategory="Wellbeing" showClaimLink={false} />

      {/* Programs Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {programs.map((program) => (
          <Card key={program.name} className="benefit-card">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-display flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <program.icon className="w-5 h-5 text-accent" />
                  </div>
                  {program.name}
                </CardTitle>
                <Badge className={program.status === 'active' ? 'bg-success/10 text-success border-0' : 'bg-muted text-muted-foreground border-0'}>
                  {program.status === 'active' ? 'Active' : 'Available'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{program.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Value</span>
                <span className="font-medium">{formatCurrency(program.value)}/year</span>
              </div>

              <ul className="space-y-1.5">
                {program.features.map((feature, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-success mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                size="sm" 
                variant={program.status === 'active' ? 'outline' : 'default'}
                className="w-full"
              >
                {program.status === 'active' ? (
                  <>
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Access Now
                  </>
                ) : (
                  'Activate'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wellness Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Wellness Tips for You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {tips.map((tip, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50">
                <tip.icon className="w-5 h-5 text-accent mb-2" />
                <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                <p className="text-xs text-muted-foreground">{tip.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
