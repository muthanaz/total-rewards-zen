import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { SubmitClaimButton } from '@/components/employee/SubmitClaimButton';
import { BenefitGuide } from '@/components/employee/BenefitGuide';
import { Dumbbell, Heart, Brain, Leaf, CheckCircle, ExternalLink, Wallet, TrendingDown, Percent } from 'lucide-react';

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

export default function WellbeingPage() {
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;
  const remaining = ANNUAL_VALUE - UTILIZED;
  const utilizationPercent = Math.round((UTILIZED / ANNUAL_VALUE) * 100);

  const guideSteps = [
    {
      title: 'Choose Programs',
      description: 'Activate any combination of programs up to your AED 6,000 budget',
      highlight: 'AED 6,000',
    },
    {
      title: 'Instant Access',
      description: 'Once activated, access your programs immediately via app or partner locations',
    },
    {
      title: 'Confidential Support',
      description: 'Mental health sessions are 100% confidential — employer sees only utilization',
      highlight: '100% confidential',
    },
  ];

  const policyPoints = [
    'AED 6,000 annual wellbeing budget',
    'Gym membership fully covered',
    'Mental health support is confidential',
    'Can mix and match programs',
    'Unused budget does not roll over',
    'Family members may join gym (extra cost)',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Dumbbell className="w-7 h-7 text-accent" />
          Wellbeing Program
        </h1>
        <p className="text-muted-foreground mt-1">
          Your health and wellness benefits for mind and body
        </p>
      </div>

      {/* Summary Cards */}
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

      {/* Comprehensive Benefit Guide */}
      <BenefitGuide
        icon={Dumbbell}
        title="Wellbeing Program Guide"
        steps={guideSteps}
        policyPoints={policyPoints}
        policyButtonText="View Wellbeing Policy"
      />

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

      {/* Actions */}
      <div className="flex items-center justify-center">
        <SubmitClaimButton category="Wellbeing" buttonText="Submit Wellbeing Claim" />
      </div>
    </div>
  );
}
