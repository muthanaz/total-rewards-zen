/**
 * ZeroState - Portal-specific empty states with next-best-action CTAs
 * 
 * Provides meaningful, action-oriented empty states for every major page.
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, Search, Package, Users, Building2, ShoppingBag,
  ClipboardList, TrendingUp, Settings, Bell, Shield, Database,
  CreditCard, Calendar, Heart, Home, GraduationCap, Car,
  Briefcase, PieChart, BarChart3, FileCheck, Sparkles,
  type LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type Portal = 'employee' | 'employer' | 'admin' | 'vendor';

type EmployeePage = 'claims' | 'requests' | 'benefits' | 'marketplace' | 'documents' | 
                    'housing' | 'health' | 'education' | 'transport' | 'wellbeing' | 'leave';
type EmployerPage = 'claims' | 'policies' | 'analytics' | 'integrations' | 'segments' | 
                    'recommendations' | 'marketplace' | 'spend' | 'zombie';
type AdminPage = 'organizations' | 'users' | 'vendors' | 'offers' | 'alerts' | 
                 'reports' | 'sync' | 'policies' | 'moderation' | 'datasources';
type VendorPage = 'offers' | 'redemptions' | 'earnings' | 'analytics';

type PageType = EmployeePage | EmployerPage | AdminPage | VendorPage;

interface ZeroStateConfig {
  icon: LucideIcon;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  actionLabel: string;
  actionLabelAr: string;
  actionLink?: string;
  iconBg: string;
  iconColor: string;
}

const zeroStateConfigs: Record<Portal, Partial<Record<PageType, ZeroStateConfig>>> = {
  employee: {
    claims: {
      icon: FileText,
      title: 'No claims yet',
      titleAr: 'لا توجد مطالبات بعد',
      description: 'Submit your first claim to get reimbursed for eligible expenses.',
      descriptionAr: 'قدم مطالبتك الأولى للحصول على تعويض عن النفقات المؤهلة.',
      actionLabel: 'Browse Benefits',
      actionLabelAr: 'تصفح المزايا',
      actionLink: '/employee/benefits',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    requests: {
      icon: ClipboardList,
      title: 'No pending requests',
      titleAr: 'لا توجد طلبات معلقة',
      description: 'All your benefit requests and approvals will appear here.',
      descriptionAr: 'ستظهر جميع طلبات المزايا والموافقات هنا.',
      actionLabel: 'Make a Request',
      actionLabelAr: 'تقديم طلب',
      actionLink: '/employee/benefits',
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    benefits: {
      icon: Package,
      title: 'Benefits coming soon',
      titleAr: 'المزايا قريباً',
      description: 'Your employer is setting up your benefits package. Check back soon!',
      descriptionAr: 'يقوم صاحب العمل بإعداد حزمة المزايا الخاصة بك. تحقق مرة أخرى قريباً!',
      actionLabel: 'View Dashboard',
      actionLabelAr: 'عرض لوحة التحكم',
      actionLink: '/employee/dashboard',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    marketplace: {
      icon: ShoppingBag,
      title: 'Marketplace launching soon',
      titleAr: 'السوق قريباً',
      description: 'Exclusive discounts and offers from partner vendors are on the way.',
      descriptionAr: 'الخصومات والعروض الحصرية من الموردين الشركاء في الطريق.',
      actionLabel: 'Request an Offer',
      actionLabelAr: 'طلب عرض',
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
    },
    documents: {
      icon: FileCheck,
      title: 'No documents yet',
      titleAr: 'لا توجد مستندات بعد',
      description: 'Your benefit letters and official documents will appear here.',
      descriptionAr: 'ستظهر خطابات المزايا والمستندات الرسمية هنا.',
      actionLabel: 'Generate Letter',
      actionLabelAr: 'إنشاء خطاب',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    housing: {
      icon: Home,
      title: 'Housing benefit available',
      titleAr: 'بدل السكن متاح',
      description: 'Learn about your housing allowance and how to use it.',
      descriptionAr: 'تعرف على بدل السكن الخاص بك وكيفية استخدامه.',
      actionLabel: 'View Details',
      actionLabelAr: 'عرض التفاصيل',
      iconBg: 'bg-chart-4/10',
      iconColor: 'text-chart-4',
    },
    health: {
      icon: Heart,
      title: 'Healthcare coverage active',
      titleAr: 'التغطية الصحية نشطة',
      description: 'View your medical insurance details and find providers.',
      descriptionAr: 'عرض تفاصيل التأمين الطبي والعثور على مقدمي الخدمات.',
      actionLabel: 'View Coverage',
      actionLabelAr: 'عرض التغطية',
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
    education: {
      icon: GraduationCap,
      title: 'Education support',
      titleAr: 'دعم التعليم',
      description: 'Explore tuition assistance and professional development benefits.',
      descriptionAr: 'استكشف المساعدة الدراسية ومزايا التطوير المهني.',
      actionLabel: 'Learn More',
      actionLabelAr: 'اعرف المزيد',
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
    },
    transport: {
      icon: Car,
      title: 'Transport allowance',
      titleAr: 'بدل النقل',
      description: 'Manage your transportation benefits and vehicle allowances.',
      descriptionAr: 'إدارة مزايا النقل وبدلات المركبات.',
      actionLabel: 'View Details',
      actionLabelAr: 'عرض التفاصيل',
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    wellbeing: {
      icon: Sparkles,
      title: 'Wellbeing programs',
      titleAr: 'برامج الرفاهية',
      description: 'Discover wellness benefits and mental health resources.',
      descriptionAr: 'اكتشف مزايا الصحة وموارد الصحة النفسية.',
      actionLabel: 'Explore',
      actionLabelAr: 'استكشاف',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    leave: {
      icon: Calendar,
      title: 'Leave management',
      titleAr: 'إدارة الإجازات',
      description: 'View your leave balance and request time off.',
      descriptionAr: 'عرض رصيد إجازتك وطلب إجازة.',
      actionLabel: 'Check Balance',
      actionLabelAr: 'التحقق من الرصيد',
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
    },
  },
  employer: {
    claims: {
      icon: FileCheck,
      title: 'All caught up!',
      titleAr: 'تم الانتهاء من الكل!',
      description: 'No pending claims to review. New submissions will appear here.',
      descriptionAr: 'لا توجد مطالبات معلقة للمراجعة. ستظهر الطلبات الجديدة هنا.',
      actionLabel: 'View Analytics',
      actionLabelAr: 'عرض التحليلات',
      actionLink: '/employer/dashboard',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    policies: {
      icon: Shield,
      title: 'No policies yet',
      titleAr: 'لا توجد سياسات بعد',
      description: 'Create your first policy to define benefit rules and eligibility.',
      descriptionAr: 'أنشئ سياستك الأولى لتحديد قواعد المزايا والأهلية.',
      actionLabel: 'Create Policy',
      actionLabelAr: 'إنشاء سياسة',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    analytics: {
      icon: BarChart3,
      title: 'Analytics loading',
      titleAr: 'جارٍ تحميل التحليلات',
      description: 'Connect your data sources to see insights and trends.',
      descriptionAr: 'قم بتوصيل مصادر البيانات لمشاهدة الرؤى والاتجاهات.',
      actionLabel: 'Setup Integrations',
      actionLabelAr: 'إعداد التكاملات',
      actionLink: '/employer/integrations',
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
    },
    integrations: {
      icon: Database,
      title: 'No integrations connected',
      titleAr: 'لا توجد تكاملات متصلة',
      description: 'Connect your HRMS or payroll system for automatic data sync.',
      descriptionAr: 'قم بتوصيل نظام الموارد البشرية أو الرواتب للمزامنة التلقائية.',
      actionLabel: 'Add Integration',
      actionLabelAr: 'إضافة تكامل',
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    segments: {
      icon: Users,
      title: 'Segment analysis',
      titleAr: 'تحليل الشرائح',
      description: 'View employee segments once data is connected.',
      descriptionAr: 'عرض شرائح الموظفين بمجرد توصيل البيانات.',
      actionLabel: 'Connect Data',
      actionLabelAr: 'توصيل البيانات',
      actionLink: '/employer/integrations',
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
    },
    recommendations: {
      icon: Sparkles,
      title: 'Recommendations incoming',
      titleAr: 'التوصيات قادمة',
      description: 'System-generated suggestions will appear once we analyze your data.',
      descriptionAr: 'ستظهر الاقتراحات المولدة من النظام بمجرد تحليل بياناتك.',
      actionLabel: 'View Dashboard',
      actionLabelAr: 'عرض لوحة التحكم',
      actionLink: '/employer/dashboard',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    marketplace: {
      icon: ShoppingBag,
      title: 'Marketplace insights',
      titleAr: 'رؤى السوق',
      description: 'Track employee engagement with marketplace offers.',
      descriptionAr: 'تتبع تفاعل الموظفين مع عروض السوق.',
      actionLabel: 'Enable Marketplace',
      actionLabelAr: 'تفعيل السوق',
      iconBg: 'bg-chart-5/10',
      iconColor: 'text-chart-5',
    },
    spend: {
      icon: PieChart,
      title: 'Spend analytics',
      titleAr: 'تحليلات الإنفاق',
      description: 'Connect benefit data to see spending patterns.',
      descriptionAr: 'قم بتوصيل بيانات المزايا لرؤية أنماط الإنفاق.',
      actionLabel: 'Setup Data',
      actionLabelAr: 'إعداد البيانات',
      actionLink: '/employer/integrations',
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
    },
    zombie: {
      icon: TrendingUp,
      title: 'No budget leakage detected',
      titleAr: 'لم يتم اكتشاف تسرب في الميزانية',
      description: 'Good news! All benefits are being utilized effectively.',
      descriptionAr: 'أخبار جيدة! يتم استخدام جميع المزايا بفعالية.',
      actionLabel: 'View Utilization',
      actionLabelAr: 'عرض الاستخدام',
      actionLink: '/employer/spend',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
  },
  admin: {
    organizations: {
      icon: Building2,
      title: 'No organizations yet',
      titleAr: 'لا توجد مؤسسات بعد',
      description: 'Add your first organization to start managing benefits.',
      descriptionAr: 'أضف مؤسستك الأولى لبدء إدارة المزايا.',
      actionLabel: 'Add Organization',
      actionLabelAr: 'إضافة مؤسسة',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    users: {
      icon: Users,
      title: 'No users found',
      titleAr: 'لم يتم العثور على مستخدمين',
      description: 'Users will appear once organizations are set up.',
      descriptionAr: 'سيظهر المستخدمون بمجرد إعداد المؤسسات.',
      actionLabel: 'View Organizations',
      actionLabelAr: 'عرض المؤسسات',
      actionLink: '/admin/organizations',
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    vendors: {
      icon: Briefcase,
      title: 'No vendors registered',
      titleAr: 'لا يوجد موردون مسجلون',
      description: 'Invite vendors to join the marketplace.',
      descriptionAr: 'قم بدعوة الموردين للانضمام إلى السوق.',
      actionLabel: 'Invite Vendor',
      actionLabelAr: 'دعوة مورد',
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
    },
    offers: {
      icon: ShoppingBag,
      title: 'No offers submitted',
      titleAr: 'لم يتم تقديم عروض',
      description: 'Vendor offers pending approval will appear here.',
      descriptionAr: 'ستظهر عروض الموردين المعلقة للموافقة هنا.',
      actionLabel: 'Manage Vendors',
      actionLabelAr: 'إدارة الموردين',
      actionLink: '/admin/vendors',
      iconBg: 'bg-chart-4/10',
      iconColor: 'text-chart-4',
    },
    alerts: {
      icon: Bell,
      title: 'No active alerts',
      titleAr: 'لا توجد تنبيهات نشطة',
      description: 'System alerts and notifications will appear here.',
      descriptionAr: 'ستظهر تنبيهات النظام والإشعارات هنا.',
      actionLabel: 'View Settings',
      actionLabelAr: 'عرض الإعدادات',
      actionLink: '/admin/settings',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    reports: {
      icon: FileText,
      title: 'No saved reports',
      titleAr: 'لا توجد تقارير محفوظة',
      description: 'Save reports from analytics pages for quick access.',
      descriptionAr: 'احفظ التقارير من صفحات التحليلات للوصول السريع.',
      actionLabel: 'Create Report',
      actionLabelAr: 'إنشاء تقرير',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    sync: {
      icon: Database,
      title: 'No sync activity',
      titleAr: 'لا يوجد نشاط مزامنة',
      description: 'Data sync status from connected integrations.',
      descriptionAr: 'حالة مزامنة البيانات من التكاملات المتصلة.',
      actionLabel: 'View Data Sources',
      actionLabelAr: 'عرض مصادر البيانات',
      actionLink: '/admin/data-sources',
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    policies: {
      icon: Shield,
      title: 'Policy library empty',
      titleAr: 'مكتبة السياسات فارغة',
      description: 'Upload policy templates for organizations to use.',
      descriptionAr: 'قم بتحميل قوالب السياسات للمؤسسات لاستخدامها.',
      actionLabel: 'Upload Template',
      actionLabelAr: 'تحميل قالب',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    moderation: {
      icon: FileCheck,
      title: 'Queue is clear',
      titleAr: 'قائمة الانتظار فارغة',
      description: 'No items pending moderation. Great work!',
      descriptionAr: 'لا توجد عناصر في انتظار المراجعة. عمل رائع!',
      actionLabel: 'View History',
      actionLabelAr: 'عرض السجل',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    datasources: {
      icon: Database,
      title: 'No data sources configured',
      titleAr: 'لا توجد مصادر بيانات مكونة',
      description: 'Configure data sources for organizations to connect.',
      descriptionAr: 'قم بتكوين مصادر البيانات للمؤسسات للاتصال.',
      actionLabel: 'Add Data Source',
      actionLabelAr: 'إضافة مصدر بيانات',
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
    },
  },
  vendor: {
    offers: {
      icon: ShoppingBag,
      title: 'No offers created',
      titleAr: 'لم يتم إنشاء عروض',
      description: 'Create your first offer to reach employees.',
      descriptionAr: 'أنشئ عرضك الأول للوصول إلى الموظفين.',
      actionLabel: 'Create Offer',
      actionLabelAr: 'إنشاء عرض',
      actionLink: '/vendor/create-offer',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    redemptions: {
      icon: CreditCard,
      title: 'No redemptions yet',
      titleAr: 'لا توجد عمليات استرداد بعد',
      description: 'Employee redemptions will appear here once your offers go live.',
      descriptionAr: 'ستظهر عمليات استرداد الموظفين هنا بمجرد نشر عروضك.',
      actionLabel: 'View Offers',
      actionLabelAr: 'عرض العروض',
      actionLink: '/vendor/offers',
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    earnings: {
      icon: TrendingUp,
      title: 'No earnings yet',
      titleAr: 'لا توجد أرباح بعد',
      description: 'Your earnings and payouts will be tracked here.',
      descriptionAr: 'سيتم تتبع أرباحك ومدفوعاتك هنا.',
      actionLabel: 'Create Offer',
      actionLabelAr: 'إنشاء عرض',
      actionLink: '/vendor/create-offer',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    analytics: {
      icon: BarChart3,
      title: 'Analytics coming soon',
      titleAr: 'التحليلات قريباً',
      description: 'Performance insights will appear once you have active offers.',
      descriptionAr: 'ستظهر رؤى الأداء بمجرد أن يكون لديك عروض نشطة.',
      actionLabel: 'Create Offer',
      actionLabelAr: 'إنشاء عرض',
      actionLink: '/vendor/create-offer',
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
    },
  },
};

interface ZeroStateProps {
  portal: Portal;
  page: PageType;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

export function ZeroState({ 
  portal, 
  page, 
  onAction, 
  className,
  children 
}: ZeroStateProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const config = zeroStateConfigs[portal]?.[page];
  
  if (!config) {
    return (
      <div className={cn('text-center py-16 text-muted-foreground', className)}>
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{isArabic ? 'لا توجد بيانات' : 'No data available'}</p>
      </div>
    );
  }

  const Icon = config.icon;
  const title = isArabic ? config.titleAr : config.title;
  const description = isArabic ? config.descriptionAr : config.description;
  const actionLabel = isArabic ? config.actionLabelAr : config.actionLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
          config.iconBg
        )}
      >
        <Icon className={cn('w-8 h-8', config.iconColor)} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-lg font-display font-semibold text-foreground mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground max-w-sm mb-6"
      >
        {description}
      </motion.p>

      {children}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {config.actionLink ? (
          <Button asChild>
            <Link to={config.actionLink}>{actionLabel}</Link>
          </Button>
        ) : onAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

// Pre-built zero states for common scenarios
export function EmployeeZeroState({ page, onAction }: { page: EmployeePage; onAction?: () => void }) {
  return <ZeroState portal="employee" page={page} onAction={onAction} />;
}

export function EmployerZeroState({ page, onAction }: { page: EmployerPage; onAction?: () => void }) {
  return <ZeroState portal="employer" page={page} onAction={onAction} />;
}

export function AdminZeroState({ page, onAction }: { page: AdminPage; onAction?: () => void }) {
  return <ZeroState portal="admin" page={page} onAction={onAction} />;
}

export function VendorZeroState({ page, onAction }: { page: VendorPage; onAction?: () => void }) {
  return <ZeroState portal="vendor" page={page} onAction={onAction} />;
}
