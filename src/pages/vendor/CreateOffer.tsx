import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Tag,
  Calendar,
  Percent,
  FileText,
  Image,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const categories = [
  { value: 'fitness', label: 'Fitness', labelAr: 'اللياقة' },
  { value: 'wellness', label: 'Wellness', labelAr: 'العافية' },
  { value: 'health', label: 'Health', labelAr: 'الصحة' },
  { value: 'education', label: 'Education', labelAr: 'التعليم' },
  { value: 'food', label: 'Food & Dining', labelAr: 'الطعام والمطاعم' },
  { value: 'entertainment', label: 'Entertainment', labelAr: 'الترفيه' },
  { value: 'travel', label: 'Travel', labelAr: 'السفر' },
  { value: 'retail', label: 'Retail', labelAr: 'التجزئة' },
];

const discountTypes = [
  { value: 'percentage', label: 'Percentage Off', labelAr: 'خصم بالنسبة المئوية' },
  { value: 'fixed', label: 'Fixed Amount Off', labelAr: 'خصم بمبلغ ثابت' },
  { value: 'bogo', label: 'Buy One Get One', labelAr: 'اشترِ واحداً واحصل على الثاني' },
  { value: 'free_trial', label: 'Free Trial', labelAr: 'تجربة مجانية' },
];

export default function VendorCreateOffer() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    category: '',
    discountType: '',
    discountValue: '',
    terms: '',
    termsAr: '',
    startDate: '',
    endDate: '',
    isActive: true,
    limitRedemptions: false,
    maxRedemptions: '',
  });

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('Offer created successfully!', 'تم إنشاء العرض بنجاح!'));
    navigate('/vendor/offers');
  };

  const handleSaveDraft = () => {
    toast.success(t('Draft saved', 'تم حفظ المسودة'));
  };

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/vendor/offers')}
        >
          <BackIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t('Create New Offer', 'إنشاء عرض جديد')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Set up a new offer for employees', 'أنشئ عرضاً جديداً للموظفين')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader className={cn(isRTL && "text-right")}>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-accent" />
                  {t('Basic Information', 'المعلومات الأساسية')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('Offer Title (English)', 'عنوان العرض (بالإنجليزية)')}</Label>
                    <Input 
                      id="title"
                      placeholder={t('e.g., 20% Off Premium Gym Membership', 'مثال: ٢٠٪ خصم على عضوية النادي المميزة')}
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleAr">{t('Offer Title (Arabic)', 'عنوان العرض (بالعربية)')}</Label>
                    <Input 
                      id="titleAr"
                      dir="rtl"
                      placeholder="٢٠٪ خصم على عضوية النادي المميزة"
                      value={formData.titleAr}
                      onChange={(e) => handleChange('titleAr', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('Description (English)', 'الوصف (بالإنجليزية)')}</Label>
                  <Textarea 
                    id="description"
                    placeholder={t('Describe your offer...', 'صف عرضك...')}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">{t('Description (Arabic)', 'الوصف (بالعربية)')}</Label>
                  <Textarea 
                    id="descriptionAr"
                    dir="rtl"
                    placeholder="صف عرضك..."
                    value={formData.descriptionAr}
                    onChange={(e) => handleChange('descriptionAr', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Category', 'الفئة')}</Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select a category', 'اختر فئة')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {language === 'ar' ? cat.labelAr : cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Discount Details */}
            <Card>
              <CardHeader className={cn(isRTL && "text-right")}>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="w-5 h-5 text-accent" />
                  {t('Discount Details', 'تفاصيل الخصم')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Discount Type', 'نوع الخصم')}</Label>
                    <Select value={formData.discountType} onValueChange={(v) => handleChange('discountType', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select discount type', 'اختر نوع الخصم')} />
                      </SelectTrigger>
                      <SelectContent>
                        {discountTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {language === 'ar' ? type.labelAr : type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">{t('Discount Value', 'قيمة الخصم')}</Label>
                    <Input 
                      id="discountValue"
                      placeholder={formData.discountType === 'percentage' ? '20' : '100'}
                      value={formData.discountValue}
                      onChange={(e) => handleChange('discountValue', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">{t('Terms & Conditions (English)', 'الشروط والأحكام (بالإنجليزية)')}</Label>
                  <Textarea 
                    id="terms"
                    placeholder={t('Enter terms and conditions...', 'أدخل الشروط والأحكام...')}
                    value={formData.terms}
                    onChange={(e) => handleChange('terms', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Validity Period */}
            <Card>
              <CardHeader className={cn(isRTL && "text-right")}>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  {t('Validity Period', 'فترة الصلاحية')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t('Start Date', 'تاريخ البدء')}</Label>
                    <Input 
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">{t('End Date', 'تاريخ الانتهاء')}</Label>
                    <Input 
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader className={cn(isRTL && "text-right")}>
                <CardTitle className="text-lg">{t('Status', 'الحالة')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <Label htmlFor="isActive">{t('Active immediately', 'تفعيل فوري')}</Label>
                  <Switch 
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(v) => handleChange('isActive', v)}
                  />
                </div>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <Label htmlFor="limitRedemptions">{t('Limit redemptions', 'تحديد عدد الاستردادات')}</Label>
                  <Switch 
                    id="limitRedemptions"
                    checked={formData.limitRedemptions}
                    onCheckedChange={(v) => handleChange('limitRedemptions', v)}
                  />
                </div>
                {formData.limitRedemptions && (
                  <div className="space-y-2">
                    <Label htmlFor="maxRedemptions">{t('Maximum Redemptions', 'الحد الأقصى للاستردادات')}</Label>
                    <Input 
                      id="maxRedemptions"
                      type="number"
                      placeholder="500"
                      value={formData.maxRedemptions}
                      onChange={(e) => handleChange('maxRedemptions', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Upload Placeholder */}
            <Card>
              <CardHeader className={cn(isRTL && "text-right")}>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="w-5 h-5 text-accent" />
                  {t('Offer Image', 'صورة العرض')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('Drag & drop or click to upload', 'اسحب وأفلت أو انقر للتحميل')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button type="submit" className="w-full gap-2">
                <Save className="w-4 h-4" />
                {t('Create Offer', 'إنشاء العرض')}
              </Button>
              <Button type="button" variant="outline" className="w-full gap-2" onClick={handleSaveDraft}>
                <FileText className="w-4 h-4" />
                {t('Save as Draft', 'حفظ كمسودة')}
              </Button>
              <Button type="button" variant="ghost" className="w-full gap-2">
                <Eye className="w-4 h-4" />
                {t('Preview', 'معاينة')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
