import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { 
  Database, CheckCircle, XCircle, Clock, AlertTriangle, 
  RefreshCw, Link2, Unlink, Settings, Plus, Activity, ArrowRight,
  Key, Globe, Server, FileSpreadsheet, Shield, Loader2, Eye,
  AlertCircle, HelpCircle, Copy, Wrench, ExternalLink, Play, Zap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

// Available connectors configuration
const AVAILABLE_CONNECTORS = [
  { id: 'workday', name: 'Workday', icon: '🔷', category: 'HRIS', description: 'Enterprise HR and Finance system', authMethods: ['oauth', 'api_key'], domains: ['employees', 'payroll', 'benefits', 'leave'] },
  { id: 'sap_sf', name: 'SAP SuccessFactors', icon: '🟦', category: 'HRIS', description: 'Cloud-based HR management', authMethods: ['oauth', 'api_key'], domains: ['employees', 'payroll'] },
  { id: 'oracle_hcm', name: 'Oracle HCM', icon: '🔶', category: 'HRIS', description: 'HR and talent management suite', authMethods: ['oauth', 'api_key'], domains: ['employees', 'payroll', 'benefits'] },
  { id: 'bamboohr', name: 'BambooHR', icon: '🌿', category: 'HRIS', description: 'SMB-focused HR platform', authMethods: ['api_key'], domains: ['employees'] },
  { id: 'entra_id', name: 'Microsoft Entra ID', icon: '🔵', category: 'SSO/SCIM', description: 'Identity and access management', authMethods: ['oauth'], domains: ['employees'] },
  { id: 'google_workspace', name: 'Google Workspace', icon: '🔴', category: 'SSO', description: 'Google identity provider', authMethods: ['oauth'], domains: ['employees'] },
  { id: 'azure_ad', name: 'Azure AD', icon: '⚡', category: 'SSO/SCIM', description: 'Microsoft directory services', authMethods: ['oauth'], domains: ['employees'] },
  { id: 'csv_sftp', name: 'CSV/SFTP', icon: '📁', category: 'Manual', description: 'Manual file-based integration', authMethods: ['sftp', 'upload'], domains: ['employees', 'payroll', 'benefits', 'claims'] },
];

const DATA_DOMAINS = [
  { id: 'employees', label: 'Employees', labelAr: 'الموظفين', icon: '👥' },
  { id: 'payroll', label: 'Payroll', labelAr: 'الرواتب', icon: '💰' },
  { id: 'benefits', label: 'Benefits', labelAr: 'المزايا', icon: '🎁' },
  { id: 'claims', label: 'Claims', labelAr: 'المطالبات', icon: '📄' },
  { id: 'leave', label: 'Leave', labelAr: 'الإجازات', icon: '🏖️' },
];

const SYNC_FREQUENCIES = [
  { value: 'realtime', label: 'Real-time', labelAr: 'فوري' },
  { value: 'hourly', label: 'Every hour', labelAr: 'كل ساعة' },
  { value: 'daily', label: 'Daily (midnight)', labelAr: 'يومياً' },
  { value: 'weekly', label: 'Weekly', labelAr: 'أسبوعياً' },
];

const REQUIRED_FIELDS = [
  { id: 'employeeId', label: 'Employee ID', required: true },
  { id: 'orgId', label: 'Organization ID', required: true },
  { id: 'grade', label: 'Grade/Level', required: true },
  { id: 'salary', label: 'Monthly Salary', required: true },
  { id: 'allowances', label: 'Allowances', required: false },
  { id: 'dependentCount', label: 'Dependent Count', required: false },
  { id: 'nationality', label: 'Nationality', required: false },
  { id: 'joinDate', label: 'Join Date', required: true },
  { id: 'employmentType', label: 'Employment Type', required: true },
];

const STATUS_CONFIG = {
  connected: { label: 'Connected', labelAr: 'متصل', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  syncing: { label: 'Syncing', labelAr: 'مزامنة', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: RefreshCw },
  error: { label: 'Error', labelAr: 'خطأ', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  not_connected: { label: 'Not Connected', labelAr: 'غير متصل', color: 'bg-muted text-muted-foreground border-border', icon: Unlink },
};

// Sample connected sources
const INITIAL_CONNECTED_SOURCES = [
  { 
    id: '1', connectorId: 'sap_sf', name: 'SAP SuccessFactors', status: 'connected', 
    coverage: 95, lastSync: new Date(Date.now() - 1000 * 60 * 15), recordsSynced: 12450,
    healthScore: 98, domains: ['employees', 'payroll'], frequency: 'hourly',
    missingFields: ['manager_id'], org: 'All Organizations', authType: 'OAuth 2.0',
    environment: 'Production', owner: 'IT Admin', createdAt: new Date('2024-06-15'),
    schedule: 'Every hour at :00', fieldsMapped: 8, fieldsTotal: 9,
    lastAuthCheck: new Date(Date.now() - 1000 * 60 * 30), lastRunDuration: '4m 12s',
    recentRuns: [
      { id: 'run-1', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 15), duration: '4m 12s', recordsIn: 12450, recordsOut: 12448, errors: 2, retries: 0 },
      { id: 'run-2', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 75), duration: '4m 08s', recordsIn: 12445, recordsOut: 12445, errors: 0, retries: 0 },
      { id: 'run-3', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 135), duration: '4m 22s', recordsIn: 12440, recordsOut: 12440, errors: 0, retries: 0 },
    ],
  },
  { 
    id: '2', connectorId: 'oracle_hcm', name: 'Oracle HCM', status: 'connected', 
    coverage: 88, lastSync: new Date(Date.now() - 1000 * 60 * 60), recordsSynced: 8920,
    healthScore: 92, domains: ['employees', 'payroll', 'benefits'], frequency: 'daily',
    missingFields: ['bonus_date'], org: 'Acme Corp', authType: 'API Key',
    environment: 'Production', owner: 'HRIS Team', createdAt: new Date('2024-08-20'),
    schedule: 'Daily at 02:00 UTC', fieldsMapped: 7, fieldsTotal: 9,
    lastAuthCheck: new Date(Date.now() - 1000 * 60 * 60 * 2), lastRunDuration: '8m 45s',
    recentRuns: [
      { id: 'run-4', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 60), duration: '8m 45s', recordsIn: 8920, recordsOut: 8915, errors: 5, retries: 0 },
    ],
  },
  { 
    id: '3', connectorId: 'bamboohr', name: 'BambooHR', status: 'syncing', 
    coverage: 72, lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), recordsSynced: 5600,
    healthScore: 78, domains: ['employees'], frequency: 'hourly',
    missingFields: ['dependent_count', 'plan_tier'], org: 'TechStart Inc', authType: 'API Key',
    environment: 'Production', owner: 'HR Ops', createdAt: new Date('2024-10-01'),
    schedule: 'Every hour at :30', fieldsMapped: 6, fieldsTotal: 9,
    lastAuthCheck: new Date(Date.now() - 1000 * 60 * 45), lastRunDuration: '5m 12s',
    recentRuns: [],
  },
  { 
    id: '4', connectorId: 'csv_sftp', name: 'Payroll CSV Feed', status: 'error', 
    coverage: 45, lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24), recordsSynced: 2100,
    healthScore: 35, domains: ['payroll'], frequency: 'daily',
    missingFields: ['cost_center', 'budget_code'], org: 'GlobalBank', authType: 'SFTP',
    environment: 'Production', owner: 'Finance IT', createdAt: new Date('2024-11-10'),
    schedule: 'Daily at 04:00 UTC', fieldsMapped: 5, fieldsTotal: 9,
    lastAuthCheck: new Date(Date.now() - 1000 * 60 * 60 * 24), lastRunDuration: '0m 32s',
    error: 'SFTP connection failed: Authentication timeout',
    errorDetails: {
      code: 'SFTP_AUTH_TIMEOUT',
      message: 'Connection to sftp.globalbank.com timed out after 30 seconds.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      suggestedFix: 'Verify SFTP credentials and check firewall rules.',
    },
    recentRuns: [],
  },
];

