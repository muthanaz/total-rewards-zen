/**
 * Admin Onboarding Wizard
 * Multi-step wizard for setting up new organizations
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ShieldCheck, FileText, Users, Check, 
  ChevronRight, ChevronLeft, Rocket, Database,
  Upload, Download, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePolicyTemplates } from '@/hooks/usePolicyTemplates';

type WizardStep = 'profile' | 'governance' | 'policies' | 'roles' | 'publish';

interface StepConfig {
  id: WizardStep;
  title: string;
  titleAr: string;
  icon: React.ElementType;
  description: string;
  descriptionAr: string;
}

const steps: StepConfig[] = [
  { 
    id: 'profile', 
    title: 'Organization Profile', 
    titleAr: 'ملف المؤسسة',
    icon: Building2, 
    description: 'Basic organization setup and branding',
    descriptionAr: 'إعداد المؤسسة الأساسي والعلامة التجارية'
  },
  { 
    id: 'governance', 
    title: 'Governance Settings', 
    titleAr: 'إعدادات الحوكمة',
    icon: ShieldCheck, 
    description: 'Policy approval workflows and enforcement',
    descriptionAr: 'سير عمل الموافقة على السياسات والتنفيذ'
  },
  { 
    id: 'policies', 
    title: 'Add Policies', 
    titleAr: 'إضافة السياسات',
    icon: FileText, 
    description: 'Create from templates or import existing policies',
    descriptionAr: 'إنشاء من القوالب أو استيراد السياسات الحالية'
  },
  { 
    id: 'roles', 
    title: 'Assign Roles', 
    titleAr: 'تعيين الأدوار',
    icon: Users, 
    description: 'Set up HR admins and approvers',
    descriptionAr: 'إعداد مسؤولي الموارد البشرية والموافقين'
  },
  { 
    id: 'publish', 
    title: 'Review & Publish', 
    titleAr: 'المراجعة والنشر',
    icon: Rocket, 
    description: 'Finalize and activate the organization',
    descriptionAr: 'إنهاء وتفعيل المؤسسة'
  },
];

interface OrgFormData {
  name: string;
  nameAr: string;
  domain: string;
  industry: string;
  companySize: string;
  primaryColor: string;
  hrContactEmail: string;
  timezone: string;
  fiscalYearStart: string;
  // Governance
  requireApproval: boolean;
  approverRole: string;
  approvalSlaDays: number;
  enforcementMode: string;
  // Roles
  hrAdminEmails: string[];
  approverEmails: string[];
}

const defaultFormData: OrgFormData = {
  name: '',
  nameAr: '',
  domain: '',
  industry: 'Technology',
  companySize: '51-200',
  primaryColor: '#0f766e',
  hrContactEmail: '',
  timezone: 'Asia/Dubai',
  fiscalYearStart: '01',
  requireApproval: true,
  approverRole: 'executive',
  approvalSlaDays: 3,
  enforcementMode: 'advisory',
  hrAdminEmails: [],
  approverEmails: [],
};

interface PolicySelection {
  templateId: string;
  name: string;
  category: string;
  selected: boolean;
}

export default function OnboardingWizard({ 
  onComplete,
  onCancel 
}: { 
  onComplete?: (orgId: string) => void;
  onCancel?: () => void;
}) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('profile');
  const [formData, setFormData] = useState<OrgFormData>(defaultFormData);
  const [selectedPolicies, setSelectedPolicies] = useState<PolicySelection[]>([]);
  const [importMode, setImportMode] = useState<'template' | 'import'>('template');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seedDemoData, setSeedDemoData] = useState(false);

  const { data: templates } = usePolicyTemplates();

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateFormData = (field: keyof OrgFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: WizardStep): boolean => {
    switch (step) {
      case 'profile':
        return !!(formData.name && formData.domain && formData.hrContactEmail);
      case 'governance':
        return true; // All have defaults
      case 'policies':
        return selectedPolicies.some(p => p.selected) || importMode === 'import';
      case 'roles':
        return formData.hrAdminEmails.length > 0;
      case 'publish':
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error(t('Please complete all required fields', 'يرجى إكمال جميع الحقول المطلوبة'));
      return;
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In real implementation, this would call Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(t(
        'Organization created successfully!',
        'تم إنشاء المؤسسة بنجاح!'
      ));
      
      onComplete?.('mock-org-id');
    } catch (error) {
      toast.error(t('Failed to create organization', 'فشل في إنشاء المؤسسة'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePolicySelection = (templateId: string) => {
    setSelectedPolicies(prev => 
      prev.map(p => p.templateId === templateId ? { ...p, selected: !p.selected } : p)
    );
  };

  // Initialize policy selections from templates
  useState(() => {
    if (templates) {
      setSelectedPolicies(
        templates.map(t => ({
          templateId: t.id,
          name: t.name,
          category: t.category,
          selected: false,
        }))
      );
    }
  });

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Progress Header */}
      <Card className="border-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{t('Organization Onboarding', 'تأهيل المؤسسة')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('Step', 'الخطوة')} {currentStepIndex + 1} {t('of', 'من')} {steps.length}
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {Math.round(progress)}% {t('Complete', 'مكتمل')}
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2 mb-6" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const Icon = step.icon;
              
              return (
                <div 
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 flex-1",
                    index < steps.length - 1 && "after:flex-1 after:h-0.5 after:ml-2",
                    index < steps.length - 1 && (isCompleted ? "after:bg-accent" : "after:bg-muted")
                  )}
                >
                  <button
                    onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                    disabled={index > currentStepIndex}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg transition-colors",
                      isActive && "bg-accent/20 text-accent",
                      isCompleted && "text-accent",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      isActive && "bg-accent text-accent-foreground",
                      isCompleted && "bg-accent text-accent-foreground",
                      !isActive && !isCompleted && "bg-muted"
                    )}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {language === 'ar' ? step.titleAr : step.title}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 'profile' && (
            <ProfileStep formData={formData} updateFormData={updateFormData} t={t} />
          )}
          {currentStep === 'governance' && (
            <GovernanceStep formData={formData} updateFormData={updateFormData} t={t} />
          )}
          {currentStep === 'policies' && (
            <PoliciesStep 
              templates={templates || []}
              selectedPolicies={selectedPolicies}
              toggleSelection={togglePolicySelection}
              importMode={importMode}
              setImportMode={setImportMode}
              t={t}
            />
          )}
          {currentStep === 'roles' && (
            <RolesStep formData={formData} updateFormData={updateFormData} t={t} />
          )}
          {currentStep === 'publish' && (
            <PublishStep 
              formData={formData} 
              selectedPolicies={selectedPolicies}
              seedDemoData={seedDemoData}
              setSeedDemoData={setSeedDemoData}
              t={t}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className={cn("flex items-center justify-between pt-4 border-t", isRTL && "flex-row-reverse")}>
        <Button
          variant="outline"
          onClick={currentStepIndex === 0 ? onCancel : goToPrevStep}
          className="gap-2"
        >
          {currentStepIndex === 0 ? (
            t('Cancel', 'إلغاء')
          ) : (
            <>
              <ChevronLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
              {t('Previous', 'السابق')}
            </>
          )}
        </Button>
        
        {currentStep === 'publish' ? (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gap-2 bg-gradient-to-r from-accent to-accent/80"
          >
            {isSubmitting ? (
              t('Creating...', 'جارٍ الإنشاء...')
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                {t('Launch Organization', 'إطلاق المؤسسة')}
              </>
            )}
          </Button>
        ) : (
          <Button onClick={goToNextStep} className="gap-2">
            {t('Next', 'التالي')}
            <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
          </Button>
        )}
      </div>
    </div>
  );
}

