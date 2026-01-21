import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, ShoppingBag, Coffee, Activity, Users, BookOpen, Home, Car, Plane,
  Building2, Globe, Sparkles, Send, HelpCircle, CheckCircle, Tag, Star,
  MessageSquare, Heart, AlertCircle, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Category configuration
const MARKETPLACE_CATEGORIES = [
  { id: 'wellness', name: 'Wellness', nameAr: 'العافية', icon: Heart, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'food', name: 'Food & Dining', nameAr: 'الطعام والمطاعم', icon: Coffee, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'fitness', name: 'Fitness', nameAr: 'اللياقة البدنية', icon: Activity, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'learning', name: 'Learning', nameAr: 'التعلم', icon: BookOpen, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'family', name: 'Family', nameAr: 'العائلة', icon: Users, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { id: 'transport', name: 'Transport', nameAr: 'النقل', icon: Car, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { id: 'home', name: 'Home & Living', nameAr: 'المنزل والمعيشة', icon: Home, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { id: 'travel', name: 'Travel', nameAr: 'السفر', icon: Plane, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
];

// Example offers (demo mode)
const EXAMPLE_OFFERS = [
  {
    id: 'example-1',
    title: 'Premium Gym Membership',
    merchant: 'FitLife Studios',
    discount: 40,
    category: 'Fitness',
    rating: 4.8,
    sponsored: true,
  },
  {
    id: 'example-2',
    title: 'Online Language Courses',
    merchant: 'SkillBoost Academy',
    discount: 30,
    category: 'Learning',
    rating: 4.6,
    sponsored: true,
  },
  {
    id: 'example-3',
    title: 'Family Restaurant Bundle',
    merchant: 'Gourmet Kitchen',
    discount: 25,
    category: 'Food & Dining',
    rating: 4.5,
    sponsored: false,
  },
  {
    id: 'example-4',
    title: 'Wellness Spa Package',
    merchant: 'Serenity Spa',
    discount: 35,
    category: 'Wellness',
    rating: 4.9,
    sponsored: false,
  },
];

interface MarketplaceEmptyStateProps {
  className?: string;
}

export function MarketplaceEmptyState({ className }: MarketplaceEmptyStateProps) {
  const { language, direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    offerType: '',
    vendorName: '',
    description: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    if (!requestForm.offerType || !requestForm.description) {
      toast({
        title: t('Missing Information', 'معلومات ناقصة'),
        description: t('Please fill in all required fields.', 'يرجى ملء جميع الحقول المطلوبة.'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - in real implementation, this would create a request record
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: t('Request Submitted! 🎉', 'تم إرسال الطلب! 🎉'),
      description: t(
        'Your offer request has been sent to HR. We\'ll notify you when there\'s an update.',
        'تم إرسال طلب العرض إلى الموارد البشرية. سنُعلمك عند وجود تحديث.'
      ),
    });
    
    setRequestDialogOpen(false);
    setRequestForm({ offerType: '', vendorName: '', description: '', category: '' });
    setIsSubmitting(false);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-dashed bg-gradient-to-br from-background to-muted/30">
          <CardContent className="py-10 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-5"
            >
              <Gift className="w-8 h-8 text-accent" />
            </motion.div>
            
            <h2 className="text-xl font-display font-semibold mb-2">
              {t('Perks & Partners Marketplace', 'سوق الامتيازات والشراكات')}
            </h2>
            
            <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
              {t(
                'Discover exclusive discounts on wellness, learning, dining, and more — curated for your organization. Offers are currently being set up.',
                'اكتشف خصومات حصرية على العافية والتعلم والطعام والمزيد — مختارة لمؤسستك. يتم حالياً إعداد العروض.'
              )}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Send className="w-4 h-4" />
                    {t('Request an Offer', 'طلب عرض')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{t('Request a New Offer', 'طلب عرض جديد')}</DialogTitle>
                    <DialogDescription>
                      {t(
                        'Suggest an offer or vendor you\'d like to see in the marketplace. Your request will be reviewed by HR.',
                        'اقترح عرضاً أو موردًا تود رؤيته في السوق. سيتم مراجعة طلبك من قبل الموارد البشرية.'
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="offerType">{t('Request Type', 'نوع الطلب')} *</Label>
                      <Select 
                        value={requestForm.offerType} 
                        onValueChange={(v) => setRequestForm(prev => ({ ...prev, offerType: v }))}
                      >
                        <SelectTrigger id="offerType">
                          <SelectValue placeholder={t('Select type...', 'اختر النوع...')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_vendor">{t('New Vendor/Partner', 'مورد/شريك جديد')}</SelectItem>
                          <SelectItem value="specific_offer">{t('Specific Offer/Discount', 'عرض/خصم محدد')}</SelectItem>
                          <SelectItem value="category_request">{t('New Category Request', 'طلب فئة جديدة')}</SelectItem>
                          <SelectItem value="general_feedback">{t('General Feedback', 'ملاحظات عامة')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">{t('Category', 'الفئة')}</Label>
                      <Select 
                        value={requestForm.category} 
                        onValueChange={(v) => setRequestForm(prev => ({ ...prev, category: v }))}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder={t('Select category...', 'اختر الفئة...')} />
                        </SelectTrigger>
                        <SelectContent>
                          {MARKETPLACE_CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {t(cat.name, cat.nameAr)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vendorName">{t('Vendor/Brand Name', 'اسم المورد/العلامة التجارية')}</Label>
                      <Input
                        id="vendorName"
                        value={requestForm.vendorName}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, vendorName: e.target.value }))}
                        placeholder={t('e.g., Fitness First, Talabat', 'مثال: فيتنس فيرست، طلبات')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">{t('Description', 'الوصف')} *</Label>
                      <Textarea
                        id="description"
                        value={requestForm.description}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={t(
                          'Describe the offer you\'d like to see, why it would be valuable, etc.',
                          'صف العرض الذي تود رؤيته، ولماذا سيكون ذا قيمة، وما إلى ذلك.'
                        )}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                      {t('Cancel', 'إلغاء')}
                    </Button>
                    <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
                      {isSubmitting ? t('Submitting...', 'جارٍ الإرسال...') : t('Submit Request', 'إرسال الطلب')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" asChild>
                <a href="/employee/requests?type=question">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('Ask HR', 'اسأل الموارد البشرية')}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Offer Types Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              {t('How Marketplace Offers Work', 'كيف تعمل عروض السوق')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className={cn(
                'p-4 rounded-xl border-2 border-dashed bg-gradient-to-br from-accent/5 to-transparent',
                isRTL && 'text-right'
              )}>
                <div className={cn('flex items-center gap-3 mb-3', isRTL && 'flex-row-reverse')}>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <Badge className="bg-accent/10 text-accent border-accent/20 mb-1">
                      {t('Employer-Sponsored', 'برعاية صاحب العمل')}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {t('Premium discounts', 'خصومات مميزة')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'Exclusive offers subsidized by your employer. These typically include deeper discounts and are specifically negotiated for your organization.',
                    'عروض حصرية مدعومة من صاحب عملك. تتضمن عادةً خصومات أعمق وتم التفاوض عليها خصيصًا لمؤسستك.'
                  )}
                </p>
                <ul className={cn('mt-3 space-y-1 text-xs text-muted-foreground', isRTL && 'text-right')}>
                  <li className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                    {t('Up to 50% off partner services', 'خصم يصل إلى 50% على خدمات الشركاء')}
                  </li>
                  <li className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                    {t('Priority access to new offers', 'أولوية الوصول للعروض الجديدة')}
                  </li>
                  <li className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                    {t('Curated for your benefit categories', 'مختارة لفئات المزايا الخاصة بك')}
                  </li>
                </ul>
              </div>

              <div className={cn(
                'p-4 rounded-xl border bg-muted/20',
                isRTL && 'text-right'
              )}>
                <div className={cn('flex items-center gap-3 mb-3', isRTL && 'flex-row-reverse')}>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {t('Public Offers', 'العروض العامة')}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {t('Partner discounts', 'خصومات الشركاء')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'Partner discounts available to all employees on the platform. These are standard partnership rates that benefit the wider community.',
                    'خصومات الشركاء المتاحة لجميع الموظفين على المنصة. هذه أسعار شراكة قياسية تفيد المجتمع الأوسع.'
                  )}
                </p>
                <ul className={cn('mt-3 space-y-1 text-xs text-muted-foreground', isRTL && 'text-right')}>
                  <li className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <CheckCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {t('10-25% partner discounts', 'خصومات شركاء 10-25%')}
                  </li>
                  <li className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <CheckCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {t('Wide variety of categories', 'مجموعة واسعة من الفئات')}
                  </li>
                  <li className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <CheckCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {t('No employer subsidy required', 'لا يتطلب دعم صاحب العمل')}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('Browse Categories', 'تصفح الفئات')}
            </CardTitle>
            <CardDescription>
              {t('Explore offers across these categories when they become available', 'استكشف العروض في هذه الفئات عندما تتوفر')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MARKETPLACE_CATEGORIES.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={cn(
                      'p-4 rounded-xl border border-dashed hover:border-solid hover:bg-muted/30 transition-all cursor-default group',
                      isRTL && 'text-right'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                      cat.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-medium text-sm">
                      {t(cat.name, cat.nameAr)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('Coming soon', 'قريباً')}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Example Offers (Demo Mode) */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-dashed border-accent/30 bg-accent/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {t('Demo Mode', 'وضع العرض')}
                </Badge>
                <CardTitle className="text-base">
                  {t('Example Offers Preview', 'معاينة عروض المثال')}
                </CardTitle>
              </div>
              <CardDescription>
                {t(
                  'These are example offers showing what the marketplace will look like. They are not real offers.',
                  'هذه عروض مثال توضح كيف سيبدو السوق. إنها ليست عروضًا حقيقية.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {EXAMPLE_OFFERS.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="relative"
                  >
                    {/* Example badge overlay */}
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-warning/90 text-warning-foreground text-[10px] px-1.5 py-0.5 shadow-sm">
                        {t('Example', 'مثال')}
                      </Badge>
                    </div>

                    <Card className="overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                      {/* Gradient placeholder for image */}
                      <div className="h-24 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <span className="text-2xl font-bold text-muted-foreground/30">
                          {offer.merchant.charAt(0)}
                        </span>
                      </div>
                      
                      <CardContent className="p-3">
                        <div className={cn('flex items-center gap-2 mb-2', isRTL && 'flex-row-reverse')}>
                          {offer.sponsored ? (
                            <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] px-1.5">
                              <Building2 className="w-2.5 h-2.5 mr-0.5" />
                              {t('Sponsored', 'مدعوم')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              {t('Public', 'عام')}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {offer.category}
                          </Badge>
                        </div>

                        <h4 className="font-medium text-sm line-clamp-1">{offer.title}</h4>
                        <p className="text-xs text-muted-foreground">{offer.merchant}</p>

                        <div className={cn('flex items-center justify-between mt-3', isRTL && 'flex-row-reverse')}>
                          <Badge className="bg-success/10 text-success border-success/20">
                            <Tag className="w-3 h-3 mr-1" />
                            {t(`Save ${offer.discount}%`, `وفر ${offer.discount}%`)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            {offer.rating}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Eligibility Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className={cn('flex items-start gap-4', isRTL && 'flex-row-reverse text-right')}>
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">
                  {t('Eligibility & Access', 'الأهلية والوصول')}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t(
                    'Marketplace access is determined by your employer based on your role, grade, and benefit entitlements. Some offers may be restricted to specific employee groups.',
                    'يتم تحديد الوصول إلى السوق من قبل صاحب عملك بناءً على دورك ودرجتك واستحقاقات المزايا. قد تكون بعض العروض مقيدة لمجموعات موظفين محددة.'
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        {t('Grade-based', 'حسب الدرجة')}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        {t('Some offers are only available to specific employee grades', 'بعض العروض متاحة فقط لدرجات موظفين محددة')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        {t('Department-specific', 'حسب القسم')}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        {t('Certain offers may be targeted to specific departments', 'قد تكون بعض العروض موجهة لأقسام محددة')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        {t('Benefit-linked', 'مرتبط بالمزايا')}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        {t('Some offers are linked to your active benefit entitlements', 'بعض العروض مرتبطة باستحقاقات المزايا النشطة')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
