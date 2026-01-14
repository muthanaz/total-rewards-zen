import { useState, useEffect } from 'react';
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
  Target,
  BarChart3,
  Shield,
  Activity,
  Zap,
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

interface NavItem {
  labelKey: string;
  label: { en: string; ar: string };
  path: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  strategicOnly?: boolean;
  operationalOnly?: boolean;
}

interface NavGroup {
  titleKey: string;
  title: { en: string; ar: string };
  icon: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
  strategicOnly?: boolean;
  operationalOnly?: boolean;
}

// Strategic View Navigation - For C-Suite/Leadership
const strategicNavigation: NavGroup[] = [
  {
    titleKey: 'financial_intelligence',
    title: { en: 'Financial Intelligence', ar: 'الذكاء المالي' },
    icon: DollarSign,
    items: [
      { 
        labelKey: 'budget_roi', 
        label: { en: 'Budget & ROI', ar: 'الميزانية والعائد' },
        path: '/employer/spend', 
        icon: BarChart3 
      },
      { 
        labelKey: 'waste_recovery', 
        label: { en: 'Waste Recovery', ar: 'استرداد الهدر' },
        path: '/employer/zombie', 
        icon: Recycle 
      },
    ],
    defaultOpen: true,
  },
  {
    titleKey: 'workforce_analytics',
    title: { en: 'Workforce Analytics', ar: 'تحليلات القوى العاملة' },
    icon: Users,
    items: [
      { 
        labelKey: 'segments', 
        label: { en: 'Team Segments', ar: 'شرائح الفريق' },
        path: '/employer/segments', 
        icon: Users 
      },
      { 
        labelKey: 'recommendations', 
        label: { en: 'AI Recommendations', ar: 'توصيات الذكاء الاصطناعي' },
        path: '/employer/recommendations', 
        icon: Lightbulb 
      },
    ],
    defaultOpen: true,
  },
  {
    titleKey: 'governance',
    title: { en: 'Governance', ar: 'الحوكمة' },
    icon: Shield,
    items: [
      { 
        labelKey: 'policy_hub', 
        label: { en: 'Policy Hub', ar: 'مركز السياسات' },
        path: '/employer/policies', 
        icon: BookOpen 
      },
    ],
    defaultOpen: false,
  },
];

// Operational View Navigation - For HR Teams
const operationalNavigation: NavGroup[] = [
  {
    titleKey: 'action_queue',
    title: { en: 'Action Queue', ar: 'قائمة الإجراءات' },
    icon: Zap,
    items: [
      { 
        labelKey: 'claims', 
        label: { en: 'Claims & Approvals', ar: 'المطالبات والموافقات' },
        path: '/employer/claims', 
        icon: FileCheck,
        badge: 12,
        badgeColor: 'amber'
      },
    ],
    defaultOpen: true,
  },
  {
    titleKey: 'spend_management',
    title: { en: 'Spend Management', ar: 'إدارة الإنفاق' },
    icon: DollarSign,
    items: [
      { 
        labelKey: 'budget_utilization', 
        label: { en: 'Budget & Utilization', ar: 'الميزانية والاستخدام' },
        path: '/employer/spend', 
        icon: BarChart3 
      },
      { 
        labelKey: 'waste_recovery', 
        label: { en: 'Waste Recovery', ar: 'استرداد الهدر' },
        path: '/employer/zombie', 
        icon: Recycle 
      },
    ],
    defaultOpen: true,
  },
  {
    titleKey: 'workforce_data',
    title: { en: 'Workforce Data', ar: 'بيانات القوى العاملة' },
    icon: Users,
    items: [
      { 
        labelKey: 'segments', 
        label: { en: 'Employee Segments', ar: 'شرائح الموظفين' },
        path: '/employer/segments', 
        icon: Users 
      },
      { 
        labelKey: 'recommendations', 
        label: { en: 'Recommendations', ar: 'التوصيات' },
        path: '/employer/recommendations', 
        icon: Lightbulb 
      },
    ],
    defaultOpen: true,
  },
  {
    titleKey: 'configuration',
    title: { en: 'Configuration', ar: 'الإعدادات' },
    icon: Settings,
    items: [
      { 
        labelKey: 'policy_hub', 
        label: { en: 'Policy Hub', ar: 'مركز السياسات' },
        path: '/employer/policies', 
        icon: BookOpen 
      },
      { 
        labelKey: 'integrations', 
        label: { en: 'Integrations', ar: 'التكاملات' },
        path: '/employer/integrations', 
        icon: Settings 
      },
    ],
    defaultOpen: false,
  },
];

