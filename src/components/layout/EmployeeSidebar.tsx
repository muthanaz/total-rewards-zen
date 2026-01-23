import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Menu,
  X,
  LogOut,
  ShoppingBag,
  Receipt,
  Zap,
  Clock,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

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

interface NavSection {
  id: string;
  label: string;
  labelAr?: string;
  type: 'group' | 'standalone' | 'life-area-container';
  path?: string;
  icon?: React.ElementType;
  items?: NavItem[];
  lifeAreas?: LifeAreaGroup[];
  defaultOpen?: boolean;
}

// ============================================================================
// LIFE AREA GROUPINGS - Hardcoded per spec
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
// NAVIGATION STRUCTURE
// ============================================================================

const navigation: NavSection[] = [
  // 1) HOME
  {
    id: 'home',
    label: 'Home',
    labelAr: 'الرئيسية',
    type: 'group',
    defaultOpen: true,
    items: [
      { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/employee', icon: LayoutDashboard },
      { label: 'My Actions', labelAr: 'إجراءاتي', path: '/employee/my-actions', icon: Zap },
    ],
  },
  // 2) MY BENEFITS (with Life Area sub-groups)
  {
    id: 'my-benefits',
    label: 'My Benefits',
    labelAr: 'مزاياي',
    type: 'life-area-container',
    defaultOpen: true,
    items: [
      { label: 'Benefits Overview', labelAr: 'نظرة عامة على المزايا', path: '/employee/benefits', icon: Gift },
    ],
    lifeAreas: LIFE_AREA_GROUPS,
  },
  // 3) MY REQUESTS
  {
    id: 'my-requests',
    label: 'My Requests',
    labelAr: 'طلباتي',
    type: 'group',
    defaultOpen: true,
    items: [
      { label: 'Requests', labelAr: 'الطلبات', path: '/employee/requests', icon: Receipt },
      { label: 'Documents', labelAr: 'المستندات', path: '/employee/documents', icon: FileText },
    ],
  },
  // 4) TIME OFF
  {
    id: 'time-off',
    label: 'Time Off',
    labelAr: 'الإجازات',
    type: 'standalone',
    path: '/employee/leave',
    icon: Calendar,
  },
  // 5) MARKETPLACE
  {
    id: 'marketplace',
    label: 'Marketplace',
    labelAr: 'السوق',
    type: 'standalone',
    path: '/employee/marketplace',
    icon: ShoppingBag,
  },
  // 6) HELP & SETTINGS
  {
    id: 'help-settings',
    label: 'Help & Settings',
    labelAr: 'المساعدة والإعدادات',
    type: 'group',
    items: [
      { label: 'Knowledge Hub', labelAr: 'مركز المعرفة', path: '/employee/knowledge', icon: HelpCircle },
      { label: 'Profile', labelAr: 'الملف الشخصي', path: '/employee/profile', icon: User },
      { label: 'Government Services', labelAr: 'الخدمات الحكومية', path: '/employee/gov-connect', icon: Building2, badge: 'Soon' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function EmployeeSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const { flags } = useFeatureFlags();
  const { profile } = useProfile();
  
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'home',
    'my-benefits',
    'my-requests',
  ]);
  const [expandedLifeAreas, setExpandedLifeAreas] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = direction === 'rtl';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleLifeArea = (id: string) => {
    setExpandedLifeAreas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Active rule: exact match or nested route
  const isActive = (path: string) => {
    if (path === '/employee') return location.pathname === '/employee';
    const basePath = path.split('?')[0];
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/');
  };

  // Check if any item in a life area is active
  const isLifeAreaActive = (lifeArea: LifeAreaGroup) => {
    return lifeArea.items.some(item => isActive(item.path));
  };

  const ChevronCollapsed = isRTL ? ChevronLeft : ChevronRight;

  const getLabel = (item: { label: string; labelAr?: string }) => {
    return language === 'ar' && item.labelAr ? item.labelAr : item.label;
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderNavItem = (item: NavItem, indent: number = 0) => (
    <Link
      key={item.path}
      to={item.path}
      onClick={() => setMobileOpen(false)}
      className={cn(
        'nav-item',
        isActive(item.path) && 'nav-item-active',
        isRTL && 'flex-row-reverse text-right',
        indent > 0 && (isRTL ? 'pr-4' : 'pl-4')
      )}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <span className={cn('text-sm flex-1', isRTL && 'text-right')}>
        {getLabel(item)}
      </span>
      {item.badge && (
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-accent/10 text-accent border-accent/20">
          {item.badge}
        </Badge>
      )}
    </Link>
  );

  const renderLifeAreaGroup = (lifeArea: LifeAreaGroup) => {
    const isExpanded = expandedLifeAreas.includes(lifeArea.id) || isLifeAreaActive(lifeArea);
    
    return (
      <div key={lifeArea.id} className="space-y-0.5">
        <button
          onClick={() => toggleLifeArea(lifeArea.id)}
          className={cn(
            'flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide transition-colors rounded-md',
            'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            isLifeAreaActive(lifeArea) && 'text-accent',
            isRTL && 'flex-row-reverse text-right'
          )}
        >
          <span>{getLabel(lifeArea)}</span>
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
          ) : (
            <ChevronCollapsed className="w-3 h-3 shrink-0 opacity-60" />
          )}
        </button>
        
        {isExpanded && (
          <div className="space-y-0.5 animate-fade-in">
            {lifeArea.items.map(item => renderNavItem(item, 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: NavSection, index: number) => {
    // Standalone link (no subitems)
    if (section.type === 'standalone' && section.path && section.icon) {
      const Icon = section.icon;
      return (
        <div key={section.id} className={cn('mb-1', index > 0 && 'mt-4')}>
          <Link
            to={section.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors rounded-md',
              'hover:bg-sidebar-primary/10',
              isActive(section.path) 
                ? 'text-accent bg-accent/10' 
                : 'text-sidebar-primary hover:text-accent',
              isRTL && 'flex-row-reverse text-right'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{getLabel(section)}</span>
          </Link>
        </div>
      );
    }

    // Group with items (and possibly life areas)
    const isExpanded = expandedSections.includes(section.id);
    
    return (
      <div key={section.id} className={cn('mb-1', index > 0 && 'mt-4')}>
        {/* Section heading */}
        <button
          onClick={() => toggleSection(section.id)}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors rounded-md group',
            'text-sidebar-primary hover:bg-sidebar-primary/10',
            isRTL && 'flex-row-reverse text-right'
          )}
        >
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
            <span>{getLabel(section)}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          ) : (
            <ChevronCollapsed className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-1 space-y-0.5 animate-fade-in">
            {/* Primary items */}
            {section.items?.map(item => renderNavItem(item))}
            
            {/* Life area sub-groups (for My Benefits) */}
            {section.type === 'life-area-container' && section.lifeAreas && (
              <div className="mt-2 space-y-1 border-t border-sidebar-border/30 pt-2">
                {section.lifeAreas.map(lifeArea => renderLifeAreaGroup(lifeArea))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // SIDEBAR CONTENT
  // ============================================================================

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
              <span className="text-sidebar-background font-bold text-lg">b</span>
            </div>
            <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
          </div>
        </div>

        {/* Theme & Language Controls */}
        <div
          className={cn(
            'flex items-center gap-1 mt-3 pt-3 border-t border-sidebar-border/50',
            isRTL && 'flex-row-reverse'
          )}
        >
          <NotificationCenter />
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        'flex-1 overflow-y-auto py-4 px-3 space-y-1',
        'scroll-shadow',
        isRTL && 'text-right'
      )}>
        {navigation.map((section, index) => renderSection(section, index))}
      </nav>

      {/* Sign Out */}
      <div className={cn('p-4 border-t border-sidebar-border', isRTL && 'text-right')}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            isRTL ? 'justify-start flex-row-reverse' : 'justify-start'
          )}
        >
          <LogOut className={cn('w-4 h-4 shrink-0', isRTL ? 'ml-3' : 'mr-3')} />
          <span className={isRTL ? 'text-right' : 'text-left'}>
            {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
          </span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          'fixed top-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground lg:hidden',
          isRTL ? 'right-4' : 'left-4'
        )}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-40 h-screen w-64 flex flex-col bg-sidebar transition-transform duration-300',
          isRTL ? 'right-0 lg:translate-x-0' : 'left-0 lg:translate-x-0',
          isRTL
            ? mobileOpen
              ? 'translate-x-0'
              : 'translate-x-full'
            : mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
