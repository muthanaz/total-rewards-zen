import { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Database, 
  Shield, 
  Users, 
  Building2, 
  Webhook, 
  Key, 
  CloudUpload,
  FileUp,
  Settings,
  Activity,
  Zap,
  Globe,
  HardDrive,
  BookOpen,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const pageTranslations = {
  en: {
    title: 'Integrations & Data Management',
    subtitle: 'Connect HR systems, import data, and manage organizational policies',
    
    // Tabs
    tabHRSystems: 'HR Systems',
    tabDataImport: 'Data Import',
    tabPolicies: 'Policy Documents',
    tabAPIWebhooks: 'API & Webhooks',
    tabAuditLogs: 'Audit Logs',
    
    // HR Systems
    hrSystemsTitle: 'HR System Integrations',
    hrSystemsDesc: 'Connect your existing HR, payroll, and workforce management systems',
    connected: 'Connected',
    disconnected: 'Not Connected',
    pending: 'Pending Setup',
    lastSync: 'Last synced',
    connect: 'Connect',
    configure: 'Configure',
    syncNow: 'Sync Now',
    viewLogs: 'View Logs',
    
    // Data Import
    dataImportTitle: 'Employee Data Import',
    dataImportDesc: 'Import employee records from Excel, CSV, or other formats',
    uploadFile: 'Upload File',
    dragDrop: 'Drag and drop files here, or click to browse',
    supportedFormats: 'Supported formats: XLS, XLSX, CSV, JSON',
    maxFileSize: 'Maximum file size: 50MB',
    recentImports: 'Recent Imports',
    importStatus: 'Status',
    recordsProcessed: 'Records Processed',
    downloadTemplate: 'Download Template',
    employeeTemplate: 'Employee Data Template',
    benefitsTemplate: 'Benefits Enrollment Template',
    dependentsTemplate: 'Dependents Data Template',
    
    // Policies
    policiesTitle: 'Organization Policy Documents',
    policiesDesc: 'Upload policy documents to automatically configure benefits and rules',
    uploadPolicy: 'Upload Policy',
    processingPolicy: 'Processing document...',
    policyProcessed: 'Policy processed and rules extracted',
    extractedRules: 'Extracted Rules',
    pendingReview: 'Pending Review',
    appliedRules: 'Applied to Platform',
    
    // API & Webhooks
    apiTitle: 'API Access & Webhooks',
    apiDesc: 'Manage API keys and configure webhook endpoints for real-time updates',
    apiKeys: 'API Keys',
    generateKey: 'Generate New Key',
    webhooks: 'Webhooks',
    addWebhook: 'Add Webhook',
    webhookUrl: 'Endpoint URL',
    webhookEvents: 'Events',
    
    // Audit Logs
    auditTitle: 'System Audit Logs',
    auditDesc: 'Track all data changes, imports, and integration activities',
    filterByType: 'Filter by Type',
    filterByDate: 'Filter by Date',
    exportLogs: 'Export Logs',
    
    // Status Messages
    syncInProgress: 'Synchronization in progress...',
    syncComplete: 'Synchronization completed successfully',
    importSuccess: 'Data imported successfully',
    policyUploaded: 'Policy document uploaded for processing',
    
    // Integration names
    intSAP: 'SAP SuccessFactors',
    intWorkday: 'Workday',
    intOracle: 'Oracle HCM',
    intBamboo: 'BambooHR',
    intADP: 'ADP Workforce',
    intPayroll: 'Payroll System',
    intAttendance: 'Attendance System',
    intCustom: 'Custom Integration',
    
    // Additional helpful features
    dataValidation: 'Data Validation',
    dataValidationDesc: 'Automatic validation of imported data against business rules',
    dataMapping: 'Field Mapping',
    dataMappingDesc: 'Map your data fields to platform fields',
    scheduledSync: 'Scheduled Sync',
    scheduledSyncDesc: 'Set up automatic data synchronization',
    securityCompliance: 'Security & Compliance',
    securityComplianceDesc: 'GDPR, SOC2, and data encryption standards',
  },
  ar: {
    title: 'التكاملات وإدارة البيانات',
    subtitle: 'ربط أنظمة الموارد البشرية واستيراد البيانات وإدارة سياسات المؤسسة',
    
    // Tabs
    tabHRSystems: 'أنظمة الموارد البشرية',
    tabDataImport: 'استيراد البيانات',
    tabPolicies: 'وثائق السياسات',
    tabAPIWebhooks: 'واجهات البرمجة',
    tabAuditLogs: 'سجلات المراجعة',
    
    // HR Systems
    hrSystemsTitle: 'تكامل أنظمة الموارد البشرية',
    hrSystemsDesc: 'اربط أنظمة الموارد البشرية والرواتب وإدارة القوى العاملة الحالية',
    connected: 'متصل',
    disconnected: 'غير متصل',
    pending: 'في انتظار الإعداد',
    lastSync: 'آخر مزامنة',
    connect: 'اتصال',
    configure: 'إعداد',
    syncNow: 'مزامنة الآن',
    viewLogs: 'عرض السجلات',
    
    // Data Import
    dataImportTitle: 'استيراد بيانات الموظفين',
    dataImportDesc: 'استيراد سجلات الموظفين من ملفات Excel أو CSV أو غيرها',
    uploadFile: 'رفع ملف',
    dragDrop: 'اسحب وأفلت الملفات هنا، أو انقر للتصفح',
    supportedFormats: 'الصيغ المدعومة: XLS, XLSX, CSV, JSON',
    maxFileSize: 'الحجم الأقصى للملف: 50 ميجابايت',
    recentImports: 'عمليات الاستيراد الأخيرة',
    importStatus: 'الحالة',
    recordsProcessed: 'السجلات المعالجة',
    downloadTemplate: 'تحميل القالب',
    employeeTemplate: 'قالب بيانات الموظفين',
    benefitsTemplate: 'قالب تسجيل المزايا',
    dependentsTemplate: 'قالب بيانات المعالين',
    
    // Policies
    policiesTitle: 'وثائق سياسات المؤسسة',
    policiesDesc: 'ارفع وثائق السياسات لتكوين المزايا والقواعد تلقائياً',
    uploadPolicy: 'رفع سياسة',
    processingPolicy: 'جاري معالجة الوثيقة...',
    policyProcessed: 'تمت معالجة السياسة واستخراج القواعد',
    extractedRules: 'القواعد المستخرجة',
    pendingReview: 'في انتظار المراجعة',
    appliedRules: 'مطبقة على المنصة',
    
    // API & Webhooks
    apiTitle: 'الوصول لواجهة البرمجة والويب هوك',
    apiDesc: 'إدارة مفاتيح API وتكوين نقاط نهاية الويب هوك للتحديثات الفورية',
    apiKeys: 'مفاتيح API',
    generateKey: 'إنشاء مفتاح جديد',
    webhooks: 'الويب هوك',
    addWebhook: 'إضافة ويب هوك',
    webhookUrl: 'رابط النقطة النهائية',
    webhookEvents: 'الأحداث',
    
    // Audit Logs
    auditTitle: 'سجلات مراجعة النظام',
    auditDesc: 'تتبع جميع تغييرات البيانات والاستيراد وأنشطة التكامل',
    filterByType: 'تصفية حسب النوع',
    filterByDate: 'تصفية حسب التاريخ',
    exportLogs: 'تصدير السجلات',
    
    // Status Messages
    syncInProgress: 'المزامنة قيد التنفيذ...',
    syncComplete: 'اكتملت المزامنة بنجاح',
    importSuccess: 'تم استيراد البيانات بنجاح',
    policyUploaded: 'تم رفع وثيقة السياسة للمعالجة',
    
    // Integration names
    intSAP: 'SAP SuccessFactors',
    intWorkday: 'Workday',
    intOracle: 'Oracle HCM',
    intBamboo: 'BambooHR',
    intADP: 'ADP Workforce',
    intPayroll: 'نظام الرواتب',
    intAttendance: 'نظام الحضور',
    intCustom: 'تكامل مخصص',
    
    // Additional helpful features
    dataValidation: 'التحقق من البيانات',
    dataValidationDesc: 'التحقق التلقائي من البيانات المستوردة وفقاً لقواعد العمل',
    dataMapping: 'ربط الحقول',
    dataMappingDesc: 'ربط حقول بياناتك بحقول المنصة',
    scheduledSync: 'المزامنة المجدولة',
    scheduledSyncDesc: 'إعداد مزامنة البيانات التلقائية',
    securityCompliance: 'الأمان والامتثال',
    securityComplianceDesc: 'معايير GDPR و SOC2 وتشفير البيانات',
  }
};

// HR System integrations data
const hrSystems = [
  { id: 'sap', nameKey: 'intSAP', icon: Building2, status: 'connected', lastSync: '2 hours ago', records: 1247 },
  { id: 'workday', nameKey: 'intWorkday', icon: Globe, status: 'disconnected', lastSync: null, records: 0 },
  { id: 'oracle', nameKey: 'intOracle', icon: Database, status: 'disconnected', lastSync: null, records: 0 },
  { id: 'bamboo', nameKey: 'intBamboo', icon: Users, status: 'pending', lastSync: null, records: 0 },
  { id: 'adp', nameKey: 'intADP', icon: HardDrive, status: 'disconnected', lastSync: null, records: 0 },
  { id: 'payroll', nameKey: 'intPayroll', icon: FileSpreadsheet, status: 'connected', lastSync: '1 day ago', records: 1247 },
  { id: 'attendance', nameKey: 'intAttendance', icon: Clock, status: 'connected', lastSync: '30 mins ago', records: 1180 },
  { id: 'custom', nameKey: 'intCustom', icon: Webhook, status: 'disconnected', lastSync: null, records: 0 },
];

// Recent imports data
const recentImports = [
  { id: 1, filename: 'employees_jan_2025.xlsx', date: '2025-01-10', records: 156, status: 'success' },
  { id: 2, filename: 'benefits_enrollment.csv', date: '2025-01-08', records: 89, status: 'success' },
  { id: 3, filename: 'dependents_update.xlsx', date: '2025-01-05', records: 234, status: 'partial', errors: 12 },
  { id: 4, filename: 'new_hires_dec.csv', date: '2024-12-28', records: 45, status: 'success' },
];

// Policy documents data
const policyDocuments = [
  { id: 1, name: 'Employee Benefits Policy 2025', uploadDate: '2025-01-05', status: 'processed', rulesExtracted: 24, rulesApplied: 22 },
  { id: 2, name: 'Leave Management Guidelines', uploadDate: '2025-01-03', status: 'processed', rulesExtracted: 18, rulesApplied: 18 },
  { id: 3, name: 'Housing Allowance Policy', uploadDate: '2024-12-20', status: 'review', rulesExtracted: 12, rulesApplied: 0 },
  { id: 4, name: 'Health Insurance Coverage', uploadDate: '2024-12-15', status: 'processed', rulesExtracted: 31, rulesApplied: 31 },
];

// Audit logs data
const auditLogs = [
  { id: 1, action: 'Data Import', user: 'Admin', timestamp: '2025-01-10 14:32', details: 'Imported 156 employee records', type: 'import' },
  { id: 2, action: 'Policy Update', user: 'HR Manager', timestamp: '2025-01-10 11:15', details: 'Updated housing allowance rules', type: 'policy' },
  { id: 3, action: 'System Sync', user: 'System', timestamp: '2025-01-10 09:00', details: 'SAP SuccessFactors sync completed', type: 'sync' },
  { id: 4, action: 'API Access', user: 'Integration', timestamp: '2025-01-09 16:45', details: 'Payroll data retrieved via API', type: 'api' },
  { id: 5, action: 'Webhook Triggered', user: 'System', timestamp: '2025-01-09 14:20', details: 'Employee onboarding webhook fired', type: 'webhook' },
];

export default function IntegrationsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (key: keyof typeof pageTranslations.en) => pageTranslations[language][key];
  
  const [syncing, setSyncing] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  const handleSync = (systemId: string) => {
    setSyncing(systemId);
    toast.info(t('syncInProgress'));
    setTimeout(() => {
      setSyncing(null);
      toast.success(t('syncComplete'));
    }, 3000);
  };

  const handleFileUpload = () => {
    setUploadDialogOpen(false);
    toast.success(t('importSuccess'));
  };

  const handlePolicyUpload = () => {
    setPolicyDialogOpen(false);
    toast.success(t('policyUploaded'));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-1" />{t('connected')}</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3 h-3 mr-1" />{t('pending')}</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />{t('disconnected')}</Badge>;
    }
  };

  const getImportStatusBadge = (status: string, errors?: number) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case 'partial':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><AlertCircle className="w-3 h-3 mr-1" />{errors} errors</Badge>;
      default:
        return <Badge variant="secondary">Processing</Badge>;
    }
  };

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col gap-2", isRTL && "items-end")}>
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Link2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Active Integrations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-muted-foreground">Synced Employees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Policy Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="text-2xl font-bold">85</p>
              <p className="text-xs text-muted-foreground">Rules Applied</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="hr-systems" className="space-y-4">
        <TabsList className={cn("grid w-full grid-cols-5", isRTL && "direction-rtl")}>
          <TabsTrigger value="hr-systems" className="text-xs sm:text-sm">{t('tabHRSystems')}</TabsTrigger>
          <TabsTrigger value="data-import" className="text-xs sm:text-sm">{t('tabDataImport')}</TabsTrigger>
          <TabsTrigger value="policies" className="text-xs sm:text-sm">{t('tabPolicies')}</TabsTrigger>
          <TabsTrigger value="api" className="text-xs sm:text-sm">{t('tabAPIWebhooks')}</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs sm:text-sm">{t('tabAuditLogs')}</TabsTrigger>
        </TabsList>

        {/* HR Systems Tab */}
        <TabsContent value="hr-systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Database className="w-5 h-5" />
                {t('hrSystemsTitle')}
              </CardTitle>
              <CardDescription>{t('hrSystemsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hrSystems.map((system) => (
                  <div key={system.id} className={cn(
                    "p-4 rounded-xl border bg-card hover:shadow-md transition-all",
                    isRTL && "text-right"
                  )}>
                    <div className={cn("flex items-start justify-between mb-3", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                        <div className="p-2 rounded-lg bg-muted">
                          <system.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{t(system.nameKey as keyof typeof pageTranslations.en)}</h4>
                          {system.lastSync && (
                            <p className="text-xs text-muted-foreground">{t('lastSync')}: {system.lastSync}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(system.status)}
                    </div>
                    
                    {system.status === 'connected' && (
                      <div className="mb-3">
                        <div className={cn("flex justify-between text-xs mb-1", isRTL && "flex-row-reverse")}>
                          <span className="text-muted-foreground">{t('recordsProcessed')}</span>
                          <span className="font-medium">{system.records.toLocaleString()}</span>
                        </div>
                        <Progress value={100} className="h-1.5" />
                      </div>
                    )}
                    
                    <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                      {system.status === 'connected' ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleSync(system.id)}
                            disabled={syncing === system.id}
                          >
                            <RefreshCw className={cn("w-3 h-3", syncing === system.id && "animate-spin", isRTL ? "ml-1" : "mr-1")} />
                            {t('syncNow')}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="flex-1">
                          <Link2 className={cn("w-3 h-3", isRTL ? "ml-1" : "mr-1")} />
                          {t('connect')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Helpful Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <h4 className="font-semibold text-sm">{t('scheduledSync')}</h4>
                  <p className="text-xs text-muted-foreground">{t('scheduledSyncDesc')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <h4 className="font-semibold text-sm">{t('dataValidation')}</h4>
                  <p className="text-xs text-muted-foreground">{t('dataValidationDesc')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <h4 className="font-semibold text-sm">{t('dataMapping')}</h4>
                  <p className="text-xs text-muted-foreground">{t('dataMappingDesc')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <h4 className="font-semibold text-sm">{t('securityCompliance')}</h4>
                  <p className="text-xs text-muted-foreground">{t('securityComplianceDesc')}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Data Import Tab */}
        <TabsContent value="data-import" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Upload Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Upload className="w-5 h-5" />
                  {t('dataImportTitle')}
                </CardTitle>
                <CardDescription>{t('dataImportDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <div className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-all",
                      isRTL && "text-right"
                    )}>
                      <CloudUpload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium mb-1">{t('dragDrop')}</p>
                      <p className="text-sm text-muted-foreground">{t('supportedFormats')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('maxFileSize')}</p>
                      <Button className="mt-4">
                        <FileUp className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                        {t('uploadFile')}
                      </Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('uploadFile')}</DialogTitle>
                      <DialogDescription>{t('dataImportDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Input type="file" accept=".xlsx,.xls,.csv,.json" className="hidden" id="file-upload" />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <CloudUpload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to select file</span>
                        </Label>
                      </div>
                      <Button className="w-full" onClick={handleFileUpload}>
                        Import Data
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Recent Imports */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">{t('recentImports')}</h4>
                  <div className="space-y-2">
                    {recentImports.map((item) => (
                      <div key={item.id} className={cn(
                        "flex items-center justify-between p-3 rounded-lg bg-muted/50",
                        isRTL && "flex-row-reverse"
                      )}>
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                          <div className={isRTL ? "text-right" : ""}>
                            <p className="font-medium text-sm">{item.filename}</p>
                            <p className="text-xs text-muted-foreground">{item.date} • {item.records} records</p>
                          </div>
                        </div>
                        {getImportStatusBadge(item.status, item.errors)}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Download className="w-5 h-5" />
                  {t('downloadTemplate')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className={cn("w-full justify-start", isRTL && "flex-row-reverse")}>
                  <Users className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('employeeTemplate')}
                </Button>
                <Button variant="outline" className={cn("w-full justify-start", isRTL && "flex-row-reverse")}>
                  <FileText className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('benefitsTemplate')}
                </Button>
                <Button variant="outline" className={cn("w-full justify-start", isRTL && "flex-row-reverse")}>
                  <Users className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('dependentsTemplate')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={isRTL ? "text-right" : ""}>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <BookOpen className="w-5 h-5" />
                  {t('policiesTitle')}
                </CardTitle>
                <CardDescription>{t('policiesDesc')}</CardDescription>
              </div>
              <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('uploadPolicy')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('uploadPolicy')}</DialogTitle>
                    <DialogDescription>{t('policiesDesc')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Policy Name</Label>
                      <Input placeholder="e.g., Annual Leave Policy 2025" className="mt-1" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea placeholder="Brief description of the policy..." className="mt-1" />
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Input type="file" accept=".pdf,.docx,.doc" className="hidden" id="policy-upload" />
                      <Label htmlFor="policy-upload" className="cursor-pointer">
                        <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload PDF or Word document</span>
                      </Label>
                    </div>
                    <Button className="w-full" onClick={handlePolicyUpload}>
                      Upload & Process Policy
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policyDocuments.map((policy) => (
                  <div key={policy.id} className={cn(
                    "p-4 rounded-xl border bg-card",
                    isRTL && "text-right"
                  )}>
                    <div className={cn("flex items-start justify-between mb-3", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{policy.name}</h4>
                          <p className="text-xs text-muted-foreground">Uploaded: {policy.uploadDate}</p>
                        </div>
                      </div>
                      <Badge className={policy.status === 'processed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}>
                        {policy.status === 'processed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {policy.status === 'processed' ? t('policyProcessed') : t('pendingReview')}
                      </Badge>
                    </div>
                    
                    <div className={cn("flex gap-4 text-sm", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                        <span className="text-muted-foreground">{t('extractedRules')}:</span>
                        <span className="font-medium">{policy.rulesExtracted}</span>
                      </div>
                      <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                        <span className="text-muted-foreground">{t('appliedRules')}:</span>
                        <span className="font-medium text-emerald-600">{policy.rulesApplied}</span>
                      </div>
                    </div>
                    
                    {policy.rulesApplied < policy.rulesExtracted && (
                      <div className="mt-3">
                        <Progress value={(policy.rulesApplied / policy.rulesExtracted) * 100} className="h-1.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Webhooks Tab */}
        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* API Keys */}
            <Card>
              <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={isRTL ? "text-right" : ""}>
                  <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Key className="w-5 h-5" />
                    {t('apiKeys')}
                  </CardTitle>
                </div>
                <Button size="sm">
                  {t('generateKey')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <span className="font-medium text-sm">Production API Key</span>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                  </div>
                  <code className="text-xs text-muted-foreground block bg-background p-2 rounded">
                    bnft_prod_••••••••••••••••
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">Created: Jan 1, 2025 • Last used: 2 hours ago</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <span className="font-medium text-sm">Test API Key</span>
                    <Badge variant="secondary">Test</Badge>
                  </div>
                  <code className="text-xs text-muted-foreground block bg-background p-2 rounded">
                    bnft_test_••••••••••••••••
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">Created: Dec 15, 2024</p>
                </div>
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={isRTL ? "text-right" : ""}>
                  <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Webhook className="w-5 h-5" />
                    {t('webhooks')}
                  </CardTitle>
                </div>
                <Button size="sm">
                  {t('addWebhook')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <span className="font-medium text-sm">Employee Onboarding</span>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                  </div>
                  <code className="text-xs text-muted-foreground block bg-background p-2 rounded truncate">
                    https://api.company.com/webhooks/onboarding
                  </code>
                  <div className={cn("flex gap-2 mt-2", isRTL && "flex-row-reverse")}>
                    <Badge variant="outline" className="text-xs">employee.created</Badge>
                    <Badge variant="outline" className="text-xs">employee.updated</Badge>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <span className="font-medium text-sm">Benefits Changes</span>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                  </div>
                  <code className="text-xs text-muted-foreground block bg-background p-2 rounded truncate">
                    https://api.company.com/webhooks/benefits
                  </code>
                  <div className={cn("flex gap-2 mt-2", isRTL && "flex-row-reverse")}>
                    <Badge variant="outline" className="text-xs">benefit.enrolled</Badge>
                    <Badge variant="outline" className="text-xs">claim.submitted</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={isRTL ? "text-right" : ""}>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Activity className="w-5 h-5" />
                  {t('auditTitle')}
                </CardTitle>
                <CardDescription>{t('auditDesc')}</CardDescription>
              </div>
              <Button variant="outline">
                <Download className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('exportLogs')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className={cn(
                    "flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
                    isRTL && "flex-row-reverse"
                  )}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className={cn(
                        "p-2 rounded-lg",
                        log.type === 'import' && "bg-blue-100 dark:bg-blue-900/30",
                        log.type === 'policy' && "bg-purple-100 dark:bg-purple-900/30",
                        log.type === 'sync' && "bg-emerald-100 dark:bg-emerald-900/30",
                        log.type === 'api' && "bg-amber-100 dark:bg-amber-900/30",
                        log.type === 'webhook' && "bg-rose-100 dark:bg-rose-900/30",
                      )}>
                        {log.type === 'import' && <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {log.type === 'policy' && <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                        {log.type === 'sync' && <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        {log.type === 'api' && <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                        {log.type === 'webhook' && <Webhook className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                      </div>
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <p className="text-sm">{log.user}</p>
                      <p className="text-xs text-muted-foreground">{log.timestamp}</p>
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
