import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Database,
  Users,
  FileText,
  TrendingUp,
  Info,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataConfidenceBadge, useDataCoverageMetrics } from '@/components/employer';

const dataConfidenceSummary = {
  overall: 78,
  employeeProfiles: 95,
  entitlements: 82,
  policies: 70,
  claims: 65,
};

const dataSources = [
  { name: 'HRIS (SAP)', status: 'connected', lastSync: '2 hours ago', coverage: 95 },
  { name: 'Payroll System', status: 'connected', lastSync: '1 day ago', coverage: 88 },
  { name: 'Benefits Platform', status: 'connected', lastSync: '30 mins ago', coverage: 92 },
  { name: 'Claims System', status: 'partial', lastSync: '3 days ago', coverage: 65 },
];

const insightLimitations = [
  {
    metric: 'Retention Impact',
    confidence: 'low',
    reason: 'Exit interview data not integrated',
    suggestion: 'Connect HR exit survey system'
  },
  {
    metric: 'Market Competitiveness',
    confidence: 'medium',
    reason: 'Only 3 of 5 benchmark sources active',
    suggestion: 'Add industry-specific salary data'
  },
  {
    metric: 'Employee Satisfaction',
    confidence: 'low',
    reason: 'Survey response rate below 30%',
    suggestion: 'Launch engagement campaign'
  },
];

export function IntegrationsExecView() {
  const coverageMetrics = useDataCoverageMetrics();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Data Confidence</h1>
          <p className="text-muted-foreground">Understand the reliability of your analytics insights</p>
        </div>
        <Button variant="outline" asChild className="gap-2">
          <Link to="/employer/integrations?view=ops">
            <Database className="w-4 h-4" />
            Manage Integrations
          </Link>
        </Button>
      </div>

      {/* Overall Confidence */}
      <Card className="card-elevated border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{dataConfidenceSummary.overall}%</p>
                    <p className="text-xs text-muted-foreground">Overall</p>
                  </div>
                </div>
                <Shield className="absolute -top-1 -right-1 w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Employees</span>
                </div>
                <p className="text-xl font-bold">{dataConfidenceSummary.employeeProfiles}%</p>
                <Progress value={dataConfidenceSummary.employeeProfiles} className="h-1.5 mt-1" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Entitlements</span>
                </div>
                <p className="text-xl font-bold">{dataConfidenceSummary.entitlements}%</p>
                <Progress value={dataConfidenceSummary.entitlements} className="h-1.5 mt-1" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Policies</span>
                </div>
                <p className="text-xl font-bold text-amber-600">{dataConfidenceSummary.policies}%</p>
                <Progress value={dataConfidenceSummary.policies} className="h-1.5 mt-1" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Claims</span>
                </div>
                <p className="text-xl font-bold text-amber-600">{dataConfidenceSummary.claims}%</p>
                <Progress value={dataConfidenceSummary.claims} className="h-1.5 mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Sources Health */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Data Sources</CardTitle>
            <CardDescription>Connection status and data freshness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {source.status === 'connected' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{source.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {source.lastSync}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${source.coverage >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {source.coverage}%
                    </p>
                    <p className="text-xs text-muted-foreground">coverage</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Why Insights May Be Incomplete */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-500" />
              Why Some Insights May Be Incomplete
            </CardTitle>
            <CardDescription>Data gaps affecting analytics quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insightLimitations.map((limitation, index) => (
                <div key={index} className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">{limitation.metric}</span>
                    <Badge 
                      variant="outline" 
                      className={limitation.confidence === 'low' 
                        ? 'bg-red-500/10 text-red-600 border-0' 
                        : 'bg-amber-500/10 text-amber-600 border-0'
                      }
                    >
                      {limitation.confidence} confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{limitation.reason}</p>
                  <p className="text-xs text-primary font-medium">
                    → {limitation.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="card-elevated bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Improve Your Data Confidence</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Adding 2 more data sources could increase your overall confidence to 90%+
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link to="/employer/integrations?tab=import">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
