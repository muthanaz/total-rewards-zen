/**
 * Integration Readiness Page
 * Documents supported integration modes and maturity levels
 */

import { useState } from 'react';
import { 
  Database, Upload, FileSpreadsheet, Link2, Server, 
  CheckCircle2, Clock, AlertCircle, ArrowRight, 
  Shield, Zap, Users, RefreshCw,
  Download, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { downloadCompleteMigrationPackage } from '@/components/admin/ExcelGenerator';
import { toast } from 'sonner';

interface IntegrationMode {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ElementType;
  description: string;
  descriptionAr: string;
  status: 'available' | 'coming_soon' | 'enterprise';
  complexity: 'low' | 'medium' | 'high';
  setupTime: string;
  features: string[];
  limitations: string[];
}

const integrationModes: IntegrationMode[] = [
  {
    id: 'manual',
    name: 'Manual Entry',
    nameAr: 'إدخال يدوي',
    icon: Users,
    description: 'HR admins enter data directly through the admin portal',
    descriptionAr: 'يقوم مسؤولو الموارد البشرية بإدخال البيانات مباشرة من خلال بوابة الإدارة',
    status: 'available',
    complexity: 'low',
    setupTime: 'Immediate',
    features: [
      'No technical setup required',
      'Full control over data entry',
      'Immediate updates',
      'Built-in validation',
    ],
    limitations: [
      'Manual effort for each update',
      'Not suitable for 500+ employees',
      'No automatic sync',
    ],
  },
  {
    id: 'excel',
    name: 'Excel Bulk Import',
    nameAr: 'استيراد إكسل بالجملة',
    icon: FileSpreadsheet,
    description: 'Upload Excel files for bulk data import with validation',
    descriptionAr: 'تحميل ملفات إكسل لاستيراد البيانات بالجملة مع التحقق',
    status: 'available',
    complexity: 'low',
    setupTime: '1-2 hours',
    features: [
      'Downloadable templates',
      'Row-by-row validation',
      'Error report download',
      'Supports all data types',
      'Version tracking',
    ],
    limitations: [
      'Periodic manual uploads needed',
      'Export from source system required',
      'No real-time sync',
    ],
  },
  {
    id: 'sftp',
    name: 'SFTP/Scheduled Upload',
    nameAr: 'تحميل SFTP/مجدول',
    icon: Server,
    description: 'Automated file drops via secure SFTP connection',
    descriptionAr: 'نقل ملفات تلقائي عبر اتصال SFTP آمن',
    status: 'coming_soon',
    complexity: 'medium',
    setupTime: '1-2 days',
    features: [
      'Scheduled automatic imports',
      'Secure file transfer',
      'Audit trail',
      'Failure notifications',
    ],
    limitations: [
      'Requires IT setup',
      'Fixed schedule (not real-time)',
      'Source system export needed',
    ],
  },
  {
    id: 'api',
    name: 'REST API Integration',
    nameAr: 'تكامل REST API',
    icon: Link2,
    description: 'Direct API integration for real-time data sync',
    descriptionAr: 'تكامل API مباشر لمزامنة البيانات في الوقت الفعلي',
    status: 'coming_soon',
    complexity: 'high',
    setupTime: '1-2 weeks',
    features: [
      'Real-time sync',
      'Two-way data flow',
      'Webhook support',
      'Comprehensive docs',
    ],
    limitations: [
      'Requires development resources',
      'API quota considerations',
      'Maintenance overhead',
    ],
  },
  {
    id: 'hris',
    name: 'HRIS Connectors',
    nameAr: 'موصلات نظام معلومات الموارد البشرية',
    icon: Database,
    description: 'Pre-built connectors for Workday, SAP SF, Oracle HCM, BambooHR',
    descriptionAr: 'موصلات جاهزة لـ Workday و SAP SF و Oracle HCM و BambooHR',
    status: 'enterprise',
    complexity: 'medium',
    setupTime: '3-5 days',
    features: [
      'Pre-built field mappings',
      'OAuth authentication',
      'Automatic sync schedules',
      'Error handling & retries',
    ],
    limitations: [
      'Enterprise license required',
      'HRIS subscription needed',
      'Limited customization',
    ],
  },
];

const dataDomains = [
  { name: 'Employees', icon: Users, required: true, description: 'Employee master data and profiles' },
  { name: 'Employment', icon: Database, required: true, description: 'Job details, grades, departments' },
  { name: 'Compensation', icon: Database, required: false, description: 'Salary and allowances' },
  { name: 'Benefits', icon: Shield, required: true, description: 'Benefit entitlements by grade' },
  { name: 'Leave', icon: Clock, required: false, description: 'Leave balances and accruals' },
  { name: 'Dependents', icon: Users, required: false, description: 'Children and family members' },
];

export default function IntegrationReadinessPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const [activeTab, setActiveTab] = useState('overview');

  const handleDownloadTemplates = () => {
    downloadCompleteMigrationPackage();
    toast.success(t('Templates downloaded', 'تم تحميل القوالب'));
  };

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      <PageHeader
        title={t('Integration Readiness', 'جاهزية التكامل')}
        description={t(
          'The platform works perfectly without integrations. Choose the mode that fits your organization.',
          'تعمل المنصة بشكل مثالي بدون تكاملات. اختر الوضع الذي يناسب مؤسستك.'
        )}
        icon={Database}
        iconClassName="from-accent to-accent/80"
        actions={
          <Button onClick={handleDownloadTemplates} className="gap-2">
            <Download className="w-4 h-4" />
            {t('Download All Templates', 'تحميل جميع القوالب')}
          </Button>
        }
      />

      {/* Key Message */}
      <Alert className="border-success/30 bg-success/5">
        <CheckCircle2 className="w-4 h-4 text-success" />
        <AlertTitle>{t('Manual-First Design', 'تصميم يدوي أولاً')}</AlertTitle>
        <AlertDescription>
          {t(
            'bnft is designed to work fully without any external integrations. You can start using the platform today with Excel imports or manual entry, and add integrations later as needed.',
            'تم تصميم bnft للعمل بشكل كامل بدون أي تكاملات خارجية. يمكنك البدء في استخدام المنصة اليوم مع استيراد Excel أو الإدخال اليدوي، وإضافة التكاملات لاحقًا حسب الحاجة.'
          )}
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Database className="w-4 h-4" />
            {t('Integration Modes', 'أوضاع التكامل')}
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            {t('Data Domains', 'نطاقات البيانات')}
          </TabsTrigger>
          <TabsTrigger value="maturity" className="gap-2">
            <Zap className="w-4 h-4" />
            {t('Maturity Path', 'مسار النضج')}
          </TabsTrigger>
        </TabsList>

        {/* Integration Modes Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Card 
                  key={mode.id}
                  className={cn(
                    "relative overflow-hidden",
                    mode.status === 'available' && "border-success/30",
                    mode.status === 'enterprise' && "border-accent/30"
                  )}
                >
                  {mode.status === 'available' && (
                    <div className="absolute top-0 right-0 px-2 py-1 bg-success text-success-foreground text-xs font-medium rounded-bl">
                      {t('Available', 'متاح')}
                    </div>
                  )}
                  {mode.status === 'coming_soon' && (
                    <div className="absolute top-0 right-0 px-2 py-1 bg-warning text-warning-foreground text-xs font-medium rounded-bl">
                      {t('Coming Soon', 'قريبًا')}
                    </div>
                  )}
                  {mode.status === 'enterprise' && (
                    <div className="absolute top-0 right-0 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-bl">
                      {t('Enterprise', 'المؤسسات')}
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {language === 'ar' ? mode.nameAr : mode.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {mode.complexity} complexity
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {mode.setupTime}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? mode.descriptionAr : mode.description}
                    </p>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-success">
                        {t('Features', 'المميزات')}
                      </div>
                      <ul className="space-y-1">
                        {mode.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-success mt-0.5 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {t('Limitations', 'القيود')}
                      </div>
                      <ul className="space-y-1">
                        {mode.limitations.slice(0, 2).map((limitation, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <AlertCircle className="w-3 h-3 text-warning mt-0.5 shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {mode.status === 'available' && (
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        {t('Get Started', 'ابدأ الآن')}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Data Domains Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Data Domains', 'نطاقات البيانات')}</CardTitle>
              <CardDescription>
                {t(
                  'Different data types that can be imported into the platform',
                  'أنواع البيانات المختلفة التي يمكن استيرادها إلى المنصة'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataDomains.map((domain) => {
                  const Icon = domain.icon;
                  return (
                    <div 
                      key={domain.name}
                      className="p-4 rounded-lg border hover:border-accent/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-accent/10">
                            <Icon className="w-4 h-4 text-accent" />
                          </div>
                          <span className="font-medium">{domain.name}</span>
                        </div>
                        {domain.required ? (
                          <Badge variant="destructive" className="text-[10px]">Required</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Optional</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{domain.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Excel Templates', 'قوالب إكسل')}</CardTitle>
              <CardDescription>
                {t('Download templates for each data domain', 'تحميل القوالب لكل نطاق بيانات')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dataDomains.map((domain) => (
                  <Button key={domain.name} variant="outline" size="sm" className="gap-2">
                    <Download className="w-3 h-3" />
                    {domain.name}
                  </Button>
                ))}
                <Button onClick={handleDownloadTemplates} className="gap-2">
                  <Download className="w-4 h-4" />
                  {t('Download All', 'تحميل الكل')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maturity Path Tab */}
        <TabsContent value="maturity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Integration Maturity Path', 'مسار نضج التكامل')}</CardTitle>
              <CardDescription>
                {t(
                  'Recommended progression from manual to automated data management',
                  'التقدم الموصى به من إدارة البيانات اليدوية إلى التلقائية'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    level: 1,
                    name: t('Manual / Excel', 'يدوي / إكسل'),
                    description: t('Start here - no technical setup needed', 'ابدأ هنا - لا حاجة لإعداد تقني'),
                    features: ['Direct data entry', 'Excel bulk import', 'Full platform access'],
                    employees: '1-200',
                    recommended: true,
                  },
                  {
                    level: 2,
                    name: t('Scheduled Uploads', 'تحميلات مجدولة'),
                    description: t('Automate periodic data sync', 'أتمتة مزامنة البيانات الدورية'),
                    features: ['SFTP integration', 'Daily/weekly sync', 'Email notifications'],
                    employees: '200-1000',
                    recommended: false,
                  },
                  {
                    level: 3,
                    name: t('API Integration', 'تكامل API'),
                    description: t('Real-time data sync with custom development', 'مزامنة البيانات في الوقت الفعلي مع تطوير مخصص'),
                    features: ['REST API access', 'Webhooks', 'Two-way sync'],
                    employees: '1000+',
                    recommended: false,
                  },
                  {
                    level: 4,
                    name: t('Enterprise Connectors', 'موصلات المؤسسات'),
                    description: t('Pre-built HRIS integrations', 'تكاملات نظام معلومات الموارد البشرية الجاهزة'),
                    features: ['Workday, SAP SF, Oracle HCM', 'OAuth SSO', 'Managed sync'],
                    employees: '1000+',
                    recommended: false,
                  },
                ].map((level, index) => (
                  <div 
                    key={level.level}
                    className={cn(
                      "relative pl-8 pb-6",
                      index < 3 && "border-l-2 border-muted ml-4"
                    )}
                  >
                    <div className={cn(
                      "absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      level.recommended 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {level.level}
                    </div>
                    <div className={cn(
                      "p-4 rounded-lg border",
                      level.recommended && "border-accent/40 bg-accent/5"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{level.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {level.employees} employees
                          </Badge>
                          {level.recommended && (
                            <Badge className="text-[10px] bg-accent">
                              {t('Start Here', 'ابدأ هنا')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{level.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {level.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {feature}
                          </Badge>
                        ))}
                      </div>
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