// Shared items that appear in both views
const sharedBottomItems: NavItem[] = [
  { 
    labelKey: 'marketplace', 
    label: { en: 'Marketplace Analytics', ar: 'تحليلات السوق' },
    path: '/employer/marketplace', 
    icon: ShoppingBag 
  },
];

export function EmployerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('employer-view-mode');
    return (saved as ViewMode) || 'strategic';
  });
  
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  // Get current navigation based on view mode
  const currentNavigation = viewMode === 'strategic' ? strategicNavigation : operationalNavigation;

  // Initialize expanded groups based on current navigation
  useEffect(() => {
    const defaultExpanded = currentNavigation
      .filter(g => g.defaultOpen !== false)
      .map(g => g.titleKey);
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
  
  const toggleGroup = (groupTitleKey: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupTitleKey) 
        ? prev.filter(g => g !== groupTitleKey)
        : [...prev, groupTitleKey]
    );
  };

  const ChevronCollapsed = isRTL ? ChevronLeft : ChevronRight;

  // Program Health Score (mock - would come from API)
  const programScore = 72;
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-500 bg-amber-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const sidebarContent = (
    <>
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
          {/* Program Score Badge */}
          <div className={cn(
            "px-2 py-1 text-xs font-bold rounded-full flex items-center gap-1",
            getScoreColor(programScore)
          )}>
            <Target className="w-3 h-3" />
            <span>{programScore}</span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-sidebar-accent/50 rounded-xl p-1 mb-3">
          <div className={cn("flex", isRTL && "flex-row-reverse")}>
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
              <span>{isArabic ? 'تشغيلي' : 'Operational'}</span>
            </button>
          </div>
        </div>

        {/* View Description */}
        <div className={cn(
          "text-[10px] text-sidebar-foreground/50 px-1",
          isRTL && "text-right"
        )}>
          {viewMode === 'strategic' 
            ? (isArabic ? 'للقيادة التنفيذية والإدارة العليا' : 'For C-Suite & Leadership')
            : (isArabic ? 'لفرق الموارد البشرية والعمليات' : 'For HR & Operations Teams')
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
        {/* Dashboard Link - Always visible */}
        <Link
          to="/employer"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'nav-item relative mb-4',
            isActive('/employer') && 'nav-item-active',
            isRTL && 'flex-row-reverse text-right'
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className={cn("text-sm flex-1 font-medium", isRTL && "text-right")}>
            {isArabic ? 'لوحة التحكم' : 'Dashboard'}
          </span>
          {viewMode === 'strategic' && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
              {isArabic ? 'تنفيذي' : 'Executive'}
            </Badge>
          )}
        </Link>

        <Separator className="my-2 bg-sidebar-border/50" />

        {/* Grouped Navigation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: viewMode === 'strategic' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: viewMode === 'strategic' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentNavigation.map((group, index) => (
              <div key={group.titleKey} className={cn("mb-1", index > 0 && "mt-4")}>
                <button
                  onClick={() => toggleGroup(group.titleKey)}
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
                  {expandedGroups.includes(group.titleKey) ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ChevronCollapsed className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedGroups.includes(group.titleKey) && (
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
                            key={item.path}
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
                                  item.badgeColor === 'amber' 
                                    ? "bg-amber-500/20 text-amber-500" 
                                    : "bg-primary/20 text-primary"
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

        {/* Shared Bottom Items */}
        <div className="mt-4 pt-4 border-t border-sidebar-border/50">
          {sharedBottomItems.map((item) => (
            <Link
              key={item.path}
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
            </Link>
          ))}
        </div>

        {/* Integrations - Only in Operational View or as subtle link in Strategic */}
        {viewMode === 'strategic' && (
          <Link
            to="/employer/integrations"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'nav-item relative text-sidebar-foreground/50 hover:text-sidebar-foreground',
              isActive('/employer/integrations') && 'nav-item-active',
              isRTL && 'flex-row-reverse text-right'
            )}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className={cn("text-sm flex-1", isRTL && "text-right")}>
              {isArabic ? 'التكاملات' : 'Integrations'}
            </span>
          </Link>
        )}
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
    </>
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

// Export hook for other components to use
export function useEmployerViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('employer-view-mode');
    return (saved as ViewMode) || 'strategic';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('employer-view-mode');
      if (saved) {
        setViewMode(saved as ViewMode);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return viewMode;
}
