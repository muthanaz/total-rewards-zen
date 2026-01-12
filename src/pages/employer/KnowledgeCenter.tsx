import { useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  HelpCircle,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  BarChart3,
  Target,
  Award,
  Zap,
  Building2,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
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
    title: 'Employer Knowledge Center',
    subtitle: 'Strategic guidance for benefits program excellence',
    searchPlaceholder: 'Search terms, strategies, or topics...',
    
    // Tabs
    tabGlossary: 'Terminology',
    tabBestPractices: 'Best Practices',
    tabBenchmarks: 'Benchmarks',
    tabStrategies: 'Strategies',
    
    // Glossary
    glossaryTitle: 'HR & Benefits Terminology',
    glossaryDesc: 'Key terms and metrics for benefits management',
    
    // Best Practices
    practicesTitle: 'Leading Practices',
    practicesDesc: 'Expert-backed strategies for program optimization',
    
    // Benchmarks
    benchmarksTitle: 'Industry Benchmarks',
    benchmarksDesc: 'How top organizations measure success',
    
    // Strategies
    strategiesTitle: 'Strategic Playbooks',
    strategiesDesc: 'Actionable frameworks for common challenges',
    
    // Categories
    catUtilization: 'Utilization',
    catCost: 'Cost Management',
    catEngagement: 'Employee Engagement',
    catCompliance: 'Compliance',
    catROI: 'ROI & Analytics',
    catRetention: 'Retention',
    
    industryAvg: 'Industry Average',
    topPerformers: 'Top Performers',
    yourOrg: 'Your Organization',
    keyInsight: 'Key Insight',
    actionItem: 'Action Item',
    relatedMetrics: 'Related Metrics',
  },
  ar: {
    title: 'مركز معرفة صاحب العمل',
    subtitle: 'إرشادات استراتيجية للتميز في برامج المزايا',
    searchPlaceholder: 'ابحث عن مصطلحات أو استراتيجيات أو مواضيع...',
    
    // Tabs
    tabGlossary: 'المصطلحات',
    tabBestPractices: 'أفضل الممارسات',
    tabBenchmarks: 'المعايير المرجعية',
    tabStrategies: 'الاستراتيجيات',
    
    // Glossary
    glossaryTitle: 'مصطلحات الموارد البشرية والمزايا',
    glossaryDesc: 'المصطلحات والمقاييس الرئيسية لإدارة المزايا',
    
    // Best Practices
    practicesTitle: 'الممارسات الرائدة',
    practicesDesc: 'استراتيجيات مدعومة بالخبراء لتحسين البرنامج',
    
    // Benchmarks
    benchmarksTitle: 'المعايير المرجعية للصناعة',
    benchmarksDesc: 'كيف تقيس المؤسسات الرائدة النجاح',
    
    // Strategies
    strategiesTitle: 'الكتيبات الاستراتيجية',
    strategiesDesc: 'أطر عمل قابلة للتنفيذ للتحديات الشائعة',
    
    // Categories
    catUtilization: 'الاستخدام',
    catCost: 'إدارة التكاليف',
    catEngagement: 'مشاركة الموظفين',
    catCompliance: 'الامتثال',
    catROI: 'العائد والتحليلات',
    catRetention: 'الاحتفاظ',
    
    industryAvg: 'متوسط الصناعة',
    topPerformers: 'الأفضل أداءً',
    yourOrg: 'مؤسستك',
    keyInsight: 'رؤية رئيسية',
    actionItem: 'إجراء مطلوب',
    relatedMetrics: 'مقاييس ذات صلة',
  }
};

