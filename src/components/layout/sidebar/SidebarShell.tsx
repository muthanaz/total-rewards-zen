import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarShellProps {
  children: ReactNode;
}

/**
 * SidebarShell - The outer container for all portal sidebars.
 * Provides consistent width, background, mobile behavior, and RTL support.
 */
export function SidebarShell({ children }: SidebarShellProps) {
  const { direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = direction === 'rtl';

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

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 z-40 h-screen w-64 flex flex-col bg-sidebar transition-transform duration-300 shadow-xl',
          isRTL 
            ? 'right-0 lg:translate-x-0 border-l border-sidebar-border' 
            : 'left-0 lg:translate-x-0 border-r border-sidebar-border',
          isRTL
            ? mobileOpen
              ? 'translate-x-0'
              : 'translate-x-full'
            : mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
        )}
      >
        <SidebarShellContext.Provider value={{ mobileOpen, setMobileOpen }}>
          {children}
        </SidebarShellContext.Provider>
      </aside>
    </>
  );
}

// Context to allow children to close mobile menu
import { createContext, useContext } from 'react';

interface SidebarShellContextType {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarShellContext = createContext<SidebarShellContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useSidebarShell() {
  return useContext(SidebarShellContext);
}
