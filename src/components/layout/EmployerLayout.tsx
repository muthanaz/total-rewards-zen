/**
 * Employer Layout with Persistent Mode Toggle Header
 * 
 * The mode toggle (Executive View / HR Ops View) is now in the header,
 * always visible regardless of sidebar state.
 */

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmployerViewModeProvider, useEmployerViewMode, ViewMode } from '@/contexts/EmployerViewModeContext';
import { SkipLink, MainContent } from '@/components/ui/skip-link';
import { cn } from '@/lib/utils';
import { Eye, Briefcase, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommandPalette } from '@/components/ui/command-palette';

// ============================================================================
// MODE TOGGLE COMPONENT (Header Version)
// ============================================================================

function HeaderModeToggle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { direction, language } = useLanguage();
  const { viewMode, setViewMode, isExecutive } = useEmployerViewMode();
  const isRTL = direction === 'rtl';

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Redirect to the correct landing page for the selected mode
    if (mode === 'operational') {
      navigate('/employer/ops');
    } else {
      navigate('/employer');
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border">
      <Button
        variant={isExecutive ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleModeChange('executive')}
        className={cn(
          'gap-2 h-8 px-3 text-xs font-medium transition-all',
          isExecutive 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'hover:bg-muted'
        )}
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {language === 'ar' ? 'العرض التنفيذي' : 'Executive View'}
        </span>
        <span className="sm:hidden">Exec</span>
      </Button>
      <Button
        variant={!isExecutive ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleModeChange('operational')}
        className={cn(
          'gap-2 h-8 px-3 text-xs font-medium transition-all',
          !isExecutive 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'hover:bg-muted'
        )}
      >
        <Briefcase className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {language === 'ar' ? 'عرض العمليات' : 'HR Ops View'}
        </span>
        <span className="sm:hidden">Ops</span>
      </Button>
    </div>
  );
}

// ============================================================================
// COMMAND PALETTE TRIGGER
// ============================================================================

function CommandPaletteTrigger() {
  const { open } = useCommandPalette();
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={open}
      className="gap-2 h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
    >
      <Command className="w-3.5 h-3.5" />
      <span className="hidden md:inline">Search</span>
      <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-70">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}

// ============================================================================
// LAYOUT INNER COMPONENT (needs context)
// ============================================================================

function EmployerLayoutInner() {
  const location = useLocation();
  const showBreadcrumbs = location.pathname !== '/employer';
  const { direction } = useLanguage();
  const { isExecutive } = useEmployerViewMode();
  const isRTL = direction === 'rtl';

  return (
    <div className="min-h-screen bg-background">
      <SkipLink targetId="employer-main-content" />
      <EmployerSidebar />
      
      {/* Persistent Header with Mode Toggle */}
      <header 
        className={cn(
          'fixed top-0 right-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-6',
          isRTL ? 'lg:right-64 left-0' : 'lg:left-64 right-0'
        )}
      >
        <div className="flex items-center gap-4">
          {/* Mode indicator text */}
          <span className="text-sm font-medium text-muted-foreground hidden lg:block">
            {isExecutive ? 'Executive Dashboard' : 'HR Operations'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <CommandPaletteTrigger />
          <HeaderModeToggle />
        </div>
      </header>

      <MainContent
        id="employer-main-content"
        className={cn(
          'transition-all duration-300 pt-14',
          isRTL ? 'lg:pr-64' : 'lg:pl-64'
        )}
      >
        <div className="p-4 lg:p-8">
          {showBreadcrumbs && <Breadcrumbs />}
          <Outlet />
        </div>
      </MainContent>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function EmployerLayout() {
  return (
    <EmployerViewModeProvider>
      <EmployerLayoutInner />
    </EmployerViewModeProvider>
  );
}