const glossaryTerms = {
  en: [
    { term: 'Utilization Rate', definition: 'The percentage of allocated benefits actually used by employees. Formula: (Benefits Used / Benefits Allocated) × 100. Target: 70-85%', category: 'Metrics', related: ['Zombie Spend', 'Adoption Rate'] },
    { term: 'Zombie Spend', definition: 'Benefits budget allocated but not utilized by employees. Represents wasted investment and opportunity for reallocation or program redesign.', category: 'Cost', related: ['Utilization Rate', 'ROI'] },
    { term: 'Total Rewards', definition: 'The complete package of compensation, benefits, recognition, and development opportunities provided to employees beyond base salary.', category: 'Strategy', related: ['EVP', 'Compensation Philosophy'] },
    { term: 'Employee Value Proposition (EVP)', definition: 'The unique set of offerings and values that make your organization attractive to current and potential employees.', category: 'Strategy', related: ['Total Rewards', 'Employer Brand'] },
    { term: 'Benefits Adoption Rate', definition: 'The percentage of eligible employees who enroll in a specific benefit. Low adoption may indicate poor communication or irrelevant offerings.', category: 'Metrics', related: ['Utilization Rate', 'Engagement'] },
    { term: 'Cost Per Employee (CPE)', definition: 'Total benefits spend divided by number of employees. Used for budgeting and benchmarking against industry standards.', category: 'Cost', related: ['Total Cost of Ownership', 'ROI'] },
    { term: 'Experience Rating', definition: 'Insurance pricing method based on your organization\'s historical claims. High claims lead to higher premiums.', category: 'Insurance', related: ['Premium', 'Claims Ratio'] },
    { term: 'Claims Ratio', definition: 'The ratio of claims paid to premiums collected. High ratio (>85%) may result in premium increases at renewal.', category: 'Insurance', related: ['Experience Rating', 'Loss Ratio'] },
    { term: 'Flex Credits', definition: 'Employer-provided points or currency employees can use to customize their benefits package within defined options.', category: 'Design', related: ['Cafeteria Plan', 'Choice Architecture'] },
    { term: 'Open Enrollment', definition: 'Annual period when employees can make changes to their benefits selections. Critical time for communication and education.', category: 'Administration', related: ['Qualifying Life Event', 'Benefits Window'] },
    { term: 'Voluntary Benefits', definition: 'Additional benefits offered at employee expense through payroll deduction, leveraging group purchasing power.', category: 'Design', related: ['Core Benefits', 'Supplemental Coverage'] },
    { term: 'Return on Investment (ROI)', definition: 'Measure of benefits program value. Calculate: (Value Generated - Program Cost) / Program Cost. Include productivity, retention, and engagement impacts.', category: 'Metrics', related: ['Cost Savings', 'Productivity'] },
    { term: 'Vesting Schedule', definition: 'Timeline for employees to gain full ownership of employer contributions to retirement or equity plans. Used for retention.', category: 'Equity', related: ['Golden Handcuffs', 'Cliff Vesting'] },
    { term: 'Benchmarking', definition: 'Comparing your benefits program against industry peers to ensure competitiveness and identify gaps or opportunities.', category: 'Strategy', related: ['Market Positioning', 'Competitiveness'] },
  ],
  ar: [
    { term: 'معدل الاستخدام', definition: 'نسبة المزايا المخصصة التي يستخدمها الموظفون فعلياً. الصيغة: (المزايا المستخدمة / المزايا المخصصة) × ١٠٠. الهدف: ٧٠-٨٥٪', category: 'المقاييس', related: ['الإنفاق غير المستغل', 'معدل التبني'] },
    { term: 'الإنفاق غير المستغل', definition: 'ميزانية المزايا المخصصة ولكن غير المستخدمة من قبل الموظفين. يمثل استثماراً ضائعاً وفرصة لإعادة التخصيص.', category: 'التكلفة', related: ['معدل الاستخدام', 'العائد على الاستثمار'] },
    { term: 'المكافآت الإجمالية', definition: 'الحزمة الكاملة من التعويضات والمزايا والتقدير وفرص التطوير المقدمة للموظفين بخلاف الراتب الأساسي.', category: 'الاستراتيجية', related: ['عرض قيمة الموظف', 'فلسفة التعويض'] },
    { term: 'عرض قيمة الموظف (EVP)', definition: 'المجموعة الفريدة من العروض والقيم التي تجعل مؤسستك جذابة للموظفين الحاليين والمحتملين.', category: 'الاستراتيجية', related: ['المكافآت الإجمالية', 'العلامة التجارية لصاحب العمل'] },
    { term: 'معدل تبني المزايا', definition: 'نسبة الموظفين المؤهلين الذين يسجلون في مزايا محددة. قد يشير التبني المنخفض إلى ضعف التواصل.', category: 'المقاييس', related: ['معدل الاستخدام', 'المشاركة'] },
    { term: 'التكلفة لكل موظف (CPE)', definition: 'إجمالي إنفاق المزايا مقسوماً على عدد الموظفين. يستخدم للميزانية والمقارنة مع معايير الصناعة.', category: 'التكلفة', related: ['التكلفة الإجمالية للملكية', 'العائد على الاستثمار'] },
    { term: 'تصنيف الخبرة', definition: 'طريقة تسعير التأمين بناءً على سجل مطالبات مؤسستك. المطالبات العالية تؤدي إلى أقساط أعلى.', category: 'التأمين', related: ['القسط', 'نسبة المطالبات'] },
    { term: 'نسبة المطالبات', definition: 'نسبة المطالبات المدفوعة إلى الأقساط المحصلة. النسبة العالية (>٨٥٪) قد تؤدي إلى زيادة الأقساط عند التجديد.', category: 'التأمين', related: ['تصنيف الخبرة', 'نسبة الخسارة'] },
    { term: 'أرصدة مرنة', definition: 'نقاط أو عملة يقدمها صاحب العمل يمكن للموظفين استخدامها لتخصيص حزمة مزاياهم ضمن خيارات محددة.', category: 'التصميم', related: ['خطة الكافتيريا', 'هندسة الاختيار'] },
    { term: 'التسجيل المفتوح', definition: 'الفترة السنوية التي يمكن للموظفين فيها إجراء تغييرات على اختيارات مزاياهم. وقت حاسم للتواصل والتثقيف.', category: 'الإدارة', related: ['حدث الحياة المؤهل', 'نافذة المزايا'] },
    { term: 'المزايا الطوعية', definition: 'مزايا إضافية تُقدم على حساب الموظف من خلال خصم الرواتب، مستفيدة من القوة الشرائية الجماعية.', category: 'التصميم', related: ['المزايا الأساسية', 'التغطية التكميلية'] },
    { term: 'العائد على الاستثمار (ROI)', definition: 'قياس قيمة برنامج المزايا. الحساب: (القيمة المولدة - تكلفة البرنامج) / تكلفة البرنامج.', category: 'المقاييس', related: ['توفير التكاليف', 'الإنتاجية'] },
    { term: 'جدول الاستحقاق', definition: 'الجدول الزمني للموظفين للحصول على الملكية الكاملة لمساهمات صاحب العمل في خطط التقاعد أو الأسهم.', category: 'الأسهم', related: ['القيود الذهبية', 'الاستحقاق الفوري'] },
    { term: 'المقارنة المرجعية', definition: 'مقارنة برنامج المزايا الخاص بك مع نظرائك في الصناعة لضمان التنافسية وتحديد الفجوات أو الفرص.', category: 'الاستراتيجية', related: ['التموضع في السوق', 'التنافسية'] },
  ]
};

