/**
 * Page Breadcrumbs Component
 * 
 * Context-aware breadcrumbs for deep pages.
 * Automatically builds trail from current route.
 */

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreadcrumbItem {
  label: string;
  labelAr?: string;
  path: string;
  icon?: React.ElementType;
}

interface PageBreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route label mappings for automatic breadcrumb generation
const ROUTE_LABELS: Record<string, { en: string; ar: string }> = {
  // Employee routes
  employee: { en: 'Dashboard', ar: 'لوحة التحكم' },
  'my-actions': { en: 'My Actions', ar: 'إجراءاتي' },
  benefits: { en: 'Benefits', ar: 'المزايا' },
  housing: { en: 'Housing', ar: 'السكن' },
  schooling: { en: 'Education', ar: 'التعليم' },
  health: { en: 'Health', ar: 'الصحة' },
  transport: { en: 'Transport', ar: 'النقل' },
  wellbeing: { en: 'Wellbeing', ar: 'الرفاهية' },
  learning: { en: 'Learning', ar: 'التعلم' },
  'long-term-financials': { en: 'Financials', ar: 'الشؤون المالية' },
  financial: { en: 'Financial', ar: 'المالية' },
  claims: { en: 'Claims', ar: 'المطالبات' },
  documents: { en: 'Documents', ar: 'المستندات' },
  leave: { en: 'Leave', ar: 'الإجازات' },
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  marketplace: { en: 'Marketplace', ar: 'السوق' },
  'gov-connect': { en: 'Gov Connect', ar: 'الخدمات الحكومية' },
  
  // Employer routes
  employer: { en: 'Dashboard', ar: 'لوحة التحكم' },
  spend: { en: 'Spend Analytics', ar: 'تحليلات الإنفاق' },
  zombie: { en: 'Zombie Spend', ar: 'الإنفاق الخامل' },
  segments: { en: 'Segments', ar: 'الشرائح' },
  policies: { en: 'Policies', ar: 'السياسات' },
  recommendations: { en: 'Recommendations', ar: 'التوصيات' },
  integrations: { en: 'Integrations', ar: 'التكاملات' },
  
  // Admin routes
  admin: { en: 'Dashboard', ar: 'لوحة التحكم' },
  organizations: { en: 'Organizations', ar: 'المنظمات' },
  users: { en: 'Users & Roles', ar: 'المستخدمون' },
  audit: { en: 'Audit Logs', ar: 'سجلات التدقيق' },
  vendors: { en: 'Vendors', ar: 'البائعون' },
  templates: { en: 'Templates', ar: 'القوالب' },
  onboarding: { en: 'Onboarding', ar: 'الإعداد' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  
  // Vendor routes
  vendor: { en: 'Dashboard', ar: 'لوحة التحكم' },
  offers: { en: 'Offers', ar: 'العروض' },
  performance: { en: 'Performance', ar: 'الأداء' },
};

// Get portal name from path
function getPortalInfo(path: string): { name: string; nameAr: string; icon: React.ElementType } {
  if (path.startsWith('/admin')) return { name: 'Admin', nameAr: 'المشرف', icon: LayoutDashboard };
  if (path.startsWith('/employer')) return { name: 'Employer', nameAr: 'صاحب العمل', icon: LayoutDashboard };
  if (path.startsWith('/vendor')) return { name: 'Vendor', nameAr: 'البائع', icon: LayoutDashboard };
  return { name: 'Employee', nameAr: 'الموظف', icon: Home };
}

export function PageBreadcrumbs({ items, className, showHome = true }: PageBreadcrumbsProps) {
  const location = useLocation();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  // Build breadcrumbs from current path if items not provided
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const labels = ROUTE_LABELS[segment];
      
      // Skip UUID-like segments
      if (segment.match(/^[0-9a-f-]{36}$/i)) {
        return;
      }

      result.push({
        label: labels?.en || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        labelAr: labels?.ar,
        path: currentPath,
      });
    });

    return result;
  })();

  // Don't show breadcrumbs on root portal pages
  if (breadcrumbs.length <= 1) {
    return null;
  }

  const portalInfo = getPortalInfo(location.pathname);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-1.5 text-sm text-muted-foreground mb-4',
        isRTL && 'flex-row-reverse',
        className
      )}
    >
      {showHome && (
        <>
          <Link
            to={`/${location.pathname.split('/')[1]}`}
            className={cn(
              'flex items-center gap-1 hover:text-foreground transition-colors',
              isRTL && 'flex-row-reverse'
            )}
          >
            <portalInfo.icon className="w-3.5 h-3.5" />
            <span className="sr-only">{t(portalInfo.name, portalInfo.nameAr)}</span>
          </Link>
          <ChevronRight className={cn('w-3.5 h-3.5 text-muted-foreground/50', isRTL && 'rotate-180')} />
        </>
      )}

      {breadcrumbs.slice(1).map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 2;

        return (
          <div key={crumb.path} className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
            {isLast ? (
              <span className="font-medium text-foreground">
                {t(crumb.label, crumb.labelAr)}
              </span>
            ) : (
              <>
                <Link
                  to={crumb.path}
                  className="hover:text-foreground transition-colors"
                >
                  {t(crumb.label, crumb.labelAr)}
                </Link>
                <ChevronRight className={cn('w-3.5 h-3.5 text-muted-foreground/50', isRTL && 'rotate-180')} />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
