import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployerGlobalFiltersBar } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';

interface DataSource {
  id: string;
  name: string;
  type: 'hris' | 'payroll' | 'benefits' | 'claims';
  status: 'connected' | 'disconnected' | 'warning' | 'syncing';
  lastSync: string;
  coverage: number;
  recordCount: number;
  missingFields: string[];
}

const dataSources: DataSource[] = [
  { 
    id: 'ds1', 
    name: 'HRIS System (SAP)', 
    type: 'hris',
    status: 'connected', 
    lastSync: '2 hours ago', 
    coverage: 98,
    recordCount: 12847,
    missingFields: ['Work Location (2%)']
  },
  { 
    id: 'ds2', 
    name: 'Payroll Provider', 
    type: 'payroll',
    status: 'connected', 
    lastSync: '1 day ago', 
    coverage: 95,
    recordCount: 12650,
    missingFields: ['Bank Details (3%)', 'Tax ID (2%)']
  },
  { 
    id: 'ds3', 
    name: 'Benefits Platform', 
    type: 'benefits',
    status: 'warning', 
    lastSync: '3 days ago', 
    coverage: 87,
    recordCount: 11200,
    missingFields: ['Dependent Info (8%)', 'Enrollment Date (5%)']
  },
  { 
    id: 'ds4', 
    name: 'Claims System', 
    type: 'claims',
    status: 'connected', 
    lastSync: '30 mins ago', 
    coverage: 92,
    recordCount: 45200,
    missingFields: ['Receipt Attachments (5%)', 'Category (3%)']
  },
];

const importTemplates = [
  { name: 'Employee Master', description: 'Import employee profiles and demographics', fields: 15 },
  { name: 'Benefit Entitlements', description: 'Import allowance allocations by grade', fields: 8 },
  { name: 'Grade Eligibility Rules', description: 'Define benefit eligibility by grade', fields: 12 },
  { name: 'Utilization Events', description: 'Import historical utilization data', fields: 10 },
];

export function IntegrationsOpsView() {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useEmployerPermissions();
  const canManageIntegrations = hasPermission('can_manage_integrations');

  const handleSync = (sourceId: string, sourceName: string) => {
    setSyncingId(sourceId);
    setTimeout(() => {
      setSyncingId(null);
      toast({
        title: 'Sync Complete',
        description: `${sourceName} has been synchronized successfully.`,
      });
    }, 2000);
  };

  const getStatusBadge = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-0"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'disconnected':
        return <Badge className="bg-muted text-muted-foreground"><Unlink className="w-3 h-3 mr-1" />Disconnected</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/10 text-amber-600 border-0"><AlertTriangle className="w-3 h-3 mr-1" />Needs Attention</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-500/10 text-blue-600 border-0"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Syncing</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'hris': return '👥';
      case 'payroll': return '💰';
      case 'benefits': return '🎁';
      case 'claims': return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Integrations & Data</h1>
          <p className="text-muted-foreground">Manage data sources, mappings, and imports</p>
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
            <Button variant="outline" className="gap-2">
              <Link2 className="w-4 h-4" />
              Add Connection
            </Button>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
          </div>
        </PermissionGate>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar compact />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{dataSources.length}</p>
                <p className="text-sm text-muted-foreground">Data Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">{dataSources.filter(d => d.status === 'connected').length}</p>
                <p className="text-sm text-muted-foreground">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{dataSources.filter(d => d.status === 'warning').length}</p>
                <p className="text-sm text-muted-foreground">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">93%</p>
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
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {dataSources.map((source) => (
            <Card key={source.id} className={`card-elevated ${source.status === 'warning' ? 'border-amber-500/30' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getTypeIcon(source.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{source.name}</h3>
                        {getStatusBadge(syncingId === source.id ? 'syncing' : source.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Last Sync</p>
                          <p className="font-medium">{source.lastSync}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Records</p>
                          <p className="font-medium">{source.recordCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Coverage</p>
                          <div className="flex items-center gap-2">
                            <Progress value={source.coverage} className="w-16 h-2" />
                            <span className={`font-medium ${source.coverage >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {source.coverage}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Missing Fields</p>
                          <p className="font-medium text-amber-600">{source.missingFields.length}</p>
                        </div>
                      </div>
                      {source.missingFields.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {source.missingFields.map((field, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs text-amber-600 border-amber-500/30">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSync(source.id, source.name)}
                      disabled={syncingId === source.id}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${syncingId === source.id ? 'animate-spin' : ''}`} />
                      Sync Now
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

        <TabsContent value="mapping" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Field Mappings</CardTitle>
              <CardDescription>Configure how external system fields map to internal data model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSources.map((source) => (
                  <div key={source.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getTypeIcon(source.type)}</span>
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {source.recordCount.toLocaleString()} records mapped
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" />
                        Configure Mapping
                      </Button>
                    </div>
                  </div>
                ))}
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
                  { source: 'HRIS System', time: '2 hours ago', records: 12847, status: 'success' },
                  { source: 'Claims System', time: '30 mins ago', records: 45200, status: 'success' },
                  { source: 'Payroll Provider', time: '1 day ago', records: 12650, status: 'success' },
                  { source: 'Benefits Platform', time: '3 days ago', records: 11200, status: 'warning', error: '145 records skipped' },
                ].map((sync, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      {sync.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium">{sync.source}</p>
                        <p className="text-xs text-muted-foreground">{sync.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{sync.records.toLocaleString()} records</p>
                      {sync.error && <p className="text-xs text-amber-600">{sync.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
