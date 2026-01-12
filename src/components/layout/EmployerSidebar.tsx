import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  DollarSign,
  Ghost,
  Users,
  FileCheck,
  ShoppingBag,
  FileText,
  Lightbulb,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { label: 'Overview', path: '/employer', icon: LayoutDashboard },
  { label: 'Spend & Utilization', path: '/employer/spend', icon: DollarSign },
  { label: 'Zombie Spend', path: '/employer/zombie', icon: Ghost },
  { label: 'Employee Segments', path: '/employer/segments', icon: Users },
  { label: 'Claims & Approvals', path: '/employer/claims', icon: FileCheck },
  { label: 'Marketplace Analytics', path: '/employer/marketplace', icon: ShoppingBag },
  { label: 'Policy Insights', path: '/employer/policies', icon: FileText },
  { label: 'Recommendations', path: '/employer/recommendations', icon: Lightbulb },
];

export function EmployerSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
          <span className="text-sidebar-background font-bold text-lg">b</span>
        </div>
        <span className="font-display text-xl font-bold text-sidebar-foreground">bnft.</span>
        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-sidebar-accent text-sidebar-primary">
          Employer
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navigation.map((item) => (
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