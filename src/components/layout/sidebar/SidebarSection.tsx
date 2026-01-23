import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface SidebarSectionProps {
  /** Section ID for state management */
  id: string;
  /** Section label */
  label: string;
  /** Arabic label */
  labelAr?: string;
  /** Whether section is expanded by default */
  defaultOpen?: boolean;
  /** Optional beta badge */
  isBeta?: boolean;
  /** Children nav items */
  children: ReactNode;
  /** Whether this section is controlled externally */
  isOpen?: boolean;
  /** Callback when section is toggled */
  onToggle?: () => void;
}

/**
 * SidebarSection - Collapsible section with header.
 * Matches Employee sidebar section header style exactly.
 */
export function SidebarSection({
  id,
  label,
  labelAr,
  defaultOpen = false,
  isBeta = false,
  children,
  isOpen: controlledOpen,
  onToggle,
}: SidebarSectionProps) {
  const { language, direction } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isRTL = direction === 'rtl';

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const ChevronCollapsed = isRTL ? ChevronLeft : ChevronRight;
  const displayLabel = language === 'ar' && labelAr ? labelAr : label;

  return (
    <div className="mb-1 mt-4 first:mt-0">
      {/* Section heading */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors rounded-lg group',
          'text-sidebar-foreground/60 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/40',
          isRTL && 'flex-row-reverse text-right'
        )}
      >
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary/80" />
          <span>{displayLabel}</span>
          {isBeta && (
            <Badge
              variant="outline"
              className="text-[8px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-500 border-amber-500/30"
            >
              Beta
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-80 transition-opacity" />
        ) : (
          <ChevronCollapsed className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-80 transition-opacity" />
        )}
      </button>

      {isOpen && (
        <div className="mt-1 space-y-0.5 animate-fade-in">{children}</div>
      )}
    </div>
  );
}
