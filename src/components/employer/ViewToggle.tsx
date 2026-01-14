import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { LayoutDashboard, Settings2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export type ViewMode = 'strategic' | 'operational';

interface ViewToggleProps {
  defaultView?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  storageKey?: string;
}

export function ViewToggle({ 
  defaultView = 'strategic', 
  onViewChange,
  storageKey = 'employer-dashboard-view'
}: ViewToggleProps) {
  const { direction, t } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [view, setView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(storageKey);
    return (saved as ViewMode) || defaultView;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, view);
    onViewChange?.(view);
  }, [view, storageKey, onViewChange]);

  const views = [
    {
      id: 'strategic' as ViewMode,
      label: isRTL ? 'العرض الاستراتيجي' : 'Strategic View',
      description: isRTL ? 'للقيادة التنفيذية' : 'For C-Suite',
      icon: Eye
    },
    {
      id: 'operational' as ViewMode,
      label: isRTL ? 'العرض التشغيلي' : 'Operational View',
      description: isRTL ? 'للموارد البشرية' : 'For HR Teams',
      icon: Settings2
    }
  ];

  return (
    <div className={cn(
      "inline-flex items-center p-1 rounded-xl bg-muted/50 border border-border/50",
      isRTL && "flex-row-reverse"
    )}>
      {views.map((v) => {
        const isActive = view === v.id;
        const Icon = v.icon;
        
        return (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
              isRTL && "flex-row-reverse"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeView"
                className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{v.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function useViewToggle(storageKey = 'employer-dashboard-view', defaultView: ViewMode = 'strategic') {
  const [view, setView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(storageKey);
    return (saved as ViewMode) || defaultView;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, view);
  }, [view, storageKey]);

  return { view, setView };
}
