import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Home,
  GraduationCap,
  Heart,
  Car,
  Dumbbell,
  BookOpen,
  Calendar,
  Gift,
  Wallet,
  FileText,
  Building2,
  User,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Receipt,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import {
  SidebarShell,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarStandaloneLink,
  SidebarFooter,
  useSidebarShell,
} from './sidebar';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  label: string;
  labelAr?: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

interface LifeAreaGroup {
  id: string;
  label: string;
  labelAr: string;
  items: NavItem[];
}

// ============================================================================
// LIFE AREA GROUPINGS
// ============================================================================

const LIFE_AREA_GROUPS: LifeAreaGroup[] = [
  {
    id: 'home-living',
    label: 'Home & Living',
    labelAr: 'المنزل والمعيشة',
    items: [
      { label: 'Housing', labelAr: 'السكن', path: '/employee/housing', icon: Home },
    ],
  },
  {
    id: 'family-parenting',
    label: 'Family & Parenting',
    labelAr: 'الأسرة والأبوة',
    items: [
      { label: 'Schooling', labelAr: 'التعليم', path: '/employee/schooling', icon: GraduationCap },
    ],
  },
  {
    id: 'health',
    label: 'Health',
    labelAr: 'الصحة',
    items: [
      { label: 'Health Insurance', labelAr: 'التأمين الصحي', path: '/employee/health', icon: Heart },
      { label: 'Wellbeing', labelAr: 'الرفاهية', path: '/employee/wellbeing', icon: Dumbbell },
    ],
  },
  {
    id: 'mobility',
    label: 'Mobility',
    labelAr: 'التنقل',
    items: [
      { label: 'Transport', labelAr: 'النقل', path: '/employee/transport', icon: Car },
    ],
  },
  {
    id: 'career',
    label: 'Career',
    labelAr: 'المسار المهني',
    items: [
      { label: 'Learning & Development', labelAr: 'التعلم والتطوير', path: '/employee/learning', icon: BookOpen },
    ],
  },
  {
    id: 'money',
    label: 'Money',
    labelAr: 'المال',
    items: [
      { label: 'Long-Term Financials', labelAr: 'الماليات طويلة الأجل', path: '/employee/long-term-financials', icon: Wallet },
    ],
  },
];

// ============================================================================
// NAVIGATION DATA
// ============================================================================

