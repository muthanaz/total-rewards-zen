import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, Calendar, DollarSign, Users, Ticket, Eye, CheckCircle, 
  ArrowLeft, ArrowRight, Sparkles, Info, AlertCircle, Image as ImageIcon,
  Link, CreditCard, QrCode, FileText, MapPin, Building2, Clock, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateOffer, CreateOfferInput } from '@/hooks/useVendorData';
import { PageLayout } from '@/components/shared';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============= WIZARD CONFIGURATION =============

const WIZARD_STEPS = [
  { 
    id: 'details', 
    label: 'Offer Details', 
    labelAr: 'تفاصيل العرض', 
    icon: Tag,
    description: 'Basic information about your offer',
    descriptionAr: 'المعلومات الأساسية عن عرضك',
  },
  { 
    id: 'pricing', 
    label: 'Pricing & Discount', 
    labelAr: 'التسعير والخصم', 
    icon: DollarSign,
    description: 'Set discount amount and pricing model',
    descriptionAr: 'حدد مبلغ الخصم ونموذج التسعير',
  },
  { 
    id: 'eligibility', 
    label: 'Eligibility Rules', 
    labelAr: 'قواعد الأهلية', 
    icon: Users,
    description: 'Define who can access this offer',
    descriptionAr: 'حدد من يمكنه الوصول لهذا العرض',
  },
  { 
    id: 'redemption', 
    label: 'Redemption Method', 
    labelAr: 'طريقة الاستبدال', 
    icon: Ticket,
    description: 'How employees will redeem the offer',
    descriptionAr: 'كيف سيستبدل الموظفون العرض',
  },
  { 
    id: 'reporting', 
    label: 'Reporting & Tracking', 
    labelAr: 'التقارير والتتبع', 
    icon: FileText,
    description: 'Configure analytics and tracking',
    descriptionAr: 'إعداد التحليلات والتتبع',
  },
  { 
    id: 'preview', 
    label: 'Preview & Publish', 
    labelAr: 'معاينة ونشر', 
    icon: Eye,
    description: 'Review and submit your offer',
    descriptionAr: 'راجع وأرسل عرضك',
  },
];

const CATEGORIES = [
  { id: 'Health & Fitness', label: 'Wellness & Fitness', labelAr: 'الصحة واللياقة', icon: '🏋️' },
  { id: 'Learning & Skills', label: 'Learning & Development', labelAr: 'التعلم والتطوير', icon: '📚' },
  { id: 'Food & Coffee', label: 'Food & Dining', labelAr: 'الطعام والمطاعم', icon: '🍽️' },
  { id: 'Mobility', label: 'Transport & Mobility', labelAr: 'المواصلات', icon: '🚗' },
  { id: 'Family & Kids', label: 'Family & Lifestyle', labelAr: 'الأسرة ونمط الحياة', icon: '👨‍👩‍👧' },
  { id: 'Lifestyle & Shopping', label: 'Retail & Shopping', labelAr: 'التسوق', icon: '🛍️' },
  { id: 'Travel & Experiences', label: 'Travel & Experiences', labelAr: 'السفر والتجارب', icon: '✈️' },
  { id: 'Home & Living', label: 'Home & Living', labelAr: 'المنزل والمعيشة', icon: '🏠' },
];

const DISCOUNT_TYPES = [
  { id: 'percentage', label: 'Percentage Off', labelAr: 'نسبة خصم', example: '25% off' },
  { id: 'fixed', label: 'Fixed Amount Off', labelAr: 'مبلغ ثابت', example: 'AED 50 off' },
  { id: 'bogo', label: 'Buy One Get One', labelAr: 'اشترِ واحدة واحصل على واحدة', example: 'Buy 1 Get 1 Free' },
  { id: 'special', label: 'Special Rate', labelAr: 'سعر خاص', example: 'Special employee rate' },
];

