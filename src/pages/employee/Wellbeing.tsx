import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Dumbbell, Heart, Brain, Leaf, Moon, CheckCircle, ExternalLink } from 'lucide-react';

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

export default function WellbeingPage() {
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;
  const remaining = ANNUAL_VALUE - UTILIZED;
  const utilizationPercent = Math.round((UTILIZED / ANNUAL_VALUE) * 100);

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
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Dumbbell className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Total wellbeing budget" dataSource="HR Policy" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(ANNUAL_VALUE)}</p>
          <p className="stat-label">Annual Value</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Dumbbell className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Active subscriptions value" dataSource="Benefits System" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(UTILIZED)}</p>
          <p className="stat-label">Utilized</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Dumbbell className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Annual - Utilized" dataSource="System" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(remaining)}</p>
          <p className="stat-label">Available</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Dumbbell className="w-5 h-5 text-accent" />
            <InfoTooltip formula="(Utilized / Annual) × 100" dataSource="System" />
          </div>
          <p className="stat-value mt-3">{utilizationPercent}%</p>
          <p className="stat-label">Utilization</p>
          <Progress value={utilizationPercent} className="h-2 mt-2" />
        </Card>
      </div>

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

      {/* Policy Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Policy Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              AED 6,000 annual wellbeing budget
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Gym membership fully covered
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Mental health support is confidential
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Can mix and match programs
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Unused budget doesn't roll over
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Family members may join gym (extra cost)
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* View Full Policy */}
      <div className="text-center">
        <Button variant="outline">View Full Wellbeing Policy</Button>
      </div>
    </div>
  );
}
