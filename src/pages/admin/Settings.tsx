import { useState } from 'react';
import {
  Settings,
  Shield,
  Globe,
  Bell,
  Database,
  Users,
  Mail,
  CreditCard,
  Lock,
  Building2,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function AdminSettings() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'bnft.',
    supportEmail: 'support@bnft.io',
    defaultCurrency: 'AED',
    defaultLanguage: 'en',
    maintenanceMode: false,
    autoApproveVendors: false,
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: '24',
    dataRetentionDays: '365',
    enableAnalytics: true,
    enableAuditLogs: true,
    enableBackups: true,
    backupFrequency: 'daily',
    emailNotifications: true,
    slackNotifications: false,
    webhookUrl: '',
    commissionRate: '3.5',
    minPayoutAmount: '100',
    payoutCycle: 'monthly',
  });

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleSaveSettings = (section: string) => {
    toast.success(t(`${section} settings saved successfully`, `تم حفظ إعدادات ${section} بنجاح`));
  };

  const systemStatus = [
    { name: 'API Server', status: 'operational', latency: '45ms' },
    { name: 'Database', status: 'operational', latency: '12ms' },
    { name: 'Cache', status: 'operational', latency: '3ms' },
    { name: 'Email Service', status: 'operational', latency: '120ms' },
    { name: 'Analytics', status: 'operational', latency: '85ms' },
  ];

  return (
    <div className={cn("space-y-8", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", isRTL && "sm:flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('Platform Settings', 'إعدادات المنصة')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Configure and manage platform-wide settings', 'تكوين وإدارة إعدادات المنصة')}
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Badge variant="outline" className="gap-1.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {t('All Systems Operational', 'جميع الأنظمة تعمل')}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t('General', 'عام')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Security', 'الأمان')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Notifications', 'الإشعارات')}</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Data & Backups', 'البيانات')}</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Billing', 'الفوترة')}</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Platform Info */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Building2 className="w-5 h-5 text-accent" />
                  {t('Platform Information', 'معلومات المنصة')}
                </CardTitle>
                <CardDescription>
                  {t('Basic platform configuration', 'التكوين الأساسي للمنصة')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('Platform Name', 'اسم المنصة')}</Label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Support Email', 'البريد الإلكتروني للدعم')}</Label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Default Currency', 'العملة الافتراضية')}</Label>
                    <Select
                      value={settings.defaultCurrency}
                      onValueChange={(value) => setSettings({ ...settings, defaultCurrency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">AED - Dirham</SelectItem>
                        <SelectItem value="USD">USD - Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - Pound</SelectItem>
                        <SelectItem value="SAR">SAR - Riyal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Default Language', 'اللغة الافتراضية')}</Label>
                    <Select
                      value={settings.defaultLanguage}
                      onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => handleSaveSettings('Platform')} className="w-full">
                  <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('Save Changes', 'حفظ التغييرات')}
                </Button>
              </CardContent>
            </Card>

            {/* Feature Flags */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Settings className="w-5 h-5 text-accent" />
                  {t('Feature Settings', 'إعدادات الميزات')}
                </CardTitle>
                <CardDescription>
                  {t('Enable or disable platform features', 'تمكين أو تعطيل ميزات المنصة')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-0.5", isRTL && "text-right")}>
                    <Label>{t('Maintenance Mode', 'وضع الصيانة')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Temporarily disable public access', 'تعطيل الوصول العام مؤقتًا')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
                <Separator />
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-0.5", isRTL && "text-right")}>
                    <Label>{t('Auto-approve Vendors', 'الموافقة التلقائية على البائعين')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Skip manual vendor approval process', 'تخطي عملية الموافقة اليدوية')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoApproveVendors}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoApproveVendors: checked })}
                  />
                </div>
                <Separator />
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-0.5", isRTL && "text-right")}>
                    <Label>{t('Analytics Tracking', 'تتبع التحليلات')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Collect platform usage analytics', 'جمع تحليلات استخدام المنصة')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableAnalytics}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableAnalytics: checked })}
                  />
                </div>
                <Separator />
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-0.5", isRTL && "text-right")}>
                    <Label>{t('Audit Logs', 'سجلات التدقيق')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Track all admin actions', 'تتبع جميع إجراءات المسؤول')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableAuditLogs}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableAuditLogs: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Server className="w-5 h-5 text-accent" />
                {t('System Status', 'حالة النظام')}
              </CardTitle>
              <CardDescription>
                {t('Real-time system health monitoring', 'مراقبة صحة النظام في الوقت الحقيقي')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {systemStatus.map((system) => (
                  <div
                    key={system.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-success" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{system.name}</p>
                      <p className="text-xs text-muted-foreground">{system.latency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Lock className="w-5 h-5 text-accent" />
                  {t('Authentication', 'المصادقة')}
                </CardTitle>
                <CardDescription>
                  {t('User authentication settings', 'إعدادات مصادقة المستخدم')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-0.5", isRTL && "text-right")}>
                    <Label>{t('Require Email Verification', 'طلب التحقق من البريد الإلكتروني')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Users must verify email to access', 'يجب على المستخدمين التحقق للوصول')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                  />
                </div>
                <Separator />
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-0.5", isRTL && "text-right")}>
                    <Label>{t('Two-Factor Authentication', 'المصادقة الثنائية')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Require 2FA for admin accounts', 'طلب 2FA لحسابات المسؤول')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableTwoFactor: checked })}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>{t('Session Timeout (hours)', 'مهلة الجلسة (ساعات)')}</Label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) => setSettings({ ...settings, sessionTimeout: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => handleSaveSettings('Security')} className="w-full">
                  <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('Save Security Settings', 'حفظ إعدادات الأمان')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Shield className="w-5 h-5 text-accent" />
                  {t('API Configuration', 'تكوين API')}
                </CardTitle>
                <CardDescription>
                  {t('Manage API keys and access', 'إدارة مفاتيح API والوصول')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('API Key', 'مفتاح API')}</Label>
                  <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value="bnft_live_sk_xxxxxxxxxxxxxxxxxxxx"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className={cn("flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20", isRTL && "flex-row-reverse")}>
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <p className="text-sm text-warning">
                    {t('Never share your API key publicly', 'لا تشارك مفتاح API الخاص بك أبدًا')}
                  </p>
                </div>
                <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                  <Button variant="outline" className="flex-1">
                    <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('Regenerate Key', 'إعادة إنشاء المفتاح')}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    {t('View Logs', 'عرض السجلات')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Bell className="w-5 h-5 text-accent" />
                {t('Notification Preferences', 'تفضيلات الإشعارات')}
              </CardTitle>
              <CardDescription>
                {t('Configure how you receive notifications', 'تكوين كيفية تلقي الإشعارات')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-muted">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <Label>{t('Email Notifications', 'إشعارات البريد الإلكتروني')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Receive updates via email', 'تلقي التحديثات عبر البريد الإلكتروني')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              <Separator />
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-muted">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <Label>{t('Slack Notifications', 'إشعارات Slack')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Send alerts to Slack channel', 'إرسال التنبيهات إلى قناة Slack')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.slackNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, slackNotifications: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{t('Webhook URL', 'عنوان Webhook')}</Label>
                <Input
                  placeholder="https://your-webhook-url.com/endpoint"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {t('Receive real-time events via webhook', 'تلقي الأحداث في الوقت الحقيقي عبر webhook')}
                </p>
              </div>
              <Button onClick={() => handleSaveSettings('Notification')} className="w-full">
                <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('Save Notification Settings', 'حفظ إعدادات الإشعارات')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Backups */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Database className="w-5 h-5 text-accent" />
                  {t('Data Management', 'إدارة البيانات')}
                </CardTitle>
                <CardDescription>
                  {t('Configure data retention and backups', 'تكوين الاحتفاظ بالبيانات والنسخ الاحتياطي')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('Data Retention (days)', 'الاحتفاظ بالبيانات (أيام)')}</Label>
                  <Select
                    value={settings.dataRetentionDays}
                    onValueChange={(value) => setSettings({ ...settings, dataRetentionDays: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                      <SelectItem value="1095">3 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-0.5", isRTL && "text-right")}>
                    <Label>{t('Automatic Backups', 'النسخ الاحتياطي التلقائي')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('Automatically backup data', 'نسخ البيانات احتياطيًا تلقائيًا')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableBackups}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableBackups: checked })}
                  />
                </div>
                {settings.enableBackups && (
                  <div className="space-y-2">
                    <Label>{t('Backup Frequency', 'تكرار النسخ الاحتياطي')}</Label>
                    <Select
                      value={settings.backupFrequency}
                      onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={() => handleSaveSettings('Data')} className="w-full">
                  <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('Save Data Settings', 'حفظ إعدادات البيانات')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <CheckCircle className="w-5 h-5 text-success" />
                  {t('Recent Backups', 'النسخ الاحتياطية الأخيرة')}
                </CardTitle>
                <CardDescription>
                  {t('View and manage backup history', 'عرض وإدارة سجل النسخ الاحتياطي')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: '2026-01-12 08:00', size: '2.4 GB', status: 'completed' },
                    { date: '2026-01-11 08:00', size: '2.3 GB', status: 'completed' },
                    { date: '2026-01-10 08:00', size: '2.3 GB', status: 'completed' },
                    { date: '2026-01-09 08:00', size: '2.2 GB', status: 'completed' },
                  ].map((backup, index) => (
                    <div
                      key={index}
                      className={cn("flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50", isRTL && "flex-row-reverse")}
                    >
                      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <div className={isRTL ? "text-right" : ""}>
                          <p className="text-sm font-medium">{backup.date}</p>
                          <p className="text-xs text-muted-foreground">{backup.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {t('Restore', 'استعادة')}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <CreditCard className="w-5 h-5 text-accent" />
                {t('Vendor Commission Settings', 'إعدادات عمولة البائع')}
              </CardTitle>
              <CardDescription>
                {t('Configure vendor payment and commission rates', 'تكوين معدلات الدفع والعمولة للبائعين')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t('Default Commission Rate (%)', 'معدل العمولة الافتراضي (%)')}</Label>
                  <Input
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({ ...settings, commissionRate: e.target.value })}
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('Applied to all vendor transactions', 'يطبق على جميع معاملات البائعين')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t('Minimum Payout (AED)', 'الحد الأدنى للدفع (درهم)')}</Label>
                  <Input
                    type="number"
                    value={settings.minPayoutAmount}
                    onChange={(e) => setSettings({ ...settings, minPayoutAmount: e.target.value })}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('Minimum accrued amount required for disbursement', 'الحد الأدنى للمبلغ المستحق للصرف')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t('Disbursement Cycle', 'دورة الصرف')}</Label>
                  <Select
                    value={settings.payoutCycle}
                    onValueChange={(value) => setSettings({ ...settings, payoutCycle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className={cn("flex items-center gap-4 p-4 rounded-lg bg-accent/5 border border-accent/20", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-full bg-accent/10">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <h4 className="font-semibold">{t('Active Vendors', 'البائعون النشطون')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('12 vendors with pending payouts totaling AED 45,230', '12 بائع لديهم دفعات معلقة بإجمالي 45,230 درهم')}
                  </p>
                </div>
                <Button>
                  {t('Process Payouts', 'معالجة الدفعات')}
                </Button>
              </div>
              <Button onClick={() => handleSaveSettings('Billing')} className="w-full">
                <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('Save Billing Settings', 'حفظ إعدادات الفوترة')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