const SAMPLE_FIELD_MAPPINGS = [
  { sourceField: 'emp_id', bnftField: 'employeeId', transform: null, status: 'mapped' },
  { sourceField: 'org_code', bnftField: 'orgId', transform: 'lookup:org_mapping', status: 'mapped' },
  { sourceField: 'job_grade', bnftField: 'grade', transform: null, status: 'mapped' },
  { sourceField: 'base_salary', bnftField: 'salary', transform: null, status: 'mapped' },
  { sourceField: 'housing_allowance', bnftField: 'allowances', transform: 'sum:transport,housing', status: 'mapped' },
  { sourceField: null, bnftField: 'dependentCount', transform: null, status: 'unmapped' },
  { sourceField: 'country_code', bnftField: 'nationality', transform: 'lookup:country_codes', status: 'mapped' },
  { sourceField: 'hire_date', bnftField: 'joinDate', transform: 'date:YYYY-MM-DD', status: 'mapped' },
  { sourceField: 'emp_type', bnftField: 'employmentType', transform: 'map:FT=full_time,PT=part_time', status: 'mapped' },
];

export default function AdminDataSources() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const { createAuditLog } = useAdminAuditLog();

  const [sources, setSources] = useState(INITIAL_CONNECTED_SOURCES);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<string>('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'failure' | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [fieldMappingOpen, setFieldMappingOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<typeof sources[0] | null>(null);
  const [fieldMappings] = useState(SAMPLE_FIELD_MAPPINGS);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [fixConnectionOpen, setFixConnectionOpen] = useState(false);

  const connectedCount = sources.filter(s => s.status === 'connected' || s.status === 'syncing').length;
  const errorCount = sources.filter(s => s.status === 'error').length;
  const avgHealth = Math.round(sources.reduce((acc, s) => acc + s.healthScore, 0) / sources.length);
  const totalRecords = sources.reduce((acc, s) => acc + s.recordsSynced, 0);

  const metrics = [
    { title: t('Connected Sources', 'المصادر المتصلة'), value: connectedCount, icon: Link2 },
    { title: t('Avg Health', 'متوسط الصحة'), value: `${avgHealth}%`, icon: Activity },
    { title: t('Total Records', 'إجمالي السجلات'), value: `${(totalRecords / 1000).toFixed(1)}k`, icon: Database },
    { title: t('Errors', 'أخطاء'), value: errorCount, icon: AlertTriangle },
  ];

  const handleOpenWizard = () => {
    setWizardStep(1);
    setSelectedConnector(null);
    setAuthMethod('');
    setSelectedDomains([]);
    setSyncFrequency('daily');
    setSelectedOrg('all');
    setTestResult(null);
    setWizardOpen(true);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult('pending');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = Math.random() > 0.2;
    setTestResult(success ? 'success' : 'failure');
    setIsTesting(false);
  };

  const handleSaveConnector = async () => {
    const connector = AVAILABLE_CONNECTORS.find(c => c.id === selectedConnector);
    if (!connector) return;

    const newSource = {
      id: Date.now().toString(),
      connectorId: connector.id,
      name: connector.name,
      status: 'connected' as const,
      coverage: 0,
      lastSync: new Date(),
      recordsSynced: 0,
      healthScore: 100,
      domains: selectedDomains,
      frequency: syncFrequency,
      missingFields: [],
      org: selectedOrg === 'all' ? 'All Organizations' : selectedOrg,
      authType: authMethod === 'oauth' ? 'OAuth 2.0' : authMethod === 'api_key' ? 'API Key' : 'SFTP',
      environment: 'Production',
      owner: 'Admin',
      createdAt: new Date(),
      schedule: syncFrequency === 'hourly' ? 'Every hour at :00' : 'Daily at 02:00 UTC',
      fieldsMapped: 0,
      fieldsTotal: 9,
      lastAuthCheck: new Date(),
      lastRunDuration: '—',
      recentRuns: [],
    };

    setSources(prev => [...prev, newSource]);
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: newSource.id,
      metadata: { setting_type: 'connector', action: 'connector_created', connector_name: connector.name },
    });

    toast.success(t(`Connected ${connector.name}`, `تم توصيل ${connector.name}`));
    setWizardOpen(false);
  };

  const handleSyncNow = async (source: typeof sources[0]) => {
    toast.info(t(`Syncing ${source.name}...`, `جاري مزامنة ${source.name}...`));
    setSources(prev => prev.map(s => s.id === source.id ? { ...s, status: 'syncing' as const } : s));

    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: source.id,
      metadata: { setting_type: 'connector', action: 'sync_started', connector_name: source.name },
    });

    setTimeout(() => {
      setSources(prev => prev.map(s => s.id === source.id ? { ...s, status: 'connected' as const, lastSync: new Date() } : s));
      toast.success(t(`${source.name} synced successfully`, `تمت مزامنة ${source.name} بنجاح`));
    }, 3000);
  };

  const handleViewDetails = (source: typeof sources[0]) => {
    setSelectedSource(source);
    setDetailDrawerOpen(true);
  };

  const handleOpenFieldMapping = (source: typeof sources[0]) => {
    setSelectedSource(source);
    setFieldMappingOpen(true);
  };

  const handleFixConnection = (source: typeof sources[0]) => {
    setSelectedSource(source);
    setFixConnectionOpen(true);
  };

  const handleTestAndFix = async () => {
    setIsTesting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (selectedSource) {
      setSources(prev => prev.map(s => 
        s.id === selectedSource.id ? { ...s, status: 'connected' as const, error: undefined, errorDetails: undefined, healthScore: 85 } : s
      ));
      
      await createAuditLog({
        action: 'SETTINGS_UPDATE',
        entityType: 'settings',
        entityId: selectedSource.id,
        metadata: { setting_type: 'connector', action: 'connection_fixed', connector_name: selectedSource.name },
      });
      
      toast.success(t('Connection fixed successfully', 'تم إصلاح الاتصال بنجاح'));
    }
    
    setIsTesting(false);
    setFixConnectionOpen(false);
  };

  const unmappedCount = fieldMappings.filter(f => f.status === 'unmapped').length;
  const requiredUnmapped = fieldMappings.filter(f => 
    f.status === 'unmapped' && REQUIRED_FIELDS.find(r => r.id === f.bnftField)?.required
  ).length;

  // Get unconnected connectors for catalog
  const unconnectedConnectors = AVAILABLE_CONNECTORS.filter(
    c => !sources.some(s => s.connectorId === c.id)
  );

  return (
    <PageLayout
      title={t('Data Sources', 'مصادر البيانات')}
      description={t('Manage HRIS, payroll, and benefits vendor connections', 'إدارة اتصالات الموارد البشرية والرواتب والمزايا')}
      icon={Database}
      iconClassName="from-cyan-500 to-blue-500"
      actions={
        <Button onClick={handleOpenWizard}>
          <Plus className="w-4 h-4 me-2" />
          {t('Connect New Source', 'توصيل مصدر جديد')}
        </Button>
      }
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      {/* Connected Sources */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Link2 className="w-5 h-5" />
            {t('Connected Sources', 'المصادر المتصلة')}
          </CardTitle>
          <CardDescription>{t('Active data integrations', 'عمليات تكامل البيانات النشطة')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t('No connectors configured', 'لا توجد موصلات مكونة')}</p>
              <p className="text-sm mt-1">{t('Connect your first data source to get started', 'قم بتوصيل مصدر البيانات الأول للبدء')}</p>
              <Button className="mt-4" onClick={handleOpenWizard}>
                <Plus className="w-4 h-4 me-2" />
                {t('Connect Source', 'توصيل مصدر')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((source) => {
                const connector = AVAILABLE_CONNECTORS.find(c => c.id === source.connectorId);
                const statusConfig = STATUS_CONFIG[source.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_connected;
                const isError = source.status === 'error';
                const isSyncing = source.status === 'syncing';
                
                return (
                  <Card 
                    key={source.id} 
                    className={cn(
                      "border-l-4",
                      isError ? 'border-l-destructive' : isSyncing ? 'border-l-blue-500' : 'border-l-success'
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <div className="text-2xl">{connector?.icon || '📦'}</div>
                          <div>
                            <CardTitle className="text-base">{source.name}</CardTitle>
                            <CardDescription className="text-xs">{source.org}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("shrink-0 text-xs", statusConfig.color)}>
                          <statusConfig.icon className={cn("w-3 h-3 me-1", isSyncing && 'animate-spin')} />
                          {isRTL ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {source.error && (
                        <Alert variant="destructive" className="py-2">
                          <AlertTriangle className="w-4 h-4" />
                          <AlertDescription className="text-xs">{source.error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-2 rounded bg-muted/50 cursor-help">
                                <p className="text-lg font-bold">{source.healthScore}%</p>
                                <p className="text-[10px] text-muted-foreground">{t('Health', 'الصحة')}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-48">{t('Based on sync success rate and error frequency', 'بناءً على معدل نجاح المزامنة')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-2 rounded bg-muted/50 cursor-help">
                                <p className="text-lg font-bold">{source.coverage}%</p>
                                <p className="text-[10px] text-muted-foreground">{t('Coverage', 'التغطية')}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-48">{t('Percentage of required fields mapped', 'نسبة الحقول المطلوبة المعينة')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-lg font-bold">{(source.recordsSynced / 1000).toFixed(1)}k</p>
                          <p className="text-[10px] text-muted-foreground">{t('Records', 'السجلات')}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 flex-wrap">
                        {source.domains.map(d => (
                          <Badge key={d} variant="secondary" className="text-[10px]">
                            {DATA_DOMAINS.find(dd => dd.id === d)?.icon} {d}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {t('Last sync:', 'آخر مزامنة:')} {formatDistanceToNow(source.lastSync, { addSuffix: true })}
                      </p>

                      {/* Standardized CTAs */}
                      <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                        {isError ? (
                          <>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex-1 text-xs"
                              onClick={() => handleFixConnection(source)}
                            >
                              <Wrench className="w-3 h-3 me-1" />
                              {t('Fix Connection', 'إصلاح الاتصال')}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleViewDetails(source)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs"
                              onClick={() => handleSyncNow(source)}
                              disabled={isSyncing}
                            >
                              <RefreshCw className={cn("w-3 h-3 me-1", isSyncing && 'animate-spin')} />
                              {t('Sync Now', 'مزامنة الآن')}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-xs"
                              onClick={() => handleViewDetails(source)}
                            >
                              <Eye className="w-3 h-3 me-1" />
                              {t('View Details', 'عرض التفاصيل')}
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => handleOpenFieldMapping(source)}
                                  >
                                    <Settings className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t('Map Fields', 'تعيين الحقول')}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Connectors Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Globe className="w-5 h-5" />
            {t('Available Connectors', 'الموصلات المتاحة')}
          </CardTitle>
          <CardDescription>{t('Browse and connect new data sources', 'تصفح وتوصيل مصادر بيانات جديدة')}</CardDescription>
        </CardHeader>
        <CardContent>
          {unconnectedConnectors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-success" />
              <p className="font-medium">{t('All connectors are configured', 'تم تكوين جميع الموصلات')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {unconnectedConnectors.map((connector) => (
                <Card key={connector.id} className="border hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{connector.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{connector.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{connector.category}</Badge>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{connector.description}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      size="sm"
                      onClick={() => {
                        setSelectedConnector(connector.id);
                        handleOpenWizard();
                      }}
                    >
                      <Plus className="w-3 h-3 me-1" />
                      {t('Connect', 'توصيل')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connector Details Drawer */}
      <Sheet open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="text-xl">{AVAILABLE_CONNECTORS.find(c => c.id === selectedSource?.connectorId)?.icon}</span>
              {selectedSource?.name}
            </SheetTitle>
            <SheetDescription>{selectedSource?.org}</SheetDescription>
          </SheetHeader>

          {selectedSource && (
            <ScrollArea className="h-[calc(100vh-160px)] mt-4">
              <div className="space-y-4 pr-4">
                {/* Status & Auth */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('Connection Details', 'تفاصيل الاتصال')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('Status', 'الحالة')}</p>
                      <Badge variant="outline" className={STATUS_CONFIG[selectedSource.status as keyof typeof STATUS_CONFIG]?.color}>
                        {selectedSource.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Auth Method', 'طريقة المصادقة')}</p>
                      <p className="font-medium">{selectedSource.authType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Last Auth Check', 'آخر فحص')}</p>
                      <p className="text-xs">{selectedSource.lastAuthCheck ? formatDistanceToNow(selectedSource.lastAuthCheck, { addSuffix: true }) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Environment', 'البيئة')}</p>
                      <Badge variant="secondary">{selectedSource.environment}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Coverage Breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {t('Coverage Breakdown', 'تفاصيل التغطية')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent className="max-w-48">
                            <p className="text-xs">{t('Records count per data domain', 'عدد السجلات لكل نطاق بيانات')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedSource.domains.map(d => (
                      <div key={d} className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          {DATA_DOMAINS.find(dd => dd.id === d)?.icon} {DATA_DOMAINS.find(dd => dd.id === d)?.label}
                        </span>
                        <span className="font-mono text-sm">{Math.floor(selectedSource.recordsSynced / selectedSource.domains.length).toLocaleString()}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Sync Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('Sync Information', 'معلومات المزامنة')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('Last Sync', 'آخر مزامنة')}</p>
                      <p className="font-medium">{formatDistanceToNow(selectedSource.lastSync, { addSuffix: true })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Last Run Duration', 'مدة آخر تشغيل')}</p>
                      <p className="font-mono">{selectedSource.lastRunDuration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Schedule', 'الجدول')}</p>
                      <p className="text-xs">{selectedSource.schedule}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Owner', 'المالك')}</p>
                      <p className="font-medium">{selectedSource.owner}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mapping Status */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{t('Field Mapping', 'تعيين الحقول')}</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => { setDetailDrawerOpen(false); handleOpenFieldMapping(selectedSource); }}>
                        {t('Open Mapping', 'فتح التعيين')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{t('Mapped', 'معين')}</span>
                      <span className="font-bold">{Math.round((selectedSource.fieldsMapped / selectedSource.fieldsTotal) * 100)}%</span>
                    </div>
                    <Progress value={(selectedSource.fieldsMapped / selectedSource.fieldsTotal) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedSource.fieldsMapped}/{selectedSource.fieldsTotal} {t('fields configured', 'حقول مكونة')}
                    </p>
                  </CardContent>
                </Card>

                {/* Error Panel */}
                {selectedSource.errorDetails && (
                  <Card className="border-destructive/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {t('Connection Error', 'خطأ الاتصال')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="destructive" className="font-mono">{selectedSource.errorDetails.code}</Badge>
                      <p className="text-sm">{selectedSource.errorDetails.message}</p>
                      <div className="p-3 rounded bg-success/10 border border-success/30">
                        <p className="text-xs font-medium text-success flex items-center gap-1 mb-1">
                          <Zap className="w-3 h-3" /> {t('Suggested Fix', 'الإصلاح المقترح')}
                        </p>
                        <p className="text-sm">{selectedSource.errorDetails.suggestedFix}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {selectedSource.status === 'error' ? (
                    <Button className="w-full" onClick={() => { setDetailDrawerOpen(false); handleFixConnection(selectedSource); }}>
                      <Wrench className="w-4 h-4 me-2" />
                      {t('Fix Connection', 'إصلاح الاتصال')}
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleSyncNow(selectedSource)} disabled={selectedSource.status === 'syncing'}>
                      <RefreshCw className={cn("w-4 h-4 me-2", selectedSource.status === 'syncing' && 'animate-spin')} />
                      {t('Sync Now', 'مزامنة الآن')}
                    </Button>
                  )}
                  <Button className="w-full" variant="outline" onClick={handleTestConnection}>
                    <Activity className="w-4 h-4 me-2" />
                    {t('Test Connection', 'اختبار الاتصال')}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Fix Connection Modal */}
      <Dialog open={fixConnectionOpen} onOpenChange={setFixConnectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Fix Connection', 'إصلاح الاتصال')}</DialogTitle>
            <DialogDescription>{selectedSource?.name} - {t('Update connection settings', 'تحديث إعدادات الاتصال')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Host', 'المضيف')}</Label>
              <Input defaultValue="sftp.globalbank.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('Port', 'المنفذ')}</Label>
                <Input defaultValue="22" type="number" />
              </div>
              <div className="space-y-2">
                <Label>{t('Timeout (s)', 'المهلة (ث)')}</Label>
                <Input defaultValue="30" type="number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('Username', 'اسم المستخدم')}</Label>
              <Input defaultValue="bnft_integration" />
            </div>
            <div className="space-y-2">
              <Label>{t('Auth Method', 'طريقة المصادقة')}</Label>
              <Select defaultValue="password">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="password">{t('Password', 'كلمة المرور')}</SelectItem>
                  <SelectItem value="ssh_key">{t('SSH Key', 'مفتاح SSH')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Password', 'كلمة المرور')}</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFixConnectionOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Activity className="w-4 h-4 me-2" />}
              {t('Test Connection', 'اختبار الاتصال')}
            </Button>
            <Button onClick={handleTestAndFix} disabled={isTesting}>
              <CheckCircle className="w-4 h-4 me-2" />
              {t('Save & Connect', 'حفظ وتوصيل')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Wizard Dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('Connect Data Source', 'توصيل مصدر البيانات')}</DialogTitle>
            <DialogDescription>{t(`Step ${wizardStep} of 5`, `الخطوة ${wizardStep} من 5`)}</DialogDescription>
          </DialogHeader>

          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className={cn("h-1.5 flex-1 rounded", step <= wizardStep ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>

          {wizardStep === 1 && (
            <div className="space-y-4">
              <Label>{t('Select Connector', 'اختر الموصل')}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {AVAILABLE_CONNECTORS.map((connector) => (
                  <div
                    key={connector.id}
                    onClick={() => setSelectedConnector(connector.id)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      selectedConnector === connector.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="text-2xl mb-1">{connector.icon}</div>
                    <p className="font-medium text-sm">{connector.name}</p>
                    <p className="text-[10px] text-muted-foreground">{connector.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <Label>{t('Organization Scope', 'نطاق المنظمة')}</Label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Organizations', 'جميع المنظمات')}</SelectItem>
                  <SelectItem value="acme">Acme Corp</SelectItem>
                  <SelectItem value="techstart">TechStart Inc</SelectItem>
                  <SelectItem value="globalbank">GlobalBank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {wizardStep === 3 && selectedConnector && (
            <div className="space-y-4">
              <Label>{t('Authentication Method', 'طريقة المصادقة')}</Label>
              <div className="space-y-2">
                {AVAILABLE_CONNECTORS.find(c => c.id === selectedConnector)?.authMethods.map((method) => (
                  <div
                    key={method}
                    onClick={() => setAuthMethod(method)}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all flex items-center gap-3",
                      authMethod === method ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    {method === 'oauth' && <Shield className="w-5 h-5" />}
                    {method === 'api_key' && <Key className="w-5 h-5" />}
                    {method === 'sftp' && <Server className="w-5 h-5" />}
                    {method === 'upload' && <FileSpreadsheet className="w-5 h-5" />}
                    <div>
                      <p className="font-medium capitalize">{method.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {method === 'oauth' && 'Secure OAuth 2.0'}
                        {method === 'api_key' && 'API key authentication'}
                        {method === 'sftp' && 'SFTP file transfer'}
                        {method === 'upload' && 'Manual file upload'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label>{t('Data Scopes', 'نطاقات البيانات')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {DATA_DOMAINS.map((domain) => (
                    <div
                      key={domain.id}
                      onClick={() => {
                        setSelectedDomains(prev => prev.includes(domain.id) ? prev.filter(d => d !== domain.id) : [...prev, domain.id]);
                      }}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-2",
                        selectedDomains.includes(domain.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox checked={selectedDomains.includes(domain.id)} />
                      <span className="text-xl">{domain.icon}</span>
                      <span className="text-sm">{isRTL ? domain.labelAr : domain.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>{t('Sync Frequency', 'تردد المزامنة')}</Label>
                <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYNC_FREQUENCIES.map(f => (
                      <SelectItem key={f.value} value={f.value}>{isRTL ? f.labelAr : f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {wizardStep === 5 && (
            <div className="space-y-4 text-center py-4">
              {testResult === null && (
                <>
                  <div className="p-4 rounded-full bg-muted w-16 h-16 mx-auto flex items-center justify-center">
                    <Server className="w-8 h-8" />
                  </div>
                  <p>{t('Ready to test the connection', 'جاهز لاختبار الاتصال')}</p>
                  <Button onClick={handleTestConnection} disabled={isTesting}>
                    {isTesting ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Activity className="w-4 h-4 me-2" />}
                    {t('Test Connection', 'اختبار الاتصال')}
                  </Button>
                </>
              )}
              {testResult === 'pending' && (
                <>
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                  <p>{t('Testing connection...', 'جاري اختبار الاتصال...')}</p>
                </>
              )}
              {testResult === 'success' && (
                <>
                  <div className="p-4 rounded-full bg-success/10 w-16 h-16 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-success font-medium">{t('Connection successful!', 'الاتصال ناجح!')}</p>
                </>
              )}
              {testResult === 'failure' && (
                <>
                  <div className="p-4 rounded-full bg-destructive/10 w-16 h-16 mx-auto flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-destructive font-medium">{t('Connection failed', 'فشل الاتصال')}</p>
                  <Button variant="outline" onClick={handleTestConnection}>{t('Retry', 'إعادة')}</Button>
                </>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {wizardStep > 1 && (
              <Button variant="outline" onClick={() => setWizardStep(s => s - 1)}>{t('Back', 'رجوع')}</Button>
            )}
            {wizardStep < 5 && (
              <Button 
                onClick={() => setWizardStep(s => s + 1)}
                disabled={(wizardStep === 1 && !selectedConnector) || (wizardStep === 3 && !authMethod) || (wizardStep === 4 && selectedDomains.length === 0)}
              >
                {t('Next', 'التالي')}
                <ArrowRight className="w-4 h-4 ms-2" />
              </Button>
            )}
            {wizardStep === 5 && testResult === 'success' && (
              <Button onClick={handleSaveConnector}>
                <CheckCircle className="w-4 h-4 me-2" />
                {t('Save & Connect', 'حفظ وتوصيل')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Mapping Sheet */}
      <Sheet open={fieldMappingOpen} onOpenChange={setFieldMappingOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{t('Field Mapping', 'تعيين الحقول')}</SheetTitle>
            <SheetDescription>{selectedSource?.name}</SheetDescription>
          </SheetHeader>

          {requiredUnmapped > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{requiredUnmapped} {t('required fields unmapped', 'حقول مطلوبة غير معينة')}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Source', 'المصدر')}</TableHead>
                  <TableHead></TableHead>
                  <TableHead>{t('Platform', 'المنصة')}</TableHead>
                  <TableHead>{t('Transform', 'التحويل')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldMappings.map((mapping, idx) => {
                  const isRequired = REQUIRED_FIELDS.find(r => r.id === mapping.bnftField)?.required;
                  return (
                    <TableRow key={idx} className={mapping.status === 'unmapped' ? 'bg-destructive/5' : ''}>
                      <TableCell>
                        {mapping.sourceField ? (
                          <Badge variant="secondary" className="font-mono text-xs">{mapping.sourceField}</Badge>
                        ) : (
                          <span className="text-destructive text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell><ArrowRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                      <TableCell>
                        <Badge variant={mapping.status === 'mapped' ? 'outline' : 'destructive'} className="font-mono text-xs">
                          {mapping.bnftField}
                          {isRequired && <span className="text-destructive ms-1">*</span>}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {mapping.transform ? (
                          <Badge variant="outline" className="text-[10px]">{mapping.transform}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setFieldMappingOpen(false)}>{t('Close', 'إغلاق')}</Button>
            <Button onClick={async () => {
              await createAuditLog({
                action: 'SETTINGS_UPDATE',
                entityType: 'settings',
                entityId: selectedSource?.id || '',
                metadata: { setting_type: 'field_mapping', action: 'field_mapping_updated' },
              });
              toast.success(t('Field mappings saved', 'تم حفظ التعيينات'));
              setFieldMappingOpen(false);
            }}>
              {t('Save Mappings', 'حفظ التعيينات')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
