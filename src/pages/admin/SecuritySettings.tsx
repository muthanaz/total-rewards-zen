import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, SectionCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ShieldCheck, Key, Lock, Users, Globe, AlertTriangle,
  Fingerprint, Smartphone, Mail, Clock, Plus, Trash2, Save
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { useAuth } from '@/contexts/AuthContext';

interface SecuritySettings {
  mfa_required: boolean;
  mfa_methods: string[];
  session_timeout: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  max_login_attempts: number;
  lockout_duration: number;
  sso_enabled: boolean;
  sso_provider: string;
  ip_allowlist_enabled: boolean;
  ip_allowlist: string;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  mfa_required: true,
  mfa_methods: ['totp', 'sms'],
  session_timeout: 30,
  password_min_length: 12,
  password_require_uppercase: true,
  password_require_numbers: true,
  password_require_symbols: true,
  max_login_attempts: 5,
  lockout_duration: 15,
  sso_enabled: false,
  sso_provider: '',
  ip_allowlist_enabled: false,
  ip_allowlist: '',
};

export default function AdminSecuritySettings() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const { user } = useAuth();
  const { createAuditLog } = useAdminAuditLog();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);

  // Fetch security settings from org settings JSONB
  const { data: orgData, isLoading } = useQuery({
    queryKey: ['admin-security-settings'],
    queryFn: async () => {
      if (!user) return null;
      
      // Get user's org or first org for admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!profile?.organization_id) {
        // Admin: get first org
        const { data: orgs } = await supabase.from('organizations').select('id, settings').limit(1);
        return orgs?.[0] || null;
      }
      
      const { data: org } = await supabase
        .from('organizations')
        .select('id, settings')
        .eq('id', profile.organization_id)
        .single();
      
      return org;
    },
    enabled: !!user,
  });

  // Load settings from org data
  useEffect(() => {
    if (orgData?.settings) {
      const storedSettings = orgData.settings as any;
      setSettings(prev => ({
        ...prev,
        ...storedSettings.security_settings,
      }));
    }
  }, [orgData]);

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async (newSettings: SecuritySettings) => {
      if (!orgData?.id) throw new Error('No organization found');
      
      const currentOrgSettings = (orgData.settings || {}) as any;
      const updatedSettings = {
        ...currentOrgSettings,
        security_settings: newSettings,
      };

      const { error } = await supabase
        .from('organizations')
        .update({ settings: updatedSettings })
        .eq('id', orgData.id);

      if (error) throw error;
      return newSettings;
    },
    onSuccess: async () => {
      await createAuditLog({
        action: 'SETTINGS_UPDATE',
        entityType: 'settings',
        entityId: 'security_settings',
        metadata: { 
          section: 'security',
          mfa_required: settings.mfa_required,
          session_timeout: settings.session_timeout,
          sso_enabled: settings.sso_enabled,
        },
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-security-settings'] });
      toast.success(t('Security settings saved', 'تم حفظ إعدادات الأمان'));
    },
    onError: () => {
      toast.error(t('Failed to save settings', 'فشل في حفظ الإعدادات'));
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <PageLayout
        title={t('Security Settings', 'إعدادات الأمان')}
        description={t('Loading...', 'جاري التحميل...')}
        icon={ShieldCheck}
      >
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('Security Settings', 'إعدادات الأمان')}
      description={t('Configure authentication, MFA, SSO, and access control policies', 'تكوين المصادقة والتحقق متعدد العوامل وتسجيل الدخول الموحد وسياسات التحكم في الوصول')}
      icon={ShieldCheck}
      iconClassName="from-emerald-500 to-teal-500"
      actions={
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 me-2" />
          {saveMutation.isPending ? t('Saving...', 'جاري الحفظ...') : t('Save Changes', 'حفظ التغييرات')}
        </Button>
      }
    >
      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            {t('Authentication', 'المصادقة')}
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            {t('MFA', 'التحقق المتعدد')}
          </TabsTrigger>
          <TabsTrigger value="sso" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('SSO', 'تسجيل الدخول الموحد')}
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t('Access Control', 'التحكم في الوصول')}
          </TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Lock className="w-5 h-5" />
                {t('Password Policy', 'سياسة كلمة المرور')}
              </CardTitle>
              <CardDescription>{t('Configure password requirements for all users', 'تكوين متطلبات كلمة المرور لجميع المستخدمين')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('Minimum Password Length', 'الحد الأدنى لطول كلمة المرور')}</Label>
                  <Select 
                    value={settings.password_min_length.toString()} 
                    onValueChange={(v) => setSettings({...settings, password_min_length: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 {t('characters', 'أحرف')}</SelectItem>
                      <SelectItem value="10">10 {t('characters', 'أحرف')}</SelectItem>
                      <SelectItem value="12">12 {t('characters', 'أحرف')}</SelectItem>
                      <SelectItem value="16">16 {t('characters', 'أحرف')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('Session Timeout (minutes)', 'مهلة الجلسة (دقائق)')}</Label>
                  <Select 
                    value={settings.session_timeout.toString()} 
                    onValueChange={(v) => setSettings({...settings, session_timeout: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 {t('minutes', 'دقيقة')}</SelectItem>
                      <SelectItem value="30">30 {t('minutes', 'دقيقة')}</SelectItem>
                      <SelectItem value="60">60 {t('minutes', 'دقيقة')}</SelectItem>
                      <SelectItem value="120">120 {t('minutes', 'دقيقة')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div>
                    <p className="font-medium">{t('Require Uppercase Letters', 'تتطلب أحرف كبيرة')}</p>
                    <p className="text-sm text-muted-foreground">{t('At least one uppercase letter', 'حرف كبير واحد على الأقل')}</p>
                  </div>
                  <Switch checked={settings.password_require_uppercase} onCheckedChange={(v) => setSettings({...settings, password_require_uppercase: v})} />
                </div>

                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div>
                    <p className="font-medium">{t('Require Numbers', 'تتطلب أرقام')}</p>
                    <p className="text-sm text-muted-foreground">{t('At least one number', 'رقم واحد على الأقل')}</p>
                  </div>
                  <Switch checked={settings.password_require_numbers} onCheckedChange={(v) => setSettings({...settings, password_require_numbers: v})} />
                </div>

                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div>
                    <p className="font-medium">{t('Require Special Characters', 'تتطلب رموز خاصة')}</p>
                    <p className="text-sm text-muted-foreground">{t('At least one special character (!@#$%)', 'رمز خاص واحد على الأقل')}</p>
                  </div>
                  <Switch checked={settings.password_require_symbols} onCheckedChange={(v) => setSettings({...settings, password_require_symbols: v})} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <AlertTriangle className="w-5 h-5" />
                {t('Account Lockout', 'قفل الحساب')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('Max Login Attempts', 'الحد الأقصى لمحاولات تسجيل الدخول')}</Label>
                  <Select 
                    value={settings.max_login_attempts.toString()} 
                    onValueChange={(v) => setSettings({...settings, max_login_attempts: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 {t('attempts', 'محاولات')}</SelectItem>
                      <SelectItem value="5">5 {t('attempts', 'محاولات')}</SelectItem>
                      <SelectItem value="10">10 {t('attempts', 'محاولات')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('Lockout Duration (minutes)', 'مدة القفل (دقائق)')}</Label>
                  <Select 
                    value={settings.lockout_duration.toString()} 
                    onValueChange={(v) => setSettings({...settings, lockout_duration: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 {t('minutes', 'دقائق')}</SelectItem>
                      <SelectItem value="15">15 {t('minutes', 'دقائق')}</SelectItem>
                      <SelectItem value="30">30 {t('minutes', 'دقائق')}</SelectItem>
                      <SelectItem value="60">60 {t('minutes', 'دقائق')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MFA Tab */}
        <TabsContent value="mfa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Fingerprint className="w-5 h-5" />
                {t('Multi-Factor Authentication', 'المصادقة متعددة العوامل')}
              </CardTitle>
              <CardDescription>{t('Configure MFA requirements and methods', 'تكوين متطلبات وطرق MFA')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={cn("flex items-center justify-between p-4 rounded-lg bg-muted/50", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="font-medium">{t('Require MFA for All Users', 'تتطلب MFA لجميع المستخدمين')}</p>
                  <p className="text-sm text-muted-foreground">{t('Users must set up MFA to access the platform', 'يجب على المستخدمين إعداد MFA للوصول إلى المنصة')}</p>
                </div>
                <Switch checked={settings.mfa_required} onCheckedChange={(v) => setSettings({...settings, mfa_required: v})} />
              </div>

              <div>
                <Label className="mb-3 block">{t('Allowed MFA Methods', 'طرق MFA المسموحة')}</Label>
                <div className="space-y-3">
                  <div className={cn("flex items-center justify-between p-3 rounded-lg border", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{t('Authenticator App (TOTP)', 'تطبيق المصادقة')}</p>
                        <p className="text-sm text-muted-foreground">{t('Google Authenticator, Authy, etc.', 'Google Authenticator، Authy، إلخ')}</p>
                      </div>
                    </div>
                    <Switch checked={settings.mfa_methods.includes('totp')} />
                  </div>

                  <div className={cn("flex items-center justify-between p-3 rounded-lg border", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{t('SMS Verification', 'التحقق عبر الرسائل')}</p>
                        <p className="text-sm text-muted-foreground">{t('One-time codes via SMS', 'رموز لمرة واحدة عبر الرسائل')}</p>
                      </div>
                    </div>
                    <Switch checked={settings.mfa_methods.includes('sms')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSO Tab */}
        <TabsContent value="sso" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Users className="w-5 h-5" />
                {t('Single Sign-On (SSO)', 'تسجيل الدخول الموحد')}
              </CardTitle>
              <CardDescription>{t('Configure enterprise SSO integration', 'تكوين تكامل SSO للمؤسسات')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={cn("flex items-center justify-between p-4 rounded-lg bg-muted/50", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="font-medium">{t('Enable SSO', 'تمكين SSO')}</p>
                  <p className="text-sm text-muted-foreground">{t('Allow users to sign in with enterprise identity provider', 'السماح للمستخدمين بتسجيل الدخول باستخدام موفر هوية المؤسسة')}</p>
                </div>
                <Switch checked={settings.sso_enabled} onCheckedChange={(v) => setSettings({...settings, sso_enabled: v})} />
              </div>

              {settings.sso_enabled && (
                <div className="space-y-4 p-4 rounded-lg border">
                  <div className="space-y-2">
                    <Label>{t('Identity Provider', 'موفر الهوية')}</Label>
                    <Select value={settings.sso_provider} onValueChange={(v) => setSettings({...settings, sso_provider: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select provider', 'اختر الموفر')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="azure">Azure AD</SelectItem>
                        <SelectItem value="okta">Okta</SelectItem>
                        <SelectItem value="google">Google Workspace</SelectItem>
                        <SelectItem value="saml">Custom SAML 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('Contact support to complete SSO configuration', 'اتصل بالدعم لإكمال تكوين SSO')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Globe className="w-5 h-5" />
                {t('IP Allowlist', 'قائمة IP المسموح بها')}
              </CardTitle>
              <CardDescription>{t('Restrict access to specific IP addresses or ranges', 'تقييد الوصول إلى عناوين IP محددة')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={cn("flex items-center justify-between p-4 rounded-lg bg-muted/50", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="font-medium">{t('Enable IP Allowlist', 'تمكين قائمة IP المسموح بها')}</p>
                  <p className="text-sm text-muted-foreground">{t('Only allow access from specified IPs', 'السماح بالوصول فقط من عناوين IP المحددة')}</p>
                </div>
                <Switch checked={settings.ip_allowlist_enabled} onCheckedChange={(v) => setSettings({...settings, ip_allowlist_enabled: v})} />
              </div>

              {settings.ip_allowlist_enabled && (
                <div className="space-y-2">
                  <Label>{t('Allowed IP Addresses', 'عناوين IP المسموح بها')}</Label>
                  <Textarea
                    placeholder="192.168.1.0/24&#10;10.0.0.1&#10;203.0.113.0/24"
                    value={settings.ip_allowlist}
                    onChange={(e) => setSettings({...settings, ip_allowlist: e.target.value})}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">{t('Enter one IP address or CIDR range per line', 'أدخل عنوان IP واحد أو نطاق CIDR لكل سطر')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
