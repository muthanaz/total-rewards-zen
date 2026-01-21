/**
 * Admin Empty State Component
 * Provides consistent empty state messaging across admin pages
 */

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Database, 
  Search, 
  Bell, 
  ShieldCheck, 
  FileText,
  Building2,
  Users,
  Plus,
  RefreshCw,
  Filter,
  LucideIcon
} from 'lucide-react';

interface EmptyStateProps {
  type: 'noData' | 'noResults' | 'noAlerts' | 'noViolations' | 'noConnectors' | 'noPolicies' | 'noOrgs' | 'noUsers';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateProps['type'], {
  icon: LucideIcon;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  defaultAction?: { en: string; ar: string };
}> = {
  noData: {
    icon: Database,
    title: { en: 'No data available', ar: 'لا توجد بيانات' },
    description: { en: 'Connect a data source to get started', ar: 'قم بتوصيل مصدر بيانات للبدء' },
    defaultAction: { en: 'Connect Source', ar: 'توصيل مصدر' },
  },
  noResults: {
    icon: Search,
    title: { en: 'No results found', ar: 'لم يتم العثور على نتائج' },
    description: { en: 'Try adjusting your filters or search terms', ar: 'حاول تعديل الفلاتر أو مصطلحات البحث' },
    defaultAction: { en: 'Clear Filters', ar: 'مسح الفلاتر' },
  },
  noAlerts: {
    icon: Bell,
    title: { en: 'All clear!', ar: 'كل شيء على ما يرام!' },
    description: { en: 'No alerts require your attention right now', ar: 'لا توجد تنبيهات تتطلب انتباهك الآن' },
  },
  noViolations: {
    icon: ShieldCheck,
    title: { en: 'No violations', ar: 'لا توجد مخالفات' },
    description: { en: 'All data quality rules are passing', ar: 'جميع قواعد جودة البيانات ناجحة' },
  },
  noConnectors: {
    icon: Database,
    title: { en: 'No connectors configured', ar: 'لا توجد موصلات مكونة' },
    description: { en: 'Connect your first data source to get started', ar: 'قم بتوصيل مصدر البيانات الأول للبدء' },
    defaultAction: { en: 'Connect Source', ar: 'توصيل مصدر' },
  },
  noPolicies: {
    icon: FileText,
    title: { en: 'No policies created', ar: 'لا توجد سياسات' },
    description: { en: 'Create your first policy to define organizational guidelines', ar: 'قم بإنشاء أول سياسة لتحديد إرشادات المنظمة' },
    defaultAction: { en: 'Create Policy', ar: 'إنشاء سياسة' },
  },
  noOrgs: {
    icon: Building2,
    title: { en: 'No organizations yet', ar: 'لا توجد منظمات بعد' },
    description: { en: 'Add your first organization to get started', ar: 'أضف أول منظمة للبدء' },
    defaultAction: { en: 'Add Organization', ar: 'إضافة منظمة' },
  },
  noUsers: {
    icon: Users,
    title: { en: 'No users found', ar: 'لم يتم العثور على مستخدمين' },
    description: { en: 'Invite users to join the platform', ar: 'قم بدعوة المستخدمين للانضمام للمنصة' },
    defaultAction: { en: 'Invite User', ar: 'دعوة مستخدم' },
  },
};

export function AdminEmptyState({ 
  type, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;
  
  const displayTitle = title || (language === 'ar' ? config.title.ar : config.title.en);
  const displayDescription = description || (language === 'ar' ? config.description.ar : config.description.en);
  const defaultActionLabel = config.defaultAction 
    ? (language === 'ar' ? config.defaultAction.ar : config.defaultAction.en)
    : null;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      isRTL && "text-right",
      className
    )}>
      <div className="p-4 rounded-full bg-muted/50 mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="font-medium text-lg">{displayTitle}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        {displayDescription}
      </p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.icon ? <action.icon className="w-4 h-4 me-2" /> : <Plus className="w-4 h-4 me-2" />}
          {action.label}
        </Button>
      )}
      {!action && defaultActionLabel && (
        <p className="text-xs text-muted-foreground mt-4 opacity-70">
          {type === 'noResults' 
            ? (language === 'ar' ? 'حاول تعديل معايير البحث' : 'Try adjusting your search criteria')
            : ''
          }
        </p>
      )}
    </div>
  );
}
