// Language Context - Provides i18n support with RTL
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'common.signOut': 'Sign Out',
    'common.viewMore': 'View More',
    'common.viewAll': 'View All',
    'common.seeAll': 'See All',
    'common.export': 'Export',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.employer': 'Employer',
    'common.employee': 'Employee',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.approve': 'Approve',
    'common.reject': 'Reject',
    'common.pending': 'Pending',
    'common.approved': 'Approved',
    'common.rejected': 'Rejected',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.total': 'Total',
    'common.utilized': 'Utilized',
    'common.remaining': 'Remaining',
    'common.available': 'Available',
    'common.annual': 'Annual',
    'common.monthly': 'Monthly',
    'common.daily': 'Daily',
    'common.days': 'days',
    'common.percentage': '%',
    'common.clickToView': 'Click to view details',
    
    // Navigation - Employer
    'nav.overview': 'Overview',
    'nav.spendUtilization': 'Spend & Utilization',
    'nav.zombieSpend': 'Zombie Spend',
    'nav.employeeSegments': 'Employee Segments',
    'nav.claimsApprovals': 'Claims & Approvals',
    'nav.marketplaceAnalytics': 'Marketplace Analytics',
    'nav.policyInsights': 'Policy Insights',
    'nav.integrations': 'Integrations & Data',
    'nav.recommendations': 'Recommendations',
    
    // Navigation Groups
    'nav.group.overview': 'Overview',
    'nav.group.operations': 'Operations',
    'nav.group.financials': 'Financials',
    'nav.group.analytics': 'Analytics & Insights',
    'nav.group.settings': 'Settings',
    
    // Navigation - Employee
    'nav.dashboard': 'Dashboard',
    'nav.benefitsAnalysis': 'Benefits Analysis',
    'nav.allowances': 'Allowances',
    'nav.healthWellbeing': 'Health & Wellbeing',
    'nav.financialRewards': 'Financial & Rewards',
    'nav.leave': 'Leave',
    'nav.leaves': 'Leaves',
    'nav.learningDevelopment': 'Learning',
    'nav.documentsClaims': 'HR & Requests',
    'nav.hrRequests': 'HR & Requests',
    'nav.hrServices': 'HR & Services',
    'nav.hrDocuments': 'HR Documents',
    'nav.hrClaims': 'HR & Claims',
    'nav.claimsRequests': 'Claims & Requests',
    'nav.housing': 'Housing',
    'nav.schooling': 'Schooling',
    'nav.healthInsurance': 'Health Insurance',
    'nav.transport': 'Transport & Mobility',
    'nav.wellbeing': 'Wellbeing Program',
    'nav.financial': 'Financial Planning',
    'nav.equity': 'Equity & Options',
    'nav.learning': 'Learning & Development',
    'nav.leaveManagement': 'Leave Management',
    'nav.marketplace': 'Marketplace',
    'nav.perks': 'Perks & Partners',
    'nav.perksPartners': 'Perks & Partners',
    'nav.documents': 'Documents',
    'nav.govConnect': 'Gov Connect',
    'nav.knowledgeHub': 'Knowledge Hub',
    'nav.knowledgeCenter': 'Knowledge Center',
    'nav.account': 'Account',
    'nav.profile': 'Smart Profile',
    'nav.security': 'Security & Privacy',
    'nav.allBenefits': 'All Benefits',
    'nav.servicesSupport': 'Services & Support',
    'nav.benefitDetails': 'Benefit Details',
    'nav.bonus': 'Annual Bonus',
    'nav.health': 'Health Insurance',
    'nav.timeOff': 'Time Off',
    'nav.myBenefits': 'My Benefits',
    
    // Employee Dashboard
    'employee.dashboard.title': 'Dashboard Overview',
    'employee.dashboard.subtitle': 'Your total rewards at a glance',
    'employee.dashboard.monthlySalary': 'Monthly Salary',
    'employee.dashboard.annualSalary': 'Annual Salary',
    'employee.dashboard.annualBenefits': 'Annual Benefits',
    'employee.dashboard.utilization': 'Utilization',
    'employee.dashboard.leaveBalance': 'Leave Balance',
    'employee.dashboard.activatedPerks': 'Activated Perks',
    'employee.dashboard.benefitHighlights': 'Benefit Highlights',
    'employee.dashboard.fullyUtilized': 'Fully Utilized',
    'employee.dashboard.roomToUse': 'Room to Use',
    'employee.dashboard.thisMonth': 'This Month',
    'employee.dashboard.yourBenefits': 'Your Benefits',
    'employee.dashboard.utilizationByType': 'Utilization by Benefit Type',
    'employee.dashboard.overallUsage': 'Overall Benefits Usage',
    'employee.dashboard.benefitComparison': 'Benefit Comparison',
    'employee.dashboard.yourUtilization': 'Your Utilization',
    'employee.dashboard.companyAvg': 'Company Avg',
    'employee.dashboard.requestClaim': 'Request & Claims',
    'employee.dashboard.benefitsAt100': 'benefits at 100%',
    'employee.dashboard.benefitsWithRemaining': 'benefits with remaining allocation',
    'employee.dashboard.perkActivations': 'perk activations',
    'employee.dashboard.claimsApproved': 'claims approved',
    'employee.dashboard.clickBarDetails': 'Click any bar to see detailed breakdown',
    'employee.dashboard.used': 'Used',
    'employee.dashboard.remaining': 'Rem',
    
    // Benefit Types (legacy)
    'benefit.cash_allowances': 'Cash & Allowances',
    'benefit.health_protection': 'Health & Protection',
    'benefit.time_off_flex': 'Time Off & Flex',
    'benefit.growth_career': 'Growth & Career',
    'benefit.wealth_ownership': 'Wealth & Ownership',
    
    // Benefits - Unified naming (use these consistently across all pages)
    'benefit.housing': 'Housing Allowance',
    'benefit.education': 'Education Allowance',
    'benefit.health': 'Health Insurance',
    'benefit.transport': 'Transport & Mobility',
    'benefit.bonus': 'Annual Bonus',
    'benefit.financial': 'Financial Planning',
    'benefit.wellbeing': 'Wellbeing Program',
    'benefit.learning': 'Learning & Development',
    'benefit.equity': 'Equity & Options',
    'benefit.leave': 'Leave Management',
    
    // Navigation additions
    'nav.annualBonus': 'Annual Bonus',
    
    // Employer Dashboard
    'employer.dashboard.title': 'Executive Dashboard',
    'employer.dashboard.subtitle': 'Benefits program performance overview',
    'employer.dashboard.executiveSummary': 'Executive Summary',
    'employer.dashboard.keyInsights': 'Key Insights This Month',
    'employer.dashboard.totalEmployees': 'Total Employees',
    'employer.dashboard.annualBudget': 'Annual Budget',
    'employer.dashboard.utilizationRate': 'Utilization Rate',
    'employer.dashboard.zombieSpend': 'Zombie Spend',
    'employer.dashboard.satisfaction': 'Satisfaction Score',
    'employer.dashboard.retention': 'Retention Rate',
    'employer.dashboard.pendingClaims': 'Pending Claims',
    'employer.dashboard.roiIndicator': 'ROI Indicator',
    'employer.dashboard.utilizationTrend': 'Utilization Trend',
    'employer.dashboard.spendByType': 'Spend by Benefit Type',
    'employer.dashboard.segmentComparison': 'Segment Comparison',
    'employer.dashboard.cumulativeSpend': 'Cumulative Spend Tracking',
    'employer.dashboard.topUtilized': 'Top Utilized Benefits',
    'employer.dashboard.leastUtilized': 'Least Utilized Benefits',
    'employer.dashboard.zombieCandidates': 'Zombie Spend Candidates',
    'employer.dashboard.viewFullAnalysis': 'View Full Analysis',
    'employer.dashboard.actionRequired': 'Action Required',
    'employer.dashboard.performingWell': 'Performing Well',
    'employer.dashboard.needsAttention': 'Needs Attention',
    'employer.dashboard.vsLastMonth': 'vs last month',
    'employer.dashboard.vsLastYear': 'vs last year',
    'employer.dashboard.ytd': 'YTD',
    'employer.dashboard.target': 'Target',
    'employer.dashboard.avgProcessingDays': 'avg processing days',
    'employer.dashboard.benchmarkAbove': 'above benchmark',
    'employer.dashboard.ofTarget': 'of target',
    'employer.dashboard.atRisk': 'at risk',
    'employer.dashboard.newThisMonth': 'new this month',
    'employer.dashboard.recoverable': 'recoverable',
    'employer.dashboard.awaitingReview': 'awaiting review',
    
    // Insights
    'insight.utilizationUp': 'Utilization up 5% this month',
    'insight.zombieDecreased': 'Zombie spend decreased by AED 45K',
    'insight.healthUnderutilized': 'Health benefits underutilized by 23%',
    'insight.topPerforming': 'Housing benefit is top performing',
    
    // Actions
    'action.viewDetails': 'View Details',
    'action.download': 'Download',
    'action.export': 'Export',
    'action.refresh': 'Refresh',
    
    // Time
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.thisWeek': 'This Week',
    'time.thisMonth': 'This Month',
    'time.lastMonth': 'Last Month',
    'time.thisYear': 'This Year',
    'time.custom': 'Custom Range',
    
    // Language
    'language.english': 'English',
    'language.arabic': 'العربية',
  },
  ar: {
    // Common
    'common.signOut': 'تسجيل الخروج',
    'common.viewMore': 'عرض المزيد',
    'common.viewAll': 'عرض الكل',
    'common.seeAll': 'عرض الكل',
    'common.export': 'تصدير',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.loading': 'جاري التحميل...',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.employer': 'صاحب العمل',
    'common.employee': 'الموظف',
    'common.close': 'إغلاق',
    'common.submit': 'إرسال',
    'common.approve': 'موافقة',
    'common.reject': 'رفض',
    'common.pending': 'قيد الانتظار',
    'common.approved': 'تمت الموافقة',
    'common.rejected': 'مرفوض',
    'common.active': 'نشط',
    'common.inactive': 'غير نشط',
    'common.total': 'الإجمالي',
    'common.utilized': 'المستخدم',
    'common.remaining': 'المتبقي',
    'common.available': 'المتاح',
    'common.annual': 'سنوي',
    'common.monthly': 'شهري',
    'common.daily': 'يومي',
    'common.days': 'أيام',
    'common.percentage': '٪',
    'common.clickToView': 'اضغط لعرض التفاصيل',
    
    // Navigation - Employer
    'nav.overview': 'نظرة عامة',
    'nav.spendUtilization': 'الإنفاق والاستخدام',
    'nav.zombieSpend': 'الإنفاق غير المستغل',
    'nav.employeeSegments': 'شرائح الموظفين',
    'nav.claimsApprovals': 'المطالبات والموافقات',
    'nav.marketplaceAnalytics': 'تحليلات السوق',
    'nav.policyInsights': 'رؤى السياسات',
    'nav.integrations': 'التكاملات والبيانات',
    'nav.recommendations': 'التوصيات',
    
    // Navigation Groups
    'nav.group.overview': 'نظرة عامة',
    'nav.group.operations': 'العمليات',
    'nav.group.financials': 'المالية',
    'nav.group.analytics': 'التحليلات والرؤى',
    'nav.group.settings': 'الإعدادات',
    
    // Navigation - Employee
    'nav.dashboard': 'لوحة التحكم',
    'nav.benefitsAnalysis': 'تحليل المزايا',
    'nav.allowances': 'البدلات',
    'nav.healthWellbeing': 'الصحة والرفاهية',
    'nav.financialRewards': 'المالية والمكافآت',
    'nav.leave': 'الإجازات',
    'nav.leaves': 'الإجازات',
    'nav.learningDevelopment': 'التعلم',
    'nav.documentsClaims': 'الموارد البشرية والطلبات',
    'nav.hrRequests': 'الموارد البشرية والطلبات',
    'nav.hrServices': 'الموارد البشرية والخدمات',
    'nav.hrDocuments': 'مستندات الموارد البشرية',
    'nav.hrClaims': 'الموارد البشرية والمطالبات',
    'nav.claimsRequests': 'المطالبات والطلبات',
    'nav.housing': 'السكن',
    'nav.schooling': 'التعليم',
    'nav.healthInsurance': 'التأمين الصحي',
    'nav.transport': 'النقل والتنقل',
    'nav.wellbeing': 'برنامج الرفاهية',
    'nav.financial': 'التخطيط المالي',
    'nav.equity': 'الأسهم والخيارات',
    'nav.learning': 'التعلم والتطوير',
    'nav.leaveManagement': 'إدارة الإجازات',
    'nav.marketplace': 'السوق',
    'nav.perks': 'الامتيازات والشركاء',
    'nav.perksPartners': 'الامتيازات والشركاء',
    'nav.documents': 'المستندات والمطالبات',
    'nav.govConnect': 'الخدمات الحكومية',
    'nav.knowledgeHub': 'مركز المعرفة',
    'nav.knowledgeCenter': 'مركز المعرفة',
    'nav.account': 'الحساب',
    'nav.profile': 'الملف الذكي',
    'nav.security': 'الأمان والخصوصية',
    'nav.allBenefits': 'جميع المزايا',
    'nav.servicesSupport': 'الخدمات والدعم',
    'nav.benefitDetails': 'تفاصيل المزايا',
    'nav.bonus': 'المكافأة السنوية',
    'nav.health': 'التأمين الصحي',
    'nav.timeOff': 'الإجازات',
    'nav.myBenefits': 'مزاياي',
    
    // Employee Dashboard
    'employee.dashboard.title': 'نظرة عامة على لوحة التحكم',
    'employee.dashboard.subtitle': 'إجمالي مكافآتك في لمحة واحدة',
    'employee.dashboard.monthlySalary': 'الراتب الشهري',
    'employee.dashboard.annualSalary': 'الراتب السنوي',
    'employee.dashboard.annualBenefits': 'المزايا السنوية',
    'employee.dashboard.utilization': 'نسبة الاستخدام',
    'employee.dashboard.leaveBalance': 'رصيد الإجازات',
    'employee.dashboard.activatedPerks': 'الامتيازات المفعّلة',
    'employee.dashboard.benefitHighlights': 'أبرز المزايا',
    'employee.dashboard.fullyUtilized': 'مستخدمة بالكامل',
    'employee.dashboard.roomToUse': 'متاح للاستخدام',
    'employee.dashboard.thisMonth': 'هذا الشهر',
    'employee.dashboard.yourBenefits': 'مزاياك',
    'employee.dashboard.utilizationByType': 'الاستخدام حسب نوع المزايا',
    'employee.dashboard.overallUsage': 'إجمالي استخدام المزايا',
    'employee.dashboard.benefitComparison': 'مقارنة المزايا',
    'employee.dashboard.yourUtilization': 'استخدامك',
    'employee.dashboard.companyAvg': 'متوسط الشركة',
    'employee.dashboard.requestClaim': 'الطلبات والمطالبات',
    'employee.dashboard.benefitsAt100': 'مزايا بنسبة ١٠٠٪',
    'employee.dashboard.benefitsWithRemaining': 'مزايا مع رصيد متبقي',
    'employee.dashboard.perkActivations': 'تفعيلات الامتيازات',
    'employee.dashboard.claimsApproved': 'مطالبات تمت الموافقة عليها',
    'employee.dashboard.clickBarDetails': 'اضغط على أي شريط لعرض التفاصيل',
    'employee.dashboard.used': 'المستخدم',
    'employee.dashboard.remaining': 'المتبقي',
    
    // Benefit Types (legacy)
    'benefit.cash_allowances': 'البدلات النقدية',
    'benefit.health_protection': 'الصحة والحماية',
    'benefit.time_off_flex': 'الإجازات والمرونة',
    'benefit.growth_career': 'النمو والمسار المهني',
    'benefit.wealth_ownership': 'الثروة والملكية',
    
    // Benefits - Unified naming (use these consistently across all pages)
    'benefit.housing': 'بدل السكن',
    'benefit.education': 'بدل التعليم',
    'benefit.health': 'التأمين الصحي',
    'benefit.transport': 'النقل والتنقل',
    'benefit.bonus': 'المكافأة السنوية',
    'benefit.financial': 'التخطيط المالي',
    'benefit.wellbeing': 'برنامج الرفاهية',
    'benefit.learning': 'التعلم والتطوير',
    'benefit.equity': 'الأسهم والخيارات',
    'benefit.leave': 'إدارة الإجازات',
    
    // Navigation additions
    'nav.annualBonus': 'المكافأة السنوية',
    
    // Employer Dashboard
    'employer.dashboard.title': 'لوحة التحكم التنفيذية',
    'employer.dashboard.subtitle': 'نظرة عامة على أداء برنامج المزايا',
    'employer.dashboard.executiveSummary': 'الملخص التنفيذي',
    'employer.dashboard.keyInsights': 'الرؤى الرئيسية لهذا الشهر',
    'employer.dashboard.totalEmployees': 'إجمالي الموظفين',
    'employer.dashboard.annualBudget': 'الميزانية السنوية',
    'employer.dashboard.utilizationRate': 'معدل الاستخدام',
    'employer.dashboard.zombieSpend': 'الإنفاق غير المستغل',
    'employer.dashboard.satisfaction': 'درجة الرضا',
    'employer.dashboard.retention': 'معدل الاحتفاظ',
    'employer.dashboard.pendingClaims': 'المطالبات المعلقة',
    'employer.dashboard.roiIndicator': 'مؤشر العائد على الاستثمار',
    'employer.dashboard.utilizationTrend': 'اتجاه الاستخدام',
    'employer.dashboard.spendByType': 'الإنفاق حسب نوع المزايا',
    'employer.dashboard.segmentComparison': 'مقارنة الشرائح',
    'employer.dashboard.cumulativeSpend': 'تتبع الإنفاق التراكمي',
    'employer.dashboard.topUtilized': 'أكثر المزايا استخداماً',
    'employer.dashboard.leastUtilized': 'أقل المزايا استخداماً',
    'employer.dashboard.zombieCandidates': 'مرشحو الإنفاق غير المستغل',
    'employer.dashboard.viewFullAnalysis': 'عرض التحليل الكامل',
    'employer.dashboard.actionRequired': 'إجراء مطلوب',
    'employer.dashboard.performingWell': 'أداء جيد',
    'employer.dashboard.needsAttention': 'يحتاج انتباه',
    'employer.dashboard.vsLastMonth': 'مقارنة بالشهر الماضي',
    'employer.dashboard.vsLastYear': 'مقارنة بالعام الماضي',
    'employer.dashboard.ytd': 'منذ بداية العام',
    'employer.dashboard.target': 'المستهدف',
    'employer.dashboard.avgProcessingDays': 'متوسط أيام المعالجة',
    'employer.dashboard.benchmarkAbove': 'أعلى من المعيار',
    'employer.dashboard.ofTarget': 'من المستهدف',
    'employer.dashboard.atRisk': 'معرضون للخطر',
    'employer.dashboard.newThisMonth': 'جديد هذا الشهر',
    'employer.dashboard.recoverable': 'قابل للاسترداد',
    'employer.dashboard.awaitingReview': 'في انتظار المراجعة',
    
    // Insights
    'insight.utilizationUp': 'ارتفاع الاستخدام بنسبة ٥٪ هذا الشهر',
    'insight.zombieDecreased': 'انخفض الإنفاق غير المستغل بمقدار ٤٥ ألف درهم',
    'insight.healthUnderutilized': 'المزايا الصحية أقل استخداماً بنسبة ٢٣٪',
    'insight.topPerforming': 'بدل السكن هو الأفضل أداءً',
    
    // Actions
    'action.viewDetails': 'عرض التفاصيل',
    'action.download': 'تحميل',
    'action.export': 'تصدير',
    'action.refresh': 'تحديث',
    
    // Time
    'time.today': 'اليوم',
    'time.yesterday': 'أمس',
    'time.thisWeek': 'هذا الأسبوع',
    'time.thisMonth': 'هذا الشهر',
    'time.lastMonth': 'الشهر الماضي',
    'time.thisYear': 'هذا العام',
    'time.custom': 'نطاق مخصص',
    
    // Language
    'language.english': 'English',
    'language.arabic': 'العربية',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bnft-language');
    return (saved as Language) || 'en';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('bnft-language', language);
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
    
    if (language === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