const homeItems: NavItem[] = [
  { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employee', icon: LayoutDashboard },
  { label: 'My Actions', labelAr: 'إجراءاتي', path: '/employee/my-actions', icon: Zap },
];

const benefitsOverview: NavItem = {
  label: 'Benefits Overview',
  labelAr: 'نظرة عامة على المزايا',
  path: '/employee/benefits',
  icon: Gift,
};

const requestItems: NavItem[] = [
  { label: 'Requests', labelAr: 'الطلبات', path: '/employee/requests', icon: Receipt },
  { label: 'Documents', labelAr: 'المستندات', path: '/employee/documents', icon: FileText },
];

const helpItems: NavItem[] = [
  { label: 'Knowledge Hub', labelAr: 'مركز المعرفة', path: '/employee/knowledge', icon: HelpCircle },
  { label: 'Profile', labelAr: 'الملف الشخصي', path: '/employee/profile', icon: User },
  { label: 'Government Services', labelAr: 'الخدمات الحكومية', path: '/employee/gov-connect', icon: Building2, badge: 'Soon' },
];

// ============================================================================
// LIFE AREA SUB-GROUP COMPONENT
// ============================================================================

function LifeAreaSubGroup({ lifeArea }: { lifeArea: LifeAreaGroup }) {
  const location = useLocation();
  const { language, direction } = useLanguage();
  const { setMobileOpen } = useSidebarShell();
  const [isExpanded, setIsExpanded] = useState(false);
  const isRTL = direction === 'rtl';

  const isLifeAreaActive = lifeArea.items.some(
    (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  );

  const isOpen = isExpanded || isLifeAreaActive;
  const ChevronCollapsed = isRTL ? ChevronLeft : ChevronRight;
  const displayLabel = language === 'ar' ? lifeArea.labelAr : lifeArea.label;

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide transition-colors rounded-md',
          'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          isLifeAreaActive && 'text-accent',
          isRTL && 'flex-row-reverse text-right'
        )}
      >
        <span>{displayLabel}</span>
        {isOpen ? (
          <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
        ) : (
          <ChevronCollapsed className="w-3 h-3 shrink-0 opacity-60" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-0.5 animate-fade-in">
          {lifeArea.items.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/');
            const label = language === 'ar' && item.labelAr ? item.labelAr : item.label;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'nav-item',
                  isActive && 'nav-item-active',
                  isRTL && 'flex-row-reverse text-right',
                  isRTL ? 'pr-4' : 'pl-4'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className={cn('text-sm flex-1', isRTL && 'text-right')}>{label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] px-1.5 py-0 h-4 bg-accent/10 text-accent border-accent/20"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmployeeSidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'home',
    'my-benefits',
    'my-requests',
  ]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <SidebarShell>
      <SidebarHeader />

      <SidebarNav>
        {/* Home Section */}
        <SidebarSection
          id="home"
          label="Home"
          labelAr="الرئيسية"
          isOpen={expandedSections.includes('home')}
          onToggle={() => toggleSection('home')}
        >
          {homeItems.map((item) => (
            <SidebarItem
              key={item.path}
              path={item.path}
              label={item.label}
              labelAr={item.labelAr}
              icon={item.icon}
              badge={item.badge}
            />
          ))}
        </SidebarSection>

        {/* My Benefits Section */}
        <SidebarSection
          id="my-benefits"
          label="My Benefits"
          labelAr="مزاياي"
          isOpen={expandedSections.includes('my-benefits')}
          onToggle={() => toggleSection('my-benefits')}
        >
          <SidebarItem
            path={benefitsOverview.path}
            label={benefitsOverview.label}
            labelAr={benefitsOverview.labelAr}
            icon={benefitsOverview.icon}
          />
          {/* Life Area Sub-groups */}
          <div className="mt-2 space-y-1 border-t border-sidebar-border/30 pt-2">
            {LIFE_AREA_GROUPS.map((lifeArea) => (
              <LifeAreaSubGroup key={lifeArea.id} lifeArea={lifeArea} />
            ))}
          </div>
        </SidebarSection>

        {/* My Requests Section */}
        <SidebarSection
          id="my-requests"
          label="My Requests"
          labelAr="طلباتي"
          isOpen={expandedSections.includes('my-requests')}
          onToggle={() => toggleSection('my-requests')}
        >
          {requestItems.map((item) => (
            <SidebarItem
              key={item.path}
              path={item.path}
              label={item.label}
              labelAr={item.labelAr}
              icon={item.icon}
            />
          ))}
        </SidebarSection>

        {/* Time Off - Standalone */}
        <SidebarStandaloneLink
          path="/employee/leave"
          label="Time Off"
          labelAr="الإجازات"
          icon={Calendar}
        />

        {/* Marketplace - Standalone */}
        <SidebarStandaloneLink
          path="/employee/marketplace"
          label="Marketplace"
          labelAr="السوق"
          icon={ShoppingBag}
        />

        {/* Help & Settings Section */}
        <SidebarSection
          id="help-settings"
          label="Help & Settings"
          labelAr="المساعدة والإعدادات"
          isOpen={expandedSections.includes('help-settings')}
          onToggle={() => toggleSection('help-settings')}
        >
          {helpItems.map((item) => (
            <SidebarItem
              key={item.path}
              path={item.path}
              label={item.label}
              labelAr={item.labelAr}
              icon={item.icon}
              badge={item.badge}
            />
          ))}
        </SidebarSection>
      </SidebarNav>

      <SidebarFooter />
    </SidebarShell>
  );
}
