import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, ArrowLeft, ArrowRight, Tag, Calendar, FileText, Image as ImageIcon, CheckCircle, AlertCircle, Sparkles, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateOffer, CreateOfferInput } from '@/hooks/useVendorData';
import { PageLayout } from '@/components/shared';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'wellness', label: 'Wellness & Fitness', labelAr: 'الصحة واللياقة' },
  { id: 'learning', label: 'Learning & Development', labelAr: 'التعلم والتطوير' },
  { id: 'food', label: 'Food & Dining', labelAr: 'الطعام والمطاعم' },
  { id: 'transport', label: 'Transport', labelAr: 'المواصلات' },
  { id: 'family', label: 'Family & Lifestyle', labelAr: 'الأسرة ونمط الحياة' },
  { id: 'entertainment', label: 'Entertainment', labelAr: 'الترفيه' },
  { id: 'retail', label: 'Retail & Shopping', labelAr: 'التسوق' },
  { id: 'travel', label: 'Travel', labelAr: 'السفر' },
];

const OFFER_TYPES = [
  { id: 'code', label: 'Voucher Code', labelAr: 'رمز القسيمة' },
  { id: 'deeplink', label: 'Direct Link', labelAr: 'رابط مباشر' },
  { id: 'payroll', label: 'Payroll Deduction', labelAr: 'خصم من الراتب' },
];

const LOCATIONS = [
  { id: 'all', label: 'All UAE', labelAr: 'جميع الإمارات' },
  { id: 'ad', label: 'Abu Dhabi', labelAr: 'أبوظبي' },
  { id: 'dxb', label: 'Dubai', labelAr: 'دبي' },
];

const WIZARD_STEPS = [
  { id: 'basics', label: 'Basics', labelAr: 'الأساسيات', icon: Tag },
  { id: 'validity', label: 'Validity', labelAr: 'الصلاحية', icon: Calendar },
  { id: 'terms', label: 'Terms', labelAr: 'الشروط', icon: FileText },
  { id: 'assets', label: 'Assets', labelAr: 'الأصول', icon: ImageIcon },
  { id: 'review', label: 'Review', labelAr: 'المراجعة', icon: CheckCircle },
];

interface FormData extends CreateOfferInput {
  offer_type: 'code' | 'deeplink' | 'payroll';
  usage_limit: number | undefined;
  location: string;
}

