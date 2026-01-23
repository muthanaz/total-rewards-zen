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
    <div className="mb-1 mt-3 first:mt-0">
      {/* Section heading */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors rounded-md group',
          'text-sidebar-foreground/50 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/30',
          isRTL && 'flex-row-reverse text-right'
        )}
      >
        <div className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
          <span>{displayLabel}</span>
          {isBeta && (
            <Badge
              variant="outline"
              className="text-[8px] px-1 py-0 h-3.5 bg-amber-500/10 text-amber-500 border-amber-500/30"
            >
              Beta
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-3 h-3 shrink-0 opacity-50 group-hover:opacity-70 transition-opacity" />
        ) : (
          <ChevronCollapsed className="w-3 h-3 shrink-0 opacity-50 group-hover:opacity-70 transition-opacity" />
        )}
      </button>

      {isOpen && (
        <div className="mt-0.5 space-y-0.5 animate-fade-in">{children}</div>
      )}
    </div>
  );
}
