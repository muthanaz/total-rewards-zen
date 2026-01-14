import { useState, useEffect, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  DollarSign,
  Recycle,
  Users,
  FileCheck,
  ShoppingBag,
  Lightbulb,
  Menu,
  X,
  LogOut,
  Settings,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  Settings2,
  TrendingUp,
  BarChart3,
  Shield,
  Activity,
  Zap,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export type ViewMode = 'strategic' | 'operational';

// Context for sharing view mode
const ViewModeContext = createContext<ViewMode>('operational');
export const useEmployerViewMode = () => useContext(ViewModeContext);

interface NavItem {
  label: { en: string; ar: string };
  path: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: 'amber' | 'primary' | 'red';
}

interface NavGroup {
  id: string;
  title: { en: string; ar: string };
  icon: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
}

// Operations-first navigation (Default for employers)
const operationalNavigation: NavGroup[] = [
  {
    id: 'action-queue',
    title: { en: 'Action Queue', ar: 'قائمة الإجراءات' },
    icon: Zap,
    items: [
      { 
        label: { en: 'Claims & Approvals', ar: 'المطالبات والموافقات' },
        path: '/employer/claims', 
        icon: FileCheck,
        badge: 12,
        badgeColor: 'amber'
      },
      { 
        label: { en: 'Policy Acknowledgements', ar: 'إقرارات السياسات' },
        path: '/employer/policies', 
        icon: ClipboardCheck,
        badge: 3,
        badgeColor: 'primary'
      },
      { 
        label: { en: 'Data Quality Issues', ar: 'مشاكل جودة البيانات' },
        path: '/employer/compliance', 
        icon: AlertTriangle,
        badge: 5,
        badgeColor: 'red'
      },
    ],
    defaultOpen: true,
  },
  {
    id: 'financial-intelligence',
    title: { en: 'Financial Intelligence', ar: 'الذكاء المالي' },
    icon: DollarSign,
    items: [
      { 
        label: { en: 'Spend & Utilization', ar: 'الإنفاق والاستخدام' },
        path: '/employer/spend', 
        icon: BarChart3 
      },
      { 
        label: { en: 'Forecasting', ar: 'التوقعات' },
        path: '/employer/forecasting', 
        icon: TrendingUp 
      },
      { 
        label: { en: 'Unrealized Benefits Value', ar: 'قيمة المزايا غير المحققة' },
        path: '/employer/zombie', 
        icon: Recycle
      },
    ],
    defaultOpen: true,
  },
  {
    id: 'people-intelligence',
    title: { en: 'People Intelligence', ar: 'ذكاء الموظفين' },
    icon: Users,
    items: [
      { 
        label: { en: 'Segments', ar: 'الشرائح' },
        path: '/employer/segments', 
        icon: Users 
      },
      { 
        label: { en: 'Satisfaction Pulse', ar: 'نبض الرضا' },
        path: '/employer/satisfaction', 
        icon: Activity
      },
    ],
  },
  {
    id: 'governance',
    title: { en: 'Governance', ar: 'الحوكمة' },
    icon: Shield,
    items: [
      { 
        label: { en: 'Policy Hub', ar: 'مركز السياسات' },
        path: '/employer/policies', 
        icon: BookOpen 
      },
      { 
        label: { en: 'Compliance & Audit', ar: 'الامتثال والتدقيق' },
        path: '/employer/compliance', 
        icon: Shield 
      },
      { 
        label: { en: 'Metrics Dictionary', ar: 'قاموس المقاييس' },
        path: '/employer/metrics', 
        icon: BookOpen 
      },
    ],
  },
  {
    id: 'configuration',
    title: { en: 'Configuration', ar: 'الإعدادات' },
    icon: Settings,
    items: [
      { 
        label: { en: 'Integrations', ar: 'التكاملات' },
        path: '/employer/integrations', 
        icon: Settings 
      },
    ],
  },
];

// Strategic navigation for C-Suite
const strategicNavigation: NavGroup[] = [
  {
    id: 'insights',
    title: { en: 'Strategic Insights', ar: 'الرؤى الاستراتيجية' },
    icon: Lightbulb,
    items: [
      { 
        label: { en: 'bnft Insights', ar: 'رؤى bnft' },
        path: '/employer/recommendations', 
        icon: Lightbulb,
        badge: 8,
        badgeColor: 'primary'
      },
      { 
        label: { en: 'Action Plan', ar: 'خطة العمل' },
        path: '/employer/actions', 
        icon: Zap
      },
    ],
    defaultOpen: true,
  },
  {
    id: 'financial-intelligence',
    title: { en: 'Financial Intelligence', ar: 'الذكاء المالي' },
    icon: DollarSign,
    items: [
      { 
        label: { en: 'Budget & ROI', ar: 'الميزانية والعائد' },
        path: '/employer/spend', 
        icon: BarChart3 
      },
      { 
        label: { en: 'Forecasting', ar: 'التوقعات' },
        path: '/employer/forecasting', 
        icon: TrendingUp 
      },
      { 
        label: { en: 'Unrealized Benefits Value', ar: 'قيمة المزايا غير المحققة' },
        path: '/employer/zombie', 
        icon: Recycle
      },
    ],
    defaultOpen: true,
  },
  {
    id: 'people-intelligence',
    title: { en: 'People Intelligence', ar: 'ذكاء الموظفين' },
    icon: Users,
    items: [
      { 
        label: { en: 'Team Segments', ar: 'شرائح الفريق' },
        path: '/employer/segments', 
        icon: Users 
      },
      { 
        label: { en: 'Satisfaction Pulse', ar: 'نبض الرضا' },
        path: '/employer/satisfaction', 
        icon: Activity
      },
    ],
  },
  {
    id: 'governance',
    title: { en: 'Governance', ar: 'الحوكمة' },
    icon: Shield,
    items: [
      { 
        label: { en: 'Policy Hub', ar: 'مركز السياسات' },
        path: '/employer/policies', 
        icon: BookOpen 
      },
      { 
        label: { en: 'Compliance & Audit', ar: 'الامتثال والتدقيق' },
        path: '/employer/compliance', 
        icon: Shield 
      },
      { 
        label: { en: 'Metrics Dictionary', ar: 'قاموس المقاييس' },
        path: '/employer/metrics', 
        icon: BookOpen 
      },
    ],
  },
];

export function EmployerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  // Default to operational mode for HR teams
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('employer-view-mode');
    return (saved as ViewMode) || 'operational';
  });
  
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  // Get current navigation based on view mode
  const currentNavigation = viewMode === 'strategic' ? strategicNavigation : operationalNavigation;

  // Initialize expanded groups based on current navigation
  useEffect(() => {
    const defaultExpanded = currentNavigation
      .filter(g => g.defaultOpen !== false)
      .map(g => g.id);
    setExpandedGroups(defaultExpanded);
  }, [viewMode]);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('employer-view-mode', viewMode);
  }, [viewMode]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  };

  const getBadgeStyles = (color?: 'amber' | 'primary' | 'red') => {
    switch (color) {
      case 'amber':
        return 'bg-amber-500/20 text-amber-500';
      case 'red':
        return 'bg-red-500/20 text-red-500';
      case 'primary':
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  const ChevronCollapsed = isRTL ? ChevronLeft : ChevronRight;

  const sidebarContent = (
    <ViewModeContext.Provider value={viewMode}>
      {/* Logo & View Toggle */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        {/* Logo */}
        <div className={cn(
          "flex items-center justify-between mb-4",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
              <span className="text-sidebar-background font-bold text-lg">b</span>
            </div>
            <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-sidebar-accent/50 rounded-xl p-1 mb-3">
          <div className={cn("flex", isRTL && "flex-row-reverse")}>
            <button
              onClick={() => setViewMode('operational')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                viewMode === 'operational' 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                isRTL && "flex-row-reverse"
              )}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تشغيلي' : 'Operations'}</span>
            </button>
            <button
              onClick={() => setViewMode('strategic')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                viewMode === 'strategic' 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                isRTL && "flex-row-reverse"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isArabic ? 'استراتيجي' : 'Strategic'}</span>
            </button>
          </div>
        </div>

        {/* View Description */}
        <div className={cn(
          "text-[10px] text-sidebar-foreground/50 px-1",
          isRTL && "text-right"
        )}>
          {viewMode === 'operational' 
            ? (isArabic ? 'لفرق الموارد البشرية والعمليات' : 'For HR & Operations Teams')
            : (isArabic ? 'للقيادة التنفيذية والإدارة العليا' : 'For C-Suite & Leadership')
          }
        </div>
        
        {/* Utility Controls */}
        <div className={cn(
          "flex items-center gap-1 mt-3 pt-3 border-t border-sidebar-border/50",
          isRTL && "flex-row-reverse"
        )}>
          <NotificationCenter />
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 px-3 space-y-1",
        isRTL && "text-right"
      )}>
        {/* Command Center Dashboard Link */}
        <Link
          to="/employer"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm',
            isActive('/employer') 
              ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent',
            isRTL && 'flex-row-reverse text-right'
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className="flex-1">{isArabic ? 'مركز القيادة' : 'Command Center'}</span>
        </Link>

        <Separator className="my-3 bg-sidebar-border/50" />

        {/* Grouped Navigation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: viewMode === 'operational' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: viewMode === 'operational' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentNavigation.map((group, index) => (
              <div key={group.id} className={cn("mb-1", index > 0 && "mt-4")}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors rounded-md group",
                    "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    isRTL && "flex-row-reverse text-right"
                  )}
                >
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <group.icon className="w-3.5 h-3.5 text-sidebar-primary" />
                    <span>{isArabic ? group.title.ar : group.title.en}</span>
                  </div>
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ChevronCollapsed className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedGroups.includes(group.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 space-y-0.5">
                        {group.items.map((item) => (
                          <Link
                            key={item.path + item.label.en}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'nav-item relative',
                              isActive(item.path) && 'nav-item-active',
                              isRTL && 'flex-row-reverse text-right'
                            )}
                          >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span className={cn("text-sm flex-1", isRTL && "text-right")}>
                              {isArabic ? item.label.ar : item.label.en}
                            </span>
                            {item.badge && (
                              <Badge 
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 border-0",
                                  getBadgeStyles(item.badgeColor)
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Marketplace Analytics - Heading Style Link (both views) */}
        <div className="mt-4 pt-4 border-t border-sidebar-border/50">
          <Link
            to="/employer/marketplace"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm',
              isActive('/employer/marketplace') 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent',
              isRTL && 'flex-row-reverse text-right'
            )}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="flex-1">{isArabic ? 'تحليلات السوق' : 'Marketplace Analytics'}</span>
          </Link>
        </div>
      </nav>

      {/* Sign Out */}
      <div className={cn("p-4 border-t border-sidebar-border", isRTL && "text-right")}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            isRTL ? "justify-start flex-row-reverse" : "justify-start"
          )}
        >
          <LogOut className={cn("w-4 h-4 shrink-0", isRTL ? "ml-3" : "mr-3")} />
          <span className={isRTL ? "text-right" : "text-left"}>
            {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
          </span>
        </Button>
      </div>
    </ViewModeContext.Provider>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          "fixed top-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground lg:hidden",
          isRTL ? "right-4" : "left-4"
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
            ? (mobileOpen ? 'translate-x-0' : 'translate-x-full')
            : (mobileOpen ? 'translate-x-0' : '-translate-x-full')
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
