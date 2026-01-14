import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Users,
  Heart,
  Gift,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Home,
  GraduationCap,
  Car,
  PiggyBank,
  Dumbbell,
  Upload,
  Check,
  Landmark,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const pageTranslations = {
  en: {
    title: 'Welcome to Your Benefits Portal',
    subtitle: 'Let\'s set up your profile and benefits in a few easy steps',
    step: 'Step',
    of: 'of',
    next: 'Continue',
    back: 'Back',
    skip: 'Skip for now',
    finish: 'Complete Setup',
    
    // Step 1 - Welcome
    step1Title: 'Welcome Aboard!',
    step1Desc: 'We\'re excited to have you join the team. This wizard will help you set up your profile and choose your benefits.',
    getStarted: 'Let\'s Get Started',
    whatYouWillDo: 'What you\'ll do:',
    task1: 'Complete your personal profile',
    task2: 'Add family members & dependents',
    task3: 'Select your benefits package',
    task4: 'Upload required documents',
    task5: 'Review and confirm',
    estimatedTime: 'Estimated time: 10-15 minutes',
    
    // Step 2 - Personal Info
    step2Title: 'Personal Information',
    step2Desc: 'Help us know you better by completing your profile',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    nationality: 'Nationality',
    emiratesId: 'Emirates ID',
    dateOfBirth: 'Date of Birth',
    bloodType: 'Blood Type',
    homeLocation: 'Home Location/Area',
    
    // Step 3 - Family
    step3Title: 'Family & Dependents',
    step3Desc: 'Add your family members to enroll them in applicable benefits',
    maritalStatus: 'Marital Status',
    single: 'Single',
    married: 'Married',
    spouseName: 'Spouse Name',
    spouseEmployer: 'Spouse Employer (if applicable)',
    children: 'Children',
    addChild: 'Add Child',
    childName: 'Child Name',
    childDob: 'Date of Birth',
    childSchool: 'School Name',
    emergencyContact: 'Emergency Contact',
    emergencyName: 'Contact Name',
    emergencyPhone: 'Contact Phone',
    noChildren: 'No children added yet',
    
    // Step 4 - Benefits
    step4Title: 'Select Your Benefits',
    step4Desc: 'Choose the benefits that matter most to you and your family',
    benefitsIntro: 'Based on your grade and employment terms, you\'re eligible for the following benefits:',
    selectBenefits: 'Select the benefits you want to activate:',
    housingAllowance: 'Housing Allowance',
    housingDesc: 'Monthly housing support up to AED 12,000',
    educationAllowance: 'Education Allowance',
    educationDesc: 'School fee coverage for up to 3 children',
    healthInsurance: 'Health Insurance',
    healthDesc: 'Premium medical coverage for you and family',
    transportAllowance: 'Transport Allowance',
    transportDesc: 'Monthly transport support of AED 2,500',
    wellbeingProgram: 'Wellbeing Program',
    wellbeingDesc: 'Gym membership and wellness activities',
    financialPlanning: 'Financial Planning',
    financialDesc: 'Access to financial advisors and tools',
    gratuityBenefit: 'End of Service Gratuity',
    gratuityDesc: 'Statutory payment under UAE Labor Law',
    annualValue: 'Annual Value',
    included: 'Included',
    optional: 'Optional',
    
    // Step 5 - Documents
    step5Title: 'Upload Documents',
    step5Desc: 'Upload the required documents to complete your enrollment',
    requiredDocs: 'Required Documents',
    optionalDocs: 'Optional Documents',
    passportCopy: 'Passport Copy',
    emiratesIdCopy: 'Emirates ID Copy',
    visaCopy: 'Visa Copy',
    marriageCert: 'Marriage Certificate',
    birthCerts: 'Children Birth Certificates',
    uploadBtn: 'Upload',
    uploaded: 'Uploaded',
    pending: 'Pending',
    
    // Step 6 - Review
    step6Title: 'Review & Confirm',
    step6Desc: 'Review your information before completing the setup',
    personalInfo: 'Personal Information',
    familyInfo: 'Family Information',
    selectedBenefits: 'Selected Benefits',
    documents: 'Documents',
    edit: 'Edit',
    totalAnnualBenefits: 'Total Annual Benefits Value',
    confirmSetup: 'I confirm that all information provided is accurate',
    
    // Completion
    completeTitle: 'Setup Complete!',
    completeDesc: 'Your profile and benefits have been configured successfully',
    goToDashboard: 'Go to Dashboard',
    exploreBenefits: 'Explore My Benefits',
  },
  ar: {
    title: 'مرحباً بك في بوابة المزايا',
    subtitle: 'لنقم بإعداد ملفك الشخصي ومزاياك في خطوات بسيطة',
    step: 'الخطوة',
    of: 'من',
    next: 'متابعة',
    back: 'رجوع',
    skip: 'تخطي الآن',
    finish: 'إكمال الإعداد',
    
    // Step 1 - Welcome
    step1Title: 'أهلاً وسهلاً!',
    step1Desc: 'يسعدنا انضمامك إلى الفريق. سيساعدك هذا المعالج في إعداد ملفك الشخصي واختيار مزاياك.',
    getStarted: 'لنبدأ',
    whatYouWillDo: 'ما ستفعله:',
    task1: 'إكمال ملفك الشخصي',
    task2: 'إضافة أفراد العائلة والمعالين',
    task3: 'اختيار حزمة المزايا',
    task4: 'رفع المستندات المطلوبة',
    task5: 'المراجعة والتأكيد',
    estimatedTime: 'الوقت المقدر: ١٠-١٥ دقيقة',
    
    // Step 2 - Personal Info
    step2Title: 'المعلومات الشخصية',
    step2Desc: 'ساعدنا في معرفتك بشكل أفضل من خلال إكمال ملفك الشخصي',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    phone: 'رقم الهاتف',
    nationality: 'الجنسية',
    emiratesId: 'الهوية الإماراتية',
    dateOfBirth: 'تاريخ الميلاد',
    bloodType: 'فصيلة الدم',
    homeLocation: 'موقع السكن/المنطقة',
    
    // Step 3 - Family
    step3Title: 'العائلة والمعالون',
    step3Desc: 'أضف أفراد عائلتك لتسجيلهم في المزايا المتاحة',
    maritalStatus: 'الحالة الاجتماعية',
    single: 'أعزب',
    married: 'متزوج',
    spouseName: 'اسم الزوج/الزوجة',
    spouseEmployer: 'جهة عمل الزوج/الزوجة (إن وجدت)',
    children: 'الأطفال',
    addChild: 'إضافة طفل',
    childName: 'اسم الطفل',
    childDob: 'تاريخ الميلاد',
    childSchool: 'اسم المدرسة',
    emergencyContact: 'جهة اتصال الطوارئ',
    emergencyName: 'اسم جهة الاتصال',
    emergencyPhone: 'رقم الهاتف',
    noChildren: 'لم يتم إضافة أطفال بعد',
    
    // Step 4 - Benefits
    step4Title: 'اختر مزاياك',
    step4Desc: 'اختر المزايا الأكثر أهمية لك ولعائلتك',
    benefitsIntro: 'بناءً على درجتك وشروط التوظيف، أنت مؤهل للمزايا التالية:',
    selectBenefits: 'اختر المزايا التي تريد تفعيلها:',
    housingAllowance: 'بدل السكن',
    housingDesc: 'دعم سكني شهري حتى ١٢,٠٠٠ درهم',
    educationAllowance: 'بدل التعليم',
    educationDesc: 'تغطية الرسوم المدرسية لما يصل إلى ٣ أطفال',
    healthInsurance: 'التأمين الصحي',
    healthDesc: 'تغطية طبية ممتازة لك ولعائلتك',
    transportAllowance: 'بدل النقل',
    transportDesc: 'دعم نقل شهري بقيمة ٢,٥٠٠ درهم',
    wellbeingProgram: 'برنامج الرفاهية',
    wellbeingDesc: 'عضوية صالة رياضية وأنشطة صحية',
    financialPlanning: 'التخطيط المالي',
    financialDesc: 'الوصول إلى مستشارين ماليين وأدوات',
    gratuityBenefit: 'مكافأة نهاية الخدمة',
    gratuityDesc: 'دفعة قانونية بموجب قانون العمل الإماراتي',
    annualValue: 'القيمة السنوية',
    included: 'مشمول',
    optional: 'اختياري',
    
    // Step 5 - Documents
    step5Title: 'رفع المستندات',
    step5Desc: 'ارفع المستندات المطلوبة لإكمال تسجيلك',
    requiredDocs: 'المستندات المطلوبة',
    optionalDocs: 'المستندات الاختيارية',
    passportCopy: 'نسخة جواز السفر',
    emiratesIdCopy: 'نسخة الهوية الإماراتية',
    visaCopy: 'نسخة التأشيرة',
    marriageCert: 'شهادة الزواج',
    birthCerts: 'شهادات ميلاد الأطفال',
    uploadBtn: 'رفع',
    uploaded: 'تم الرفع',
    pending: 'معلق',
    
    // Step 6 - Review
    step6Title: 'المراجعة والتأكيد',
    step6Desc: 'راجع معلوماتك قبل إكمال الإعداد',
    personalInfo: 'المعلومات الشخصية',
    familyInfo: 'معلومات العائلة',
    selectedBenefits: 'المزايا المختارة',
    documents: 'المستندات',
    edit: 'تعديل',
    totalAnnualBenefits: 'إجمالي قيمة المزايا السنوية',
    confirmSetup: 'أؤكد أن جميع المعلومات المقدمة صحيحة',
    
    // Completion
    completeTitle: 'تم الإعداد!',
    completeDesc: 'تم تكوين ملفك الشخصي ومزاياك بنجاح',
    goToDashboard: 'الذهاب للوحة التحكم',
    exploreBenefits: 'استكشاف مزاياي',
  }
};

