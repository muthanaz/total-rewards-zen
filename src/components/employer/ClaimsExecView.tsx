import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrencyAED, formatInteger } from '@/lib/utils';
import { DemoDataGate, DemoModeBadge } from '@/components/shared/DemoDataGate';
import { useDemoMode } from '@/contexts/DemoModeContext';

// Demo data for executive summary (only shown in demo mode)
const DEMO_CLAIMS_SUMMARY = {
  totalPending: 12,
  avgProcessingDays: 2.3,
  slaCompliance: 94,
  totalValuePending: 45000,
  approvalRate: 87,
  rejectionRate: 13,
};

const DEMO_CATEGORY_BREAKDOWN = [
  { category: 'Health Insurance', count: 45, value: 125000, trend: 12 },
  { category: 'Learning & Development', count: 32, value: 89000, trend: -5 },
  { category: 'Transport', count: 28, value: 42000, trend: 8 },
  { category: 'Wellbeing', count: 22, value: 35000, trend: 15 },
  { category: 'Housing', count: 18, value: 156000, trend: 3 },
];

const DEMO_BOTTLENECKS = [
  { issue: 'Missing documentation', count: 5, avgDelay: 3.2 },
  { issue: 'Awaiting manager approval', count: 4, avgDelay: 2.1 },
  { issue: 'Policy clarification needed', count: 3, avgDelay: 4.5 },
];

export function ClaimsExecView() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  
  // In non-demo mode with no real data, show zero state
  const claimsSummary = isDemoMode ? DEMO_CLAIMS_SUMMARY : null;
  const categoryBreakdown = isDemoMode ? DEMO_CATEGORY_BREAKDOWN : [];
  const bottlenecks = isDemoMode ? DEMO_BOTTLENECKS : [];
  
  if (!claimsSummary) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Claims Overview</h1>
            <p className="text-muted-foreground">Strategic view of claims processing and bottlenecks</p>
          </div>
        </div>
        <DemoDataGate 
          dataType="claims"
          action={{
            label: 'Configure Claims Integration',
            onClick: () => navigate('/employer/integrations?tab=connections'),
          }}
        >
          <div />
        </DemoDataGate>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Claims Overview</h1>
            <p className="text-muted-foreground">Strategic view of claims processing and bottlenecks</p>
          </div>
          <DemoModeBadge />
        </div>
        <Button variant="outline" asChild className="gap-2">
          <Link to="/employer/claims?view=ops">
            <Eye className="w-4 h-4" />
            View Operational Queue
          </Link>
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Claims</p>
                <p className="text-2xl font-bold">{claimsSummary.totalPending}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrencyAED(claimsSummary.totalValuePending)} value
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">{claimsSummary.avgProcessingDays} days</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600">0.5 days faster</span>
                </div>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold text-emerald-600">{claimsSummary.slaCompliance}%</p>
                <Progress value={claimsSummary.slaCompliance} className="h-1.5 mt-2 w-24" />
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">{claimsSummary.approvalRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {claimsSummary.rejectionRate}% rejected
                </p>
              </div>
              <div className="flex gap-1">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown & Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Claims by Category</CardTitle>
            <CardDescription>Volume and value distribution this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((cat, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{cat.count} claims</span>
                        {cat.trend > 0 ? (
                          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-0">
                            <TrendingUp className="w-3 h-3 mr-1" />+{cat.trend}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-0">
                            <TrendingDown className="w-3 h-3 mr-1" />{cat.trend}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrencyAED(cat.value)} total value
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottlenecks */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Processing Bottlenecks
            </CardTitle>
            <CardDescription>Issues causing delays in claim processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottlenecks.map((bottleneck, index) => (
                <div key={index} className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{bottleneck.issue}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {bottleneck.count} claims affected • Avg delay: {bottleneck.avgDelay} days
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                      Action Needed
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Resolving these bottlenecks could reduce average processing time by 1.2 days.
                </p>
                <Button variant="outline" className="w-full gap-2">
                  View Recommendations
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What Changed Section */}
      <Card className="card-elevated border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">What Changed This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-emerald-600">Improved</span>
              </div>
              <p className="text-sm">Health claims processing down from 3.1 to 2.3 days average</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-amber-600">Needs Attention</span>
              </div>
              <p className="text-sm">L&D claims rejection rate increased to 18% due to policy confusion</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">Opportunity</span>
              </div>
              <p className="text-sm">15 claims could be auto-approved based on risk profile</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
