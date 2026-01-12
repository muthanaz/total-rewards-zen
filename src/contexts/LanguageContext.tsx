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
    'common.export': 'Export',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.employer': 'Employer',
    'common.employee': 'Employee',
    
    // Navigation - Employer
    'nav.overview': 'Overview',
    'nav.spendUtilization': 'Spend & Utilization',
    'nav.zombieSpend': 'Zombie Spend',
    'nav.employeeSegments': 'Employee Segments',
    'nav.claimsApprovals': 'Claims & Approvals',
    'nav.marketplaceAnalytics': 'Marketplace Analytics',
    'nav.policyInsights': 'Policy Insights',
    'nav.recommendations': 'Recommendations',
    
    // Navigation - Employee
    'nav.dashboard': 'Dashboard',
    'nav.myBenefits': 'My Benefits',
    'nav.housing': 'Housing',
    'nav.schooling': 'Schooling',
    'nav.healthInsurance': 'Health Insurance',
    'nav.transport': 'Transport & Mobility',
    'nav.wellbeing': 'Wellbeing Program',
    'nav.financial': 'Financial Planning',
    'nav.equity': 'Equity & Options',
    'nav.learning': 'Learning & Development',
    'nav.leave': 'Leave Management',
    'nav.marketplace': 'Marketplace',
    'nav.perks': 'Perks & Partners',
    'nav.services': 'Services',
    'nav.documents': 'HR Documents',
    'nav.govConnect': 'Gov Connect',
    'nav.account': 'Account',
    'nav.profile': 'Smart Profile',
    
    // Employer Dashboard
    'employer.dashboard.title': 'Employer Dashboard',
    'employer.dashboard.subtitle': 'Benefits program performance overview',
    'employer.dashboard.executiveSummary': 'Executive Summary',
    'employer.dashboard.keyInsights': 'Key Insights',
    'employer.dashboard.totalEmployees': 'Total Employees',
    'employer.dashboard.annualBudget': 'Annual Budget',
    'employer.dashboard.utilizationRate': 'Utilization Rate',
    'employer.dashboard.zombieSpend': 'Zombie Spend',
    'employer.dashboard.satisfaction': 'Satisfaction',
    'employer.dashboard.retention': 'Retention',
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
    'employer.dashboard.thisMonth': 'This Month',
    'employer.dashboard.vsLastMonth': 'vs last month',
    'employer.dashboard.vsLastYear': 'vs last year',
    
    // Language
    'language.english': 'English',
    'language.arabic': 'العربية',
  },
  ar: {
    // Common
    'common.signOut': 'تسجيل الخروج',
    'common.viewMore': 'عرض المزيد',
    'common.viewAll': 'عرض الكل',
    'common.export': 'تصدير',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.loading': 'جاري التحميل...',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.employer': 'صاحب العمل',
    'common.employee': 'الموظف',
    
    // Navigation - Employer
    'nav.overview': 'نظرة عامة',
    'nav.spendUtilization': 'الإنفاق والاستخدام',
    'nav.zombieSpend': 'الإنفاق غير المستغل',
    'nav.employeeSegments': 'شرائح الموظفين',
    'nav.claimsApprovals': 'المطالبات والموافقات',
    'nav.marketplaceAnalytics': 'تحليلات السوق',
    'nav.policyInsights': 'رؤى السياسات',
    'nav.recommendations': 'التوصيات',
    
    // Navigation - Employee
    'nav.dashboard': 'لوحة التحكم',
    'nav.myBenefits': 'مزاياي',
    'nav.housing': 'السكن',
    'nav.schooling': 'التعليم',
    'nav.healthInsurance': 'التأمين الصحي',
    'nav.transport': 'النقل والتنقل',
    'nav.wellbeing': 'برنامج الرفاهية',
    'nav.financial': 'التخطيط المالي',
    'nav.equity': 'الأسهم والخيارات',
    'nav.learning': 'التعلم والتطوير',
    'nav.leave': 'إدارة الإجازات',
    'nav.marketplace': 'السوق',
    'nav.perks': 'الامتيازات والشركاء',
    'nav.services': 'الخدمات',
    'nav.documents': 'مستندات الموارد البشرية',
    'nav.govConnect': 'الخدمات الحكومية',
    'nav.account': 'الحساب',
    'nav.profile': 'الملف الذكي',
    
    // Employer Dashboard
    'employer.dashboard.title': 'لوحة تحكم صاحب العمل',
    'employer.dashboard.subtitle': 'نظرة عامة على أداء برنامج المزايا',
    'employer.dashboard.executiveSummary': 'الملخص التنفيذي',
    'employer.dashboard.keyInsights': 'الرؤى الرئيسية',
    'employer.dashboard.totalEmployees': 'إجمالي الموظفين',
    'employer.dashboard.annualBudget': 'الميزانية السنوية',
    'employer.dashboard.utilizationRate': 'معدل الاستخدام',
    'employer.dashboard.zombieSpend': 'الإنفاق غير المستغل',
    'employer.dashboard.satisfaction': 'الرضا',
    'employer.dashboard.retention': 'الاحتفاظ',
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
    'employer.dashboard.thisMonth': 'هذا الشهر',
    'employer.dashboard.vsLastMonth': 'مقارنة بالشهر الماضي',
    'employer.dashboard.vsLastYear': 'مقارنة بالعام الماضي',
    
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