export default function VendorCreateOffer() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { mutate: createOffer, isPending } = useCreateOffer();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    discount_percent: undefined,
    valid_from: '',
    valid_to: '',
    is_public: true,
    terms: '',
    image_url: '',
    tags: [],
    offer_type: 'code',
    usage_limit: undefined,
    location: 'all',
  });

  const handleChange = (field: keyof FormData, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleNext = () => currentStep < WIZARD_STEPS.length - 1 && setCurrentStep(prev => prev + 1);
  const handleBack = () => currentStep > 0 && setCurrentStep(prev => prev - 1);

  const handleSubmit = () => {
    if (!formData.title || !formData.category) {
      toast.error(t('Please fill in required fields', 'يرجى ملء الحقول المطلوبة'));
      return;
    }
    createOffer(formData, { onSuccess: () => navigate('/vendor/offers') });
  };

  const handleSaveDraft = () => toast.success(t('Draft saved', 'تم حفظ المسودة'));
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const CurrentStepIcon = WIZARD_STEPS[currentStep].icon;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t('Offer Title', 'عنوان العرض')} *</Label>
              <Input id="title" placeholder={t('e.g., 30% Off Gym Membership', 'مثال: خصم 30% على عضوية النادي')} value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t('Category', 'الفئة')} *</Label>
              <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger><SelectValue placeholder={t('Select category', 'اختر الفئة')} /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(cat => <SelectItem key={cat.id} value={cat.id}>{language === 'ar' ? cat.labelAr : cat.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('Short Description', 'وصف قصير')}</Label>
              <Textarea id="description" placeholder={t('Describe your offer...', 'صف عرضك...')} value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">{t('Discount Percentage', 'نسبة الخصم')}</Label>
                <div className="relative">
                  <Input id="discount" type="number" min={1} max={100} placeholder="25" value={formData.discount_percent || ''} onChange={(e) => handleChange('discount_percent', parseInt(e.target.value) || undefined)} />
                  <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer_type">{t('Offer Type', 'نوع العرض')}</Label>
                <Select value={formData.offer_type} onValueChange={(v: any) => handleChange('offer_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{OFFER_TYPES.map(type => <SelectItem key={type.id} value={type.id}>{language === 'ar' ? type.labelAr : type.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="valid_from">{t('Start Date', 'تاريخ البدء')}</Label><Input id="valid_from" type="date" value={formData.valid_from || ''} onChange={(e) => handleChange('valid_from', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="valid_to">{t('End Date', 'تاريخ الانتهاء')}</Label><Input id="valid_to" type="date" value={formData.valid_to || ''} onChange={(e) => handleChange('valid_to', e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage_limit">{t('Usage Limit (Optional)', 'حد الاستخدام (اختياري)')}</Label>
              <Input id="usage_limit" type="number" placeholder={t('Leave empty for unlimited', 'اتركه فارغًا للاستخدام غير المحدود')} value={formData.usage_limit || ''} onChange={(e) => handleChange('usage_limit', parseInt(e.target.value) || undefined)} />
            </div>
            <Card className="border-primary/20 bg-primary/5"><CardContent className="pt-4">
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-right")}>
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div><p className="text-sm font-medium">{t('Validity Tip', 'نصيحة الصلاحية')}</p><p className="text-xs text-muted-foreground mt-1">{t('Offers with clear end dates create urgency. We recommend 1-3 month validity periods.', 'العروض ذات تواريخ الانتهاء الواضحة تخلق الإلحاح. نوصي بفترات صلاحية من 1-3 أشهر.')}</p></div>
              </div>
            </CardContent></Card>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="terms">{t('Terms & Conditions', 'الشروط والأحكام')}</Label>
              <Textarea id="terms" placeholder={t('Enter any exclusions, restrictions...', 'أدخل أي استثناءات أو قيود...')} value={formData.terms || ''} onChange={(e) => handleChange('terms', e.target.value)} rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t('Location', 'الموقع')}</Label>
              <Select value={formData.location} onValueChange={(v) => handleChange('location', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LOCATIONS.map(loc => <SelectItem key={loc.id} value={loc.id}>{language === 'ar' ? loc.labelAr : loc.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", isRTL && "flex-row-reverse")}>
              <div className={cn(isRTL && "text-right")}><Label>{t('Public Offer', 'عرض عام')}</Label><p className="text-xs text-muted-foreground mt-1">{t('Available to all employees', 'متاح لجميع الموظفين')}</p></div>
              <Switch checked={formData.is_public ?? true} onCheckedChange={(v) => handleChange('is_public', v)} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image_url">{t('Offer Image URL', 'رابط صورة العرض')}</Label>
              <Input id="image_url" placeholder="https://example.com/image.jpg" value={formData.image_url || ''} onChange={(e) => handleChange('image_url', e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('Recommended: 800x600px', 'موصى به: 800x600 بكسل')}</p>
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {formData.image_url ? (
                <img src={formData.image_url} alt="Offer preview" className="max-h-48 mx-auto rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('No image uploaded', 'لم يتم رفع صورة')}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <Card className="border-warning/30 bg-warning/5"><CardContent className="pt-4">
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-right")}>
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('What happens next?', 'ماذا يحدث بعد ذلك؟')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('Your offer will be submitted for admin review. Once approved, it will appear in the Employee Marketplace within 24-48 hours.', 'سيتم إرسال عرضك للمراجعة. بمجرد الموافقة، سيظهر في سوق الموظفين خلال 24-48 ساعة.')}</p>
                </div>
              </div>
            </CardContent></Card>
            <div className="grid gap-4">
              <div className={cn("flex justify-between py-2 border-b", isRTL && "flex-row-reverse")}><span className="text-muted-foreground">{t('Title', 'العنوان')}</span><span className="font-medium">{formData.title || '-'}</span></div>
              <div className={cn("flex justify-between py-2 border-b", isRTL && "flex-row-reverse")}><span className="text-muted-foreground">{t('Category', 'الفئة')}</span><span className="font-medium">{CATEGORIES.find(c => c.id === formData.category)?.[language === 'ar' ? 'labelAr' : 'label'] || '-'}</span></div>
              <div className={cn("flex justify-between py-2 border-b", isRTL && "flex-row-reverse")}><span className="text-muted-foreground">{t('Discount', 'الخصم')}</span><span className="font-medium">{formData.discount_percent ? `${formData.discount_percent}%` : '-'}</span></div>
              <div className={cn("flex justify-between py-2 border-b", isRTL && "flex-row-reverse")}><span className="text-muted-foreground">{t('Validity', 'الصلاحية')}</span><span className="font-medium">{formData.valid_from && formData.valid_to ? `${formData.valid_from} - ${formData.valid_to}` : t('Not specified', 'غير محدد')}</span></div>
              <div className={cn("flex justify-between py-2", isRTL && "flex-row-reverse")}><span className="text-muted-foreground">{t('Visibility', 'الرؤية')}</span><Badge variant={formData.is_public ? "default" : "secondary"}>{formData.is_public ? t('Public', 'عام') : t('Employer-Sponsored', 'برعاية')}</Badge></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout
      title={t('Create New Offer', 'إنشاء عرض جديد')}
      description={t('Launch a new offer for employees in the marketplace', 'أطلق عرضًا جديدًا للموظفين في السوق')}
      icon={PlusCircle}
      iconClassName="text-primary"
      actions={<Button variant="ghost" onClick={() => navigate('/vendor/offers')}>{isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}{t('Back to Offers', 'العودة إلى العروض')}</Button>}
    >
      <Card className="mb-6"><CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          {WIZARD_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={step.id} className={cn("flex flex-col items-center gap-2 flex-1", index < WIZARD_STEPS.length - 1 && "relative")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", isCompleted ? "bg-success text-success-foreground" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className={cn("text-xs font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>{language === 'ar' ? step.labelAr : step.label}</span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent></Card>

      <Card>
        <CardHeader>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><CurrentStepIcon className="w-5 h-5 text-primary" /></div>
            <div className={cn(isRTL && "text-right")}>
              <CardTitle>{t(`Step ${currentStep + 1}: `, `الخطوة ${currentStep + 1}: `)}{language === 'ar' ? WIZARD_STEPS[currentStep].labelAr : WIZARD_STEPS[currentStep].label}</CardTitle>
              <CardDescription>
                {currentStep === 0 && t('Enter the basic details of your offer', 'أدخل التفاصيل الأساسية لعرضك')}
                {currentStep === 1 && t('Set when your offer is available', 'حدد متى يكون عرضك متاحًا')}
                {currentStep === 2 && t('Define terms, exclusions, and eligibility', 'حدد الشروط والاستثناءات')}
                {currentStep === 3 && t('Add images and branding assets', 'أضف الصور والأصول')}
                {currentStep === 4 && t('Review and submit your offer', 'راجع وأرسل عرضك')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      <div className={cn("flex justify-between mt-6", isRTL && "flex-row-reverse")}>
        <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
          {currentStep > 0 && <Button variant="outline" onClick={handleBack}>{isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}{t('Back', 'رجوع')}</Button>}
          <Button variant="ghost" onClick={handleSaveDraft}>{t('Save Draft', 'حفظ كمسودة')}</Button>
        </div>
        <div>
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button onClick={handleNext}>{t('Next', 'التالي')}{isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isPending}><Sparkles className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />{isPending ? t('Submitting...', 'جاري الإرسال...') : t('Submit for Review', 'إرسال للمراجعة')}</Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
