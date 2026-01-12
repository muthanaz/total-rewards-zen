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
  PiggyBank,
  TrendingUp,
  BookOpen,
  Calendar,
  ShoppingBag,
  Gift,
  FileText,
  Building2,
  User,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navigation: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Overview', path: '/employee', icon: LayoutDashboard },
    ],
  },
  {
    label: 'My Benefits',
    items: [
      { label: 'Housing', path: '/employee/housing', icon: Home },
      { label: 'Schooling', path: '/employee/schooling', icon: GraduationCap },
      { label: 'Health Insurance', path: '/employee/health', icon: Heart },
      { label: 'Transport & Mobility', path: '/employee/transport', icon: Car },
      { label: 'Wellbeing Program', path: '/employee/wellbeing', icon: Dumbbell },
      { label: 'Financial Planning', path: '/employee/financial', icon: PiggyBank },
      { label: 'Equity & Options', path: '/employee/equity', icon: TrendingUp },
      { label: 'Learning & Development', path: '/employee/learning', icon: BookOpen },
      { label: 'Leave Management', path: '/employee/leave', icon: Calendar },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Perks & Partners', path: '/employee/marketplace', icon: Gift },
    ],
  },
  {
    label: 'Services',
    items: [
      { label: 'HR Documents', path: '/employee/documents', icon: FileText },
      { label: 'Gov Connect', path: '/employee/gov-connect', icon: Building2 },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Smart Profile', path: '/employee/profile', icon: User },
    ],
  },
];

export function EmployeeSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Dashboard', 'My Benefits']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label)
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
            <span className="text-sidebar-background font-bold text-lg">b</span>
          </div>
          <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
        </div>
        <DarkModeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((group) => (
          <div key={group.label} className="mb-2">
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            >
              {group.label}
              {expandedGroups.includes(group.label) ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            
            {expandedGroups.includes(group.label) && (
              <div className="mt-1 space-y-0.5 animate-fade-in">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'nav-item',
                      isActive(item.path) && 'nav-item-active'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground lg:hidden"
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
          'fixed left-0 top-0 z-40 h-screen w-64 flex flex-col bg-sidebar transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}