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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Database, CheckCircle, XCircle, Clock, AlertTriangle, 
  RefreshCw, Link2, Unlink, Settings, Plus, Activity, ArrowRight,
  Key, Globe, Server, FileSpreadsheet, Shield, Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

// Available connectors configuration
const AVAILABLE_CONNECTORS = [
  { id: 'workday', name: 'Workday', icon: '🔷', category: 'HRIS', authMethods: ['oauth', 'api_key'], domains: ['employees', 'payroll', 'benefits'] },
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
    missingFields: ['manager_id'], org: 'All Organizations'
  },
  { 
    id: '2', connectorId: 'oracle_hcm', name: 'Oracle HCM', status: 'connected', 
    coverage: 88, lastSync: new Date(Date.now() - 1000 * 60 * 60), recordsSynced: 8920,
    healthScore: 92, domains: ['employees', 'payroll', 'benefits'], frequency: 'daily',
    missingFields: ['bonus_date'], org: 'Acme Corp'
  },
  { 
    id: '3', connectorId: 'bamboohr', name: 'BambooHR', status: 'syncing', 
    coverage: 72, lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), recordsSynced: 5600,
    healthScore: 78, domains: ['employees'], frequency: 'hourly',
    missingFields: ['dependent_count', 'plan_tier'], org: 'TechStart Inc'
  },
  { 
    id: '4', connectorId: 'csv_sftp', name: 'Payroll CSV Feed', status: 'error', 
    coverage: 45, lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24), recordsSynced: 2100,
    healthScore: 35, domains: ['payroll'], frequency: 'daily',
    missingFields: ['cost_center', 'budget_code'], org: 'GlobalBank',
    error: 'SFTP connection failed: Authentication timeout'
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 80% success rate for demo
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

    // Simulate sync
    setTimeout(() => {
      setSources(prev => prev.map(s => 
        s.id === source.id ? { ...s, status: 'connected' as const, lastSync: new Date() } : s
      ));
      toast.success(t(`${source.name} synced successfully`, `تمت مزامنة ${source.name} بنجاح`));
    }, 3000);
  };

  const handleOpenFieldMapping = (source: typeof sources[0]) => {
    setSelectedSource(source);
    setFieldMappingOpen(true);
  };

  const unmappedCount = fieldMappings.filter(f => f.status === 'unmapped').length;
  const requiredUnmapped = fieldMappings.filter(f => 
    f.status === 'unmapped' && REQUIRED_FIELDS.find(r => r.id === f.bnftField)?.required
  ).length;

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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => {
              const connector = AVAILABLE_CONNECTORS.find(c => c.id === source.connectorId);
              const statusConfig = STATUS_CONFIG[source.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_connected;
              
              return (
                <Card key={source.id} className={cn("border-l-4", source.status === 'error' ? 'border-l-destructive' : 'border-l-success')}>
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
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-lg font-bold">{source.healthScore}%</p>
                        <p className="text-[10px] text-muted-foreground">{t('Health', 'الصحة')}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-lg font-bold">{source.coverage}%</p>
                        <p className="text-[10px] text-muted-foreground">{t('Coverage', 'التغطية')}</p>
                      </div>
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

                    <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleSync(source)} disabled={source.status === 'syncing'}>
                        <RefreshCw className={cn("w-3 h-3 me-1", source.status === 'syncing' && 'animate-spin')} />
                        {t('Sync', 'مزامنة')}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleOpenFieldMapping(source)}>
                        <Settings className="w-3 h-3 me-1" />
                        {t('Map Fields', 'تعيين الحقول')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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

      {/* Connect Wizard Dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('Connect Data Source', 'توصيل مصدر البيانات')}</DialogTitle>
            <DialogDescription>
              {t(`Step ${wizardStep} of 5`, `الخطوة ${wizardStep} من 5`)}
            </DialogDescription>
          </DialogHeader>

          {/* Progress */}
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

          {/* Step 2: Auth Method */}
          {wizardStep === 2 && selectedConnector && (
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

          {/* Step 3: Map Organization */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <Label>{t('Map to Organization', 'تعيين إلى المنظمة')}</Label>
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

          {/* Step 4: Data Domains & Frequency */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label>{t('Data Domains', 'مجالات البيانات')}</Label>
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
                  (wizardStep === 2 && !authMethod) ||
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
