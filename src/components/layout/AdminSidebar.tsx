import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Store,
  Tag,
  ShieldCheck,
  FileText,
  Shield,
  Database,
  AlertTriangle,
  Sliders,
  ToggleLeft,
  CreditCard,
  ClipboardList,
  Server,
  BarChart3,
  TrendingUp,
  Wallet,
  BookOpen,
  Activity,
  UserPlus,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DemoModeToggle } from '@/components/demo';
import {
  SidebarShell,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
} from './sidebar';

// ============================================================================
// NAVIGATION DATA
// ============================================================================

interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  isBeta?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  labelAr: string;
  items: NavItem[];
  defaultOpen?: boolean;
  isBeta?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    id: 'command-center',
    label: 'Command Center',
    labelAr: 'مركز القيادة',
    defaultOpen: true,
    items: [
      { label: 'Action Center', labelAr: 'مركز الإجراءات', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    id: 'clients',
    label: 'Clients',
    labelAr: 'العملاء',
    defaultOpen: true,
    items: [
      { label: 'Organizations', labelAr: 'المنظمات', path: '/admin/organizations', icon: Building2 },
      { label: 'Onboarding', labelAr: 'الإعداد', path: '/admin/onboarding', icon: UserPlus },
      { label: 'Users & Roles', labelAr: 'المستخدمون والأدوار', path: '/admin/users', icon: Users },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    labelAr: 'السوق',
    defaultOpen: true,
    items: [
      { label: 'Vendors', labelAr: 'البائعون', path: '/admin/vendors', icon: Store },
      { label: 'Offers', labelAr: 'العروض', path: '/admin/offers', icon: Tag },
      { label: 'Moderation', labelAr: 'المراجعة', path: '/admin/moderation', icon: ClipboardList, badge: 3 },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    labelAr: 'البيانات',
    defaultOpen: true,
    items: [
      { label: 'Data Sources', labelAr: 'مصادر البيانات', path: '/admin/data-sources', icon: Database },
      { label: 'Sync Monitor', labelAr: 'مراقبة المزامنة', path: '/admin/sync-monitor', icon: Server },
      { label: 'Data Quality Rules', labelAr: 'قواعد جودة البيانات', path: '/admin/data-quality-rules', icon: Activity },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    labelAr: 'الحوكمة',
    defaultOpen: false,
    items: [
      { label: 'Audit Log', labelAr: 'سجل التدقيق', path: '/admin/audit-log', icon: FileText },
      { label: 'Security', labelAr: 'الأمان', path: '/admin/security', icon: ShieldCheck },
      { label: 'Sessions', labelAr: 'الجلسات', path: '/admin/sessions', icon: Users },
      { label: 'Feature Flags', labelAr: 'علامات الميزات', path: '/admin/feature-flags', icon: ToggleLeft },
      { label: 'UI Config', labelAr: 'تكوين الواجهة', path: '/admin/ui-config', icon: Sliders },
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    labelAr: 'التجارية',
    defaultOpen: false,
    items: [
      { label: 'Billing', labelAr: 'الفوترة', path: '/admin/billing', icon: CreditCard },
    ],
  },
  {
    id: 'alerts',
    label: 'Alerts',
    labelAr: 'التنبيهات',
    defaultOpen: true,
    items: [
      { label: 'Alerts Center', labelAr: 'مركز التنبيهات', path: '/admin/alerts', icon: AlertTriangle, badge: 3 },
    ],
  },
  {
    id: 'insights-lab',
    label: 'Insights Lab',
    labelAr: 'مختبر الرؤى',
    defaultOpen: false,
    isBeta: true,
    items: [
      { label: 'Benchmarks', labelAr: 'المعايير', path: '/admin/benchmarks', icon: BarChart3, isBeta: true },
      { label: 'Market Intelligence', labelAr: 'ذكاء السوق', path: '/admin/market', icon: TrendingUp, isBeta: true },
      { label: 'Spending Patterns', labelAr: 'أنماط الإنفاق', path: '/admin/spending', icon: Wallet, isBeta: true },
      { label: 'Saved Reports', labelAr: 'التقارير المحفوظة', path: '/admin/reports', icon: BookOpen, isBeta: true },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminSidebar() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  // Initialize expanded groups based on defaultOpen
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.filter((g) => g.defaultOpen).map((g) => g.id)
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  // Custom admin logo
  const adminLogo = (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
      <Shield className="w-4 h-4 text-white" />
    </div>
  );

  // Demo mode toggle in header
  const extraContent = (
    <div className="mt-3">
      <DemoModeToggle variant="dropdown" className="w-full justify-start" />
    </div>
  );

  return (
    <SidebarShell>
      <SidebarHeader
        roleBadge={language === 'ar' ? 'مسؤول' : 'Admin'}
        roleBadgeClass="bg-red-500/20 text-red-400"
        logoIcon={adminLogo}
        extraContent={extraContent}
      />

      <SidebarNav>
        {navigationGroups.map((group) => (
          <SidebarSection
            key={group.id}
            id={group.id}
            label={group.label}
            labelAr={group.labelAr}
            isBeta={group.isBeta}
            isOpen={expandedGroups.includes(group.id)}
            onToggle={() => toggleGroup(group.id)}
          >
            {group.items.map((item) => (
              <SidebarItem
                key={item.path}
                path={item.path}
                label={item.label}
                labelAr={item.labelAr}
                icon={item.icon}
                badgeCount={item.badge}
                isBeta={item.isBeta}
              />
            ))}
          </SidebarSection>
        ))}
      </SidebarNav>

      <SidebarFooter />
    </SidebarShell>
  );
}
