/**
 * Data Quality & Controls Page
 * 
 * Executive-trust view: Data Readiness Score, top failing rules, impacted KPIs, fix guidance.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ShieldCheck,
  Database,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Settings,
  BarChart3,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DemoModeBadge } from '@/components/shared/DemoDataGate';
import { DataTrustPanel } from '@/components/trust';
import {
  DataReadinessScoreCard, 
  FailingRulesPanel,
  MOCK_DATA_READINESS,
  MOCK_DATA_QUALITY_RULES,
  MOCK_INTEGRATIONS,
} from '@/components/employer/integrations';
import type { DataQualityRule } from '@/components/employer/integrations/types';

export default function DataQualityControls() {
  const [rules, setRules] = useState<DataQualityRule[]>(MOCK_DATA_QUALITY_RULES);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const stats = {
    totalRules: rules.length,
    passingRules: rules.filter(r => r.status === 'passing').length,
    failingRules: rules.filter(r => r.status === 'failing').length,
    warningRules: rules.filter(r => r.status === 'warning').length,
    totalViolations: rules.reduce((sum, r) => sum + r.violationCount, 0),
    criticalViolations: rules
      .filter(r => r.severity === 'critical' && r.status === 'failing')
      .reduce((sum, r) => sum + r.violationCount, 0),
  };

  const complianceRate = Math.round((stats.passingRules / stats.totalRules) * 100);

  const handleAutoFix = async (ruleId: string) => {
    toast.info('Running auto-fix...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRules(prev => prev.map(r => 
      r.id === ruleId 
        ? { ...r, status: 'passing', violationCount: 0, lastChecked: new Date() }
        : r
    ));
    
    toast.success('Auto-fix completed successfully');
  };

  const handleRunAllRules = async () => {
    setIsRunningAll(true);
    toast.info('Running all data quality checks...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRunningAll(false);
    toast.success('All rules checked', { description: `${stats.failingRules} issues found` });
  };

  // Calculate impacted dashboards from failing rules
  const impactedDashboards = new Map<string, { name: string; path: string; impactCount: number; confidenceReduction: number }>();
  rules
    .filter(r => r.status === 'failing' || r.status === 'warning')
    .forEach(rule => {
      rule.impactedKPIs.forEach(kpi => {
        const existing = impactedDashboards.get(kpi.dashboardPath);
        if (existing) {
          existing.impactCount++;
          existing.confidenceReduction += kpi.confidenceReduction;
        } else {
          impactedDashboards.set(kpi.dashboardPath, {
            name: kpi.dashboardPath.split('/').pop()?.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) || 'Dashboard',
            path: kpi.dashboardPath,
            impactCount: 1,
            confidenceReduction: kpi.confidenceReduction,
          });
        }
      });
    });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Data Quality & Controls</h1>
            <p className="text-muted-foreground">Monitor data readiness, validation rules, and dashboard confidence</p>
          </div>
          <DemoModeBadge />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleRunAllRules}
            disabled={isRunningAll}
          >
            <RefreshCw className={cn('w-4 h-4', isRunningAll && 'animate-spin')} />
            {isRunningAll ? 'Checking...' : 'Run All Checks'}
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/employer/integrations?view=ops">
              <Settings className="w-4 h-4" />
              Manage Integrations
            </Link>
          </Button>
        </div>
      </div>

      {/* DATA TRUST PANEL */}
      <DataTrustPanel pageName="data-quality" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRules}</p>
                <p className="text-xs text-muted-foreground">Total Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{stats.passingRules}</p>
                <p className="text-xs text-muted-foreground">Passing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.failingRules}</p>
                <p className="text-xs text-muted-foreground">Failing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalViolations}</p>
                <p className="text-xs text-muted-foreground">Total Violations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{complianceRate}%</p>
                <p className="text-xs text-muted-foreground">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Readiness Score */}
        <DataReadinessScoreCard score={MOCK_DATA_READINESS} />

        {/* Center: Failing Rules */}
        <div className="lg:col-span-2">
          <FailingRulesPanel 
            rules={rules} 
            maxRules={5}
            onAutoFix={handleAutoFix}
          />
        </div>
      </div>

      {/* Impacted Dashboards */}
      {impactedDashboards.size > 0 && (
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-warning" />
              Dashboard Confidence Impact
            </CardTitle>
            <CardDescription>
              Data quality issues are affecting the following dashboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from(impactedDashboards.values()).map((dash) => (
                <Link
                  key={dash.path}
                  to={dash.path}
                  className="p-4 rounded-lg border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm capitalize">{dash.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px]">
                      -{dash.confidenceReduction}% confidence
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {dash.impactCount} issue{dash.impactCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Health Summary */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Data Source Health
              </CardTitle>
              <CardDescription>
                Integration status affecting data quality
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/employer/integrations" className="gap-2">
                View All
                <ExternalLink className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {MOCK_INTEGRATIONS.map((integration) => (
              <div 
                key={integration.id}
                className={cn(
                  'p-3 rounded-lg border',
                  integration.status === 'healthy' && 'border-success/20 bg-success/5',
                  integration.status === 'degraded' && 'border-warning/20 bg-warning/5',
                  integration.status === 'disconnected' && 'border-destructive/20 bg-destructive/5',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">{integration.name.split(' ')[0]}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-[10px]',
                      integration.status === 'healthy' && 'bg-success/10 text-success border-success/20',
                      integration.status === 'degraded' && 'bg-warning/10 text-warning border-warning/20',
                      integration.status === 'disconnected' && 'bg-destructive/10 text-destructive border-destructive/20',
                    )}
                  >
                    {integration.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={integration.coverage} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground tabular-nums">{integration.coverage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
