import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertCircle, HelpCircle, ChevronRight, Copy, Wrench, ExternalLink, Play
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

// Available connectors configuration
const AVAILABLE_CONNECTORS = [
  { id: 'workday', name: 'Workday', icon: '🔷', category: 'HRIS', authMethods: ['oauth', 'api_key'], domains: ['employees', 'payroll', 'benefits', 'leave'] },
  { id: 'sap_sf', name: 'SAP SuccessFactors', icon: '🟦', category: 'HRIS', authMethods: ['oauth', 'api_key'], domains: ['employees', 'payroll'] },
  { id: 'oracle_hcm', name: 'Oracle HCM', icon: '🔶', category: 'HRIS', authMethods: ['oauth', 'api_key'], domains: ['employees', 'payroll', 'benefits'] },
  { id: 'bamboohr', name: 'BambooHR', icon: '🌿', category: 'HRIS', authMethods: ['api_key'], domains: ['employees'] },
  { id: 'entra_id', name: 'Microsoft Entra ID', icon: '🔵', category: 'SSO/SCIM', authMethods: ['oauth'], domains: ['employees'] },
  { id: 'google_workspace', name: 'Google Workspace', icon: '🔴', category: 'SSO', authMethods: ['oauth'], domains: ['employees'] },
  { id: 'azure_ad', name: 'Azure AD', icon: '⚡', category: 'SSO/SCIM', authMethods: ['oauth'], domains: ['employees'] },
  { id: 'csv_sftp', name: 'CSV/SFTP', icon: '📁', category: 'Manual', authMethods: ['sftp', 'upload'], domains: ['employees', 'payroll', 'benefits', 'claims'] },
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

// Sample connected sources with health data
const INITIAL_CONNECTED_SOURCES = [
  { 
    id: '1', connectorId: 'sap_sf', name: 'SAP SuccessFactors', status: 'connected', 
    coverage: 95, lastSync: new Date(Date.now() - 1000 * 60 * 15), recordsSynced: 12450,
    healthScore: 98, domains: ['employees', 'payroll'], frequency: 'hourly',
    missingFields: ['manager_id'], org: 'All Organizations', authType: 'OAuth 2.0',
    environment: 'Production', owner: 'IT Admin', createdAt: new Date('2024-06-15'),
    schedule: 'Every hour at :00', fieldsMapped: 8, fieldsTotal: 9,
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
    recentRuns: [
      { id: 'run-4', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 60), duration: '8m 45s', recordsIn: 8920, recordsOut: 8915, errors: 5, retries: 0 },
      { id: 'run-5', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 25), duration: '8m 32s', recordsIn: 8918, recordsOut: 8918, errors: 0, retries: 0 },
    ],
  },
  { 
    id: '3', connectorId: 'bamboohr', name: 'BambooHR', status: 'syncing', 
    coverage: 72, lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), recordsSynced: 5600,
    healthScore: 78, domains: ['employees'], frequency: 'hourly',
    missingFields: ['dependent_count', 'plan_tier'], org: 'TechStart Inc', authType: 'API Key',
    environment: 'Production', owner: 'HR Ops', createdAt: new Date('2024-10-01'),
    schedule: 'Every hour at :30', fieldsMapped: 6, fieldsTotal: 9,
    recentRuns: [
      { id: 'run-6', status: 'running', startedAt: new Date(Date.now() - 1000 * 60 * 5), duration: '5m 12s...', recordsIn: 3200, recordsOut: 2890, errors: 0, retries: 0 },
    ],
  },
  { 
    id: '4', connectorId: 'csv_sftp', name: 'Payroll CSV Feed', status: 'error', 
    coverage: 45, lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24), recordsSynced: 2100,
    healthScore: 35, domains: ['payroll'], frequency: 'daily',
    missingFields: ['cost_center', 'budget_code'], org: 'GlobalBank', authType: 'SFTP',
    environment: 'Production', owner: 'Finance IT', createdAt: new Date('2024-11-10'),
    schedule: 'Daily at 04:00 UTC', fieldsMapped: 5, fieldsTotal: 9,
    error: 'SFTP connection failed: Authentication timeout',
    errorDetails: {
      code: 'SFTP_AUTH_TIMEOUT',
      message: 'Connection to sftp.globalbank.com timed out after 30 seconds. The server did not respond to the authentication request.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      suggestedFix: 'Verify SFTP credentials are correct and the server is accessible. Check firewall rules and IP whitelist.',
    },
    recentRuns: [
      { id: 'run-7', status: 'failed', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), duration: '0m 32s', recordsIn: 0, recordsOut: 0, errors: 1, retries: 3 },
      { id: 'run-8', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), duration: '2m 18s', recordsIn: 2100, recordsOut: 2100, errors: 0, retries: 0 },
    ],
  },
];

