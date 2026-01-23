/**
 * Integrations Ops View (Manage Integrations)
 * 
 * Full integration management with connection wizard, drawers, and issue resolution.
 * Enhanced with connection health, sync history, CSV import, and security footer.
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search,
  Filter,
  ChevronRight,
  Server,
  Key,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployerGlobalFiltersBar, IntegrationConnectionDrawer, SyncHistoryDrawer, CSVImportPreview, IntegrationFieldMapping, IntegrationDataDictionary } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';
import { useIntegrationSources, type IntegrationSource, type IntegrationStatus } from '@/hooks/useIntegrationSources';
import { useDataConfidenceIssues } from '@/hooks/useDataConfidenceIssues';
import { IntegrationConnectWizard } from '@/components/employer/IntegrationConnectWizard';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { formatInteger, cn } from '@/lib/utils';
import type { SyncRecord } from '@/components/employer/SyncHistoryDrawer';
import type { CSVPreviewData } from '@/components/employer/CSVImportPreview';
import { toast } from 'sonner';
import { DemoModeBadge } from '@/components/shared/DemoDataGate';
import { useDemoMode } from '@/contexts/DemoModeContext';

// Issue category types
type IssueCategory = 'auth' | 'mapping' | 'quality' | 'sync' | 'coverage';

const issueCategoryLabels: Record<IssueCategory, { label: string; icon: React.ElementType; color: string }> = {
  auth: { label: 'Auth Issue', icon: Key, color: 'text-destructive' },
  mapping: { label: 'Field Mapping Gap', icon: FileSpreadsheet, color: 'text-warning' },
  quality: { label: 'Data Quality', icon: AlertTriangle, color: 'text-warning' },
  sync: { label: 'Sync Failures', icon: RefreshCw, color: 'text-destructive' },
  coverage: { label: 'Low Coverage', icon: Database, color: 'text-amber-500' },
};

// Generate mock uptime sparkline data
const generateSparkline = (status: IntegrationStatus) => {
  const base = status === 'connected' ? 99 : status === 'degraded' ? 85 : 0;
  return Array.from({ length: 7 }, (_, i) => ({
    day: i,
    value: Math.max(0, Math.min(100, base + (Math.random() * 4 - 2))),
  }));
};

// Demo sync history data (only shown in demo mode)
const DEMO_SYNC_HISTORY: SyncRecord[] = [
  {
    id: 'sync-1',
    source: 'HRIS System (SAP)',
    sourceId: 'int-hris',
    time: '2 hours ago',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    duration: 45,
    recordsProcessed: 12847,
    recordsSkipped: 23,
    status: 'success',
    skippedReasons: [
      { reason: 'Missing employee ID', count: 15 },
      { reason: 'Invalid date format', count: 8 },
    ],
    affectedModules: ['Employee Demographics', 'Tenure Analysis'],
    initiatedBy: 'System',
    initiationType: 'scheduled',
  },
  {
    id: 'sync-2',
    source: 'Claims System',
    sourceId: 'int-claims',
    time: '30 mins ago',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    duration: 120,
    recordsProcessed: 45200,
    recordsSkipped: 0,
    status: 'success',
    affectedModules: ['Claims Processing', 'Utilization'],
    initiatedBy: 'Ahmed Hassan',
    initiationType: 'manual',
  },
  {
    id: 'sync-3',
    source: 'Payroll Provider',
    sourceId: 'int-payroll',
    time: '1 day ago',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    duration: 78,
    recordsProcessed: 12650,
    recordsSkipped: 0,
    status: 'success',
    affectedModules: ['Compensation', 'Cost Analysis'],
    initiatedBy: 'System',
    initiationType: 'scheduled',
  },
  {
    id: 'sync-4',
    source: 'Benefits Platform',
    sourceId: 'int-benefits',
    time: '3 days ago',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    duration: 95,
    recordsProcessed: 11200,
    recordsSkipped: 145,
    status: 'warning',
    errorMessage: '145 records skipped due to validation errors',
    skippedReasons: [
      { reason: 'Missing enrollment date', count: 89 },
      { reason: 'Invalid plan code', count: 56 },
    ],
    topErrors: [
      { message: 'ENROLLMENT_DATE_REQUIRED', count: 89 },
      { message: 'PLAN_CODE_NOT_FOUND', count: 56 },
    ],
    affectedModules: ['Benefits Utilization', 'Coverage Gaps'],
    initiatedBy: 'System',
    initiationType: 'scheduled',
  },
];

export function IntegrationsOpsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast: showToast } = useToast();
  const { hasPermission } = useEmployerPermissions();
  const canManageIntegrations = hasPermission('can_manage_integrations');
  const { isDemoMode } = useDemoMode();
  
  // Use demo data only in demo mode
  const syncHistoryData = isDemoMode ? DEMO_SYNC_HISTORY : [];
  
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

  // Tab state from URL
  const activeTab = searchParams.get('tab') || 'connections';
  
  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationSource | null>(null);
  const [linkedIssueId, setLinkedIssueId] = useState<string | null>(null);
  
  // Drawer states
  const [connectionDrawerOpen, setConnectionDrawerOpen] = useState(false);
  const [drawerIntegration, setDrawerIntegration] = useState<IntegrationSource | null>(null);
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [selectedSync, setSelectedSync] = useState<SyncRecord | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // CSV Import state
  const [csvPreviewData, setCsvPreviewData] = useState<CSVPreviewData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

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

  // Categorize issues for "Need Action"
  const issuesByCategory = useMemo(() => {
    const categories: Record<IssueCategory, IntegrationSource[]> = {
      auth: [],
      mapping: [],
      quality: [],
      sync: [],
      coverage: [],
    };
    
    integrations.forEach(int => {
      if (int.status === 'not_connected') {
        categories.auth.push(int);
      } else if (int.status === 'degraded') {
        if (int.validationResults.some(v => v.status === 'error' && v.message.includes('stale'))) {
          categories.sync.push(int);
        } else {
          categories.quality.push(int);
        }
      }
      if (int.coverage < 70 && int.status !== 'not_connected') {
        categories.coverage.push(int);
      }
      if (int.requiredFields.some(f => f.required && !f.mapped)) {
        categories.mapping.push(int);
      }
    });
    
    return categories;
  }, [integrations]);

  // Filtered sync history
  const filteredSyncHistory = useMemo(() => {
    return syncHistoryData.filter(sync => {
      if (searchQuery && !sync.source.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && sync.status !== statusFilter) {
        return false;
      }
      if (sourceFilter !== 'all' && sync.sourceId !== sourceFilter) {
        return false;
      }
      return true;
    });
  }, [searchQuery, statusFilter, sourceFilter, syncHistoryData]);

  const handleSync = async (source: IntegrationSource) => {
    await syncIntegration(source.id);
    showToast({
      title: 'Sync Complete',
      description: `${source.name} has been synchronized successfully.`,
    });
  };

  const handleFix = async (source: IntegrationSource) => {
    const success = await fixConnection(source.id);
    if (success) {
      source.relatedIssueIds.forEach(issueId => {
        resolveIssue(issueId, 'integration', `Fixed connection for ${source.name}`);
      });
      showToast({
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
    showToast({
      title: result.success ? 'Connection OK' : 'Connection Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    return result;
  };

  const handleWizardComplete = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      integration.relatedIssueIds.forEach(issueId => {
        resolveIssue(issueId, 'integration', `Connected ${integration.name} integration`);
      });
    }
    
    showToast({
      title: 'Integration Connected',
      description: 'Data is now syncing. Confidence score has been updated.',
    });
  };

  const handleOpenConnectionDrawer = (source: IntegrationSource) => {
    setDrawerIntegration(source);
    setConnectionDrawerOpen(true);
  };

  const handleOpenSyncDetails = (sync: SyncRecord) => {
    setSelectedSync(sync);
    setSyncDrawerOpen(true);
  };

  const handleRetrySyncFailed = async (syncId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Retry Complete', { description: 'Failed records re-processed' });
  };

  const handleDownloadTemplate = (templateName: string) => {
    toast.success('Download started', { description: `${templateName} template` });
  };

  const handleCSVUpload = () => {
    // Simulate file upload and preview
    setCsvPreviewData({
      headers: ['Employee ID', 'First Name', 'Last Name', 'Email', 'Department', 'Grade', 'Hire Date'],
      rows: [
        ['EMP001', 'Ahmed', 'Hassan', 'ahmed.hassan@company.com', 'Engineering', 'G5', '2022-01-15'],
        ['EMP002', 'Sara', 'Ali', 'sara.ali@company.com', 'HR', 'G4', '2023-03-20'],
        ['EMP003', 'Mohamed', 'Khalil', 'mohamed.khalil@company.com', 'Finance', 'G5', '2021-06-01'],
        ['EMP004', '', 'Omar', 'omar@company.com', 'IT', 'G3', '2023-11-15'],
        ['EMP005', 'Fatima', 'Salem', 'fatima.salem@company.com', 'Marketing', '', '2024-01-10'],
      ],
      totalRows: 156,
      errors: [
        { row: 3, column: 'First Name', message: 'Required field is empty' },
      ],
      warnings: [
        { row: 4, column: 'Grade', message: 'Grade is empty, will use default' },
      ],
      mappingSuggestions: {
        'Employee ID': 'emp_id',
        'First Name': 'first_name',
        'Last Name': 'last_name',
        'Email': 'email',
        'Department': 'department',
        'Grade': 'grade',
        'Hire Date': 'hire_date',
      },
    });
  };

  const handleConfirmImport = () => {
    toast.success('Import Complete', { description: `155 records imported successfully` });
    setCsvPreviewData(null);
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
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Manage Integrations</h1>
              <p className="text-muted-foreground">Connect data sources, map fields, and manage syncs</p>
            </div>
            <DemoModeBadge />
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

      {/* Need Action by Category */}
      {Object.entries(issuesByCategory).some(([_, items]) => items.length > 0) && (
        <Card className="border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Issues Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(issuesByCategory).map(([category, items]) => {
                if (items.length === 0) return null;
                const config = issueCategoryLabels[category as IssueCategory];
                const Icon = config.icon;
                return (
                  <Badge 
                    key={category}
                    variant="outline" 
                    className={cn('gap-1 cursor-pointer hover:bg-muted', config.color)}
                    onClick={() => {
                      if (items[0]) handleOpenConnectionDrawer(items[0]);
                    }}
                  >
                    <Icon className="h-3 w-3" />
                    {config.label} ({items.length})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Data Connections</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="dictionary">Data Dictionary</TabsTrigger>
          <TabsTrigger value="import">CSV/Excel Import</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {/* Integration Cards */}
          {integrations.map((source) => {
            const isHighlighted = linkedIssue && source.relatedIssueIds.includes(linkedIssue.id);
            const sparklineData = generateSparkline(source.status);
            const uptimePercent = source.status === 'connected' ? 99.2 : source.status === 'degraded' ? 87.5 : 0;
            const errorRate = source.status === 'connected' ? 0.1 : source.status === 'degraded' ? 2.3 : 0;
            
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
                          <Badge variant="outline" className={cn(
                            'text-xs',
                            source.status === 'connected' ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'
                          )}>
                            {source.status === 'connected' ? 'Measured' : 'Estimated'}
                          </Badge>
                        </div>
                        
                        {/* Connection Health Row */}
                        {source.status !== 'not_connected' && (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground text-xs">Last Sync</p>
                              <p className="font-medium">{source.lastSync || 'Never'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Next Sync</p>
                              <p className="font-medium">{source.status === 'connected' ? 'In 2 hours' : '—'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Uptime (7d)</p>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "font-medium",
                                  uptimePercent >= 99 ? 'text-success' : 'text-warning'
                                )}>
                                  {uptimePercent.toFixed(1)}%
                                </span>
                                <div className="w-12 h-4">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineData}>
                                      <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={uptimePercent >= 99 ? 'hsl(160 84% 39%)' : 'hsl(38 92% 50%)'} 
                                        strokeWidth={1}
                                        dot={false}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Error Rate</p>
                              <p className={cn(
                                "font-medium",
                                errorRate < 1 ? 'text-success' : 'text-warning'
                              )}>
                                {errorRate.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Coverage</p>
                              <div className="flex items-center gap-2">
                                <Progress value={source.coverage} className="w-12 h-1.5" />
                                <span className={cn(
                                  "font-medium",
                                  source.coverage >= 90 ? 'text-success' : 'text-warning'
                                )}>
                                  {source.coverage}%
                                </span>
                              </div>
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenConnectionDrawer(source)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {getPrimaryAction(source)}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenConnectionDrawer(source)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <IntegrationFieldMapping />
        </TabsContent>

        <TabsContent value="dictionary" className="space-y-4">
          <IntegrationDataDictionary />
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <CSVImportPreview
            selectedTemplate={selectedTemplate}
            previewData={csvPreviewData}
            onDownloadTemplate={handleDownloadTemplate}
            onUpload={handleCSVUpload}
            onConfirmImport={handleConfirmImport}
            onClearPreview={() => setCsvPreviewData(null)}
            onDownloadErrors={() => toast.success('Downloading error report')}
            onDownloadCleanedFile={() => toast.success('Downloading cleaned file')}
          />

          {!csvPreviewData && (
            <Card className="card-elevated border-dashed border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Drop files here or click to upload</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports Excel (.xlsx) and CSV files up to 10MB
                  </p>
                  <Button onClick={handleCSVUpload}>Select Files</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search syncs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {integrations.map(int => (
                  <SelectItem key={int.id} value={int.id}>{int.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sync History Table */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sync History</CardTitle>
              <CardDescription>Click a sync for detailed information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredSyncHistory.map((sync) => (
                  <div 
                    key={sync.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleOpenSyncDetails(sync)}
                  >
                    <div className="flex items-center gap-3">
                      {sync.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : sync.status === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium">{sync.source}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{sync.time}</span>
                          <span>•</span>
                          <span>{sync.duration}s</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {sync.initiationType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatInteger(sync.recordsProcessed)} records</p>
                        {sync.recordsSkipped > 0 && (
                          <p className="text-xs text-warning">{sync.recordsSkipped} skipped</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}

                {filteredSyncHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No sync history found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security & Privacy Footer */}
      <Card className="bg-muted/20 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Security & Privacy</p>
              <p className="text-xs text-muted-foreground mt-1">
                All data is encrypted in transit (TLS 1.3) and at rest (AES-256). 
                Integrations use least-privilege access with read-only scopes where possible. 
                All access is logged to the audit trail for compliance. 
                Data is stored in UAE-region data centers.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link to="/employer/settings?tab=security">
                View Security Settings
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Wizard */}
      <IntegrationConnectWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        integration={selectedIntegration}
        linkedIssueTitle={linkedIssue?.title}
        onConnect={connectIntegration}
        onComplete={handleWizardComplete}
      />

      {/* Connection Details Drawer */}
      <IntegrationConnectionDrawer
        open={connectionDrawerOpen}
        onOpenChange={setConnectionDrawerOpen}
        integration={drawerIntegration}
        onSync={async (id) => {
          const int = integrations.find(i => i.id === id);
          if (int) await handleSync(int);
        }}
        onTest={async (id) => {
          const int = integrations.find(i => i.id === id);
          if (int) return handleTestConnection(int);
          return { success: false, message: 'Integration not found' };
        }}
        onFix={async (id) => {
          const int = integrations.find(i => i.id === id);
          if (int) await handleFix(int);
        }}
      />

      {/* Sync History Drawer */}
      <SyncHistoryDrawer
        open={syncDrawerOpen}
        onOpenChange={setSyncDrawerOpen}
        sync={selectedSync}
        onRetry={handleRetrySyncFailed}
      />
    </div>
  );
}

export default IntegrationsOpsView;
