/**
 * Integrations Ops View (Manage Integrations)
 * 
 * Full integration management with connection wizard and issue resolution.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Upload,
  Settings,
  Link2,
  Unlink,
  FileSpreadsheet,
  Download,
  Lock,
  Zap,
  ArrowLeft,
  Sparkles,
  Wrench,
  Play,
  Shield,
  Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployerGlobalFiltersBar } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';
import { useIntegrationSources, type IntegrationSource, type IntegrationStatus } from '@/hooks/useIntegrationSources';
import { useDataConfidenceIssues } from '@/hooks/useDataConfidenceIssues';
import { IntegrationConnectWizard } from '@/components/employer/IntegrationConnectWizard';
import { cn } from '@/lib/utils';

const importTemplates = [
  { name: 'Employee Master', description: 'Import employee profiles and demographics', fields: 15 },
  { name: 'Benefit Entitlements', description: 'Import allowance allocations by grade', fields: 8 },
  { name: 'Grade Eligibility Rules', description: 'Define benefit eligibility by grade', fields: 12 },
  { name: 'Utilization Events', description: 'Import historical utilization data', fields: 10 },
];

export function IntegrationsOpsView() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { hasPermission } = useEmployerPermissions();
  const canManageIntegrations = hasPermission('can_manage_integrations');
  
  const {
    integrations,
    stats,
    syncingId,
    connectingId,
    syncIntegration,
    fixConnection,
    connectIntegration,
    testConnection,
    getIntegrationByIssueId,
  } = useIntegrationSources();
  
  const {
    getIssueById,
    resolveIssue,
    allIssues,
  } = useDataConfidenceIssues();

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationSource | null>(null);
  const [linkedIssueId, setLinkedIssueId] = useState<string | null>(null);

  // Check if coming from issue resolution
  useEffect(() => {
    const issueId = searchParams.get('resolve_issue');
    if (issueId) {
      setLinkedIssueId(issueId);
      const integration = getIntegrationByIssueId(issueId);
      if (integration) {
        setSelectedIntegration(integration);
        setWizardOpen(true);
      }
    }
  }, [searchParams, getIntegrationByIssueId]);

  const handleSync = async (source: IntegrationSource) => {
    await syncIntegration(source.id);
    toast({
      title: 'Sync Complete',
      description: `${source.name} has been synchronized successfully.`,
    });
  };

  const handleFix = async (source: IntegrationSource) => {
    const success = await fixConnection(source.id);
    if (success) {
      // Resolve related issues
      source.relatedIssueIds.forEach(issueId => {
        resolveIssue(issueId, 'integration', `Fixed connection for ${source.name}`);
      });
      toast({
        title: 'Connection Fixed',
        description: `${source.name} connection has been restored.`,
      });
    }
  };

  const handleConnect = (source: IntegrationSource) => {
    setSelectedIntegration(source);
    setLinkedIssueId(source.relatedIssueIds[0] || null);
    setWizardOpen(true);
  };

  const handleTestConnection = async (source: IntegrationSource) => {
    const result = await testConnection(source.id);
    toast({
      title: result.success ? 'Connection OK' : 'Connection Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };

  const handleWizardComplete = (integrationId: string) => {
    // Resolve linked issues
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      integration.relatedIssueIds.forEach(issueId => {
        resolveIssue(issueId, 'integration', `Connected ${integration.name} integration`);
      });
    }
    
    toast({
      title: 'Integration Connected',
      description: 'Data is now syncing. Confidence score has been updated.',
    });
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-success/10 text-success border-0 gap-1"><CheckCircle className="w-3 h-3" />Connected</Badge>;
      case 'not_connected':
        return <Badge className="bg-muted text-muted-foreground gap-1"><Unlink className="w-3 h-3" />Not Connected</Badge>;
      case 'degraded':
        return <Badge className="bg-warning/10 text-warning border-0 gap-1"><AlertTriangle className="w-3 h-3" />Degraded</Badge>;
      case 'syncing':
        return <Badge className="bg-primary/10 text-primary border-0 gap-1"><RefreshCw className="w-3 h-3 animate-spin" />Syncing</Badge>;
      default:
        return null;
    }
  };

  const getPrimaryAction = (source: IntegrationSource) => {
    const isSyncing = syncingId === source.id;
    
    switch (source.status) {
      case 'not_connected':
        return (
          <Button onClick={() => handleConnect(source)} className="gap-2">
            <Link2 className="w-4 h-4" />
            Connect
          </Button>
        );
      case 'degraded':
        return (
          <Button 
            onClick={() => handleFix(source)} 
            variant="outline" 
            className="gap-2 border-warning text-warning hover:bg-warning/10"
            disabled={isSyncing}
          >
            <Wrench className="w-4 h-4" />
            Fix
          </Button>
        );
      case 'connected':
        return (
          <Button 
            variant="outline" 
            onClick={() => handleSync(source)}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            Sync Now
          </Button>
        );
      default:
        return null;
    }
  };

  const linkedIssue = linkedIssueId ? getIssueById(linkedIssueId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="lg:hidden">
            <Link to="/employer/integrations">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Manage Integrations</h1>
            <p className="text-muted-foreground">Connect data sources, map fields, and manage syncs</p>
          </div>
        </div>
        <PermissionGate 
          permission="can_manage_integrations"
          fallback={
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Lock className="w-3 h-3" /> View Only
            </Badge>
          }
        >
          <div className="flex gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/employer/integrations">
                <Shield className="w-4 h-4" />
                Data Confidence
              </Link>
            </Button>
          </div>
        </PermissionGate>
      </div>

      {/* Linked Issue Alert */}
      {linkedIssue && (
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription>
            <span className="font-medium">Resolving issue:</span> {linkedIssue.title}
            <span className="text-muted-foreground ml-2">
              — Connect the integration below to resolve this and improve your confidence score.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{stats.connected}</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">{stats.degraded + stats.notConnected}</p>
                <p className="text-sm text-muted-foreground">Need Action</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.avgCoverage}%</p>
                <p className="text-sm text-muted-foreground">Avg Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Data Connections</TabsTrigger>
          <TabsTrigger value="import">CSV/Excel Import</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {/* Integration Cards */}
          {integrations.map((source) => {
            const isHighlighted = linkedIssue && source.relatedIssueIds.includes(linkedIssue.id);
            
            return (
              <Card 
                key={source.id} 
                className={cn(
                  'card-elevated transition-all',
                  source.status === 'degraded' && 'border-warning/30',
                  source.status === 'not_connected' && 'border-muted-foreground/20 bg-muted/20',
                  isHighlighted && 'ring-2 ring-primary border-primary'
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{source.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold">{source.name}</h3>
                          {getStatusBadge(syncingId === source.id ? 'syncing' : source.status)}
                        </div>
                        
                        {source.status !== 'not_connected' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Last Sync</p>
                              <p className="font-medium">{source.lastSync || 'Never'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Records</p>
                              <p className="font-medium">{source.recordCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Coverage</p>
                              <div className="flex items-center gap-2">
                                <Progress value={source.coverage} className="w-16 h-1.5" />
                                <span className={cn(
                                  "font-medium",
                                  source.coverage >= 90 ? 'text-success' : 'text-warning'
                                )}>
                                  {source.coverage}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fields Mapped</p>
                              <p className="font-medium">
                                {source.mappedFields.length}/{source.requiredFields.length}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* What this unlocks */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="text-xs text-muted-foreground">Unlocks:</span>
                          {source.unlocksInsights.slice(0, 3).map((insight, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {insight}
                            </Badge>
                          ))}
                          {source.unlocksInsights.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{source.unlocksInsights.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Validation warnings */}
                        {source.validationResults.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {source.validationResults.map((result, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  result.status === 'error' && 'text-destructive border-destructive/30',
                                  result.status === 'warning' && 'text-warning border-warning/30'
                                )}
                              >
                                {result.message}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {source.status === 'connected' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTestConnection(source)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {getPrimaryAction(source)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Import Templates</CardTitle>
              <CardDescription>Download templates and upload populated files to import data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {importTemplates.map((template, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{template.fields} fields</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Template
                        </Button>
                        <Button size="sm">
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated border-dashed border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Drop files here or click to upload</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports Excel (.xlsx) and CSV files up to 10MB
                </p>
                <Button>Select Files</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Recent Sync Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { source: 'HRIS System (SAP)', time: '2 hours ago', records: 12847, status: 'success' },
                  { source: 'Claims System', time: '30 mins ago', records: 45200, status: 'success' },
                  { source: 'Payroll Provider', time: '1 day ago', records: 12650, status: 'success' },
                  { source: 'Benefits Platform', time: '3 days ago', records: 11200, status: 'warning', error: '145 records skipped' },
                ].map((sync, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      {sync.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      )}
                      <div>
                        <p className="font-medium">{sync.source}</p>
                        <p className="text-xs text-muted-foreground">{sync.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{sync.records.toLocaleString()} records</p>
                      {sync.error && <p className="text-xs text-warning">{sync.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Wizard */}
      <IntegrationConnectWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        integration={selectedIntegration}
        linkedIssueTitle={linkedIssue?.title}
        onConnect={connectIntegration}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
