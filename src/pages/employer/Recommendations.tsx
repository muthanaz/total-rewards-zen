import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, Users, DollarSign, MessageSquare, Target, ArrowRight, CheckCircle } from 'lucide-react';
import { formatCurrencyAED, formatInteger } from '@/lib/utils';
import { EmployerGlobalFiltersBar } from '@/components/employer';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'utilization' | 'cost' | 'engagement' | 'policy';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  affectedEmployees?: number;
  action: string;
  rationale: string;
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Launch L&D Awareness Campaign',
    description: 'Learning & Development has only 50% utilization. Many employees are unaware of available courses and budget.',
    category: 'utilization',
    impact: 'high',
    effort: 'low',
    potentialSavings: 75000,
    affectedEmployees: 45,
    action: 'Create internal newsletter featuring top courses and success stories',
    rationale: 'Low-effort campaign can increase utilization by 20-30% based on industry benchmarks.',
  },
  {
    id: '2',
    title: 'Simplify Wellbeing Redemption Process',
    description: 'Wellbeing program has complex redemption causing 47% of budget to remain unused.',
    category: 'policy',
    impact: 'high',
    effort: 'medium',
    potentialSavings: 35000,
    affectedEmployees: 60,
    action: 'Implement one-click app-based wellness rewards system',
    rationale: 'Current 5-step process has 60% drop-off. Simplification expected to recover 60% of zombie spend.',
  },
  {
    id: '3',
    title: 'Targeted Comms for Parents',
    description: 'Parents segment has highest utilization (89%). Share best practices with other segments.',
    category: 'engagement',
    impact: 'medium',
    effort: 'low',
    affectedEmployees: 42,
    action: 'Create "Benefits Champion" program with parent employees as advocates',
    rationale: 'Peer-to-peer learning more effective than corporate communications.',
  },
  {
    id: '4',
    title: 'Convert Unused Flight Tickets to Vouchers',
    description: '30% of annual flight ticket allowance unused by single employees without dependents.',
    category: 'cost',
    impact: 'medium',
    effort: 'medium',
    potentialSavings: 60000,
    affectedEmployees: 15,
    action: 'Allow conversion to travel/experience vouchers at 80% value',
    rationale: 'Increases perceived value while reducing zombie spend. Net positive for employer and employee.',
  },
  {
    id: '5',
    title: 'Expand Gym Network Partnership',
    description: 'Current gym partners have limited locations causing 40% non-utilization.',
    category: 'utilization',
    impact: 'medium',
    effort: 'high',
    potentialSavings: 32000,
    affectedEmployees: 32,
    action: 'Negotiate with 3 additional gym chains or add home fitness alternatives',
    rationale: 'Location proximity is #1 factor in gym membership usage.',
  },
  {
    id: '6',
    title: 'Update Health Insurance Policy Documentation',
    description: 'Health policy has 72% clarity score with 8 employee questions monthly.',
    category: 'policy',
    impact: 'medium',
    effort: 'low',
    affectedEmployees: 130,
    action: 'Add FAQ section, flowcharts for pre-approval, and video explainers',
    rationale: 'Reduce HR ticket volume by 50% and improve employee satisfaction.',
  },
  {
    id: '7',
    title: 'Renegotiate Underused Add-on Benefits',
    description: 'Paid add-ons like executive health screening have <30% uptake.',
    category: 'cost',
    impact: 'high',
    effort: 'high',
    potentialSavings: 45000,
    action: 'Renegotiate contracts or convert to opt-in with company matching',
    rationale: 'Current blanket coverage is inefficient. Opt-in model aligns cost with actual demand.',
  },
];

export default function RecommendationsPage() {
  const totalPotentialSavings = recommendations
    .filter(r => r.potentialSavings)
    .reduce((sum, r) => sum + (r.potentialSavings || 0), 0);

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Medium Impact</Badge>;
      case 'low':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Low Impact</Badge>;
      default:
        return null;
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low':
        return <Badge variant="outline" className="border-green-500/50 text-green-600">Quick Win</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-600">Some Effort</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-red-500/50 text-red-500">Major Project</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'utilization':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'cost':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'engagement':
        return <Users className="h-5 w-5 text-accent" />;
      case 'policy':
        return <MessageSquare className="h-5 w-5 text-chart-2" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Lightbulb className="h-8 w-8 text-accent" />
          <h1 className="text-2xl font-display font-bold text-foreground">Recommendations</h1>
        </div>
        <p className="text-muted-foreground mt-1">Data-driven suggestions to optimize your benefits program</p>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{recommendations.length}</p>
                <p className="text-sm text-muted-foreground">Active Recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrencyAED(totalPotentialSavings)}</p>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Quick Wins Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">High Impact Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Matrix */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Priority Matrix</CardTitle>
          <CardDescription>Recommendations sorted by impact vs effort</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Quick Wins (High Impact, Low Effort)
              </h3>
              <div className="space-y-2">
                {recommendations.filter(r => r.impact === 'high' && r.effort === 'low').map(r => (
                  <div key={r.id} className="text-sm p-2 bg-background rounded">
                    {r.title}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <h3 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Major Projects (High Impact, High Effort)
              </h3>
              <div className="space-y-2">
                {recommendations.filter(r => r.impact === 'high' && r.effort === 'high').map(r => (
                  <div key={r.id} className="text-sm p-2 bg-background rounded">
                    {r.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">All Recommendations</CardTitle>
          <CardDescription>Actionable insights based on your benefits data (demo logic)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-muted/50">
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        {getImpactBadge(rec.impact)}
                        {getEffortBadge(rec.effort)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                        {rec.potentialSavings && (
                          <div>
                            <p className="text-muted-foreground">Potential Savings</p>
                            <p className="font-medium text-green-600">{formatCurrencyAED(rec.potentialSavings, { abbreviate: false })}</p>
                          </div>
                        )}
                        {rec.affectedEmployees && (
                          <div>
                            <p className="text-muted-foreground">Affected Employees</p>
                            <p className="font-medium">{rec.affectedEmployees}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p className="font-medium capitalize">{rec.category}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                        <p className="text-sm">
                          <span className="font-medium text-accent">Recommended Action: </span>
                          {rec.action}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Rationale: </span>
                          {rec.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="shrink-0">
                    Take Action
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
