/**
 * Integration Connection Details Drawer
 * 
 * Shows detailed info for a data source including:
 * - Credentials status, scopes, environment
 * - Field coverage (mapped vs required vs optional)
 * - Impact map showing affected insights
 * - Actions: Test, Sync now, View logs, Fix
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw, Play, 
  Settings, FileText, Wrench, Link2, Shield, Server, Zap, Upload,
  TrendingUp, Ghost, Target, BarChart3, Users, ArrowRight
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { formatInteger, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { IntegrationSource, IntegrationStatus } from '@/hooks/useIntegrationSources';

interface IntegrationConnectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationSource | null;
  onSync: (id: string) => Promise<void>;
  onTest: (id: string) => Promise<{ success: boolean; message: string }>;
  onFix: (id: string) => Promise<void>;
}

// Mock uptime data for sparkline
const generateUptimeData = (status: IntegrationStatus) => {
  const baseUptime = status === 'connected' ? 99 : status === 'degraded' ? 85 : 0;
  return Array.from({ length: 7 }, (_, i) => ({
    day: i,
    uptime: baseUptime + (Math.random() * 3 - 1.5),
  }));
};

// Impact definitions for each integration type
const impactMappings: Record<string, { insight: string; icon: React.ElementType; confidence: 'high' | 'medium' | 'low' }[]> = {
  'hris': [
    { insight: 'Segment Analysis', icon: Users, confidence: 'high' },
    { insight: 'Tenure Metrics', icon: BarChart3, confidence: 'high' },
    { insight: 'Org Structure', icon: Target, confidence: 'medium' },
  ],
  'payroll': [
    { insight: 'Compensation Benchmarks', icon: TrendingUp, confidence: 'high' },
    { insight: 'Cost per Employee', icon: BarChart3, confidence: 'high' },
  ],
  'benefits': [
    { insight: 'Utilization Rates', icon: TrendingUp, confidence: 'high' },
    { insight: 'Coverage Gaps', icon: Target, confidence: 'medium' },
  ],
  'claims': [
    { insight: 'Budget Leakage Accuracy', icon: Ghost, confidence: 'high' },
    { insight: 'Processing Time', icon: Clock, confidence: 'high' },
    { insight: 'Policy Clarity Signals', icon: FileText, confidence: 'medium' },
  ],
  'survey': [
    { insight: 'Retention Impact', icon: Users, confidence: 'high' },
    { insight: 'Satisfaction Score', icon: TrendingUp, confidence: 'high' },
  ],
  'benchmark': [
    { insight: 'Market Competitiveness', icon: TrendingUp, confidence: 'high' },
  ],
};

const confidenceStyles = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function IntegrationConnectionDrawer({
  open,
  onOpenChange,
  integration,
  onSync,
  onTest,
  onFix,
}: IntegrationConnectionDrawerProps) {
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [fixing, setFixing] = useState(false);

  if (!integration) return null;

  const uptimeData = generateUptimeData(integration.status);
  const uptimePercent = integration.status === 'connected' ? 99.2 : integration.status === 'degraded' ? 87.5 : 0;
  const errorRate = integration.status === 'connected' ? 0.1 : integration.status === 'degraded' ? 2.3 : 0;
  
  const mappedRequired = integration.requiredFields.filter(f => f.required && f.mapped).length;
  const totalRequired = integration.requiredFields.filter(f => f.required).length;
  const mappedOptional = integration.requiredFields.filter(f => !f.required && f.mapped).length;
  const totalOptional = integration.requiredFields.filter(f => !f.required).length;
  
  const impacts = impactMappings[integration.type] || [];

  const handleTest = async () => {
    setTesting(true);
    const result = await onTest(integration.id);
    setTesting(false);
    toast[result.success ? 'success' : 'error'](result.success ? 'Connection OK' : 'Connection Failed', {
      description: result.message,
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    await onSync(integration.id);
    setSyncing(false);
    toast.success('Sync Complete', { description: `${integration.name} synchronized` });
  };

  const handleFix = async () => {
    setFixing(true);
    await onFix(integration.id);
    setFixing(false);
    toast.success('Connection Fixed', { description: `${integration.name} restored` });
  };

  const handleViewLogs = () => {
    navigate(`/employer/integrations?tab=history&source=${integration.id}`);
    onOpenChange(false);
  };

  const getMethodIcon = () => {
    switch (integration.connectionMethod) {
      case 'api': return <Zap className="h-4 w-4" />;
      case 'sftp': return <Server className="h-4 w-4" />;
      case 'csv': return <Upload className="h-4 w-4" />;
      default: return <Link2 className="h-4 w-4" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{integration.icon}</span>
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                {integration.name}
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs',
                    integration.status === 'connected' && 'bg-success/10 text-success border-success/30',
                    integration.status === 'degraded' && 'bg-warning/10 text-warning border-warning/30',
                    integration.status === 'not_connected' && 'bg-muted text-muted-foreground'
                  )}
                >
                  {integration.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {integration.status === 'degraded' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {integration.status === 'not_connected' && <XCircle className="h-3 w-3 mr-1" />}
                  {integration.status === 'connected' ? 'Connected' : 
                   integration.status === 'degraded' ? (integration.statusDetail || 'Degraded') : 'Not Connected'}
                </Badge>
              </SheetTitle>
              <SheetDescription>Connection details and data mapping</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Connection Health Row */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Last Sync</p>
                <p className="text-sm font-bold">{integration.lastSync || 'Never'}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Next Sync</p>
                <p className="text-sm font-bold">
                  {integration.status === 'connected' ? 'In 2 hours' : '—'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Uptime (7d)</p>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'text-sm font-bold',
                    uptimePercent >= 99 ? 'text-success' : 
                    uptimePercent >= 90 ? 'text-warning' : 'text-destructive'
                  )}>
                    {uptimePercent.toFixed(1)}%
                  </p>
                  <div className="w-16 h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={uptimeData}>
                        <Line 
                          type="monotone" 
                          dataKey="uptime" 
                          stroke={uptimePercent >= 99 ? 'hsl(160 84% 39%)' : 'hsl(38 92% 50%)'} 
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Error Rate</p>
                <p className={cn(
                  'text-sm font-bold',
                  errorRate < 1 ? 'text-success' : 
                  errorRate < 5 ? 'text-warning' : 'text-destructive'
                )}>
                  {errorRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Connection</TabsTrigger>
              <TabsTrigger value="fields">Field Mapping</TabsTrigger>
              <TabsTrigger value="impact">Impact Map</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 space-y-4">
              {/* Credentials Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Credentials & Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Status</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium">OK</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Scopes</p>
                      <Badge variant="outline" className="text-xs">Read-only</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Environment</p>
                      <Badge variant="secondary" className="text-xs">Production</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Connection Method */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getMethodIcon()}
                    Connection Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{integration.connectionMethod || 'Not configured'}</span>
                    <span className="text-muted-foreground">
                      {integration.recordCount > 0 && `${formatInteger(integration.recordCount)} records`}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Validation Issues */}
              {integration.validationResults.length > 0 && (
                <Card className="border-warning/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {integration.validationResults.map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-warning/5">
                          <div className="flex items-center gap-2">
                            {result.status === 'error' ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                            <span>{result.message}</span>
                          </div>
                          {result.recordsAffected && result.recordsAffected > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {result.recordsAffected} records
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="fields" className="mt-4 space-y-4">
              {/* Field Coverage Summary */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Required Mapped</p>
                    <p className={cn(
                      'text-xl font-bold',
                      mappedRequired === totalRequired ? 'text-success' : 'text-warning'
                    )}>
                      {mappedRequired}/{totalRequired}
                    </p>
                    <Progress value={(mappedRequired / totalRequired) * 100} className="h-1 mt-2" />
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Optional Mapped</p>
                    <p className="text-xl font-bold">{mappedOptional}/{totalOptional}</p>
                    <Progress value={(mappedOptional / Math.max(1, totalOptional)) * 100} className="h-1 mt-2" />
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Coverage</p>
                    <p className={cn(
                      'text-xl font-bold',
                      integration.coverage >= 90 ? 'text-success' : 
                      integration.coverage >= 70 ? 'text-warning' : 'text-destructive'
                    )}>
                      {integration.coverage}%
                    </p>
                    <Progress value={integration.coverage} className="h-1 mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Field List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {integration.requiredFields.map((field) => (
                  <div 
                    key={field.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg border text-sm',
                      field.mapped ? 'bg-success/5 border-success/20' : 
                      field.required ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {field.mapped ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : field.required ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className="font-medium">{field.name}</span>
                      {field.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    </div>
                    {field.sourceField && (
                      <span className="text-xs text-muted-foreground font-mono">
                        → {field.sourceField}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="impact" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">This affects:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {impacts.map((impact, idx) => {
                      const Icon = impact.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{impact.insight}</span>
                          </div>
                          <Badge variant="outline" className={cn('text-xs', confidenceStyles[impact.confidence])}>
                            {integration.status === 'connected' ? 'Measured' : 'Estimated'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* What this unlocks */}
              <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
                <CardContent className="pt-4">
                  <p className="text-xs font-medium text-success mb-2">What this unlocks</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.unlocksInsights.map((insight, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-success/10 border-success/30 text-success">
                        {insight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-6 flex-wrap gap-2">
          {integration.status === 'connected' && (
            <>
              <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
                <Play className={cn("h-4 w-4 mr-1", testing && "animate-spin")} />
                {testing ? 'Testing...' : 'Test'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                <RefreshCw className={cn("h-4 w-4 mr-1", syncing && "animate-spin")} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewLogs}>
                <FileText className="h-4 w-4 mr-1" />
                View Logs
              </Button>
            </>
          )}
          {integration.status === 'degraded' && (
            <Button onClick={handleFix} disabled={fixing} className="gap-2">
              <Wrench className={cn("h-4 w-4", fixing && "animate-spin")} />
              {fixing ? 'Fixing...' : 'Fix Connection'}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