const REDEMPTION_METHODS = [
  { 
    id: 'code', 
    label: 'Voucher Code', 
    labelAr: 'رمز القسيمة', 
    icon: QrCode,
    description: 'Employee receives a unique code to use at checkout',
    descriptionAr: 'يحصل الموظف على رمز فريد لاستخدامه عند الدفع',
  },
  { 
    id: 'deeplink', 
    label: 'Direct Link', 
    labelAr: 'رابط مباشر', 
    icon: Link,
    description: 'Employee clicks through to your website with discount applied',
    descriptionAr: 'ينقر الموظف للوصول لموقعك مع تطبيق الخصم',
  },
  { 
    id: 'payroll', 
    label: 'Payroll Deduction', 
    labelAr: 'خصم من الراتب', 
    icon: CreditCard,
    description: 'Amount is deducted from employee salary (requires employer approval)',
    descriptionAr: 'يُخصم المبلغ من راتب الموظف (يتطلب موافقة صاحب العمل)',
  },
  { 
    id: 'instore', 
    label: 'In-Store Verification', 
    labelAr: 'التحقق في المتجر', 
    icon: Building2,
    description: 'Employee shows app badge at your location',
    descriptionAr: 'يُظهر الموظف شارة التطبيق في موقعك',
  },
];

const LOCATIONS = [
  { id: 'all_uae', label: 'All UAE', labelAr: 'جميع الإمارات' },
  { id: 'dubai', label: 'Dubai', labelAr: 'دبي' },
  { id: 'abu_dhabi', label: 'Abu Dhabi', labelAr: 'أبوظبي' },
  { id: 'sharjah', label: 'Sharjah', labelAr: 'الشارقة' },
  { id: 'online', label: 'Online Only', labelAr: 'أونلاين فقط' },
];

const EMPLOYEE_GRADES = [
  { id: 'all', label: 'All Employees', labelAr: 'جميع الموظفين' },
  { id: 'G1-G3', label: 'Junior (G1-G3)', labelAr: 'مبتدئ (G1-G3)' },
  { id: 'G4-G6', label: 'Mid-Level (G4-G6)', labelAr: 'متوسط (G4-G6)' },
  { id: 'G7-G9', label: 'Senior (G7-G9)', labelAr: 'كبير (G7-G9)' },
  { id: 'executive', label: 'Executive', labelAr: 'تنفيذي' },
];

// ============= FORM STATE =============

interface OfferFormData extends CreateOfferInput {
  // Step 1: Details
  title: string;
  description: string;
  category: string;
  tags: string[];
  image_url: string;
  
  // Step 2: Pricing
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'special';
  discount_percent?: number;
  discount_amount?: number;
  original_price?: number;
  min_spend?: number;
  
  // Step 3: Eligibility
  is_public: boolean;
  target_grades: string[];
  target_departments: string[];
  target_organizations: string[];
  usage_limit?: number;
  per_user_limit?: number;
  
  // Step 4: Redemption
  redemption_method: 'code' | 'deeplink' | 'payroll' | 'instore';
  voucher_code?: string;
  deeplink_url?: string;
  locations: string[];
  
  // Step 5: Reporting
  valid_from: string;
  valid_to: string;
  enable_tracking: boolean;
  require_redemption_confirmation: boolean;
  notify_on_activation: boolean;
  
  // Step 6: Terms
  terms: string;
}

const DEFAULT_FORM_DATA: OfferFormData = {
  title: '',
  description: '',
  category: '',
  tags: [],
  image_url: '',
  discount_type: 'percentage',
  discount_percent: undefined,
  discount_amount: undefined,
  original_price: undefined,
  min_spend: undefined,
  is_public: true,
  target_grades: ['all'],
  target_departments: [],
  target_organizations: [],
  usage_limit: undefined,
  per_user_limit: 1,
  redemption_method: 'code',
  voucher_code: '',
  deeplink_url: '',
  locations: ['all_uae'],
  valid_from: '',
  valid_to: '',
  enable_tracking: true,
  require_redemption_confirmation: false,
  notify_on_activation: true,
  terms: '',
};

