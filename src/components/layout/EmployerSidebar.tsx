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
  GitBranch,
  Settings,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployerViewMode, ViewMode } from '@/contexts/EmployerViewModeContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useActionApprovals } from '@/hooks/useActionApprovals';
import { PendingApprovalsBadge } from '@/components/employer/PendingApprovalsBadge';
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

// ============================================================================
// NAVIGATION GROUPINGS (3 clear categories per prompt)
// ============================================================================

// 1. RUN OPERATIONS (HR Ops - day-to-day processing)
const opsNavigation: NavGroup[] = [
  {
    id: 'run-operations',
    label: 'Run Operations',
    labelAr: 'تشغيل العمليات',
    items: [
      { label: 'Claims Queue', labelAr: 'قائمة المطالبات', path: '/employer/claims', icon: FileCheck },
      { label: 'Knowledge Center', labelAr: 'مركز المعرفة', path: '/employer/knowledge', icon: HelpCircle },
    ],
  },
  {
    id: 'improve-policies',
    label: 'Improve Policies',
    labelAr: 'تحسين السياسات',
    items: [
      { label: 'Policy Management', labelAr: 'إدارة السياسات', path: '/employer/policies', icon: FileText },
      { label: 'Policy Insights', labelAr: 'رؤى السياسات', path: '/employer/policy-insights', icon: TrendingUp },
    ],
  },
  {
    id: 'data-trust',
    label: 'Data & Trust',
    labelAr: 'البيانات والثقة',
    items: [
      { label: 'Integrations', labelAr: 'التكاملات', path: '/employer/integrations', icon: Database },
      { label: 'Data Quality', labelAr: 'جودة البيانات', path: '/employer/data-quality/rules', icon: Shield },
      { label: 'Sync Status', labelAr: 'حالة المزامنة', path: '/employer/data-quality/sync', icon: AlertTriangle },
    ],
  },
];

// 2. EXECUTIVE NAVIGATION (CFO/CEO decision flow - Simplified 5-item structure)
const execNavigation: NavGroup[] = [
  // 1. EXECUTIVE SUMMARY
  {
    id: 'executive-summary',
    label: 'Executive Summary',
    labelAr: 'الملخص التنفيذي',
    items: [
      { label: 'Total Rewards Overview', labelAr: 'نظرة عامة على المكافآت', path: '/employer', icon: LayoutDashboard },
    ],
  },
  // 2. SPEND & VALUE ANALYSIS (merged: Spend, Zombie, Segments)
  {
    id: 'spend-value',
    label: 'Spend & Value Analysis',
    labelAr: 'تحليل الإنفاق والقيمة',
    items: [
      { label: 'Spend & Utilization', labelAr: 'الإنفاق والاستخدام', path: '/employer/spend', icon: DollarSign },
      { label: 'Unrealized Value', labelAr: 'القيمة غير المحققة', path: '/employer/zombie', icon: Lightbulb },
      { label: 'Employee Segments', labelAr: 'شرائح الموظفين', path: '/employer/segments', icon: Users },
    ],
  },
  // 3. DECISIONS & ACTIONS
  {
    id: 'decisions-actions',
    label: 'Decisions & Actions',
    labelAr: 'القرارات والإجراءات',
    items: [
      { label: 'Action Plan', labelAr: 'خطة العمل', path: '/employer/recommendations', icon: BarChart3 },
    ],
  },
  // 4. GOVERNANCE & CONTROLS
  {
    id: 'governance-controls',
    label: 'Governance & Controls',
    labelAr: 'الحوكمة والضوابط',
    items: [
      { label: 'Policy Impact', labelAr: 'تأثير السياسات', path: '/employer/policy-insights', icon: TrendingUp },
      { label: 'Workflow Settings', labelAr: 'إعدادات سير العمل', path: '/employer/settings/workflows', icon: GitBranch },
    ],
  },
  // 5. DATA SOURCES
  {
    id: 'data-sources',
    label: 'Data Sources',
    labelAr: 'مصادر البيانات',
    items: [
      { label: 'Integrations', labelAr: 'التكاملات', path: '/employer/integrations', icon: Database },
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
  const { pendingApprovals } = useActionApprovals();
  const isRTL = direction === 'rtl';

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Navigate to appropriate landing page for each mode
    if (mode === 'operational') {
      navigate('/employer/claims');
    } else {
      navigate('/employer');
    }
  };

  const pendingCount = pendingApprovals?.length || 0;

  return (
    <>
      {/* Pending Approvals Badge (Executive mode only) */}
      {isExecutive && pendingCount > 0 && (
        <div className="mt-3">
          <PendingApprovalsBadge count={pendingCount} className="w-full justify-center" />
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="mt-3 p-1 bg-sidebar-accent/50 rounded-xl">
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
