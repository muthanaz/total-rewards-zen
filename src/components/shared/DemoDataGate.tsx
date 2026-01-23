/**
 * DemoDataGate
 * 
 * Gates mock/demo data behind demo mode.
 * Shows ZeroState in non-demo mode, demo content in demo mode.
 */

import { useDemoMode } from '@/contexts/DemoModeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Settings, 
  Link2, 
  PlayCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface DemoDataGateProps {
  /** Content to show when demo mode is active */
  children: React.ReactNode;
  /** Type of data this component displays */
  dataType: 'integration' | 'reports' | 'vendors' | 'claims' | 'cards' | 'generic';
  /** Custom title for zero state */
  title?: string;
  /** Custom description for zero state */
  description?: string;
  /** Action to take (e.g., navigate to integrations) */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Show a compact inline version */
  compact?: boolean;
  /** Custom icon */
  icon?: React.ElementType;
  /** Bypass and always show children (for when real data exists) */
  hasRealData?: boolean;
}

const DATA_TYPE_CONFIG: Record<string, {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ElementType;
  actionLabel: string;
  actionLabelAr: string;
}> = {
  integration: {
    title: 'No Data Sources Connected',
    titleAr: 'لا توجد مصادر بيانات متصلة',
    description: 'Connect your HRIS, payroll, or benefits system to see real data here.',
    descriptionAr: 'قم بتوصيل نظام الموارد البشرية أو الرواتب أو المزايا لرؤية البيانات الحقيقية هنا.',
    icon: Link2,
    actionLabel: 'Connect Data Source',
    actionLabelAr: 'توصيل مصدر البيانات',
  },
  reports: {
    title: 'No Saved Reports',
    titleAr: 'لا توجد تقارير محفوظة',
    description: 'Save your first report from the analytics dashboard to access it here.',
    descriptionAr: 'احفظ تقريرك الأول من لوحة التحليلات للوصول إليه هنا.',
    icon: Database,
    actionLabel: 'Go to Analytics',
    actionLabelAr: 'الذهاب إلى التحليلات',
  },
  vendors: {
    title: 'No Vendor Data',
    titleAr: 'لا توجد بيانات للموردين',
    description: 'Vendor performance data will appear once marketplace integrations are active.',
    descriptionAr: 'ستظهر بيانات أداء الموردين بمجرد تفعيل تكاملات السوق.',
    icon: Settings,
    actionLabel: 'Configure Marketplace',
    actionLabelAr: 'تكوين السوق',
  },
  claims: {
    title: 'No Claims Data',
    titleAr: 'لا توجد بيانات مطالبات',
    description: 'Claims analytics require integration with your claims processing system.',
    descriptionAr: 'تتطلب تحليلات المطالبات التكامل مع نظام معالجة المطالبات.',
    icon: Database,
    actionLabel: 'Setup Claims Integration',
    actionLabelAr: 'إعداد تكامل المطالبات',
  },
  cards: {
    title: 'Link Your Cards',
    titleAr: 'اربط بطاقاتك',
    description: 'Link your bank cards to unlock exclusive benefits and offers.',
    descriptionAr: 'اربط بطاقاتك المصرفية لفتح المزايا والعروض الحصرية.',
    icon: Link2,
    actionLabel: 'Link a Card',
    actionLabelAr: 'ربط بطاقة',
  },
  generic: {
    title: 'No Data Available',
    titleAr: 'لا توجد بيانات متاحة',
    description: 'This section requires configuration or data integration.',
    descriptionAr: 'يتطلب هذا القسم التكوين أو تكامل البيانات.',
    icon: Info,
    actionLabel: 'Configure',
    actionLabelAr: 'تكوين',
  },
};

export function DemoDataGate({
  children,
  dataType,
  title,
  description,
  action,
  compact = false,
  icon,
  hasRealData = false,
}: DemoDataGateProps) {
  const { isDemoMode } = useDemoMode();
  const { language } = useLanguage();
  
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  // If real data exists, always show children
  if (hasRealData) {
    return <>{children}</>;
  }
  
  // In demo mode, show the demo content
  if (isDemoMode) {
    return <>{children}</>;
  }
  
  // In non-demo mode, show zero state
  const config = DATA_TYPE_CONFIG[dataType];
  const Icon = icon || config.icon;
  const displayTitle = title || t(config.title, config.titleAr);
  const displayDescription = description || t(config.description, config.descriptionAr);
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed bg-muted/30">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">{displayTitle}</p>
          <p className="text-xs text-muted-foreground">{displayDescription}</p>
        </div>
        {action && (
          <Button size="sm" variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{displayTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          {displayDescription}
        </p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * DemoModeBadge - Shows when demo mode is active
 * Place this prominently to indicate demo data
 */
export function DemoModeBadge({ className }: { className?: string }) {
  const { isDemoMode } = useDemoMode();
  const { language } = useLanguage();
  
  if (!isDemoMode) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1.5 bg-accent/10 text-accent border-accent/30 font-medium',
        className
      )}
    >
      <PlayCircle className="w-3 h-3" />
      {language === 'ar' ? 'وضع العرض التوضيحي' : 'Demo Mode'}
    </Badge>
  );
}

/**
 * Hook to get demo-aware data
 * Returns demo data in demo mode, empty/null in production
 */
export function useDemoData<T>(demoData: T, realData: T | null | undefined): T | null {
  const { isDemoMode } = useDemoMode();
  
  // If real data exists, always use it
  if (realData !== null && realData !== undefined) {
    return realData;
  }
  
  // If in demo mode, return demo data
  if (isDemoMode) {
    return demoData;
  }
  
  // In production with no real data, return null
  return null;
}

export default DemoDataGate;
