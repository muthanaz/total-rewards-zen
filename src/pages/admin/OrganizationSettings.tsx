import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Building2, 
  Palette,
  Save,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { getOrgPolicySettings, updateOrgPolicyGovernanceSettings, OrgPolicySettings } from '@/hooks/usePolicyRPC';

interface OrganizationSettings {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  welcome_message: string | null;
  footer_text: string | null;
  settings: unknown;
}

export default function OrganizationSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [org, setOrg] = useState<OrganizationSettings | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    primary_color: '#0f766e',
    secondary_color: '#115e59',
    accent_color: '#2dd4bf',
    welcome_message: '',
    footer_text: '',
  });

  // Policy governance settings state
  const [governanceData, setGovernanceData] = useState<OrgPolicySettings>({
    require_policy_approval: true,
    approver_role: 'executive',
    approval_sla_days: 3,
    allow_hr_ops_draft: true,
  });

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Fetch policy governance settings
  const { data: governanceSettings, isLoading: governanceLoading } = useQuery({
    queryKey: ['org_policy_governance', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      return getOrgPolicySettings(orgId);
    },
    enabled: !!orgId,
  });

  // Update local governance state when data loads
  useEffect(() => {
    if (governanceSettings) {
      setGovernanceData(governanceSettings);
    }
  }, [governanceSettings]);

  // Mutation for saving governance settings
  const governanceMutation = useMutation({
    mutationFn: async (settings: Partial<OrgPolicySettings>) => {
      if (!orgId) throw new Error('No org ID');
      return updateOrgPolicyGovernanceSettings(orgId, settings);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('Policy governance settings saved', 'تم حفظ إعدادات حوكمة السياسات'));
        queryClient.invalidateQueries({ queryKey: ['org_policy_governance', orgId] });
      } else {
        toast.error(result.error || t('Failed to save settings', 'فشل في حفظ الإعدادات'));
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Failed to save settings', 'فشل في حفظ الإعدادات'));
    },
  });

  useEffect(() => {
    if (orgId) {
      fetchOrganization();
    }
  }, [orgId]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error) throw error;

      setOrg(data);
      setFormData({
        name: data.name || '',
        domain: data.domain || '',
        logo_url: data.logo_url || '',
        primary_color: data.primary_color || '#0f766e',
        secondary_color: data.secondary_color || '#115e59',
        accent_color: data.accent_color || '#2dd4bf',
        welcome_message: data.welcome_message || '',
        footer_text: data.footer_text || '',
      });
    } catch (error: any) {
      console.error('Error fetching organization:', error);
      toast.error(t('Failed to load organization', 'فشل في تحميل المنظمة'));
      navigate('/admin/organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!orgId || !formData.name.trim()) {
      toast.error(t('Organization name is required', 'اسم المنظمة مطلوب'));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name.trim(),
          domain: formData.domain.trim() || null,
          logo_url: formData.logo_url.trim() || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color,
          welcome_message: formData.welcome_message.trim() || null,
          footer_text: formData.footer_text.trim() || null,
        })
        .eq('id', orgId);

      if (error) throw error;

      toast.success(t('Settings saved successfully', 'تم حفظ الإعدادات بنجاح'));
      fetchOrganization();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(t('Failed to save settings', 'فشل في حفظ الإعدادات'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetToDefaults = () => {
    setFormData(prev => ({
      ...prev,
      primary_color: '#0f766e',
      secondary_color: '#115e59',
      accent_color: '#2dd4bf',
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/admin/organizations')}
        >
          <ArrowLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('Organization Settings', 'إعدادات المنظمة')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {org?.name} — {t('Customize branding and settings', 'تخصيص العلامة التجارية والإعدادات')}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className={cn("w-4 h-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
          ) : (
            <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
          )}
          {t('Save Changes', 'حفظ التغييرات')}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="w-4 h-4" />
            {t('General', 'عام')}
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="w-4 h-4" />
            {t('Branding', 'العلامة التجارية')}
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            {t('Content', 'المحتوى')}
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <ShieldCheck className="w-4 h-4" />
            {t('Policy Governance', 'حوكمة السياسات')}
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('General Information', 'المعلومات العامة')}</CardTitle>
              <CardDescription>
                {t('Basic organization details', 'التفاصيل الأساسية للمنظمة')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('Organization Name', 'اسم المنظمة')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('Enter organization name', 'أدخل اسم المنظمة')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">{t('Domain', 'النطاق')}</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    placeholder="company.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('Used for automatic user assignment', 'يستخدم للتعيين التلقائي للمستخدمين')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('Brand Colors', 'ألوان العلامة التجارية')}</span>
                  <Button variant="ghost" size="sm" onClick={resetToDefaults}>
                    {t('Reset to defaults', 'إعادة التعيين')}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t('Customize the color scheme for this organization', 'تخصيص نظام الألوان لهذه المنظمة')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="primary_color">{t('Primary Color', 'اللون الأساسي')}</Label>
                      <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                        <Input
                          id="primary_color"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          placeholder="#0f766e"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="secondary_color">{t('Secondary Color', 'اللون الثانوي')}</Label>
                      <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                        <Input
                          id="secondary_color"
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={formData.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          placeholder="#115e59"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="accent_color">{t('Accent Color', 'لون التمييز')}</Label>
                      <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                        <Input
                          id="accent_color"
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={formData.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          placeholder="#2dd4bf"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('Logo & Identity', 'الشعار والهوية')}</CardTitle>
                <CardDescription>
                  {t('Upload your organization logo', 'قم بتحميل شعار منظمتك')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">{t('Logo URL', 'رابط الشعار')}</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                {formData.logo_url && (
                  <div className="mt-4">
                    <Label>{t('Preview', 'معاينة')}</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo preview" 
                        className="max-h-20 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>{t('Color Preview', 'معاينة الألوان')}</Label>
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: formData.primary_color }}
                      />
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: formData.secondary_color }}
                      />
                      <div 
                        className="w-12 h-12 rounded-lg shadow-sm"
                        style={{ backgroundColor: formData.accent_color }}
                      />
                    </div>
                    <div 
                      className="p-3 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      {t('Sample Button', 'زر نموذجي')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>{t('Custom Content', 'محتوى مخصص')}</CardTitle>
              <CardDescription>
                {t('Personalize messages for your organization', 'تخصيص الرسائل لمنظمتك')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="welcome_message">{t('Welcome Message', 'رسالة الترحيب')}</Label>
                <Textarea
                  id="welcome_message"
                  value={formData.welcome_message}
                  onChange={(e) => handleInputChange('welcome_message', e.target.value)}
                  placeholder={t('Welcome to our benefits platform!', 'مرحبًا بك في منصة المزايا الخاصة بنا!')}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {t('Displayed on the employee dashboard', 'يظهر على لوحة تحكم الموظف')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_text">{t('Footer Text', 'نص التذييل')}</Label>
                <Textarea
                  id="footer_text"
                  value={formData.footer_text}
                  onChange={(e) => handleInputChange('footer_text', e.target.value)}
                  placeholder={t('Contact HR for assistance', 'تواصل مع الموارد البشرية للمساعدة')}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {t('Displayed at the bottom of pages', 'يظهر في أسفل الصفحات')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Governance Tab */}
        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {t('Policy Governance Settings', 'إعدادات حوكمة السياسات')}
              </CardTitle>
              <CardDescription>
                {t(
                  'Control how policies are reviewed and approved before publishing. This is the single source of truth for the approval workflow.',
                  'التحكم في كيفية مراجعة السياسات والموافقة عليها قبل النشر. هذا هو المصدر الوحيد للحقيقة لسير عمل الموافقة.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Require Approval Toggle */}
              <div className={cn("flex items-center justify-between p-4 border rounded-lg bg-muted/30", isRTL && "flex-row-reverse")}>
                <div className={cn("space-y-1", isRTL && "text-right")}>
                  <Label htmlFor="require_approval" className="text-base font-medium">
                    {t('Require Policy Approval', 'تتطلب الموافقة على السياسة')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'When enabled, policies must be submitted for approval before publishing. When disabled, HR can publish directly.',
                      'عند التمكين، يجب تقديم السياسات للموافقة قبل النشر. عند التعطيل، يمكن للموارد البشرية النشر مباشرة.'
                    )}
                  </p>
                </div>
                <Switch
                  id="require_approval"
                  checked={governanceData.require_policy_approval}
                  onCheckedChange={(checked) => setGovernanceData(prev => ({ ...prev, require_policy_approval: checked }))}
                />
              </div>

              {/* Conditional: Approval settings only shown if approvals are enabled */}
              {governanceData.require_policy_approval && (
                <div className="space-y-6 p-4 border rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {t('Approval Workflow Configuration', 'تكوين سير عمل الموافقة')}
                  </h4>

                  {/* Approver Role */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="approver_role">{t('Approver Role', 'دور الموافِق')}</Label>
                      <Select
                        value={governanceData.approver_role}
                        onValueChange={(value) => setGovernanceData(prev => ({
                          ...prev,
                          approver_role: value as OrgPolicySettings['approver_role'],
                        }))}
                      >
                        <SelectTrigger id="approver_role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executive">{t('Executive', 'تنفيذي')}</SelectItem>
                          <SelectItem value="hr_manager">{t('HR Manager', 'مدير الموارد البشرية')}</SelectItem>
                          <SelectItem value="admin">{t('Admin', 'مسؤول')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {t('Users with this role can approve or reject policy submissions', 'يمكن للمستخدمين بهذا الدور الموافقة على طلبات السياسة أو رفضها')}
                      </p>
                    </div>

                    {/* Approval SLA */}
                    <div className="space-y-2">
                      <Label htmlFor="approval_sla">{t('Approval SLA (days)', 'مهلة الموافقة (أيام)')}</Label>
                      <Input
                        id="approval_sla"
                        type="number"
                        min={1}
                        max={30}
                        value={governanceData.approval_sla_days}
                        onChange={(e) => setGovernanceData(prev => ({
                          ...prev,
                          approval_sla_days: Math.max(1, Math.min(30, parseInt(e.target.value) || 3)),
                        }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('Expected time to review pending approvals', 'الوقت المتوقع لمراجعة الموافقات المعلقة')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Governance Button */}
              <div className={cn("flex", isRTL ? "justify-start" : "justify-end")}>
                <Button
                  onClick={() => governanceMutation.mutate(governanceData)}
                  disabled={governanceMutation.isPending || governanceLoading}
                >
                  {governanceMutation.isPending ? (
                    <RefreshCw className={cn("w-4 h-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                  ) : (
                    <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  )}
                  {t('Save Governance Settings', 'حفظ إعدادات الحوكمة')}
                </Button>
              </div>

              {/* Info box about source of truth */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t('Note:', 'ملاحظة:')}</strong>{' '}
                  {t(
                    'These settings are the single source of truth for the policy approval workflow across the entire platform (Employer Portal, Admin Portal, RPCs).',
                    'هذه الإعدادات هي المصدر الوحيد للحقيقة لسير عمل الموافقة على السياسة عبر المنصة بأكملها (بوابة صاحب العمل، بوابة المسؤول، RPCs).'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
