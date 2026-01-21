/**
 * Admin Portal i18n Keys
 * Language + Formatting Spec v1.0
 * 
 * Arabic Glossary (Locked Terms):
 * - مصادر البيانات = Data Sources
 * - موصل = Connector
 * - مزامنة = Sync
 * - تشغيل المزامنة = Sync Run
 * - جودة البيانات = Data Quality
 * - قاعدة تحقق = Validation Rule
 * - مخالفة = Violation
 * - مركز التنبيهات = Alerts Center
 * - سياسة = Policy
 * - إقرار بالاطلاع = Acknowledgement
 * - ضمّ المورّد = Vendor Onboarding
 * - اتفاقية مستوى الخدمة = SLA (Service Level Agreement)
 * - اعرف نشاطك التجاري = KYB (Know Your Business)
 */

export const ADMIN_I18N = {
  // ============= PAGE TITLES =============
  pages: {
    dataSources: { en: 'Data Sources', ar: 'مصادر البيانات' },
    syncMonitor: { en: 'Sync Monitor', ar: 'مراقبة المزامنة' },
    dataQualityRules: { en: 'Data Quality Rules', ar: 'قواعد جودة البيانات' },
    alertsCenter: { en: 'Alerts Center', ar: 'مركز التنبيهات' },
    policyLibrary: { en: 'Policy Library', ar: 'مكتبة السياسات' },
    organizations: { en: 'Organizations', ar: 'المنظمات' },
    usersRoles: { en: 'Users & Roles', ar: 'المستخدمون والأدوار' },
    billing: { en: 'Plans & Invoices', ar: 'الخطط والفواتير' },
  },

  // ============= COMMON ACTIONS =============
  actions: {
    syncNow: { en: 'Sync Now', ar: 'مزامنة الآن' },
    retry: { en: 'Retry', ar: 'إعادة المحاولة' },
    details: { en: 'Details', ar: 'التفاصيل' },
    viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
    acknowledge: { en: 'Acknowledge', ar: 'إقرار' },
    snooze: { en: 'Snooze', ar: 'تأجيل' },
    resolve: { en: 'Resolve', ar: 'حل' },
    assign: { en: 'Assign', ar: 'تعيين' },
    escalate: { en: 'Escalate', ar: 'تصعيد' },
    export: { en: 'Export', ar: 'تصدير' },
    refresh: { en: 'Refresh', ar: 'تحديث' },
    create: { en: 'Create', ar: 'إنشاء' },
    edit: { en: 'Edit', ar: 'تعديل' },
    delete: { en: 'Delete', ar: 'حذف' },
    save: { en: 'Save', ar: 'حفظ' },
    cancel: { en: 'Cancel', ar: 'إلغاء' },
    close: { en: 'Close', ar: 'إغلاق' },
    filter: { en: 'Filter', ar: 'تصفية' },
    search: { en: 'Search', ar: 'بحث' },
    download: { en: 'Download', ar: 'تنزيل' },
    upload: { en: 'Upload', ar: 'رفع' },
    testConnection: { en: 'Test Connection', ar: 'اختبار الاتصال' },
    mapFields: { en: 'Map Fields', ar: 'ربط الحقول' },
    viewRunbook: { en: 'View Runbook', ar: 'عرض دليل التشغيل' },
    sendReminder: { en: 'Send Reminder', ar: 'إرسال تذكير' },
  },

  // ============= COMMON LABELS =============
  labels: {
    connector: { en: 'Connector', ar: 'موصل' },
    sync: { en: 'Sync', ar: 'مزامنة' },
    syncRun: { en: 'Sync Run', ar: 'تشغيل المزامنة' },
    dataQuality: { en: 'Data Quality', ar: 'جودة البيانات' },
    validationRule: { en: 'Validation Rule', ar: 'قاعدة تحقق' },
    violation: { en: 'Violation', ar: 'مخالفة' },
    policy: { en: 'Policy', ar: 'سياسة' },
    acknowledgement: { en: 'Acknowledgement', ar: 'إقرار بالاطلاع' },
    vendorOnboarding: { en: 'Vendor Onboarding', ar: 'ضمّ المورّد' },
    sla: { en: 'SLA', ar: 'اتفاقية مستوى الخدمة' },
    kyb: { en: 'KYB', ar: 'اعرف نشاطك التجاري' },
    organization: { en: 'Organization', ar: 'المنظمة' },
    status: { en: 'Status', ar: 'الحالة' },
    severity: { en: 'Severity', ar: 'الخطورة' },
    owner: { en: 'Owner', ar: 'المالك' },
    assignee: { en: 'Assignee', ar: 'المُعين إليه' },
    createdAt: { en: 'Created At', ar: 'تاريخ الإنشاء' },
    updatedAt: { en: 'Updated At', ar: 'تاريخ التحديث' },
    lastSync: { en: 'Last Sync', ar: 'آخر مزامنة' },
    nextSync: { en: 'Next Sync', ar: 'المزامنة التالية' },
    records: { en: 'Records', ar: 'السجلات' },
    errors: { en: 'Errors', ar: 'الأخطاء' },
    duration: { en: 'Duration', ar: 'المدة' },
    coverage: { en: 'Coverage', ar: 'التغطية' },
    health: { en: 'Health', ar: 'الصحة' },
    timeline: { en: 'Timeline', ar: 'الجدول الزمني' },
    activity: { en: 'Activity', ar: 'النشاط' },
    rootCause: { en: 'Root Cause', ar: 'السبب الجذري' },
    impact: { en: 'Impact', ar: 'التأثير' },
    affectedOrgs: { en: 'Affected Organizations', ar: 'المنظمات المتأثرة' },
    recommendedActions: { en: 'Recommended Actions', ar: 'الإجراءات الموصى بها' },
    linkedObjects: { en: 'Linked Objects', ar: 'العناصر المرتبطة' },
  },

  // ============= METRICS =============
  metrics: {
    connectedSources: { en: 'Connected Sources', ar: 'المصادر المتصلة' },
    avgHealth: { en: 'Avg Health', ar: 'متوسط الصحة' },
    totalRecords: { en: 'Total Records', ar: 'إجمالي السجلات' },
    runsToday: { en: 'Runs Today', ar: 'التشغيلات اليوم' },
    failedRuns: { en: 'Failed Runs', ar: 'التشغيلات الفاشلة' },
    avgDuration: { en: 'Avg Duration', ar: 'متوسط المدة' },
    activeRules: { en: 'Active Rules', ar: 'القواعد النشطة' },
    openViolations: { en: 'Open Violations', ar: 'المخالفات المفتوحة' },
    criticalIssues: { en: 'Critical Issues', ar: 'المشاكل الحرجة' },
    openAlerts: { en: 'Open Alerts', ar: 'التنبيهات المفتوحة' },
    resolvedToday: { en: 'Resolved Today', ar: 'تم حلها اليوم' },
    mrr: { en: 'Monthly Revenue (MRR)', ar: 'الإيرادات الشهرية' },
    arr: { en: 'Annual Revenue (ARR)', ar: 'الإيرادات السنوية' },
    churnRate: { en: 'Churn Rate', ar: 'معدل التسرب' },
    dso: { en: 'Avg DSO', ar: 'متوسط أيام التحصيل' },
    overdueAmount: { en: 'Overdue Amount', ar: 'المبلغ المتأخر' },
    collectionRate: { en: 'Collection Rate', ar: 'معدل التحصيل' },
    totalPolicies: { en: 'Total Policies', ar: 'إجمالي السياسات' },
    publishedPolicies: { en: 'Published', ar: 'منشورة' },
    draftPolicies: { en: 'Drafts', ar: 'مسودات' },
    expiringPolicies: { en: 'Expiring in 30 days', ar: 'تنتهي خلال 30 يوم' },
    avgAcknowledgement: { en: 'Avg Acknowledgement', ar: 'متوسط الإقرار' },
  },

  // ============= SEVERITY LABELS =============
  severity: {
    critical: { en: 'Critical', ar: 'حرج' },
    high: { en: 'High', ar: 'عالي' },
    medium: { en: 'Medium', ar: 'متوسط' },
    low: { en: 'Low', ar: 'منخفض' },
  },

  // ============= RUN STATUS LABELS =============
  runStatus: {
    success: { en: 'Success', ar: 'نجاح' },
    running: { en: 'Running', ar: 'قيد التشغيل' },
    partial: { en: 'Partial', ar: 'جزئي' },
    failed: { en: 'Failed', ar: 'فشل' },
    pending: { en: 'Pending', ar: 'معلق' },
  },

  // ============= TIME LABELS =============
  time: {
    justNow: { en: 'Just now', ar: 'الآن' },
    minutesAgo: { en: 'minutes ago', ar: 'دقائق مضت' },
    hoursAgo: { en: 'hours ago', ar: 'ساعات مضت' },
    daysAgo: { en: 'days ago', ar: 'أيام مضت' },
    today: { en: 'Today', ar: 'اليوم' },
    yesterday: { en: 'Yesterday', ar: 'أمس' },
    thisWeek: { en: 'This week', ar: 'هذا الأسبوع' },
    lastWeek: { en: 'Last week', ar: 'الأسبوع الماضي' },
  },

  // ============= EMPTY STATES =============
  empty: {
    noData: { en: 'No data available', ar: 'لا توجد بيانات' },
    noResults: { en: 'No results found', ar: 'لم يتم العثور على نتائج' },
    noAlerts: { en: 'All clear!', ar: 'كل شيء على ما يرام!' },
    noViolations: { en: 'No violations', ar: 'لا توجد مخالفات' },
    noConnectors: { en: 'No connectors configured', ar: 'لا توجد موصلات مكونة' },
    noPolicies: { en: 'No policies created', ar: 'لا توجد سياسات' },
  },

  // ============= ERROR MESSAGES =============
  errors: {
    connectionFailed: { en: 'Connection failed', ar: 'فشل الاتصال' },
    syncFailed: { en: 'Sync failed', ar: 'فشلت المزامنة' },
    validationFailed: { en: 'Validation failed', ar: 'فشل التحقق' },
    authFailed: { en: 'Authentication failed', ar: 'فشلت المصادقة' },
    timeout: { en: 'Request timed out', ar: 'انتهت مهلة الطلب' },
    rateLimited: { en: 'Rate limit exceeded', ar: 'تم تجاوز حد المعدل' },
  },
} as const;

/**
 * Helper function to get translated string
 */
export function t(key: { en: string; ar: string }, language: 'en' | 'ar'): string {
  return language === 'ar' ? key.ar : key.en;
}

/**
 * Helper function to create a translator for a specific language
 */
export function createTranslator(language: 'en' | 'ar') {
  return (key: { en: string; ar: string }): string => {
    return language === 'ar' ? key.ar : key.en;
  };
}
