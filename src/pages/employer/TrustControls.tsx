/**
 * TrustControls Page
 * 
 * Executive view for Trust & Controls - data sources, confidence levels,
 * and integration health for informed decision-making.
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Clock,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { formatPercent } from '@/lib/utils';
import { DemoDataGate, DemoModeBadge } from '@/components/shared/DemoDataGate';
import { useDemoMode } from '@/contexts/DemoModeContext';

// Demo data for trust metrics
const DEMO_DATA_SOURCES = [
  { 
    name: 'HRIS (Workday)', 
    status: 'connected' as const, 
    coverage: 98, 
    lastSync: '2 hours ago',
    recordCount: 1247,
  },
  { 
    name: 'Payroll System', 
    status: 'connected' as const, 
    coverage: 100, 
    lastSync: '4 hours ago',
    recordCount: 1247,
  },
  { 
    name: 'Benefits Provider', 
    status: 'partial' as const, 
    coverage: 76, 
    lastSync: '1 day ago',
    recordCount: 948,
  },
  { 
    name: 'Claims TPA', 
    status: 'connected' as const, 
    coverage: 94, 
    lastSync: '30 mins ago',
    recordCount: 3421,
  },
  { 
    name: 'Marketplace Vendors', 
    status: 'disconnected' as const, 
    coverage: 0, 
    lastSync: 'Never',
    recordCount: 0,
  },
];

const DEMO_CONFIDENCE_METRICS = {
  overallConfidence: 82,
  highConfidenceMetrics: 18,
  mediumConfidenceMetrics: 7,
  lowConfidenceMetrics: 3,
  dataFreshness: 94,
  coverageScore: 86,
};

const STATUS_CONFIG = {
  connected: { 
    icon: CheckCircle2, 
    color: 'text-success', 
    bg: 'bg-success/10',
    label: 'Connected',
  },
  partial: { 
    icon: AlertTriangle, 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    label: 'Partial',
  },
  disconnected: { 
    icon: XCircle, 
    color: 'text-destructive', 
    bg: 'bg-destructive/10',
    label: 'Not Connected',
  },
};

export default function TrustControlsPage() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();

  const dataSources = isDemoMode ? DEMO_DATA_SOURCES : [];
  const confidenceMetrics = isDemoMode ? DEMO_CONFIDENCE_METRICS : null;

  if (!confidenceMetrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Trust & Controls</h1>
          <p className="text-muted-foreground">Data sources, confidence levels, and integration health</p>
        </div>
        <DemoDataGate 
          dataType="integration"
          action={{
            label: 'Configure Integrations',
            onClick: () => navigate('/employer/integrations'),
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
            <h1 className="text-2xl font-display font-bold text-foreground">Trust & Controls</h1>
            <p className="text-muted-foreground">Data sources, confidence levels, and integration health</p>
          </div>
          <DemoModeBadge />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/employer/integrations')}>
          <Database className="w-4 h-4" />
          Manage Integrations
        </Button>
      </div>

      {/* Confidence Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Confidence</p>
                <p className="text-2xl font-bold">{confidenceMetrics.overallConfidence}%</p>
                <Progress value={confidenceMetrics.overallConfidence} className="h-1.5 mt-2 w-24" />
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Freshness</p>
                <p className="text-2xl font-bold text-success">{confidenceMetrics.dataFreshness}%</p>
                <p className="text-xs text-muted-foreground mt-1">Updated recently</p>
              </div>
              <Clock className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coverage Score</p>
                <p className="text-2xl font-bold">{confidenceMetrics.coverageScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">Of employees tracked</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Metric Quality</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                    {confidenceMetrics.highConfidenceMetrics} High
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                    {confidenceMetrics.mediumConfidenceMetrics} Med
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                    {confidenceMetrics.lowConfidenceMetrics} Low
                  </Badge>
                </div>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Connected Data Sources
          </CardTitle>
          <CardDescription>Integration status and data coverage from each source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataSources.map((source, idx) => {
              const config = STATUS_CONFIG[source.status];
              const StatusIcon = config.icon;
              
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.recordCount.toLocaleString()} records • Last sync: {source.lastSync}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPercent(source.coverage)}</p>
                      <p className="text-xs text-muted-foreground">Coverage</p>
                    </div>
                    <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
                      {config.label}
                    </Badge>
                    {source.status !== 'disconnected' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {dataSources.filter(s => s.status === 'connected').length} of {dataSources.length} sources fully connected
            </p>
            <Button variant="outline" className="gap-2" onClick={() => navigate('/employer/integrations')}>
              <ExternalLink className="w-4 h-4" />
              View All Integrations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* What This Means */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">What This Means for Your Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="font-medium text-success">High Confidence</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Spend efficiency, headcount, and claims data are reliable for strategic decisions.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-medium text-warning">Use With Caution</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Benefits utilization has 76% coverage. Some employee segments may be underrepresented.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="font-medium text-destructive">Not Available</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Marketplace analytics require vendor integration. Connect vendors to unlock savings insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