const benchmarks = {
  en: [
    { metric: 'Benefits Utilization Rate', industryAvg: '62%', topPerformers: '78%', insight: 'Top performers achieve higher utilization through better communication and program design.' },
    { metric: 'Cost Per Employee (Annual)', industryAvg: 'AED 45,000', topPerformers: 'AED 52,000', insight: 'Higher spend correlates with better retention when paired with personalization.' },
    { metric: 'Zombie Spend Rate', industryAvg: '18%', topPerformers: '8%', insight: 'Leading companies actively monitor and reallocate underutilized benefits budgets.' },
    { metric: 'Employee Satisfaction Score', industryAvg: '3.6/5', topPerformers: '4.3/5', insight: 'Choice and flexibility drive satisfaction more than total spend.' },
    { metric: 'Claims Processing Time', industryAvg: '7 days', topPerformers: '3 days', insight: 'Fast claims processing significantly impacts employee perception of benefits value.' },
    { metric: 'Benefits Communication Reach', industryAvg: '45%', topPerformers: '82%', insight: 'Multi-channel communication strategies dramatically improve awareness.' },
    { metric: 'Open Enrollment Completion', industryAvg: '71%', topPerformers: '94%', insight: 'Simplified enrollment processes and manager involvement drive completion rates.' },
    { metric: 'Voluntary Benefits Adoption', industryAvg: '23%', topPerformers: '41%', insight: 'Curated, relevant voluntary offerings outperform large catalogs.' },
  ],
  ar: [
    { metric: 'معدل استخدام المزايا', industryAvg: '٦٢٪', topPerformers: '٧٨٪', insight: 'يحقق الأفضل أداءً استخداماً أعلى من خلال تواصل أفضل وتصميم برنامج محسن.' },
    { metric: 'التكلفة لكل موظف (سنوياً)', industryAvg: '٤٥,٠٠٠ درهم', topPerformers: '٥٢,٠٠٠ درهم', insight: 'الإنفاق الأعلى يرتبط باحتفاظ أفضل عند اقترانه بالتخصيص.' },
    { metric: 'معدل الإنفاق غير المستغل', industryAvg: '١٨٪', topPerformers: '٨٪', insight: 'الشركات الرائدة تراقب وتعيد تخصيص ميزانيات المزايا غير المستخدمة بنشاط.' },
    { metric: 'درجة رضا الموظفين', industryAvg: '٣.٦/٥', topPerformers: '٤.٣/٥', insight: 'الاختيار والمرونة يدفعان الرضا أكثر من إجمالي الإنفاق.' },
    { metric: 'وقت معالجة المطالبات', industryAvg: '٧ أيام', topPerformers: '٣ أيام', insight: 'معالجة المطالبات السريعة تؤثر بشكل كبير على تصور الموظف لقيمة المزايا.' },
    { metric: 'وصول تواصل المزايا', industryAvg: '٤٥٪', topPerformers: '٨٢٪', insight: 'استراتيجيات التواصل متعددة القنوات تحسن الوعي بشكل كبير.' },
    { metric: 'إكمال التسجيل المفتوح', industryAvg: '٧١٪', topPerformers: '٩٤٪', insight: 'عمليات التسجيل المبسطة ومشاركة المديرين تدفع معدلات الإكمال.' },
    { metric: 'تبني المزايا الطوعية', industryAvg: '٢٣٪', topPerformers: '٤١٪', insight: 'العروض الطوعية المنسقة والملائمة تتفوق على الكتالوجات الكبيرة.' },
  ]
};

