/**
 * Employer Setup Checklist Types
 */

export type SetupStepStatus = 'not_started' | 'in_progress' | 'done';

export interface SetupStep {
  id: string;
  order: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  whyItMatters: string;
  whyItMattersAr?: string;
  ctaLabel: string;
  ctaLabelAr?: string;
  ctaPath: string;
  expectedMinutes?: number;
  status: SetupStepStatus;
  isGated?: boolean;
  gateConditions?: string[];
}

export interface SetupProgress {
  completedSteps: number;
  totalSteps: number;
  percentComplete: number;
  isGoLiveReady: boolean;
  goLiveBlockers: string[];
}

export const SETUP_STEPS: Omit<SetupStep, 'status'>[] = [
  {
    id: 'org_structure',
    order: 1,
    title: 'Organization Structure',
    titleAr: 'الهيكل التنظيمي',
    description: 'Define legal entities, business units, departments, grades, and locations.',
    descriptionAr: 'حدد الكيانات القانونية ووحدات الأعمال والأقسام والدرجات والمواقع.',
    whyItMatters: 'Enables accurate employee segmentation and policy targeting.',
    whyItMattersAr: 'يتيح التقسيم الدقيق للموظفين واستهداف السياسات.',
    ctaLabel: 'Configure Structure',
    ctaLabelAr: 'تكوين الهيكل',
    ctaPath: '/employer/settings/org-structure',
    expectedMinutes: 15,
  },
  {
    id: 'upload_employees',
    order: 2,
    title: 'Upload Employees',
    titleAr: 'رفع الموظفين',
    description: 'Import your employee roster with grades, departments, and employment details.',
    descriptionAr: 'استيراد قائمة الموظفين مع الدرجات والأقسام وتفاصيل التوظيف.',
    whyItMatters: 'Employees need profiles to access benefits and submit claims.',
    whyItMattersAr: 'يحتاج الموظفون إلى ملفات تعريف للوصول إلى المزايا وتقديم المطالبات.',
    ctaLabel: 'Upload Roster',
    ctaLabelAr: 'رفع القائمة',
    ctaPath: '/employer/employees',
    expectedMinutes: 10,
  },
  {
    id: 'publish_policies',
    order: 3,
    title: 'Publish Policies',
    titleAr: 'نشر السياسات',
    description: 'Configure and publish at least one benefit policy for your organization.',
    descriptionAr: 'تكوين ونشر سياسة مزايا واحدة على الأقل لمنظمتك.',
    whyItMatters: 'Policies define what employees can claim and their entitlements.',
    whyItMattersAr: 'تحدد السياسات ما يمكن للموظفين المطالبة به واستحقاقاتهم.',
    ctaLabel: 'Manage Policies',
    ctaLabelAr: 'إدارة السياسات',
    ctaPath: '/employer/policies',
    expectedMinutes: 30,
  },
  {
    id: 'configure_workflows',
    order: 4,
    title: 'Configure Workflows & Approvers',
    titleAr: 'تكوين سير العمل والموافقين',
    description: 'Set up approval workflows and assign approver groups for claims processing.',
    descriptionAr: 'إعداد سير عمل الموافقة وتعيين مجموعات الموافقين لمعالجة المطالبات.',
    whyItMatters: 'Ensures claims follow proper governance and approval chains.',
    whyItMattersAr: 'يضمن اتباع المطالبات للحوكمة المناسبة وسلاسل الموافقة.',
    ctaLabel: 'Setup Workflows',
    ctaLabelAr: 'إعداد سير العمل',
    ctaPath: '/employer/settings/workflows',
    expectedMinutes: 20,
  },
  {
    id: 'validate_data',
    order: 5,
    title: 'Validate Data Quality',
    titleAr: 'التحقق من جودة البيانات',
    description: 'Run data quality checks to ensure employee records are complete and accurate.',
    descriptionAr: 'إجراء فحوصات جودة البيانات للتأكد من اكتمال سجلات الموظفين ودقتها.',
    whyItMatters: 'Incomplete data causes claim rejections and employee frustration.',
    whyItMattersAr: 'البيانات غير المكتملة تسبب رفض المطالبات وإحباط الموظفين.',
    ctaLabel: 'Check Data Quality',
    ctaLabelAr: 'فحص جودة البيانات',
    ctaPath: '/employer/data-controls',
    expectedMinutes: 10,
  },
  {
    id: 'test_claims',
    order: 6,
    title: 'Run Test Claims',
    titleAr: 'تشغيل مطالبات تجريبية',
    description: 'Process at least one test claim end-to-end to validate the full workflow.',
    descriptionAr: 'معالجة مطالبة تجريبية واحدة على الأقل من البداية إلى النهاية للتحقق من سير العمل.',
    whyItMatters: 'Validates that policies, approvals, and settlements work correctly.',
    whyItMattersAr: 'يتحقق من أن السياسات والموافقات والتسويات تعمل بشكل صحيح.',
    ctaLabel: 'Go to Operations',
    ctaLabelAr: 'الذهاب إلى العمليات',
    ctaPath: '/employer/ops',
    expectedMinutes: 15,
  },
  {
    id: 'configure_settlements',
    order: 7,
    title: 'Configure Settlements',
    titleAr: 'تكوين التسويات',
    description: 'Set up payment methods, bank integrations, and settlement batching rules.',
    descriptionAr: 'إعداد طرق الدفع وتكامل البنوك وقواعد تجميع التسويات.',
    whyItMatters: 'Employees expect timely reimbursements through proper channels.',
    whyItMattersAr: 'يتوقع الموظفون استردادات في الوقت المناسب عبر القنوات المناسبة.',
    ctaLabel: 'Setup Settlements',
    ctaLabelAr: 'إعداد التسويات',
    ctaPath: '/employer/settlements',
    expectedMinutes: 15,
  },
  {
    id: 'go_live',
    order: 8,
    title: 'Go-Live Readiness',
    titleAr: 'جاهزية الإطلاق',
    description: 'Final review of all configurations before enabling employee access.',
    descriptionAr: 'مراجعة نهائية لجميع التكوينات قبل تمكين وصول الموظفين.',
    whyItMatters: 'Ensures a smooth launch with no surprises for employees or HR.',
    whyItMattersAr: 'يضمن إطلاقاً سلساً بدون مفاجآت للموظفين أو الموارد البشرية.',
    ctaLabel: 'Review & Launch',
    ctaLabelAr: 'مراجعة وإطلاق',
    ctaPath: '/employer/setup',
    expectedMinutes: 5,
    isGated: true,
    gateConditions: [
      'Data quality compliance >= 80%',
      'At least 1 policy published',
      'At least 1 workflow active',
      'At least 1 test claim processed',
    ],
  },
];
