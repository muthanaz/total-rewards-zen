import { useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  HelpCircle,
  Search,
  Home,
  GraduationCap,
  Heart,
  Car,
  PiggyBank,
  Dumbbell,
  TrendingUp,
  Calendar,
  Gift,
  ChevronRight,
  ChevronDown,
  Star,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const pageTranslations = {
  en: {
    title: 'Knowledge Hub',
    subtitle: 'Your guide to understanding and maximizing your benefits',
    searchPlaceholder: 'Search terms, topics, or questions...',
    
    // Tabs
    tabGlossary: 'Glossary',
    tabBestPractices: 'Best Practices',
    tabFAQ: 'FAQ',
    tabTips: 'Quick Tips',
    
    // Glossary
    glossaryTitle: 'Benefits Terminology',
    glossaryDesc: 'Understanding key terms and concepts',
    
    // Best Practices
    practicesTitle: 'Leading Practices',
    practicesDesc: 'Expert recommendations for each benefit area',
    
    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqDesc: 'Common questions answered',
    
    // Tips
    tipsTitle: 'Quick Tips',
    tipsDesc: 'Actionable advice to maximize your benefits',
    
    // Categories
    catHousing: 'Housing',
    catEducation: 'Education',
    catHealth: 'Health & Insurance',
    catTransport: 'Transport',
    catWellbeing: 'Wellbeing',
    catFinancial: 'Financial Planning',
    catEquity: 'Equity & Ownership',
    catLeave: 'Leave & Time Off',
    
    learnMore: 'Learn More',
    relatedTerms: 'Related Terms',
    proTip: 'Pro Tip',
    didYouKnow: 'Did You Know?',
  },
  ar: {
    title: 'مركز المعرفة',
    subtitle: 'دليلك لفهم مزاياك وتعظيم الاستفادة منها',
    searchPlaceholder: 'ابحث عن مصطلحات أو مواضيع أو أسئلة...',
    
    // Tabs
    tabGlossary: 'المصطلحات',
    tabBestPractices: 'أفضل الممارسات',
    tabFAQ: 'الأسئلة الشائعة',
    tabTips: 'نصائح سريعة',
    
    // Glossary
    glossaryTitle: 'مصطلحات المزايا',
    glossaryDesc: 'فهم المصطلحات والمفاهيم الأساسية',
    
    // Best Practices
    practicesTitle: 'الممارسات الرائدة',
    practicesDesc: 'توصيات الخبراء لكل مجال من مجالات المزايا',
    
    // FAQ
    faqTitle: 'الأسئلة الشائعة',
    faqDesc: 'إجابات على الأسئلة المتكررة',
    
    // Tips
    tipsTitle: 'نصائح سريعة',
    tipsDesc: 'نصائح عملية لتعظيم مزاياك',
    
    // Categories
    catHousing: 'السكن',
    catEducation: 'التعليم',
    catHealth: 'الصحة والتأمين',
    catTransport: 'النقل',
    catWellbeing: 'الرفاهية',
    catFinancial: 'التخطيط المالي',
    catEquity: 'الأسهم والملكية',
    catLeave: 'الإجازات',
    
    learnMore: 'اقرأ المزيد',
    relatedTerms: 'مصطلحات ذات صلة',
    proTip: 'نصيحة احترافية',
    didYouKnow: 'هل تعلم؟',
  }
};

const glossaryTerms = {
  en: [
    { term: 'Annual Allowance', definition: 'The total amount allocated to you each year for a specific benefit category. This resets at the start of each fiscal year.', category: 'General', related: ['Utilization', 'Remaining Balance'] },
    { term: 'Utilization Rate', definition: 'The percentage of your allocated benefits that you have used. A higher utilization rate means you are making good use of your benefits.', category: 'General', related: ['Annual Allowance', 'Zombie Spend'] },
    { term: 'Housing Allowance', definition: 'A monthly or annual cash benefit to help cover accommodation costs. Can be used for rent, mortgage, or housing-related expenses.', category: 'Housing', related: ['DEWA', 'Ejari'] },
    { term: 'DEWA', definition: 'Dubai Electricity and Water Authority. Utility bills that may be covered under your housing allowance.', category: 'Housing', related: ['Housing Allowance'] },
    { term: 'Ejari', definition: 'Dubai\'s online registration system for rental contracts. Required to formalize tenancy agreements in Dubai.', category: 'Housing', related: ['Housing Allowance'] },
    { term: 'Education Allowance', definition: 'Financial support for children\'s schooling expenses including tuition fees, books, uniforms, and transportation.', category: 'Education', related: ['Tuition Fee', 'School Enrollment'] },
    { term: 'Dependent Coverage', definition: 'Health insurance or benefits that extend to your spouse and children. Check eligibility requirements for each dependent.', category: 'Health', related: ['Health Insurance', 'Premium'] },
    { term: 'Network Provider', definition: 'Healthcare facilities and doctors that have agreements with your insurance company, offering discounted rates.', category: 'Health', related: ['In-Network', 'Out-of-Network', 'Claim'] },
    { term: 'Claim', definition: 'A formal request submitted to receive reimbursement for expenses covered under your benefits.', category: 'General', related: ['Reimbursement', 'Supporting Documents'] },
    { term: 'Vesting Period', definition: 'The time you must work before you gain full ownership of certain benefits like stock options or retirement contributions.', category: 'Equity', related: ['Stock Options', 'ESOP'] },
    { term: 'ESOP', definition: 'Employee Stock Ownership Plan. A program that provides employees with ownership stakes in the company.', category: 'Equity', related: ['Vesting Period', 'Stock Options'] },
    { term: 'Gratuity', definition: 'End-of-service benefit calculated based on your length of employment. Required by UAE Labor Law.', category: 'Financial', related: ['End of Service', 'Severance'] },
    { term: 'Carryover', definition: 'The ability to transfer unused leave days or benefit amounts to the next year. Check your policy for limits.', category: 'Leave', related: ['Annual Leave', 'Encashment'] },
    { term: 'Encashment', definition: 'Converting unused leave days to cash payment. Policies vary on when and how much can be encashed.', category: 'Leave', related: ['Carryover', 'Annual Leave'] },
    { term: 'Wellness Stipend', definition: 'A fixed amount allocated for health and wellness activities like gym memberships, fitness classes, or mental health services.', category: 'Wellbeing', related: ['Gym Membership', 'Mental Health'] },
  ],
  ar: [
    { term: 'البدل السنوي', definition: 'المبلغ الإجمالي المخصص لك سنوياً لفئة مزايا محددة. يتم إعادة ضبطه في بداية كل سنة مالية.', category: 'عام', related: ['معدل الاستخدام', 'الرصيد المتبقي'] },
    { term: 'معدل الاستخدام', definition: 'نسبة المزايا المخصصة لك التي استخدمتها. معدل الاستخدام الأعلى يعني أنك تستفيد جيداً من مزاياك.', category: 'عام', related: ['البدل السنوي', 'الإنفاق غير المستغل'] },
    { term: 'بدل السكن', definition: 'مزايا نقدية شهرية أو سنوية للمساعدة في تغطية تكاليف الإقامة. يمكن استخدامها للإيجار أو الرهن العقاري.', category: 'السكن', related: ['ديوا', 'إيجاري'] },
    { term: 'ديوا', definition: 'هيئة كهرباء ومياه دبي. فواتير المرافق التي قد تغطيها بدل السكن.', category: 'السكن', related: ['بدل السكن'] },
    { term: 'إيجاري', definition: 'نظام دبي للتسجيل الإلكتروني لعقود الإيجار. مطلوب لإضفاء الطابع الرسمي على اتفاقيات الإيجار.', category: 'السكن', related: ['بدل السكن'] },
    { term: 'بدل التعليم', definition: 'دعم مالي لنفقات تعليم الأطفال بما في ذلك الرسوم الدراسية والكتب والزي المدرسي والنقل.', category: 'التعليم', related: ['الرسوم الدراسية', 'التسجيل المدرسي'] },
    { term: 'تغطية المعالين', definition: 'التأمين الصحي أو المزايا التي تمتد للزوج/الزوجة والأطفال. تحقق من متطلبات الأهلية.', category: 'الصحة', related: ['التأمين الصحي', 'القسط'] },
    { term: 'مزود الشبكة', definition: 'المرافق الصحية والأطباء الذين لديهم اتفاقيات مع شركة التأمين، ويقدمون أسعاراً مخفضة.', category: 'الصحة', related: ['داخل الشبكة', 'خارج الشبكة', 'المطالبة'] },
    { term: 'المطالبة', definition: 'طلب رسمي يُقدم لتلقي تعويض عن النفقات المغطاة بموجب مزاياك.', category: 'عام', related: ['التعويض', 'المستندات الداعمة'] },
    { term: 'فترة الاستحقاق', definition: 'المدة التي يجب أن تعمل فيها قبل الحصول على الملكية الكاملة لمزايا معينة مثل خيارات الأسهم.', category: 'الأسهم', related: ['خيارات الأسهم', 'برنامج ملكية الموظفين'] },
    { term: 'برنامج ملكية الموظفين', definition: 'برنامج يوفر للموظفين حصص ملكية في الشركة.', category: 'الأسهم', related: ['فترة الاستحقاق', 'خيارات الأسهم'] },
    { term: 'مكافأة نهاية الخدمة', definition: 'مزايا نهاية الخدمة المحسوبة بناءً على مدة عملك. مطلوبة بموجب قانون العمل الإماراتي.', category: 'المالية', related: ['نهاية الخدمة', 'التعويض'] },
    { term: 'الترحيل', definition: 'القدرة على نقل أيام الإجازة أو مبالغ المزايا غير المستخدمة إلى العام التالي.', category: 'الإجازات', related: ['الإجازة السنوية', 'صرف الإجازات'] },
    { term: 'صرف الإجازات', definition: 'تحويل أيام الإجازة غير المستخدمة إلى دفعة نقدية.', category: 'الإجازات', related: ['الترحيل', 'الإجازة السنوية'] },
    { term: 'بدل الصحة والرفاهية', definition: 'مبلغ ثابت مخصص للأنشطة الصحية مثل عضوية الصالة الرياضية ودروس اللياقة.', category: 'الرفاهية', related: ['عضوية الصالة الرياضية', 'الصحة النفسية'] },
  ]
};

const bestPractices = {
  en: [
    {
      category: 'Housing',
      icon: Home,
      practices: [
        { title: 'Plan Your Budget', description: 'Allocate no more than 30% of your total compensation to housing for financial stability.' },
        { title: 'Consider Commute', description: 'Factor in transportation costs when choosing your home location. A cheaper area with high commute costs may not save money.' },
        { title: 'Negotiate Rent', description: 'In the UAE market, landlords often offer 5-10% discounts for annual upfront payments or long-term leases.' },
        { title: 'Use Your Full Allowance', description: 'If your allowance exceeds your rent, consider using the balance for utilities or home improvements if policy allows.' },
      ]
    },
    {
      category: 'Education',
      icon: GraduationCap,
      practices: [
        { title: 'Apply Early', description: 'Top schools in UAE have waitlists. Submit applications 12-18 months before the desired start date.' },
        { title: 'Understand Coverage', description: 'Know exactly what is covered - some policies include transportation and uniforms, others only tuition.' },
        { title: 'Keep All Receipts', description: 'Maintain organized records of all school-related expenses for smooth reimbursement claims.' },
        { title: 'Consider Future Grades', description: 'School fees increase with grade level. Plan for higher costs as children advance.' },
      ]
    },
    {
      category: 'Health & Insurance',
      icon: Heart,
      practices: [
        { title: 'Use In-Network Providers', description: 'Save 20-40% by using healthcare providers within your insurance network.' },
        { title: 'Schedule Preventive Care', description: 'Annual check-ups are usually 100% covered. Use them to catch issues early.' },
        { title: 'Understand Pre-Authorization', description: 'Some procedures require pre-approval. Always check before scheduling elective treatments.' },
        { title: 'Review Coverage Annually', description: 'During open enrollment, assess if your plan still meets your family\'s needs.' },
      ]
    },
    {
      category: 'Financial Planning',
      icon: PiggyBank,
      practices: [
        { title: 'Start Retirement Planning Early', description: 'Compound interest works best over time. Even small contributions grow significantly.' },
        { title: 'Understand Gratuity Calculation', description: 'UAE gratuity is 21 days salary per year for first 5 years, then 30 days per year after.' },
        { title: 'Diversify Savings', description: 'Don\'t rely solely on end-of-service benefits. Build personal savings alongside.' },
        { title: 'Use Financial Advisory Benefits', description: 'If offered, take advantage of free financial planning consultations.' },
      ]
    },
    {
      category: 'Equity & Ownership',
      icon: TrendingUp,
      practices: [
        { title: 'Understand Your Vesting Schedule', description: 'Know when your options vest and plan accordingly. Leaving before vesting means losing unvested shares.' },
        { title: 'Consider Tax Implications', description: 'Consult a tax advisor about the implications of exercising options, especially if you\'re from a country with capital gains tax.' },
        { title: 'Don\'t Over-Concentrate', description: 'Having most of your wealth in company stock is risky. Consider diversifying as options vest.' },
        { title: 'Know Your Exercise Window', description: 'If you leave the company, you typically have 90 days to exercise vested options.' },
      ]
    },
    {
      category: 'Leave & Time Off',
      icon: Calendar,
      practices: [
        { title: 'Plan Leave Strategically', description: 'Book leave around public holidays to maximize time off with fewer leave days used.' },
        { title: 'Use It or Lose It', description: 'Understand your carryover policy. Don\'t lose earned leave by not using it.' },
        { title: 'Document Leave Properly', description: 'Always submit leave requests through proper channels with adequate notice.' },
        { title: 'Know Emergency Leave Rights', description: 'Understand your entitlements for bereavement, sick leave, and family emergencies.' },
      ]
    },
  ],
  ar: [
    {
      category: 'السكن',
      icon: Home,
      practices: [
        { title: 'خطط لميزانيتك', description: 'خصص لا أكثر من ٣٠٪ من إجمالي تعويضاتك للسكن لتحقيق الاستقرار المالي.' },
        { title: 'ضع في اعتبارك التنقل', description: 'احسب تكاليف النقل عند اختيار موقع سكنك. المنطقة الأرخص مع تكاليف تنقل عالية قد لا توفر المال.' },
        { title: 'تفاوض على الإيجار', description: 'في سوق الإمارات، غالباً ما يقدم الملاك خصومات ٥-١٠٪ للدفع السنوي المقدم.' },
        { title: 'استخدم بدلك بالكامل', description: 'إذا تجاوز بدلك الإيجار، فكر في استخدام الرصيد للمرافق إذا سمحت السياسة.' },
      ]
    },
    {
      category: 'التعليم',
      icon: GraduationCap,
      practices: [
        { title: 'قدم طلبك مبكراً', description: 'أفضل المدارس في الإمارات لديها قوائم انتظار. قدم طلبات ١٢-١٨ شهراً قبل تاريخ البدء المطلوب.' },
        { title: 'افهم التغطية', description: 'اعرف بالضبط ما هو مغطى - بعض السياسات تشمل النقل والزي، وأخرى الرسوم فقط.' },
        { title: 'احتفظ بجميع الإيصالات', description: 'حافظ على سجلات منظمة لجميع النفقات المدرسية لتسهيل مطالبات التعويض.' },
        { title: 'فكر في الصفوف المستقبلية', description: 'الرسوم المدرسية تزداد مع مستوى الصف. خطط لتكاليف أعلى مع تقدم الأطفال.' },
      ]
    },
    {
      category: 'الصحة والتأمين',
      icon: Heart,
      practices: [
        { title: 'استخدم مزودي الشبكة', description: 'وفر ٢٠-٤٠٪ باستخدام مقدمي الرعاية الصحية ضمن شبكة التأمين الخاصة بك.' },
        { title: 'جدول الرعاية الوقائية', description: 'الفحوصات السنوية عادة مغطاة ١٠٠٪. استخدمها لاكتشاف المشاكل مبكراً.' },
        { title: 'افهم الموافقة المسبقة', description: 'بعض الإجراءات تتطلب موافقة مسبقة. تحقق دائماً قبل جدولة العلاجات الاختيارية.' },
        { title: 'راجع التغطية سنوياً', description: 'خلال فترة التسجيل المفتوح، قيم إذا كانت خطتك لا تزال تلبي احتياجات عائلتك.' },
      ]
    },
    {
      category: 'التخطيط المالي',
      icon: PiggyBank,
      practices: [
        { title: 'ابدأ التخطيط للتقاعد مبكراً', description: 'الفائدة المركبة تعمل بشكل أفضل مع الوقت. حتى المساهمات الصغيرة تنمو بشكل كبير.' },
        { title: 'افهم حساب المكافأة', description: 'مكافأة نهاية الخدمة في الإمارات ٢١ يوماً راتب لكل سنة لأول ٥ سنوات، ثم ٣٠ يوماً بعد ذلك.' },
        { title: 'نوع مدخراتك', description: 'لا تعتمد فقط على مزايا نهاية الخدمة. ابنِ مدخرات شخصية إلى جانبها.' },
        { title: 'استخدم مزايا الاستشارات المالية', description: 'إذا عُرضت عليك، استفد من استشارات التخطيط المالي المجانية.' },
      ]
    },
    {
      category: 'الأسهم والملكية',
      icon: TrendingUp,
      practices: [
        { title: 'افهم جدول الاستحقاق', description: 'اعرف متى تستحق خياراتك وخطط وفقاً لذلك. المغادرة قبل الاستحقاق تعني خسارة الأسهم غير المستحقة.' },
        { title: 'فكر في الآثار الضريبية', description: 'استشر مستشاراً ضريبياً حول آثار ممارسة الخيارات، خاصة إذا كنت من بلد به ضريبة أرباح رأس المال.' },
        { title: 'لا تركز بشكل مفرط', description: 'وجود معظم ثروتك في أسهم الشركة أمر محفوف بالمخاطر. فكر في التنويع.' },
        { title: 'اعرف نافذة الممارسة', description: 'إذا غادرت الشركة، عادة لديك ٩٠ يوماً لممارسة الخيارات المستحقة.' },
      ]
    },
    {
      category: 'الإجازات والوقت المستقطع',
      icon: Calendar,
      practices: [
        { title: 'خطط للإجازة استراتيجياً', description: 'احجز الإجازة حول العطلات الرسمية لتعظيم وقت الراحة مع أيام إجازة أقل.' },
        { title: 'استخدمها أو ستخسرها', description: 'افهم سياسة الترحيل الخاصة بك. لا تخسر الإجازة المكتسبة بعدم استخدامها.' },
        { title: 'وثق الإجازة بشكل صحيح', description: 'قدم دائماً طلبات الإجازة عبر القنوات المناسبة مع إشعار كافٍ.' },
        { title: 'اعرف حقوق الإجازة الطارئة', description: 'افهم استحقاقاتك للعزاء والإجازة المرضية وحالات الطوارئ العائلية.' },
      ]
    },
  ]
};

const faqs = {
  en: [
    { q: 'When do my benefits reset?', a: 'Most benefits reset at the start of the fiscal year (January 1st). However, some benefits like leave may follow your employment anniversary. Check your specific benefit policies for exact dates.' },
    { q: 'Can I change my benefit selections mid-year?', a: 'Generally, benefit selections are fixed for the year. However, qualifying life events (marriage, birth of child, etc.) may allow mid-year changes. Contact HR within 30 days of the event.' },
    { q: 'What happens to unused benefits?', a: 'It depends on the benefit type. Cash allowances typically don\'t carry over, while some leave days may. Check your policy for specific rules on each benefit.' },
    { q: 'How do I submit a claim?', a: 'Use the Request & Claims widget on your dashboard. Attach all required supporting documents including receipts, invoices, and any approval letters. Claims are typically processed within 5-7 business days.' },
    { q: 'Are my dependents automatically covered?', a: 'Dependents must be registered to receive coverage. Submit dependent documentation through the profile section. Coverage typically begins the month after registration.' },
    { q: 'What is the difference between a claim and a request?', a: 'A claim is for reimbursement of expenses you\'ve already paid. A request is for pre-approval or allocation of benefits before spending (e.g., requesting a flight ticket).' },
    { q: 'How is my gratuity calculated?', a: 'For unlimited contracts: 21 days of basic salary for each year of the first 5 years, then 30 days for each subsequent year. Maximum gratuity is 2 years\' total salary.' },
    { q: 'Can I opt out of certain benefits?', a: 'Some benefits are mandatory (like health insurance). Optional benefits can usually be declined, but you typically cannot receive cash in lieu of declined benefits.' },
  ],
  ar: [
    { q: 'متى يتم إعادة تعيين مزاياي؟', a: 'معظم المزايا تُعاد في بداية السنة المالية (١ يناير). ومع ذلك، بعض المزايا مثل الإجازة قد تتبع ذكرى التوظيف. راجع سياسات المزايا المحددة للتواريخ الدقيقة.' },
    { q: 'هل يمكنني تغيير اختيارات المزايا في منتصف العام؟', a: 'عموماً، اختيارات المزايا ثابتة للعام. ومع ذلك، الأحداث الحياتية المؤهلة (الزواج، ولادة طفل، إلخ) قد تسمح بتغييرات. اتصل بالموارد البشرية خلال ٣٠ يوماً من الحدث.' },
    { q: 'ماذا يحدث للمزايا غير المستخدمة؟', a: 'يعتمد على نوع المزايا. البدلات النقدية عادة لا تُرحل، بينما بعض أيام الإجازة قد تُرحل. راجع سياستك للقواعد المحددة لكل مزايا.' },
    { q: 'كيف أقدم مطالبة؟', a: 'استخدم أداة الطلبات والمطالبات في لوحة التحكم. أرفق جميع المستندات الداعمة المطلوبة بما في ذلك الإيصالات والفواتير. عادة تُعالج المطالبات خلال ٥-٧ أيام عمل.' },
    { q: 'هل المعالون مشمولون تلقائياً؟', a: 'يجب تسجيل المعالين للحصول على التغطية. قدم وثائق المعالين من خلال قسم الملف الشخصي. تبدأ التغطية عادة في الشهر التالي للتسجيل.' },
    { q: 'ما الفرق بين المطالبة والطلب؟', a: 'المطالبة هي لاسترداد نفقات دفعتها بالفعل. الطلب هو للموافقة المسبقة أو تخصيص المزايا قبل الإنفاق (مثل طلب تذكرة طيران).' },
    { q: 'كيف تُحسب مكافأة نهاية الخدمة؟', a: 'للعقود غير المحددة: ٢١ يوماً من الراتب الأساسي لكل سنة من أول ٥ سنوات، ثم ٣٠ يوماً لكل سنة لاحقة. الحد الأقصى للمكافأة هو راتب سنتين.' },
    { q: 'هل يمكنني رفض بعض المزايا؟', a: 'بعض المزايا إلزامية (مثل التأمين الصحي). المزايا الاختيارية يمكن رفضها عادة، لكن عادة لا يمكنك الحصول على نقد بدلاً من المزايا المرفوضة.' },
  ]
};

const quickTips = {
  en: [
    { icon: Star, tip: 'Set calendar reminders for open enrollment periods to review and update your benefits selections.' },
    { icon: CheckCircle2, tip: 'Take photos of all receipts immediately - paper receipts fade over time and may become unreadable.' },
    { icon: Lightbulb, tip: 'Bundle related claims together to reduce processing time and paperwork.' },
    { icon: Info, tip: 'Download and save your insurance cards digitally for quick access during emergencies.' },
    { icon: Star, tip: 'Check if your gym or wellness provider is on the approved list before signing up to ensure coverage.' },
    { icon: CheckCircle2, tip: 'Keep a benefits folder with all policy documents for easy reference during claims.' },
    { icon: Lightbulb, tip: 'Schedule annual health check-ups at the start of the year to avoid year-end rush.' },
    { icon: Info, tip: 'If unsure about coverage, always ask HR or check the policy document before incurring expenses.' },
  ],
  ar: [
    { icon: Star, tip: 'ضع تذكيرات في التقويم لفترات التسجيل المفتوح لمراجعة وتحديث اختيارات المزايا.' },
    { icon: CheckCircle2, tip: 'التقط صوراً لجميع الإيصالات فوراً - الإيصالات الورقية تبهت مع الوقت وقد تصبح غير مقروءة.' },
    { icon: Lightbulb, tip: 'اجمع المطالبات ذات الصلة معاً لتقليل وقت المعالجة والأوراق.' },
    { icon: Info, tip: 'قم بتنزيل وحفظ بطاقات التأمين رقمياً للوصول السريع أثناء الطوارئ.' },
    { icon: Star, tip: 'تحقق مما إذا كانت صالة الألعاب الرياضية أو مزود الرفاهية في القائمة المعتمدة قبل الاشتراك.' },
    { icon: CheckCircle2, tip: 'احتفظ بمجلد مزايا مع جميع وثائق السياسة للرجوع إليها بسهولة أثناء المطالبات.' },
    { icon: Lightbulb, tip: 'جدول الفحوصات الصحية السنوية في بداية العام لتجنب الازدحام في نهاية العام.' },
    { icon: Info, tip: 'إذا كنت غير متأكد من التغطية، اسأل الموارد البشرية دائماً أو راجع وثيقة السياسة قبل تحمل النفقات.' },
  ]
};

export default function KnowledgeHubPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (key: keyof typeof pageTranslations.en) => pageTranslations[language][key];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const terms = glossaryTerms[language];
  const practices = bestPractices[language];
  const faqList = faqs[language];
  const tips = quickTips[language];
  
  const filteredTerms = terms.filter(term => 
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col gap-2", isRTL && "items-end")}>
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn("pl-10", isRTL && "pr-10 pl-3 text-right")}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="glossary" className="space-y-4">
        <TabsList className={cn("grid w-full grid-cols-4", isRTL && "direction-rtl")}>
          <TabsTrigger value="glossary">{t('tabGlossary')}</TabsTrigger>
          <TabsTrigger value="practices">{t('tabBestPractices')}</TabsTrigger>
          <TabsTrigger value="faq">{t('tabFAQ')}</TabsTrigger>
          <TabsTrigger value="tips">{t('tabTips')}</TabsTrigger>
        </TabsList>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('glossaryTitle')}</CardTitle>
              <CardDescription>{t('glossaryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTerms.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className={cn("flex items-start justify-between gap-4", isRTL && "flex-row-reverse")}>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{item.term}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{item.definition}</p>
                        <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          {item.related.length > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground">{t('relatedTerms')}:</span>
                              {item.related.map((rel, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{rel}</Badge>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="practices" className="space-y-4">
          <div className={cn("flex flex-col gap-2 mb-4", isRTL && "items-end")}>
            <h2 className="text-xl font-semibold">{t('practicesTitle')}</h2>
            <p className="text-muted-foreground">{t('practicesDesc')}</p>
          </div>
          
          <div className="grid gap-4">
            {practices.map((category, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <category.icon className="w-4 h-4 text-primary" />
                    </div>
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {category.practices.map((practice, i) => (
                      <div key={i} className={cn("p-3 rounded-lg bg-muted/50", isRTL && "text-right")}>
                        <h4 className="font-medium mb-1">{practice.title}</h4>
                        <p className="text-sm text-muted-foreground">{practice.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('faqTitle')}</CardTitle>
              <CardDescription>{t('faqDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqList.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className={cn("text-left", isRTL && "text-right flex-row-reverse")}>
                      <span className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                        {item.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <div className={cn("flex flex-col gap-2 mb-4", isRTL && "items-end")}>
            <h2 className="text-xl font-semibold">{t('tipsTitle')}</h2>
            <p className="text-muted-foreground">{t('tipsDesc')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {tips.map((item, index) => (
              <Card key={index} className="p-4">
                <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm">{item.tip}</p>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Pro Tip Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className={cn("p-6 flex items-start gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-full bg-primary/10">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('proTip')}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'راجع مزاياك كل ثلاثة أشهر للتأكد من أنك على المسار الصحيح لاستخدامها بالكامل بحلول نهاية العام. هذا يمنع الإنفاق المتسرع في اللحظة الأخيرة ويضمن حصولك على أقصى قيمة.'
                    : 'Review your benefits quarterly to ensure you are on track to fully utilize them by year-end. This prevents last-minute rushed spending and ensures you get maximum value.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