const bestPractices = {
  en: [
    {
      category: 'Utilization Optimization',
      icon: TrendingUp,
      practices: [
        { title: 'Quarterly Utilization Reviews', description: 'Conduct quarterly analyses of benefit utilization by segment to identify underperforming areas early.' },
        { title: 'Personalized Nudges', description: 'Implement targeted communications to employees with low utilization, highlighting relevant unused benefits.' },
        { title: 'Manager Training', description: 'Train managers to discuss benefits during 1:1s and help team members maximize their allocations.' },
        { title: 'Simplify Access', description: 'Reduce friction in claiming processes. Each additional step decreases utilization by 5-10%.' },
      ]
    },
    {
      category: 'Cost Management',
      icon: DollarSign,
      practices: [
        { title: 'Tiered Benefits Structure', description: 'Offer tiered options allowing employees to choose coverage levels that match their needs and budget.' },
        { title: 'Vendor Consolidation', description: 'Consolidate vendors to negotiate better rates and simplify administration. Aim for 20-30% fewer vendors.' },
        { title: 'Preventive Care Incentives', description: 'Incentivize preventive care to reduce costly emergency claims. Every $1 in prevention saves $3-5 in treatment.' },
        { title: 'Regular Market Testing', description: 'Benchmark vendors annually and conduct RFPs every 3 years to ensure competitive pricing.' },
      ]
    },
    {
      category: 'Employee Engagement',
      icon: Users,
      practices: [
        { title: 'Multi-Channel Communication', description: 'Use email, mobile, manager cascades, and physical materials. Repetition across channels increases awareness by 40%.' },
        { title: 'Life Event Targeting', description: 'Trigger relevant benefit communications based on life events like marriage, childbirth, or home purchase.' },
        { title: 'Benefits Champions Program', description: 'Designate peer benefits ambassadors in each department to answer questions and promote programs.' },
        { title: 'Feedback Loops', description: 'Conduct pulse surveys after major benefits interactions to continuously improve the experience.' },
      ]
    },
    {
      category: 'Program Design',
      icon: Target,
      practices: [
        { title: 'Choice Architecture', description: 'Design defaults strategically. Opt-out enrollment increases participation by 30-50% over opt-in.' },
        { title: 'Segment-Based Design', description: 'Tailor offerings by employee segment (life stage, location, role) rather than one-size-fits-all.' },
        { title: 'Total Rewards Statements', description: 'Provide annual total rewards statements showing full compensation value. Increases perceived value by 20%.' },
        { title: 'Flexible Benefits Budget', description: 'Allow reallocation between benefit categories to accommodate diverse employee needs and preferences.' },
      ]
    },
  ],
  ar: [
    {
      category: 'تحسين الاستخدام',
      icon: TrendingUp,
      practices: [
        { title: 'مراجعات الاستخدام الربع سنوية', description: 'إجراء تحليلات ربع سنوية لاستخدام المزايا حسب الشريحة لتحديد المناطق ضعيفة الأداء مبكراً.' },
        { title: 'التنبيهات الشخصية', description: 'تنفيذ اتصالات مستهدفة للموظفين ذوي الاستخدام المنخفض، مع إبراز المزايا غير المستخدمة ذات الصلة.' },
        { title: 'تدريب المديرين', description: 'تدريب المديرين على مناقشة المزايا خلال الاجتماعات الفردية ومساعدة أعضاء الفريق على تعظيم مخصصاتهم.' },
        { title: 'تبسيط الوصول', description: 'تقليل الاحتكاك في عمليات المطالبة. كل خطوة إضافية تقلل الاستخدام بنسبة ٥-١٠٪.' },
      ]
    },
    {
      category: 'إدارة التكاليف',
      icon: DollarSign,
      practices: [
        { title: 'هيكل المزايا المتدرج', description: 'تقديم خيارات متدرجة تسمح للموظفين باختيار مستويات التغطية التي تتناسب مع احتياجاتهم وميزانيتهم.' },
        { title: 'توحيد الموردين', description: 'توحيد الموردين للتفاوض على أسعار أفضل وتبسيط الإدارة. استهدف عدد موردين أقل بنسبة ٢٠-٣٠٪.' },
        { title: 'حوافز الرعاية الوقائية', description: 'تحفيز الرعاية الوقائية لتقليل المطالبات المكلفة. كل درهم في الوقاية يوفر ٣-٥ دراهم في العلاج.' },
        { title: 'اختبار السوق المنتظم', description: 'قياس الموردين سنوياً وإجراء طلبات عروض كل ٣ سنوات لضمان أسعار تنافسية.' },
      ]
    },
    {
      category: 'مشاركة الموظفين',
      icon: Users,
      practices: [
        { title: 'التواصل متعدد القنوات', description: 'استخدم البريد الإلكتروني والجوال وتسلسل المديرين والمواد المادية. التكرار عبر القنوات يزيد الوعي بنسبة ٤٠٪.' },
        { title: 'الاستهداف حسب أحداث الحياة', description: 'إطلاق اتصالات المزايا ذات الصلة بناءً على أحداث الحياة مثل الزواج أو الولادة أو شراء المنزل.' },
        { title: 'برنامج أبطال المزايا', description: 'تعيين سفراء مزايا من الأقران في كل قسم للإجابة على الأسئلة والترويج للبرامج.' },
        { title: 'حلقات التغذية الراجعة', description: 'إجراء استطلاعات سريعة بعد تفاعلات المزايا الرئيسية لتحسين التجربة باستمرار.' },
      ]
    },
    {
      category: 'تصميم البرنامج',
      icon: Target,
      practices: [
        { title: 'هندسة الاختيار', description: 'تصميم الإعدادات الافتراضية بشكل استراتيجي. التسجيل بإلغاء الاشتراك يزيد المشاركة بنسبة ٣٠-٥٠٪.' },
        { title: 'التصميم القائم على الشريحة', description: 'تخصيص العروض حسب شريحة الموظف (مرحلة الحياة، الموقع، الدور) بدلاً من مقاس واحد يناسب الجميع.' },
        { title: 'بيانات المكافآت الإجمالية', description: 'تقديم بيانات سنوية للمكافآت الإجمالية توضح القيمة الكاملة للتعويض. تزيد القيمة المدركة بنسبة ٢٠٪.' },
        { title: 'ميزانية المزايا المرنة', description: 'السماح بإعادة التخصيص بين فئات المزايا لاستيعاب احتياجات وتفضيلات الموظفين المتنوعة.' },
      ]
    },
  ]
};