// Step Components
function ProfileStep({ formData, updateFormData, t }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          {t('Organization Profile', 'ملف المؤسسة')}
        </CardTitle>
        <CardDescription>
          {t('Enter basic organization details and branding', 'أدخل تفاصيل المؤسسة الأساسية والعلامة التجارية')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('Organization Name', 'اسم المؤسسة')} *</Label>
            <Input
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder={t('Enter organization name', 'أدخل اسم المؤسسة')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('Organization Name (Arabic)', 'اسم المؤسسة (بالعربية)')}</Label>
            <Input
              value={formData.nameAr}
              onChange={(e) => updateFormData('nameAr', e.target.value)}
              placeholder="أدخل اسم المؤسسة"
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('Email Domain', 'نطاق البريد الإلكتروني')} *</Label>
            <Input
              value={formData.domain}
              onChange={(e) => updateFormData('domain', e.target.value)}
              placeholder="company.com"
            />
            <p className="text-xs text-muted-foreground">
              {t('Used for automatic user assignment via SSO', 'يستخدم للتعيين التلقائي للمستخدمين عبر SSO')}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t('HR Contact Email', 'البريد الإلكتروني للموارد البشرية')} *</Label>
            <Input
              type="email"
              value={formData.hrContactEmail}
              onChange={(e) => updateFormData('hrContactEmail', e.target.value)}
              placeholder="hr@company.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('Industry', 'الصناعة')}</Label>
            <Select value={formData.industry} onValueChange={(v) => updateFormData('industry', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">{t('Technology', 'التكنولوجيا')}</SelectItem>
                <SelectItem value="Finance">{t('Finance', 'المالية')}</SelectItem>
                <SelectItem value="Healthcare">{t('Healthcare', 'الرعاية الصحية')}</SelectItem>
                <SelectItem value="Retail">{t('Retail', 'البيع بالتجزئة')}</SelectItem>
                <SelectItem value="Manufacturing">{t('Manufacturing', 'التصنيع')}</SelectItem>
                <SelectItem value="Other">{t('Other', 'أخرى')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('Company Size', 'حجم الشركة')}</Label>
            <Select value={formData.companySize} onValueChange={(v) => updateFormData('companySize', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-50">1-50</SelectItem>
                <SelectItem value="51-200">51-200</SelectItem>
                <SelectItem value="201-500">201-500</SelectItem>
                <SelectItem value="501-1000">501-1000</SelectItem>
                <SelectItem value="1000+">1000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('Timezone', 'المنطقة الزمنية')}</Label>
            <Select value={formData.timezone} onValueChange={(v) => updateFormData('timezone', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                <SelectItem value="Asia/Riyadh">Asia/Riyadh (AST)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('Primary Brand Color', 'اللون الأساسي للعلامة التجارية')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="w-14 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                placeholder="#0f766e"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('Fiscal Year Start', 'بداية السنة المالية')}</Label>
            <Select value={formData.fiscalYearStart} onValueChange={(v) => updateFormData('fiscalYearStart', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">{t('January', 'يناير')}</SelectItem>
                <SelectItem value="04">{t('April', 'أبريل')}</SelectItem>
                <SelectItem value="07">{t('July', 'يوليو')}</SelectItem>
                <SelectItem value="10">{t('October', 'أكتوبر')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GovernanceStep({ formData, updateFormData, t }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          {t('Governance Settings', 'إعدادات الحوكمة')}
        </CardTitle>
        <CardDescription>
          {t('Configure policy approval workflows and enforcement rules', 'تكوين سير عمل الموافقة على السياسات وقواعد التنفيذ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <Label className="text-base">{t('Require Policy Approval', 'تتطلب الموافقة على السياسة')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('New policies must be approved before becoming active', 'يجب الموافقة على السياسات الجديدة قبل تفعيلها')}
            </p>
          </div>
          <Switch
            checked={formData.requireApproval}
            onCheckedChange={(v) => updateFormData('requireApproval', v)}
          />
        </div>

        {formData.requireApproval && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Approver Role', 'دور الموافق')}</Label>
              <Select value={formData.approverRole} onValueChange={(v) => updateFormData('approverRole', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">{t('Executive/CHRO', 'المدير التنفيذي')}</SelectItem>
                  <SelectItem value="hr_manager">{t('HR Manager', 'مدير الموارد البشرية')}</SelectItem>
                  <SelectItem value="department_head">{t('Department Head', 'رئيس القسم')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Approval SLA (days)', 'مهلة الموافقة (أيام)')}</Label>
              <Select 
                value={formData.approvalSlaDays.toString()} 
                onValueChange={(v) => updateFormData('approvalSlaDays', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {t('day', 'يوم')}</SelectItem>
                  <SelectItem value="3">3 {t('days', 'أيام')}</SelectItem>
                  <SelectItem value="5">5 {t('days', 'أيام')}</SelectItem>
                  <SelectItem value="7">7 {t('days', 'أيام')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>{t('Policy Enforcement Mode', 'وضع تنفيذ السياسة')}</Label>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { 
                value: 'advisory', 
                label: t('Advisory', 'استشاري'), 
                desc: t('Show warnings but allow submissions', 'عرض التحذيرات ولكن السماح بالتقديم') 
              },
              { 
                value: 'soft_block', 
                label: t('Soft Block', 'حظر مرن'), 
                desc: t('Require override justification', 'تتطلب تبريرًا للتجاوز') 
              },
              { 
                value: 'strict', 
                label: t('Strict', 'صارم'), 
                desc: t('Block non-compliant submissions', 'حظر التقديمات غير المتوافقة') 
              },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => updateFormData('enforcementMode', mode.value)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-colors",
                  formData.enforcementMode === mode.value 
                    ? "border-accent bg-accent/10" 
                    : "hover:border-accent/40"
                )}
              >
                <div className="font-medium">{mode.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>{t('Recommendation', 'توصية')}</AlertTitle>
          <AlertDescription>
            {t(
              'Start with "Advisory" mode to gather data, then gradually increase enforcement.',
              'ابدأ بوضع "استشاري" لجمع البيانات، ثم قم بزيادة التنفيذ تدريجيًا.'
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function PoliciesStep({ templates, selectedPolicies, toggleSelection, importMode, setImportMode, t }: any) {
  const categories = [...new Set(templates.map((t: any) => t.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          {t('Add Policies', 'إضافة السياسات')}
        </CardTitle>
        <CardDescription>
          {t('Create policies from templates or import existing ones', 'إنشاء سياسات من القوالب أو استيراد الموجودة')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={importMode} onValueChange={(v: any) => setImportMode(v)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template" className="gap-2">
              <FileText className="w-4 h-4" />
              {t('From Templates', 'من القوالب')}
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" />
              {t('Import Excel', 'استيراد إكسل')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4 mt-4">
            {templates.length === 0 ? (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {t('No policy templates available. You can import policies via Excel.', 'لا توجد قوالب سياسات متاحة. يمكنك استيراد السياسات عبر إكسل.')}
                </AlertDescription>
              </Alert>
            ) : (
              categories.map((category: string) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium capitalize">{category}</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {templates
                      .filter((t: any) => t.category === category)
                      .map((template: any) => {
                        const isSelected = selectedPolicies.find((p: any) => p.templateId === template.id)?.selected;
                        return (
                          <button
                            key={template.id}
                            onClick={() => toggleSelection(template.id)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-colors flex items-center gap-3",
                              isSelected ? "border-accent bg-accent/10" : "hover:border-accent/40"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                              isSelected ? "border-accent bg-accent" : "border-muted-foreground"
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{template.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {template.description || template.benefit_type}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-medium mb-2">{t('Upload Policy Excel File', 'تحميل ملف سياسة إكسل')}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {t('Download our template, fill in your policies, and upload', 'قم بتنزيل القالب الخاص بنا، واملأ السياسات، ثم ارفعها')}
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  {t('Download Template', 'تحميل القالب')}
                </Button>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  {t('Upload File', 'رفع الملف')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm">
            {selectedPolicies.filter((p: any) => p.selected).length} {t('policies selected', 'سياسات محددة')}
          </span>
          <Button variant="ghost" size="sm" onClick={() => {
            // Select all
          }}>
            {t('Select All Common', 'تحديد الكل الشائع')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RolesStep({ formData, updateFormData, t }: any) {
  const [newEmail, setNewEmail] = useState('');
  const [emailType, setEmailType] = useState<'admin' | 'approver'>('admin');

  const addEmail = () => {
    if (!newEmail.trim()) return;
    if (emailType === 'admin') {
      updateFormData('hrAdminEmails', [...formData.hrAdminEmails, newEmail.trim()]);
    } else {
      updateFormData('approverEmails', [...formData.approverEmails, newEmail.trim()]);
    }
    setNewEmail('');
  };

  const removeEmail = (email: string, type: 'admin' | 'approver') => {
    if (type === 'admin') {
      updateFormData('hrAdminEmails', formData.hrAdminEmails.filter((e: string) => e !== email));
    } else {
      updateFormData('approverEmails', formData.approverEmails.filter((e: string) => e !== email));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          {t('Assign Roles', 'تعيين الأدوار')}
        </CardTitle>
        <CardDescription>
          {t('Add HR administrators and policy approvers', 'إضافة مسؤولي الموارد البشرية والموافقين على السياسات')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Select value={emailType} onValueChange={(v: any) => setEmailType(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{t('HR Admin', 'مسؤول الموارد البشرية')}</SelectItem>
              <SelectItem value="approver">{t('Approver', 'الموافق')}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder={t('Enter email address', 'أدخل عنوان البريد الإلكتروني')}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addEmail()}
          />
          <Button onClick={addEmail}>{t('Add', 'إضافة')}</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('HR Administrators', 'مسؤولو الموارد البشرية')} *
            </Label>
            <div className="min-h-[100px] p-3 rounded-lg border bg-muted/30 space-y-2">
              {formData.hrAdminEmails.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('Add at least one HR admin', 'أضف مسؤولًا واحدًا على الأقل للموارد البشرية')}
                </p>
              ) : (
                formData.hrAdminEmails.map((email: string) => (
                  <div key={email} className="flex items-center justify-between p-2 rounded bg-background">
                    <span className="text-sm">{email}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeEmail(email, 'admin')}
                    >
                      ×
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {t('Policy Approvers', 'الموافقون على السياسات')}
            </Label>
            <div className="min-h-[100px] p-3 rounded-lg border bg-muted/30 space-y-2">
              {formData.approverEmails.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('Optional - for policy approval workflow', 'اختياري - لسير عمل الموافقة على السياسة')}
                </p>
              ) : (
                formData.approverEmails.map((email: string) => (
                  <div key={email} className="flex items-center justify-between p-2 rounded bg-background">
                    <span className="text-sm">{email}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeEmail(email, 'approver')}
                    >
                      ×
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>{t('Permissions', 'الصلاحيات')}</AlertTitle>
          <AlertDescription>
            {t(
              'HR Admins can manage policies, process claims, and view analytics. Approvers only approve policy changes.',
              'يمكن لمسؤولي الموارد البشرية إدارة السياسات ومعالجة المطالبات وعرض التحليلات. الموافقون يوافقون على تغييرات السياسة فقط.'
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function PublishStep({ formData, selectedPolicies, seedDemoData, setSeedDemoData, t }: any) {
  const selectedCount = selectedPolicies.filter((p: any) => p.selected).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-accent" />
          {t('Review & Publish', 'المراجعة والنشر')}
        </CardTitle>
        <CardDescription>
          {t('Review your configuration before launching', 'راجع التكوين الخاص بك قبل الإطلاق')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{t('Organization', 'المؤسسة')}</span>
            </div>
            <div className="text-lg font-semibold">{formData.name || '—'}</div>
            <div className="text-sm text-muted-foreground">{formData.domain}</div>
          </div>
          
          <div className="p-4 rounded-lg border space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-medium">{t('Governance', 'الحوكمة')}</span>
            </div>
            <div className="text-lg font-semibold capitalize">{formData.enforcementMode}</div>
            <div className="text-sm text-muted-foreground">
              {formData.requireApproval 
                ? t('Approval required', 'الموافقة مطلوبة')
                : t('No approval required', 'لا تتطلب موافقة')
              }
            </div>
          </div>
          
          <div className="p-4 rounded-lg border space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <FileText className="w-4 h-4" />
              <span className="font-medium">{t('Policies', 'السياسات')}</span>
            </div>
            <div className="text-lg font-semibold">{selectedCount} {t('policies', 'سياسة')}</div>
            <div className="text-sm text-muted-foreground">
              {t('Will be created in draft status', 'سيتم إنشاؤها في حالة المسودة')}
            </div>
          </div>
          
          <div className="p-4 rounded-lg border space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <Users className="w-4 h-4" />
              <span className="font-medium">{t('Users', 'المستخدمون')}</span>
            </div>
            <div className="text-lg font-semibold">
              {formData.hrAdminEmails.length + formData.approverEmails.length} {t('users', 'مستخدم')}
            </div>
            <div className="text-sm text-muted-foreground">
              {formData.hrAdminEmails.length} {t('admins', 'مسؤول')}, {formData.approverEmails.length} {t('approvers', 'موافق')}
            </div>
          </div>
        </div>

        {/* Seed Demo Data Option */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-accent/5">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-accent" />
            <div>
              <Label className="text-base">{t('Seed Demo Data', 'بيانات تجريبية')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('Add realistic sample employees, claims, and transactions for testing', 'إضافة موظفين ومطالبات ومعاملات تجريبية واقعية للاختبار')}
              </p>
            </div>
          </div>
          <Switch
            checked={seedDemoData}
            onCheckedChange={setSeedDemoData}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          <Label>{t('Pre-Launch Checklist', 'قائمة التحقق قبل الإطلاق')}</Label>
          <div className="space-y-2">
            {[
              { done: !!formData.name, label: t('Organization profile complete', 'ملف المؤسسة مكتمل') },
              { done: true, label: t('Governance settings configured', 'إعدادات الحوكمة مكونة') },
              { done: selectedCount > 0, label: t('At least one policy selected', 'تم تحديد سياسة واحدة على الأقل') },
              { done: formData.hrAdminEmails.length > 0, label: t('HR admin assigned', 'تم تعيين مسؤول الموارد البشرية') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                <span className={!item.done ? 'text-destructive' : ''}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Alert className="border-accent/30 bg-accent/5">
          <Rocket className="w-4 h-4 text-accent" />
          <AlertTitle>{t('Ready to Launch', 'جاهز للإطلاق')}</AlertTitle>
          <AlertDescription>
            {t(
              'Clicking "Launch Organization" will create the organization and invite all assigned users.',
              'سيؤدي النقر على "إطلاق المؤسسة" إلى إنشاء المؤسسة ودعوة جميع المستخدمين المعينين.'
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
