import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Key,
  Mail,
  Smartphone,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { PageLayout } from '@/components/shared';

export default function VendorSettings() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [notifications, setNotifications] = useState({
    emailRedemptions: true,
    emailWeeklyReport: true,
    emailPayouts: true,
    pushRedemptions: false,
    pushPayouts: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'Asia/Dubai',
    currency: 'AED',
  });

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleSave = () => {
    toast.success(t('Settings saved successfully', 'تم حفظ الإعدادات بنجاح'));
  };

  return (
    <PageLayout
      title={t('Settings', 'الإعدادات')}
      description={t('Manage your account settings and preferences', 'إدارة إعدادات حسابك والتفضيلات')}
      icon={Settings}
      iconClassName="text-primary"
      actions={
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {t('Save All Changes', 'حفظ كل التغييرات')}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader className={cn(isRTL && "text-right")}>
            <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Bell className="w-5 h-5 text-primary" />
              {t('Notification Preferences', 'تفضيلات الإشعارات')}
            </CardTitle>
            <CardDescription>
              {t('Choose how you want to be notified', 'اختر كيف تريد أن يتم إشعارك')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('Email Notifications', 'إشعارات البريد الإلكتروني')}
              </h4>
              <div className="space-y-3">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <Label>{t('New Redemptions', 'الاستردادات الجديدة')}</Label>
                  <Switch 
                    checked={notifications.emailRedemptions}
                    onCheckedChange={(v) => setNotifications({ ...notifications, emailRedemptions: v })}
                  />
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <Label>{t('Weekly Performance Report', 'تقرير الأداء الأسبوعي')}</Label>
                  <Switch 
                    checked={notifications.emailWeeklyReport}
                    onCheckedChange={(v) => setNotifications({ ...notifications, emailWeeklyReport: v })}
                  />
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <Label>{t('Payout Notifications', 'إشعارات الدفع')}</Label>
                  <Switch 
                    checked={notifications.emailPayouts}
                    onCheckedChange={(v) => setNotifications({ ...notifications, emailPayouts: v })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                {t('Push Notifications', 'الإشعارات الفورية')}
              </h4>
              <div className="space-y-3">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <Label>{t('New Redemptions', 'الاستردادات الجديدة')}</Label>
                  <Switch 
                    checked={notifications.pushRedemptions}
                    onCheckedChange={(v) => setNotifications({ ...notifications, pushRedemptions: v })}
                  />
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <Label>{t('Payout Processed', 'تم معالجة الدفع')}</Label>
                  <Switch 
                    checked={notifications.pushPayouts}
                    onCheckedChange={(v) => setNotifications({ ...notifications, pushPayouts: v })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className={cn(isRTL && "text-right")}>
            <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Globe className="w-5 h-5 text-primary" />
              {t('Preferences', 'التفضيلات')}
            </CardTitle>
            <CardDescription>
              {t('Customize your experience', 'تخصيص تجربتك')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Language', 'اللغة')}</Label>
              <Select value={preferences.language} onValueChange={(v) => setPreferences({ ...preferences, language: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Timezone', 'المنطقة الزمنية')}</Label>
              <Select value={preferences.timezone} onValueChange={(v) => setPreferences({ ...preferences, timezone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                  <SelectItem value="Asia/Riyadh">Riyadh (GMT+3)</SelectItem>
                  <SelectItem value="Asia/Kuwait">Kuwait (GMT+3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Currency', 'العملة')}</Label>
              <Select value={preferences.currency} onValueChange={(v) => setPreferences({ ...preferences, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                  <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                  <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className={cn(isRTL && "text-right")}>
            <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Shield className="w-5 h-5 text-primary" />
              {t('Security', 'الأمان')}
            </CardTitle>
            <CardDescription>
              {t('Manage your account security', 'إدارة أمان حسابك')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full gap-2 justify-start">
              <Key className="w-4 h-4" />
              {t('Change Password', 'تغيير كلمة المرور')}
            </Button>
            <Button variant="outline" className="w-full gap-2 justify-start">
              <Smartphone className="w-4 h-4" />
              {t('Enable Two-Factor Authentication', 'تفعيل المصادقة الثنائية')}
            </Button>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{t('Your account is secure', 'حسابك آمن')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('Last login: Today at 2:34 PM from Dubai, UAE', 'آخر تسجيل دخول: اليوم الساعة 2:34 مساءً من دبي، الإمارات')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader className={cn(isRTL && "text-right")}>
            <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <CreditCard className="w-5 h-5 text-primary" />
              {t('Payment Settings', 'إعدادات الدفع')}
            </CardTitle>
            <CardDescription>
              {t('Manage your payout details', 'إدارة تفاصيل الدفع الخاصة بك')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-border">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t('Bank Account', 'الحساب البنكي')}</p>
                    <p className="text-sm text-muted-foreground">**** **** **** 4521</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">{t('Edit', 'تعديل')}</Button>
              </div>
            </div>
            <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", isRTL && "flex-row-reverse")}>
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span>{t('Payouts are processed on the 15th of each month', 'تتم معالجة المدفوعات في الخامس عشر من كل شهر')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}