const strategies = {
  en: [
    {
      title: 'Reducing Zombie Spend',
      icon: AlertTriangle,
      problem: 'High percentage of allocated benefits going unused, representing wasted budget.',
      steps: [
        'Analyze utilization data by benefit category and employee segment',
        'Survey employees to understand barriers to utilization',
        'Simplify claims processes for underutilized benefits',
        'Implement targeted communication campaigns',
        'Consider reallocating budget to higher-value benefits',
        'Set quarterly utilization targets and monitor progress'
      ],
      expectedOutcome: 'Reduce zombie spend by 30-50% within 12 months'
    },
    {
      title: 'Improving Benefits Communication',
      icon: Users,
      problem: 'Low awareness of benefits leading to underutilization and low satisfaction scores.',
      steps: [
        'Audit current communication channels and effectiveness',
        'Develop persona-based communication strategies',
        'Create a content calendar aligned with employee life events',
        'Train managers as benefits ambassadors',
        'Implement a benefits mobile app or digital hub',
        'Measure awareness and adjust tactics quarterly'
      ],
      expectedOutcome: 'Increase benefits awareness from 45% to 80% within 6 months'
    },
    {
      title: 'Optimizing Insurance Costs',
      icon: DollarSign,
      problem: 'Rising insurance premiums threatening benefits budget sustainability.',
      steps: [
        'Analyze claims data to identify cost drivers',
        'Implement wellness programs targeting high-cost conditions',
        'Review network options and consider narrower networks for savings',
        'Introduce tiered coverage options',
        'Conduct competitive RFP every 2-3 years',
        'Consider self-insurance for larger organizations'
      ],
      expectedOutcome: 'Reduce insurance cost increases by 10-20% annually'
    },
    {
      title: 'Boosting Employee Engagement',
      icon: Award,
      problem: 'Benefits seen as entitlements rather than valuable compensation component.',
      steps: [
        'Launch annual total rewards statement program',
        'Create benefits success stories and testimonials',
        'Gamify benefits exploration and utilization',
        'Link benefits education to onboarding and life events',
        'Recognize employees who maximize their benefits',
        'Gather and act on continuous feedback'
      ],
      expectedOutcome: 'Improve benefits satisfaction scores by 25% within 12 months'
    },
  ],
  ar: [
    {
      title: 'تقليل الإنفاق غير المستغل',
      icon: AlertTriangle,
      problem: 'نسبة عالية من المزايا المخصصة غير مستخدمة، مما يمثل ميزانية مهدرة.',
      steps: [
        'تحليل بيانات الاستخدام حسب فئة المزايا وشريحة الموظف',
        'استطلاع الموظفين لفهم عوائق الاستخدام',
        'تبسيط عمليات المطالبة للمزايا غير المستغلة',
        'تنفيذ حملات تواصل مستهدفة',
        'النظر في إعادة تخصيص الميزانية لمزايا ذات قيمة أعلى',
        'وضع أهداف استخدام ربع سنوية ومراقبة التقدم'
      ],
      expectedOutcome: 'تقليل الإنفاق غير المستغل بنسبة ٣٠-٥٠٪ خلال ١٢ شهراً'
    },
    {
      title: 'تحسين تواصل المزايا',
      icon: Users,
      problem: 'انخفاض الوعي بالمزايا مما يؤدي إلى نقص الاستخدام وانخفاض درجات الرضا.',
      steps: [
        'تدقيق قنوات التواصل الحالية وفعاليتها',
        'تطوير استراتيجيات تواصل قائمة على الشخصيات',
        'إنشاء تقويم محتوى متوافق مع أحداث حياة الموظف',
        'تدريب المديرين كسفراء للمزايا',
        'تنفيذ تطبيق جوال أو مركز رقمي للمزايا',
        'قياس الوعي وتعديل التكتيكات ربع سنوياً'
      ],
      expectedOutcome: 'زيادة الوعي بالمزايا من ٤٥٪ إلى ٨٠٪ خلال ٦ أشهر'
    },
    {
      title: 'تحسين تكاليف التأمين',
      icon: DollarSign,
      problem: 'ارتفاع أقساط التأمين يهدد استدامة ميزانية المزايا.',
      steps: [
        'تحليل بيانات المطالبات لتحديد محركات التكلفة',
        'تنفيذ برامج صحية تستهدف الحالات عالية التكلفة',
        'مراجعة خيارات الشبكة والنظر في شبكات أضيق للتوفير',
        'تقديم خيارات تغطية متدرجة',
        'إجراء طلب عروض تنافسي كل ٢-٣ سنوات',
        'النظر في التأمين الذاتي للمؤسسات الأكبر'
      ],
      expectedOutcome: 'تقليل زيادات تكلفة التأمين بنسبة ١٠-٢٠٪ سنوياً'
    },
    {
      title: 'تعزيز مشاركة الموظفين',
      icon: Award,
      problem: 'يُنظر إلى المزايا كاستحقاقات بدلاً من مكون تعويض قيم.',
      steps: [
        'إطلاق برنامج بيان المكافآت الإجمالية السنوي',
        'إنشاء قصص نجاح وشهادات عن المزايا',
        'إضفاء طابع اللعب على استكشاف واستخدام المزايا',
        'ربط تعليم المزايا بالتوظيف وأحداث الحياة',
        'تقدير الموظفين الذين يعظمون مزاياهم',
        'جمع والعمل على التغذية الراجعة المستمرة'
      ],
      expectedOutcome: 'تحسين درجات رضا المزايا بنسبة ٢٥٪ خلال ١٢ شهراً'
    },
  ]
};

