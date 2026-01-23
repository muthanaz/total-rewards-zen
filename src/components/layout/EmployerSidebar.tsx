import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  DollarSign,
  Lightbulb,
  FileText,
  ShoppingBag,
  Database,
  BookOpen,
  Briefcase,
  Eye,
  TrendingUp,
  Shield,
  AlertTriangle,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployerViewMode, ViewMode } from '@/contexts/EmployerViewModeContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
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
  labelAr?: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  id: string;
  label: string;
  labelAr?: string;
  items: NavItem[];
  featureFlag?: keyof ReturnType<typeof useFeatureFlags>['flags'];
}

// HR OPS NAVIGATION
const opsNavigation: NavGroup[] = [
  {
    id: 'queue',
    label: 'Queue',
    labelAr: 'قائمة الانتظار',
    items: [
      { label: 'Claims & Approvals', labelAr: 'المطالبات والموافقات', path: '/employer/claims', icon: FileCheck },
    ],
  },
  {
    id: 'policies',
    label: 'Policies',
    labelAr: 'السياسات',
    items: [
      { label: 'Policy Management', labelAr: 'إدارة السياسات', path: '/employer/policies', icon: FileText },
      { label: 'Policy Insights', labelAr: 'رؤى السياسات', path: '/employer/policy-insights', icon: TrendingUp, badge: 'HR Lead' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    labelAr: 'البيانات',
    items: [
      { label: 'Integrations', labelAr: 'التكاملات', path: '/employer/integrations', icon: Database },
      { label: 'Data Quality Rules', labelAr: 'قواعد جودة البيانات', path: '/employer/data-quality/rules', icon: Shield },
      { label: 'Sync Status', labelAr: 'حالة المزامنة', path: '/employer/data-quality/sync', icon: AlertTriangle },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    labelAr: 'الدعم',
    items: [
      { label: 'Knowledge Center', labelAr: 'مركز المعرفة', path: '/employer/knowledge', icon: HelpCircle },
    ],
  },
];

// EXECUTIVE NAVIGATION
const execNavigation: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    labelAr: 'نظرة عامة',
    items: [
      { label: 'Executive Dashboard', labelAr: 'لوحة التحكم التنفيذية', path: '/employer', icon: LayoutDashboard },
    ],
  },
  {
    id: 'spend',
    label: 'Spend',
    labelAr: 'الإنفاق',
    items: [
      { label: 'Spend & Utilization', labelAr: 'الإنفاق والاستخدام', path: '/employer/spend', icon: DollarSign },
    ],
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    labelAr: 'الفرص',
    items: [
      { label: 'Optimization', labelAr: 'التحسين', path: '/employer/zombie', icon: Lightbulb },
      { label: 'Segments', labelAr: 'الشرائح', path: '/employer/segments', icon: Users },
    ],
  },
  {
    id: 'action-plan',
    label: 'Action Plan',
    labelAr: 'خطة العمل',
    items: [
      { label: 'Recommendations', labelAr: 'التوصيات', path: '/employer/recommendations', icon: BarChart3 },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    labelAr: 'الحوكمة',
    items: [
      { label: 'Policy Impact', labelAr: 'تأثير السياسات', path: '/employer/policy-insights', icon: TrendingUp },
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    labelAr: 'النظام البيئي',
    featureFlag: 'marketplaceEnabled',
    items: [
      { label: 'Marketplace Impact', labelAr: 'تأثير السوق', path: '/employer/marketplace', icon: ShoppingBag },
    ],
  },
  {
    id: 'trust',
    label: 'Trust',
    labelAr: 'الثقة',
    items: [
      { label: 'Data Sources', labelAr: 'مصادر البيانات', path: '/employer/integrations', icon: Database, badge: 'Read-only' },
    ],
  },
];

// ============================================================================
// VIEW MODE TOGGLE COMPONENT
// ============================================================================

function ViewModeToggle() {
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const { viewMode, setViewMode, isExecutive } = useEmployerViewMode();
  const isRTL = direction === 'rtl';

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    navigate('/employer');
  };

  return (
    <>
      {/* View Mode Toggle */}
      <div className="mt-4 p-1 bg-sidebar-accent/50 rounded-xl">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => handleModeChange('operational')}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
              !isExecutive
                ? 'bg-sidebar-background text-sidebar-foreground shadow-sm'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>HR Ops</span>
          </button>
          <button
            onClick={() => handleModeChange('executive')}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
              isExecutive
                ? 'bg-sidebar-background text-sidebar-foreground shadow-sm'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Executive</span>
          </button>
        </div>
      </div>

    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmployerSidebar() {
  const { flags } = useFeatureFlags();
  const { isExecutive } = useEmployerViewMode();

  // Get the navigation based on mode
  const baseNavigation = isExecutive ? execNavigation : opsNavigation;

  // All sections expanded by default
  const [expandedSections, setExpandedSections] = useState<string[]>(
    baseNavigation.map((s) => s.id)
  );

  // Filter by feature flags
  const visibleNavigation = useMemo(() => {
    return baseNavigation.filter((section) => {
      if (section.featureFlag) {
        return flags[section.featureFlag];
      }
      return true;
    });
  }, [baseNavigation, flags]);

  // Reset sections when mode changes
  useMemo(() => {
    setExpandedSections(baseNavigation.map((s) => s.id));
  }, [isExecutive]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <SidebarShell>
      <SidebarHeader extraContent={<ViewModeToggle />} />

      <SidebarNav>
        {visibleNavigation.map((group) => (
          <SidebarSection
            key={group.id}
            id={group.id}
            label={group.label}
            labelAr={group.labelAr}
            isOpen={expandedSections.includes(group.id)}
            onToggle={() => toggleSection(group.id)}
          >
            {group.items.map((item) => (
              <SidebarItem
                key={item.path + item.label}
                path={item.path}
                label={item.label}
                labelAr={item.labelAr}
                icon={item.icon}
                badge={item.badge}
              />
            ))}
          </SidebarSection>
        ))}
      </SidebarNav>

      <SidebarFooter />
    </SidebarShell>
  );
}