// ============= MAIN COMPONENT =============

export function CreateOfferWizard() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { mutate: createOffer, isPending } = useCreateOffer();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OfferFormData>(DEFAULT_FORM_DATA);
  const [tagInput, setTagInput] = useState('');

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const currentStepConfig = WIZARD_STEPS[currentStep];
  const CurrentStepIcon = currentStepConfig.icon;

  // Validation
  const stepValidation = useMemo(() => {
    const validations: Record<number, boolean> = {
      0: !!formData.title && !!formData.category,
      1: formData.discount_type === 'special' || 
         (formData.discount_type === 'percentage' && (formData.discount_percent || 0) > 0) ||
         (formData.discount_type === 'fixed' && (formData.discount_amount || 0) > 0) ||
         formData.discount_type === 'bogo',
      2: true, // Always valid (defaults are fine)
      3: !!formData.redemption_method,
      4: true, // Dates are optional
      5: true, // Review step
    };
    return validations;
  }, [formData]);

  const canProceed = stepValidation[currentStep];

  // Handlers
  const handleChange = <K extends keyof OfferFormData>(field: K, value: OfferFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1 && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tag));
  };

  const handleSaveDraft = () => {
    localStorage.setItem('vendor_offer_draft', JSON.stringify(formData));
    toast.success(t('Draft saved locally', 'تم حفظ المسودة محلياً'));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category) {
      toast.error(t('Please fill in required fields', 'يرجى ملء الحقول المطلوبة'));
      return;
    }
    
    createOffer({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      discount_percent: formData.discount_type === 'percentage' ? formData.discount_percent : undefined,
      valid_from: formData.valid_from || undefined,
      valid_to: formData.valid_to || undefined,
      is_public: formData.is_public,
      terms: formData.terms,
      image_url: formData.image_url,
      tags: formData.tags,
    }, {
      onSuccess: () => navigate('/vendor/offers'),
    });
  };

  // ============= STEP RENDERERS =============

  const renderStep1Details = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">{t('Offer Title', 'عنوان العرض')} *</Label>
        <Input
          id="title"
          placeholder={t('e.g., 30% Off Annual Gym Membership', 'مثال: خصم 30% على عضوية النادي السنوية')}
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="text-lg"
        />
        <p className="text-xs text-muted-foreground">
          {t('Be specific and highlight the value proposition', 'كن محدداً وأبرز عرض القيمة')}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{t('Category', 'الفئة')} *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={() => handleChange('category', cat.id)}
              className={cn(
                'p-3 rounded-xl border-2 cursor-pointer transition-all text-center',
                formData.category === cat.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/30'
              )}
            >
              <span className="text-2xl">{cat.icon}</span>
              <p className="text-sm font-medium mt-1">{t(cat.label, cat.labelAr)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('Description', 'الوصف')}</Label>
        <Textarea
          id="description"
          placeholder={t('Describe what employees get with this offer...', 'صف ما يحصل عليه الموظفون مع هذا العرض...')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('Tags', 'الوسوم')}</Label>
        <div className={cn('flex gap-2', isRTL && 'flex-row-reverse')}>
          <Input
            placeholder={t('Add a tag...', 'أضف وسماً...')}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            {t('Add', 'إضافة')}
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">{t('Offer Image URL', 'رابط صورة العرض')}</Label>
        <Input
          id="image_url"
          placeholder="https://example.com/image.jpg"
          value={formData.image_url}
          onChange={(e) => handleChange('image_url', e.target.value)}
        />
        {formData.image_url && (
          <div className="mt-2 p-2 border rounded-lg">
            <img 
              src={formData.image_url} 
              alt="Preview" 
              className="max-h-32 rounded object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2Pricing = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>{t('Discount Type', 'نوع الخصم')}</Label>
        <RadioGroup 
          value={formData.discount_type} 
          onValueChange={(v: any) => handleChange('discount_type', v)}
          className="grid grid-cols-2 gap-3"
        >
          {DISCOUNT_TYPES.map(type => (
            <div key={type.id} className="relative">
              <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
              <Label
                htmlFor={type.id}
                className={cn(
                  'flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all',
                  'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5',
                  'hover:border-primary/30'
                )}
              >
                <span className="font-medium">{t(type.label, type.labelAr)}</span>
                <span className="text-xs text-muted-foreground mt-1">{type.example}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {formData.discount_type === 'percentage' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discount_percent">{t('Discount Percentage', 'نسبة الخصم')} *</Label>
            <div className="relative">
              <Input
                id="discount_percent"
                type="number"
                min={1}
                max={100}
                placeholder="25"
                value={formData.discount_percent || ''}
                onChange={(e) => handleChange('discount_percent', parseInt(e.target.value) || undefined)}
              />
              <span className={cn('absolute top-2.5 text-muted-foreground', isRTL ? 'left-3' : 'right-3')}>%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="original_price">{t('Original Price (Optional)', 'السعر الأصلي (اختياري)')}</Label>
            <div className="relative">
              <Input
                id="original_price"
                type="number"
                placeholder="500"
                value={formData.original_price || ''}
                onChange={(e) => handleChange('original_price', parseInt(e.target.value) || undefined)}
              />
              <span className={cn('absolute top-2.5 text-muted-foreground', isRTL ? 'left-3' : 'right-3')}>AED</span>
            </div>
          </div>
        </div>
      )}

      {formData.discount_type === 'fixed' && (
        <div className="space-y-2">
          <Label htmlFor="discount_amount">{t('Discount Amount', 'مبلغ الخصم')} *</Label>
          <div className="relative">
            <Input
              id="discount_amount"
              type="number"
              min={1}
              placeholder="50"
              value={formData.discount_amount || ''}
              onChange={(e) => handleChange('discount_amount', parseInt(e.target.value) || undefined)}
            />
            <span className={cn('absolute top-2.5 text-muted-foreground', isRTL ? 'left-3' : 'right-3')}>AED</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="min_spend">{t('Minimum Spend (Optional)', 'الحد الأدنى للإنفاق (اختياري)')}</Label>
        <div className="relative">
          <Input
            id="min_spend"
            type="number"
            placeholder={t('No minimum', 'بدون حد أدنى')}
            value={formData.min_spend || ''}
            onChange={(e) => handleChange('min_spend', parseInt(e.target.value) || undefined)}
          />
          <span className={cn('absolute top-2.5 text-muted-foreground', isRTL ? 'left-3' : 'right-3')}>AED</span>
        </div>
      </div>

      {/* Pricing Preview */}
      {(formData.discount_percent || formData.discount_amount) && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-4">
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-success">
                  {formData.discount_type === 'percentage' && `${formData.discount_percent}% off`}
                  {formData.discount_type === 'fixed' && `AED ${formData.discount_amount} off`}
                  {formData.discount_type === 'bogo' && 'Buy One Get One Free'}
                </p>
                {formData.original_price && formData.discount_percent && (
                  <p className="text-sm text-muted-foreground">
                    AED {formData.original_price} → AED {Math.round(formData.original_price * (1 - formData.discount_percent / 100))}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep3Eligibility = () => (
    <div className="space-y-6">
      <div className={cn('flex items-center justify-between p-4 border rounded-xl', isRTL && 'flex-row-reverse')}>
        <div className={cn(isRTL && 'text-right')}>
          <Label className="text-base">{t('Public Offer', 'عرض عام')}</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {t('Available to all employees on the platform', 'متاح لجميع الموظفين على المنصة')}
          </p>
        </div>
        <Switch
          checked={formData.is_public}
          onCheckedChange={(v) => handleChange('is_public', v)}
        />
      </div>

      {!formData.is_public && (
        <>
          <div className="space-y-3">
            <Label>{t('Target Employee Grades', 'درجات الموظفين المستهدفة')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EMPLOYEE_GRADES.map(grade => (
                <div key={grade.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`grade-${grade.id}`}
                    checked={formData.target_grades.includes(grade.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleChange('target_grades', [...formData.target_grades, grade.id]);
                      } else {
                        handleChange('target_grades', formData.target_grades.filter(g => g !== grade.id));
                      }
                    }}
                  />
                  <label htmlFor={`grade-${grade.id}`} className="text-sm">
                    {t(grade.label, grade.labelAr)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-info/30 bg-info/5">
            <CardContent className="pt-4">
              <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse text-right')}>
                <Info className="w-5 h-5 text-info mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('Employer-Sponsored Offer', 'عرض برعاية صاحب العمل')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      'This offer will be marked as sponsored and may require employer approval before going live.',
                      'سيتم تمييز هذا العرض على أنه مدعوم وقد يتطلب موافقة صاحب العمل قبل النشر.'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usage_limit">{t('Total Usage Limit', 'حد الاستخدام الإجمالي')}</Label>
          <Input
            id="usage_limit"
            type="number"
            placeholder={t('Unlimited', 'غير محدود')}
            value={formData.usage_limit || ''}
            onChange={(e) => handleChange('usage_limit', parseInt(e.target.value) || undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="per_user_limit">{t('Per User Limit', 'الحد لكل مستخدم')}</Label>
          <Input
            id="per_user_limit"
            type="number"
            min={1}
            placeholder="1"
            value={formData.per_user_limit || ''}
            onChange={(e) => handleChange('per_user_limit', parseInt(e.target.value) || undefined)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4Redemption = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>{t('Redemption Method', 'طريقة الاستبدال')}</Label>
        <RadioGroup
          value={formData.redemption_method}
          onValueChange={(v: any) => handleChange('redemption_method', v)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {REDEMPTION_METHODS.map(method => {
            const Icon = method.icon;
            return (
              <div key={method.id} className="relative">
                <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                <Label
                  htmlFor={method.id}
                  className={cn(
                    'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                    'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5',
                    'hover:border-primary/30',
                    isRTL && 'flex-row-reverse text-right'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-medium">{t(method.label, method.labelAr)}</span>
                    <p className="text-xs text-muted-foreground mt-1">{t(method.description, method.descriptionAr)}</p>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {formData.redemption_method === 'code' && (
        <div className="space-y-2">
          <Label htmlFor="voucher_code">{t('Default Voucher Code (Optional)', 'رمز القسيمة الافتراضي (اختياري)')}</Label>
          <Input
            id="voucher_code"
            placeholder={t('Leave blank for auto-generated codes', 'اتركه فارغاً لرموز تُنشأ تلقائياً')}
            value={formData.voucher_code}
            onChange={(e) => handleChange('voucher_code', e.target.value)}
          />
        </div>
      )}

      {formData.redemption_method === 'deeplink' && (
        <div className="space-y-2">
          <Label htmlFor="deeplink_url">{t('Redemption URL', 'رابط الاستبدال')} *</Label>
          <Input
            id="deeplink_url"
            type="url"
            placeholder="https://yoursite.com/employee-discount?code={CODE}"
            value={formData.deeplink_url}
            onChange={(e) => handleChange('deeplink_url', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t('Use {CODE} as placeholder for the unique code', 'استخدم {CODE} كعنصر نائب للرمز الفريد')}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Label>{t('Available Locations', 'المواقع المتاحة')}</Label>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map(loc => (
            <Badge
              key={loc.id}
              variant={formData.locations.includes(loc.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                if (formData.locations.includes(loc.id)) {
                  handleChange('locations', formData.locations.filter(l => l !== loc.id));
                } else {
                  handleChange('locations', [...formData.locations, loc.id]);
                }
              }}
            >
              <MapPin className="w-3 h-3 mr-1" />
              {t(loc.label, loc.labelAr)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5Reporting = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valid_from">{t('Start Date', 'تاريخ البدء')}</Label>
          <Input
            id="valid_from"
            type="date"
            value={formData.valid_from}
            onChange={(e) => handleChange('valid_from', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valid_to">{t('End Date', 'تاريخ الانتهاء')}</Label>
          <Input
            id="valid_to"
            type="date"
            value={formData.valid_to}
            onChange={(e) => handleChange('valid_to', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">{t('Tracking & Notifications', 'التتبع والإشعارات')}</h4>
        
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div className={cn(isRTL && 'text-right')}>
            <Label>{t('Enable Analytics Tracking', 'تفعيل تتبع التحليلات')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('Track activations, redemptions, and conversions', 'تتبع التفعيلات والاستردادات والتحويلات')}
            </p>
          </div>
          <Switch
            checked={formData.enable_tracking}
            onCheckedChange={(v) => handleChange('enable_tracking', v)}
          />
        </div>

        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div className={cn(isRTL && 'text-right')}>
            <Label>{t('Require Redemption Confirmation', 'طلب تأكيد الاسترداد')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('Employee must confirm they used the offer', 'يجب على الموظف تأكيد استخدام العرض')}
            </p>
          </div>
          <Switch
            checked={formData.require_redemption_confirmation}
            onCheckedChange={(v) => handleChange('require_redemption_confirmation', v)}
          />
        </div>

        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div className={cn(isRTL && 'text-right')}>
            <Label>{t('Notify on Activation', 'إشعار عند التفعيل')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('Get notified when employees activate this offer', 'احصل على إشعار عند تفعيل الموظفين لهذا العرض')}
            </p>
          </div>
          <Switch
            checked={formData.notify_on_activation}
            onCheckedChange={(v) => handleChange('notify_on_activation', v)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep6Preview = () => (
    <div className="space-y-6">
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="pt-4">
          <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse text-right')}>
            <AlertCircle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">{t('What happens next?', 'ماذا يحدث بعد ذلك؟')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  'Your offer will be submitted for admin review. Once approved, it will appear in the Employee Marketplace within 24-48 hours.',
                  'سيتم إرسال عرضك للمراجعة. بمجرد الموافقة، سيظهر في سوق الموظفين خلال 24-48 ساعة.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offer Preview Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('Offer Preview', 'معاينة العرض')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {formData.image_url ? (
              <img src={formData.image_url} alt="" className="w-24 h-24 rounded-lg object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{formData.title || t('Untitled Offer', 'عرض بدون عنوان')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{formData.description || t('No description', 'بدون وصف')}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.discount_percent && (
                  <Badge className="bg-success/10 text-success border-success/30">
                    {formData.discount_percent}% {t('off', 'خصم')}
                  </Badge>
                )}
                <Badge variant="secondary">{formData.category || t('No category', 'بدون فئة')}</Badge>
                {formData.is_public ? (
                  <Badge variant="outline">{t('Public', 'عام')}</Badge>
                ) : (
                  <Badge className="bg-accent/10 text-accent border-accent/30">{t('Sponsored', 'مدعوم')}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-3">
        <div className={cn('flex justify-between py-2 border-b', isRTL && 'flex-row-reverse')}>
          <span className="text-muted-foreground">{t('Category', 'الفئة')}</span>
          <span className="font-medium">{CATEGORIES.find(c => c.id === formData.category)?.[language === 'ar' ? 'labelAr' : 'label'] || '-'}</span>
        </div>
        <div className={cn('flex justify-between py-2 border-b', isRTL && 'flex-row-reverse')}>
          <span className="text-muted-foreground">{t('Discount', 'الخصم')}</span>
          <span className="font-medium">
            {formData.discount_type === 'percentage' && formData.discount_percent ? `${formData.discount_percent}%` : ''}
            {formData.discount_type === 'fixed' && formData.discount_amount ? `AED ${formData.discount_amount}` : ''}
            {formData.discount_type === 'bogo' ? 'BOGO' : ''}
            {formData.discount_type === 'special' ? t('Special Rate', 'سعر خاص') : ''}
          </span>
        </div>
        <div className={cn('flex justify-between py-2 border-b', isRTL && 'flex-row-reverse')}>
          <span className="text-muted-foreground">{t('Redemption', 'الاستبدال')}</span>
          <span className="font-medium">{REDEMPTION_METHODS.find(m => m.id === formData.redemption_method)?.[language === 'ar' ? 'labelAr' : 'label'] || '-'}</span>
        </div>
        <div className={cn('flex justify-between py-2 border-b', isRTL && 'flex-row-reverse')}>
          <span className="text-muted-foreground">{t('Validity', 'الصلاحية')}</span>
          <span className="font-medium">
            {formData.valid_from && formData.valid_to 
              ? `${formData.valid_from} - ${formData.valid_to}` 
              : t('Not specified', 'غير محدد')}
          </span>
        </div>
        <div className={cn('flex justify-between py-2', isRTL && 'flex-row-reverse')}>
          <span className="text-muted-foreground">{t('Visibility', 'الرؤية')}</span>
          <Badge variant={formData.is_public ? "default" : "secondary"}>
            {formData.is_public ? t('Public', 'عام') : t('Employer-Sponsored', 'برعاية')}
          </Badge>
        </div>
      </div>

      {/* Terms */}
      <div className="space-y-2">
        <Label htmlFor="terms">{t('Terms & Conditions', 'الشروط والأحكام')}</Label>
        <Textarea
          id="terms"
          placeholder={t('Enter any exclusions, restrictions, or fine print...', 'أدخل أي استثناءات أو قيود أو نصوص دقيقة...')}
          value={formData.terms}
          onChange={(e) => handleChange('terms', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderStep1Details();
      case 1: return renderStep2Pricing();
      case 2: return renderStep3Eligibility();
      case 3: return renderStep4Redemption();
      case 4: return renderStep5Reporting();
      case 5: return renderStep6Preview();
      default: return null;
    }
  };

  // ============= MAIN RENDER =============

  return (
    <PageLayout
      title={t('Create New Offer', 'إنشاء عرض جديد')}
      description={t('Launch a new offer for employees in the marketplace', 'أطلق عرضًا جديدًا للموظفين في السوق')}
      icon={Tag}
      iconClassName="text-primary"
      actions={
        <Button variant="ghost" onClick={() => navigate('/vendor/offers')}>
          {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {t('Back to Offers', 'العودة إلى العروض')}
        </Button>
      }
    >
      {/* Progress Stepper */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
            {WIZARD_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex flex-col items-center gap-2 flex-1 min-w-[80px]',
                    index < WIZARD_STEPS.length - 1 && 'relative'
                  )}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isCompleted ? 'hsl(var(--success))' : isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                    }}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      isCompleted ? 'text-success-foreground' : isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </motion.div>
                  <span className={cn(
                    'text-xs font-medium text-center',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {t(step.label, step.labelAr)}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentStepIcon className="w-5 h-5 text-primary" />
            </div>
            <div className={cn(isRTL && 'text-right')}>
              <CardTitle>
                {t(`Step ${currentStep + 1}: `, `الخطوة ${currentStep + 1}: `)}
                {t(currentStepConfig.label, currentStepConfig.labelAr)}
              </CardTitle>
              <CardDescription>
                {t(currentStepConfig.description, currentStepConfig.descriptionAr)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className={cn('flex justify-between mt-6', isRTL && 'flex-row-reverse')}>
        <div className={cn('flex gap-2', isRTL && 'flex-row-reverse')}>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
              {t('Back', 'رجوع')}
            </Button>
          )}
          <Button variant="ghost" onClick={handleSaveDraft}>
            {t('Save Draft', 'حفظ كمسودة')}
          </Button>
        </div>
        <div>
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed}>
              {t('Next', 'التالي')}
              {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isPending}>
              <Sparkles className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isPending ? t('Submitting...', 'جاري الإرسال...') : t('Submit for Review', 'إرسال للمراجعة')}
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default CreateOfferWizard;