// Sample field mappings
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
  const [fieldMappings, setFieldMappings] = useState(SAMPLE_FIELD_MAPPINGS);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const connectedCount = sources.filter(s => s.status === 'connected' || s.status === 'syncing').length;
  const avgCoverage = Math.round(sources.reduce((acc, s) => acc + s.coverage, 0) / sources.length);
  const errorCount = sources.filter(s => s.status === 'error').length;
  const avgHealth = Math.round(sources.reduce((acc, s) => acc + s.healthScore, 0) / sources.length);

  const metrics = [
    { title: t('Total Connectors', 'إجمالي الموصلات'), value: sources.length, icon: Database },
    { title: t('Connected', 'متصل'), value: connectedCount, icon: CheckCircle },
    { title: t('Avg Health', 'متوسط الصحة'), value: `${avgHealth}%`, icon: Activity },
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
      recentRuns: [],
    };

    setSources(prev => [...prev, newSource]);
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: newSource.id,
      metadata: {
        setting_type: 'connector',
        action: 'connector_created',
        connector_name: connector.name,
        domains: selectedDomains,
        frequency: syncFrequency,
      },
    });

    toast.success(t(`Connected ${connector.name}`, `تم توصيل ${connector.name}`));
    setWizardOpen(false);
  };

  const handleSync = async (source: typeof sources[0]) => {
    toast.info(t(`Syncing ${source.name}...`, `جاري مزامنة ${source.name}...`));
    
    setSources(prev => prev.map(s => 
      s.id === source.id ? { ...s, status: 'syncing' as const } : s
    ));

    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: source.id,
      metadata: {
        setting_type: 'connector',
        action: 'sync_started',
        connector_name: source.name,
      },
    });

    setTimeout(() => {
      setSources(prev => prev.map(s => 
        s.id === source.id ? { ...s, status: 'connected' as const, lastSync: new Date() } : s
      ));
      toast.success(t(`${source.name} synced successfully`, `تمت مزامنة ${source.name} بنجاح`));
    }, 3000);
  };

  const handleRetry = async (source: typeof sources[0]) => {
    toast.info(t(`Retrying ${source.name}...`, `إعادة محاولة ${source.name}...`));
    
    setSources(prev => prev.map(s => 
      s.id === source.id ? { ...s, status: 'syncing' as const, error: undefined, errorDetails: undefined } : s
    ));

    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: source.id,
      metadata: {
        setting_type: 'connector',
        action: 'sync_retried',
        connector_name: source.name,
      },
    });

    setTimeout(() => {
      setSources(prev => prev.map(s => 
        s.id === source.id ? { ...s, status: 'connected' as const, lastSync: new Date(), healthScore: 85 } : s
      ));
      toast.success(t(`${source.name} recovered successfully`, `تم استرداد ${source.name} بنجاح`));
    }, 3000);
  };

  const handleOpenFieldMapping = (source: typeof sources[0]) => {
    setSelectedSource(source);
    setFieldMappingOpen(true);
  };

  const handleOpenDetails = (source: typeof sources[0]) => {
    setSelectedSource(source);
    setDetailDrawerOpen(true);
  };

  const unmappedCount = fieldMappings.filter(f => f.status === 'unmapped').length;
  const requiredUnmapped = fieldMappings.filter(f => 
    f.status === 'unmapped' && REQUIRED_FIELDS.find(r => r.id === f.bnftField)?.required
  ).length;

  const getStatusCTA = (source: typeof sources[0]) => {
    switch (source.status) {
      case 'connected':
        return { primary: 'Sync Now', secondary: 'View Logs', icon: RefreshCw, action: () => handleSync(source) };
      case 'syncing':
        return { primary: 'View Run', secondary: 'Cancel', icon: Eye, action: () => handleOpenDetails(source) };
      case 'error':
        return { primary: 'Troubleshoot', secondary: 'Retry', icon: Wrench, action: () => handleOpenDetails(source) };
      default:
        return { primary: 'Connect', secondary: null, icon: Link2, action: handleOpenWizard };
    }
  };

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
          <CardDescription>{t('Click any card to view details', 'انقر على أي بطاقة لعرض التفاصيل')}</CardDescription>
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
                const cta = getStatusCTA(source);
                
                return (
                  <Card 
                    key={source.id} 
                    className={cn(
                      "border-l-4 cursor-pointer transition-all hover:shadow-md",
                      source.status === 'error' ? 'border-l-destructive' : 
                      source.status === 'syncing' ? 'border-l-blue-500' : 'border-l-success'
                    )}
                    onClick={() => handleOpenDetails(source)}
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
                          <statusConfig.icon className={cn("w-3 h-3 me-1", source.status === 'syncing' && 'animate-spin')} />
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
                              <p className="text-xs max-w-48">{t('Health score based on sync success rate, error frequency, and data completeness', 'نقاط الصحة بناءً على معدل نجاح المزامنة')}</p>
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
                              <p className="text-xs max-w-48">{t('Percentage of required fields mapped and populated', 'نسبة الحقول المطلوبة المعينة والمعبأة')}</p>
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

                      <div className={cn("flex gap-2", isRTL && "flex-row-reverse")} onClick={e => e.stopPropagation()}>
                        <Button 
                          variant={source.status === 'error' ? 'destructive' : 'outline'} 
                          size="sm" 
                          className="flex-1 text-xs" 
                          onClick={() => source.status === 'error' ? handleRetry(source) : cta.action()}
                          disabled={source.status === 'syncing'}
                        >
                          <cta.icon className={cn("w-3 h-3 me-1", source.status === 'syncing' && 'animate-spin')} />
                          {source.status === 'error' ? t('Retry', 'إعادة') : t(cta.primary, cta.primary)}
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleOpenDetails(source)}>
                          <Eye className="w-3 h-3 me-1" />
                          {t('Details', 'التفاصيل')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Connectors */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Globe className="w-5 h-5" />
            {t('Available Connectors', 'الموصلات المتاحة')}
          </CardTitle>
          <CardDescription>{t('Click to connect a new data source', 'انقر لتوصيل مصدر بيانات جديد')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_CONNECTORS.map((connector) => {
              const isConnected = sources.some(s => s.connectorId === connector.id);
              return (
                <div
                  key={connector.id}
                  onClick={() => !isConnected && handleOpenWizard()}
                  className={cn(
                    "p-4 rounded-lg border text-center cursor-pointer transition-all",
                    isConnected 
                      ? "bg-success/5 border-success/30 opacity-75" 
                      : "hover:bg-muted/50 hover:border-primary/30"
                  )}
                >
                  <div className="text-3xl mb-2">{connector.icon}</div>
                  <p className="font-medium text-sm">{connector.name}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{connector.category}</Badge>
                  {isConnected && (
                    <Badge variant="outline" className="text-[10px] mt-1 ms-1 bg-success/10 text-success">
                      <CheckCircle className="w-2 h-2 me-1" /> Connected
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
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
                {/* Status & Overview */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('Overview', 'نظرة عامة')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('Status', 'الحالة')}</p>
                      <Badge variant="outline" className={STATUS_CONFIG[selectedSource.status as keyof typeof STATUS_CONFIG]?.color}>
                        {selectedSource.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Auth Type', 'نوع المصادقة')}</p>
                      <p className="font-medium">{selectedSource.authType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Environment', 'البيئة')}</p>
                      <Badge variant="secondary">{selectedSource.environment}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Owner', 'المالك')}</p>
                      <p className="font-medium">{selectedSource.owner}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Schedule', 'الجدول')}</p>
                      <p className="text-xs font-mono">{selectedSource.schedule}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Created', 'تم الإنشاء')}</p>
                      <p className="text-xs">{format(selectedSource.createdAt, 'MMM d, yyyy')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Scopes */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('Data Scopes', 'نطاقات البيانات')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {selectedSource.domains.map(d => (
                        <Badge key={d} variant="secondary">
                          {DATA_DOMAINS.find(dd => dd.id === d)?.icon} {DATA_DOMAINS.find(dd => dd.id === d)?.label}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Health & Coverage */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {t('Health & Coverage', 'الصحة والتغطية')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-64">
                            <p className="text-xs"><strong>Health:</strong> Based on sync success rate and error frequency</p>
                            <p className="text-xs mt-1"><strong>Coverage:</strong> Percentage of required fields mapped</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('Health Score', 'نقاط الصحة')}</span>
                        <span className="font-bold">{selectedSource.healthScore}%</span>
                      </div>
                      <Progress value={selectedSource.healthScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('Field Coverage', 'تغطية الحقول')}</span>
                        <span className="font-bold">{selectedSource.coverage}%</span>
                      </div>
                      <Progress value={selectedSource.coverage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Runs */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('Recent Runs (Last 10)', 'التشغيلات الأخيرة')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSource.recentRuns && selectedSource.recentRuns.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSource.recentRuns.map((run, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
                            <div className="flex items-center gap-2">
                              {run.status === 'success' && <CheckCircle className="w-3 h-3 text-success" />}
                              {run.status === 'failed' && <XCircle className="w-3 h-3 text-destructive" />}
                              {run.status === 'running' && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
                              <span>{formatDistanceToNow(run.startedAt, { addSuffix: true })}</span>
                            </div>
                            <span className="font-mono">{run.duration}</span>
                            <span>{run.recordsIn.toLocaleString()} → {run.recordsOut.toLocaleString()}</span>
                            {run.errors > 0 && <Badge variant="destructive" className="text-[10px]">{run.errors} err</Badge>}
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">{t('No runs yet', 'لا توجد تشغيلات بعد')}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Field Mapping */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{t('Field Mapping', 'تعيين الحقول')}</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => handleOpenFieldMapping(selectedSource)}>
                        {t('Open Mapping', 'فتح التعيين')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{Math.round((selectedSource.fieldsMapped / selectedSource.fieldsTotal) * 100)}%</p>
                        <p className="text-xs text-muted-foreground">{selectedSource.fieldsMapped}/{selectedSource.fieldsTotal} {t('fields mapped', 'حقول معينة')}</p>
                      </div>
                      {selectedSource.missingFields.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {selectedSource.missingFields.length} {t('unmapped required', 'مطلوبة غير معينة')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Errors Section */}
                {selectedSource.errorDetails && (
                  <Card className="border-destructive/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {t('Error Details', 'تفاصيل الخطأ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{t('Error Code', 'رمز الخطأ')}</p>
                        <Badge variant="destructive" className="font-mono">{selectedSource.errorDetails.code}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('Message', 'الرسالة')}</p>
                        <p className="text-sm">{selectedSource.errorDetails.message}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('Timestamp', 'الوقت')}</p>
                        <p className="text-sm font-mono">{format(selectedSource.errorDetails.timestamp, 'yyyy-MM-dd HH:mm:ss')}</p>
                      </div>
                      <Separator />
                      <div className="p-3 rounded bg-success/10 border border-success/30">
                        <p className="text-xs font-medium text-success flex items-center gap-1 mb-1">
                          <Wrench className="w-3 h-3" /> {t('Suggested Fix', 'الإصلاح المقترح')}
                        </p>
                        <p className="text-sm">{selectedSource.errorDetails.suggestedFix}</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedSource.errorDetails, null, 2));
                        toast.success(t('Copied to clipboard', 'تم النسخ'));
                      }}>
                        <Copy className="w-3 h-3 me-2" />
                        {t('Copy Details', 'نسخ التفاصيل')}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {selectedSource.status === 'error' ? (
                    <>
                      <Button className="w-full" onClick={() => handleRetry(selectedSource)}>
                        <RefreshCw className="w-4 h-4 me-2" />
                        {t('Retry Connection', 'إعادة الاتصال')}
                      </Button>
                      <Button className="w-full" variant="outline" onClick={() => handleOpenDetails(selectedSource)}>
                        <Wrench className="w-4 h-4 me-2" />
                        {t('Troubleshoot', 'استكشاف الأخطاء')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full" onClick={() => handleSync(selectedSource)} disabled={selectedSource.status === 'syncing'}>
                        <RefreshCw className={cn("w-4 h-4 me-2", selectedSource.status === 'syncing' && 'animate-spin')} />
                        {selectedSource.status === 'syncing' ? t('Syncing...', 'مزامنة...') : t('Sync Now', 'مزامنة الآن')}
                      </Button>
                      <Button className="w-full" variant="outline" onClick={() => handleOpenFieldMapping(selectedSource)}>
                        <Settings className="w-4 h-4 me-2" />
                        {t('Edit Field Mapping', 'تعديل تعيين الحقول')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Connect Wizard Dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('Connect Data Source', 'توصيل مصدر البيانات')}</DialogTitle>
            <DialogDescription>
              {t(`Step ${wizardStep} of 5`, `الخطوة ${wizardStep} من 5`)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className={cn("h-1.5 flex-1 rounded", step <= wizardStep ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>

          {/* Step 1: Select Connector */}
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

          {/* Step 2: Organization Scope */}
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
              <p className="text-xs text-muted-foreground">
                {t('Select which organization this data source will sync to', 'اختر المنظمة التي سيتم مزامنة مصدر البيانات هذا إليها')}
              </p>
            </div>
          )}

          {/* Step 3: Auth Method */}
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
                        {method === 'oauth' && 'Secure OAuth 2.0 connection'}
                        {method === 'api_key' && 'API key authentication'}
                        {method === 'sftp' && 'SFTP file transfer'}
                        {method === 'upload' && 'Manual file upload'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {authMethod === 'api_key' && (
                <div className="space-y-2">
                  <Label>{t('API Key', 'مفتاح API')}</Label>
                  <Input type="password" placeholder="sk-..." />
                </div>
              )}
              {authMethod === 'sftp' && (
                <div className="space-y-2">
                  <Label>{t('SFTP Host', 'مضيف SFTP')}</Label>
                  <Input placeholder="sftp.company.com" />
                  <Label>{t('Username', 'اسم المستخدم')}</Label>
                  <Input placeholder="username" />
                  <Label>{t('Password', 'كلمة المرور')}</Label>
                  <Input type="password" />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Data Domains & Frequency */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label>{t('Data Scopes', 'نطاقات البيانات')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {DATA_DOMAINS.map((domain) => (
                    <div
                      key={domain.id}
                      onClick={() => {
                        setSelectedDomains(prev => 
                          prev.includes(domain.id) 
                            ? prev.filter(d => d !== domain.id) 
                            : [...prev, domain.id]
                        );
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

          {/* Step 5: Test Connection */}
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
                  <p className="text-sm text-muted-foreground">{t('Ready to save and start syncing', 'جاهز للحفظ وبدء المزامنة')}</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Badge variant="secondary">{t('Next: Map Fields', 'التالي: تعيين الحقول')}</Badge>
                    <Badge variant="secondary">{t('Then: Run First Sync', 'ثم: تشغيل المزامنة الأولى')}</Badge>
                  </div>
                </>
              )}
              {testResult === 'failure' && (
                <>
                  <div className="p-4 rounded-full bg-destructive/10 w-16 h-16 mx-auto flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-destructive font-medium">{t('Connection failed', 'فشل الاتصال')}</p>
                  <p className="text-sm text-muted-foreground">{t('Check credentials and try again', 'تحقق من بيانات الاعتماد وحاول مرة أخرى')}</p>
                  <Button variant="outline" onClick={handleTestConnection}>
                    {t('Retry', 'إعادة المحاولة')}
                  </Button>
                </>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {wizardStep > 1 && (
              <Button variant="outline" onClick={() => setWizardStep(s => s - 1)}>
                {t('Back', 'رجوع')}
              </Button>
            )}
            {wizardStep < 5 && (
              <Button 
                onClick={() => setWizardStep(s => s + 1)}
                disabled={
                  (wizardStep === 1 && !selectedConnector) ||
                  (wizardStep === 3 && !authMethod) ||
                  (wizardStep === 4 && selectedDomains.length === 0)
                }
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
            <SheetDescription>
              {selectedSource?.name} - {t('Configure how source fields map to platform fields', 'تكوين كيفية تعيين حقول المصدر إلى حقول المنصة')}
            </SheetDescription>
          </SheetHeader>

          {requiredUnmapped > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {requiredUnmapped} {t('required fields are unmapped', 'حقول مطلوبة غير معينة')}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Source Field', 'حقل المصدر')}</TableHead>
                  <TableHead></TableHead>
                  <TableHead>{t('bnft Field', 'حقل المنصة')}</TableHead>
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
            <Button variant="outline" onClick={() => setFieldMappingOpen(false)}>
              {t('Close', 'إغلاق')}
            </Button>
            <Button onClick={async () => {
              await createAuditLog({
                action: 'SETTINGS_UPDATE',
                entityType: 'settings',
                entityId: selectedSource?.id || '',
                metadata: { setting_type: 'field_mapping', action: 'field_mapping_updated' },
              });
              toast.success(t('Field mappings saved', 'تم حفظ تعيينات الحقول'));
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