export default function EmployerKnowledgePage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (key: keyof typeof pageTranslations.en) => pageTranslations[language][key];
  
  const [searchQuery, setSearchQuery] = useState('');

  const terms = glossaryTerms[language];
  const benchmarkData = benchmarks[language];
  const practices = bestPractices[language];
  const strategyData = strategies[language];
  
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
          <TabsTrigger value="benchmarks">{t('tabBenchmarks')}</TabsTrigger>
          <TabsTrigger value="strategies">{t('tabStrategies')}</TabsTrigger>
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
                              <span className="text-xs text-muted-foreground">{t('relatedMetrics')}:</span>
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

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          <div className={cn("flex flex-col gap-2 mb-4", isRTL && "items-end")}>
            <h2 className="text-xl font-semibold">{t('benchmarksTitle')}</h2>
            <p className="text-muted-foreground">{t('benchmarksDesc')}</p>
          </div>
          
          <div className="grid gap-4">
            {benchmarkData.map((item, index) => (
              <Card key={index}>
                <CardContent className={cn("p-4", isRTL && "text-right")}>
                  <h4 className="font-semibold mb-3">{item.metric}</h4>
                  <div className={cn("grid md:grid-cols-3 gap-4 mb-3", isRTL && "direction-rtl")}>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{t('industryAvg')}</p>
                      <p className="text-lg font-bold">{item.industryAvg}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-center">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">{t('topPerformers')}</p>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{item.topPerformers}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 text-center">
                      <p className="text-xs text-primary mb-1">{t('yourOrg')}</p>
                      <p className="text-lg font-bold text-primary">--</p>
                    </div>
                  </div>
                  <div className={cn("flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20", isRTL && "flex-row-reverse")}>
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">{item.insight}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <div className={cn("flex flex-col gap-2 mb-4", isRTL && "items-end")}>
            <h2 className="text-xl font-semibold">{t('strategiesTitle')}</h2>
            <p className="text-muted-foreground">{t('strategiesDesc')}</p>
          </div>
          
          <div className="space-y-4">
            {strategyData.map((strategy, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <strategy.icon className="w-5 h-5 text-primary" />
                    </div>
                    {strategy.title}
                  </CardTitle>
                  <CardDescription className="text-base">{strategy.problem}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{t('actionItem')}</h4>
                      <ol className={cn("space-y-2", isRTL && "text-right")}>
                        {strategy.steps.map((step, i) => (
                          <li key={i} className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className={cn("flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20", isRTL && "flex-row-reverse")}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{strategy.expectedOutcome}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
