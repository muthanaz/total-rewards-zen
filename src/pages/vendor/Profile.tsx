import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Store,
  Globe,
  Phone,
  Mail,
  MapPin,
  Edit,
  Save,
  Building2,
  Calendar,
  Star,
  Award,
} from 'lucide-react';
import { cn, formatInteger, formatPercent } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { PageLayout } from '@/components/shared';
import { useVendor } from '@/hooks/useVendorData';

export default function VendorProfile() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: vendor } = useVendor();
  
  const [formData, setFormData] = useState({
    name: vendor?.company_name || 'FitLife Wellness',
    nameAr: 'فيت لايف للعافية',
    description: vendor?.description || 'Premium fitness and wellness services provider offering gym memberships, wellness programs, and health consultations.',
    descriptionAr: 'مزود خدمات اللياقة والعافية المميزة يقدم عضويات النادي وبرامج العافية والاستشارات الصحية.',
    website: vendor?.website_url || 'https://fitlife-wellness.ae',
    email: vendor?.contact_email || 'partners@fitlife-wellness.ae',
    phone: vendor?.contact_phone || '+971 4 123 4567',
    address: 'Business Bay, Dubai, UAE',
    categories: ['Fitness', 'Wellness', 'Health'],
    joinedDate: 'October 2024',
    totalOffers: 12,
    totalRedemptions: vendor?.total_transactions || 8470,
    rating: 4.8,
    commissionRate: vendor?.commission_rate || 7,
    verified: true,
  });

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleSave = () => {
    setIsEditing(false);
    toast.success(t('Profile updated successfully', 'تم تحديث الملف الشخصي بنجاح'));
  };

  return (
    <PageLayout
      title={t('Company Profile', 'ملف الشركة')}
      description={t('Manage your vendor profile and information', 'إدارة ملف المورد والمعلومات')}
      icon={Store}
      iconClassName="text-primary"
      actions={
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="gap-2"
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          {isEditing ? t('Save Changes', 'حفظ التغييرات') : t('Edit Profile', 'تعديل الملف')}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader className={cn(isRTL && "text-right")}>
              <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Store className="w-5 h-5 text-primary" />
                {t('Company Information', 'معلومات الشركة')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Company Name (English)', 'اسم الشركة (بالإنجليزية)')}</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{formData.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('Company Name (Arabic)', 'اسم الشركة (بالعربية)')}</Label>
                  {isEditing ? (
                    <Input 
                      dir="rtl"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium" dir="rtl">{formData.nameAr}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('Description (English)', 'الوصف (بالإنجليزية)')}</Label>
                {isEditing ? (
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">{formData.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('Description (Arabic)', 'الوصف (بالعربية)')}</Label>
                {isEditing ? (
                  <Textarea 
                    dir="rtl"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground" dir="rtl">{formData.descriptionAr}</p>
                )}
              </div>

              <div className={cn("flex flex-wrap gap-2", isRTL && "flex-row-reverse")}>
                {formData.categories.map((cat) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className={cn(isRTL && "text-right")}>
              <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Phone className="w-5 h-5 text-primary" />
                {t('Contact Information', 'معلومات الاتصال')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Globe className="w-4 h-4" />
                    {t('Website', 'الموقع الإلكتروني')}
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  ) : (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {formData.website}
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Mail className="w-4 h-4" />
                    {t('Email', 'البريد الإلكتروني')}
                  </Label>
                  {isEditing ? (
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{formData.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Phone className="w-4 h-4" />
                    {t('Phone', 'الهاتف')}
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium" dir="ltr">{formData.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <MapPin className="w-4 h-4" />
                    {t('Address', 'العنوان')}
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{formData.address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4 mb-4", isRTL && "flex-row-reverse")}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Store className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{formData.name}</h3>
                  <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                    {formData.verified && (
                      <Badge className="bg-success/10 text-success border-success/30 gap-1">
                        <Award className="w-3 h-3" />
                        {t('Verified', 'موثق')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-border">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm text-muted-foreground">{t('Member Since', 'عضو منذ')}</span>
                  <span className="font-medium">{formData.joinedDate}</span>
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-sm text-muted-foreground">{t('Commission Rate', 'نسبة العمولة')}</span>
                  <span className="font-medium text-primary">{formatPercent(formData.commissionRate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formData.rating}</p>
                  <p className="text-sm text-muted-foreground">{t('Average Rating', 'متوسط التقييم')}</p>
                </div>
              </div>
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-xl bg-accent/10">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(formData.totalOffers)}</p>
                  <p className="text-sm text-muted-foreground">{t('Active Offers', 'العروض النشطة')}</p>
                </div>
              </div>
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-xl bg-success/10">
                  <Calendar className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(formData.totalRedemptions)}</p>
                  <p className="text-sm text-muted-foreground">{t('Total Redemptions', 'إجمالي الاستردادات')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}