const steps = [
  { id: 1, icon: Sparkles, labelKey: 'step1Title' },
  { id: 2, icon: User, labelKey: 'step2Title' },
  { id: 3, icon: Users, labelKey: 'step3Title' },
  { id: 4, icon: Gift, labelKey: 'step4Title' },
  { id: 5, icon: FileText, labelKey: 'step5Title' },
  { id: 6, icon: CheckCircle2, labelKey: 'step6Title' },
];

const benefits = [
  { id: 'housing', icon: Home, nameKey: 'housingAllowance', descKey: 'housingDesc', value: 144000, included: true },
  { id: 'education', icon: GraduationCap, nameKey: 'educationAllowance', descKey: 'educationDesc', value: 80000, included: true },
  { id: 'health', icon: Heart, nameKey: 'healthInsurance', descKey: 'healthDesc', value: 45000, included: true },
  { id: 'transport', icon: Car, nameKey: 'transportAllowance', descKey: 'transportDesc', value: 30000, included: true },
  { id: 'wellbeing', icon: Dumbbell, nameKey: 'wellbeingProgram', descKey: 'wellbeingDesc', value: 8000, included: false },
  { id: 'financial', icon: PiggyBank, nameKey: 'financialPlanning', descKey: 'financialDesc', value: 0, included: false },
  { id: 'gratuity', icon: Landmark, nameKey: 'gratuityBenefit', descKey: 'gratuityDesc', value: 0, included: true },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (key: keyof typeof pageTranslations.en) => pageTranslations[language][key];
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '', lastName: '', phone: '', nationality: '', emiratesId: '', dob: '', bloodType: '', homeLocation: ''
  });
  
  const [familyInfo, setFamilyInfo] = useState({
    maritalStatus: 'single', spouseName: '', spouseEmployer: '', children: [] as { name: string; dob: string; school: string }[],
    emergencyName: '', emergencyPhone: ''
  });
  
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(['housing', 'education', 'health', 'transport']);
  
  const [documents, setDocuments] = useState({
    passport: false, emiratesId: false, visa: false, marriage: false, birthCerts: false
  });

  const progress = (currentStep / steps.length) * 100;
  
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (confirmed) {
      setCompleted(true);
      toast.success(language === 'ar' ? 'تم إكمال الإعداد بنجاح!' : 'Setup completed successfully!');
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const toggleBenefit = (id: string) => {
    const benefit = benefits.find(b => b.id === id);
    if (benefit?.included) return; // Can't toggle included benefits
    
    setSelectedBenefits(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };
  
  const addChild = () => {
    setFamilyInfo(prev => ({
      ...prev,
      children: [...prev.children, { name: '', dob: '', school: '' }]
    }));
  };
  
  const updateChild = (index: number, field: string, value: string) => {
    setFamilyInfo(prev => ({
      ...prev,
      children: prev.children.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };
  
  const totalBenefitsValue = benefits
    .filter(b => selectedBenefits.includes(b.id))
    .reduce((sum, b) => sum + b.value, 0);

  if (completed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
        <Card className="max-w-lg w-full text-center p-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('completeTitle')}</h1>
          <p className="text-muted-foreground mb-8">{t('completeDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/employee')} size="lg">
              {t('goToDashboard')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/employee/benefits')} size="lg">
              {t('exploreBenefits')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("text-center mb-8", isRTL && "text-right")}>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className={cn("flex justify-between items-center mb-2", isRTL && "flex-row-reverse")}>
          <span className="text-sm font-medium">{t('step')} {currentStep} {t('of')} {steps.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className={cn("flex justify-between mt-4", isRTL && "flex-row-reverse")}>
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={cn(
                "flex flex-col items-center gap-1",
                step.id === currentStep && "text-primary",
                step.id < currentStep && "text-emerald-600 dark:text-emerald-400",
                step.id > currentStep && "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                step.id === currentStep && "border-primary bg-primary/10",
                step.id < currentStep && "border-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
                step.id > currentStep && "border-muted-foreground/30"
              )}>
                {step.id < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs font-medium hidden sm:block">{t(step.labelKey as keyof typeof pageTranslations.en)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('step1Title')}</h2>
                <p className="text-muted-foreground">{t('step1Desc')}</p>
              </div>
              
              <div className={cn("bg-muted/50 rounded-xl p-6 mb-6", isRTL && "text-right")}>
                <h3 className="font-semibold mb-4">{t('whatYouWillDo')}</h3>
                <ul className="space-y-3">
                  {[t('task1'), t('task2'), t('task3'), t('task4'), t('task5')].map((task, i) => (
                    <li key={i} className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">{t('estimatedTime')}</p>
            </Card>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <User className="w-5 h-5" />
                  {t('step2Title')}
                </CardTitle>
                <CardDescription>{t('step2Desc')}</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('firstName')}</Label>
                  <Input 
                    value={personalInfo.firstName} 
                    onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('lastName')}</Label>
                  <Input 
                    value={personalInfo.lastName} 
                    onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                    placeholder="Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('phone')}</Label>
                  <Input 
                    value={personalInfo.phone} 
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    placeholder="+971 50 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('nationality')}</Label>
                  <Input 
                    value={personalInfo.nationality} 
                    onChange={(e) => setPersonalInfo({...personalInfo, nationality: e.target.value})}
                    placeholder="United Kingdom"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('emiratesId')}</Label>
                  <Input 
                    value={personalInfo.emiratesId} 
                    onChange={(e) => setPersonalInfo({...personalInfo, emiratesId: e.target.value})}
                    placeholder="784-1990-1234567-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('dateOfBirth')}</Label>
                  <Input 
                    type="date"
                    value={personalInfo.dob} 
                    onChange={(e) => setPersonalInfo({...personalInfo, dob: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('bloodType')}</Label>
                  <Select value={personalInfo.bloodType} onValueChange={(v) => setPersonalInfo({...personalInfo, bloodType: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('homeLocation')}</Label>
                  <Input 
                    value={personalInfo.homeLocation} 
                    onChange={(e) => setPersonalInfo({...personalInfo, homeLocation: e.target.value})}
                    placeholder="Dubai Marina"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Family */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Users className="w-5 h-5" />
                  {t('step3Title')}
                </CardTitle>
                <CardDescription>{t('step3Desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('maritalStatus')}</Label>
                    <Select value={familyInfo.maritalStatus} onValueChange={(v) => setFamilyInfo({...familyInfo, maritalStatus: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">{t('single')}</SelectItem>
                        <SelectItem value="married">{t('married')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {familyInfo.maritalStatus === 'married' && (
                    <>
                      <div className="space-y-2">
                        <Label>{t('spouseName')}</Label>
                        <Input 
                          value={familyInfo.spouseName} 
                          onChange={(e) => setFamilyInfo({...familyInfo, spouseName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('spouseEmployer')}</Label>
                        <Input 
                          value={familyInfo.spouseEmployer} 
                          onChange={(e) => setFamilyInfo({...familyInfo, spouseEmployer: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Children */}
                <div className="border-t pt-4">
                  <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
                    <Label className="text-base font-semibold">{t('children')}</Label>
                    <Button size="sm" variant="outline" onClick={addChild}>
                      {t('addChild')}
                    </Button>
                  </div>
                  
                  {familyInfo.children.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('noChildren')}</p>
                  ) : (
                    <div className="space-y-4">
                      {familyInfo.children.map((child, index) => (
                        <div key={index} className="grid md:grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
                          <Input 
                            placeholder={t('childName')} 
                            value={child.name}
                            onChange={(e) => updateChild(index, 'name', e.target.value)}
                          />
                          <Input 
                            type="date"
                            placeholder={t('childDob')}
                            value={child.dob}
                            onChange={(e) => updateChild(index, 'dob', e.target.value)}
                          />
                          <Input 
                            placeholder={t('childSchool')}
                            value={child.school}
                            onChange={(e) => updateChild(index, 'school', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold mb-4 block">{t('emergencyContact')}</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('emergencyName')}</Label>
                      <Input 
                        value={familyInfo.emergencyName} 
                        onChange={(e) => setFamilyInfo({...familyInfo, emergencyName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('emergencyPhone')}</Label>
                      <Input 
                        value={familyInfo.emergencyPhone} 
                        onChange={(e) => setFamilyInfo({...familyInfo, emergencyPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Benefits */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Gift className="w-5 h-5" />
                  {t('step4Title')}
                </CardTitle>
                <CardDescription>{t('step4Desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t('benefitsIntro')}</p>
                
                <div className="space-y-3">
                  {benefits.map((benefit) => (
                    <div 
                      key={benefit.id}
                      onClick={() => toggleBenefit(benefit.id)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all",
                        selectedBenefits.includes(benefit.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-muted-foreground/50",
                        benefit.included && "cursor-default",
                        isRTL && "text-right"
                      )}
                    >
                      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <Checkbox 
                            checked={selectedBenefits.includes(benefit.id)}
                            disabled={benefit.included}
                          />
                          <div className="p-2 rounded-lg bg-muted">
                            <benefit.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{t(benefit.nameKey as keyof typeof pageTranslations.en)}</h4>
                            <p className="text-sm text-muted-foreground">{t(benefit.descKey as keyof typeof pageTranslations.en)}</p>
                          </div>
                        </div>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <Badge variant={benefit.included ? "default" : "secondary"}>
                            {benefit.included ? t('included') : t('optional')}
                          </Badge>
                          {benefit.value > 0 && (
                            <span className="text-sm font-medium">
                              AED {benefit.value.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className={cn("mt-6 p-4 bg-primary/5 rounded-xl flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <span className="font-semibold">{t('totalAnnualBenefits')}</span>
                  <span className="text-xl font-bold text-primary">AED {totalBenefitsValue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Documents */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <FileText className="w-5 h-5" />
                  {t('step5Title')}
                </CardTitle>
                <CardDescription>{t('step5Desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">{t('requiredDocs')}</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'passport', label: t('passportCopy') },
                      { key: 'emiratesId', label: t('emiratesIdCopy') },
                      { key: 'visa', label: t('visaCopy') },
                    ].map((doc) => (
                      <div 
                        key={doc.key}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>{doc.label}</span>
                        </div>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          {documents[doc.key as keyof typeof documents] ? (
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <Check className="w-3 h-3 mr-1" />{t('uploaded')}
                            </Badge>
                          ) : (
                            <>
                              <Badge variant="secondary">{t('pending')}</Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setDocuments({...documents, [doc.key]: true})}
                              >
                                <Upload className="w-3 h-3 mr-1" />{t('uploadBtn')}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {familyInfo.maritalStatus === 'married' && (
                  <div>
                    <h4 className="font-semibold mb-3">{t('optionalDocs')}</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'marriage', label: t('marriageCert') },
                        { key: 'birthCerts', label: t('birthCerts') },
                      ].map((doc) => (
                        <div 
                          key={doc.key}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            isRTL && "flex-row-reverse"
                          )}
                        >
                          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span>{doc.label}</span>
                          </div>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            {documents[doc.key as keyof typeof documents] ? (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                <Check className="w-3 h-3 mr-1" />{t('uploaded')}
                              </Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setDocuments({...documents, [doc.key]: true})}
                              >
                                <Upload className="w-3 h-3 mr-1" />{t('uploadBtn')}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <CheckCircle2 className="w-5 h-5" />
                  {t('step6Title')}
                </CardTitle>
                <CardDescription>{t('step6Desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Personal Info Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <h4 className="font-semibold">{t('personalInfo')}</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(2)}>{t('edit')}</Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <p><span className="text-muted-foreground">{t('firstName')}:</span> {personalInfo.firstName || '-'}</p>
                    <p><span className="text-muted-foreground">{t('lastName')}:</span> {personalInfo.lastName || '-'}</p>
                    <p><span className="text-muted-foreground">{t('phone')}:</span> {personalInfo.phone || '-'}</p>
                    <p><span className="text-muted-foreground">{t('nationality')}:</span> {personalInfo.nationality || '-'}</p>
                  </div>
                </div>
                
                {/* Family Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <h4 className="font-semibold">{t('familyInfo')}</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(3)}>{t('edit')}</Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">{t('maritalStatus')}:</span> {familyInfo.maritalStatus === 'married' ? t('married') : t('single')}</p>
                    {familyInfo.maritalStatus === 'married' && (
                      <p><span className="text-muted-foreground">{t('spouseName')}:</span> {familyInfo.spouseName || '-'}</p>
                    )}
                    <p><span className="text-muted-foreground">{t('children')}:</span> {familyInfo.children.length}</p>
                  </div>
                </div>
                
                {/* Benefits Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <h4 className="font-semibold">{t('selectedBenefits')}</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(4)}>{t('edit')}</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {benefits.filter(b => selectedBenefits.includes(b.id)).map(b => (
                      <Badge key={b.id} variant="secondary">
                        <b.icon className="w-3 h-3 mr-1" />
                        {t(b.nameKey as keyof typeof pageTranslations.en)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm mt-2">
                    <span className="text-muted-foreground">{t('totalAnnualBenefits')}:</span>{' '}
                    <span className="font-semibold text-primary">AED {totalBenefitsValue.toLocaleString()}</span>
                  </p>
                </div>
                
                {/* Documents Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <h4 className="font-semibold">{t('documents')}</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(5)}>{t('edit')}</Button>
                  </div>
                  <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                    <Badge variant={documents.passport ? "default" : "secondary"}>{t('passportCopy')}</Badge>
                    <Badge variant={documents.emiratesId ? "default" : "secondary"}>{t('emiratesIdCopy')}</Badge>
                    <Badge variant={documents.visa ? "default" : "secondary"}>{t('visaCopy')}</Badge>
                  </div>
                </div>
                
                {/* Confirmation */}
                <div className={cn("flex items-center gap-3 p-4 border rounded-lg", isRTL && "flex-row-reverse")}>
                  <Checkbox 
                    id="confirm" 
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  />
                  <Label htmlFor="confirm" className="cursor-pointer">{t('confirmSetup')}</Label>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className={cn("max-w-3xl mx-auto flex justify-between pt-4", isRTL && "flex-row-reverse")}>
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 1}
          className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}
        >
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {t('back')}
        </Button>
        
        <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
          {currentStep > 1 && currentStep < steps.length && (
            <Button variant="ghost" onClick={() => setCurrentStep(currentStep + 1)}>
              {t('skip')}
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={currentStep === steps.length && !confirmed}
            className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}
          >
            {currentStep === steps.length ? t('finish') : t('next')}
            {currentStep < steps.length && (isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
          </Button>
        </div>
      </div>
    </div>
  );
}
