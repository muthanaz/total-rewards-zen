import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface DemoTipProps {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top' | 'bottom' | 'inline';
  variant?: 'default' | 'highlight' | 'subtle';
  className?: string;
}

export function DemoTip({
  id,
  title,
  description,
  action,
  position = 'inline',
  variant = 'default',
  className,
}: DemoTipProps) {
  const { isDemoMode, showDemoTips } = useDemoMode();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const dismissedTips = JSON.parse(localStorage.getItem('bnft_dismissed_tips') || '[]');
    return dismissedTips.includes(id);
  });

  if (!isDemoMode || !showDemoTips || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    const dismissedTips = JSON.parse(localStorage.getItem('bnft_dismissed_tips') || '[]');
    localStorage.setItem('bnft_dismissed_tips', JSON.stringify([...dismissedTips, id]));
  };

  const variantStyles = {
    default: 'bg-gradient-to-r from-info/10 to-info/5 border-info/30 text-info-foreground',
    highlight: 'bg-gradient-to-r from-accent/15 to-accent/5 border-accent/40 text-foreground',
    subtle: 'bg-muted/50 border-border text-muted-foreground',
  };

  const positionStyles = {
    top: 'mb-4',
    bottom: 'mt-4',
    inline: '',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'relative rounded-xl border p-4',
          variantStyles[variant],
          positionStyles[position],
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-info/20 shrink-0">
            <Lightbulb className="w-4 h-4 text-info" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-info">
                Demo Tip
              </span>
            </div>
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            {action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className="mt-2 h-8 px-3 text-info hover:text-info hover:bg-info/10"
              >
                {action.label}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Pre-configured tips for key pages
export const DEMO_TIPS = {
  employerDashboard: {
    id: 'tip-employer-dashboard',
    title: 'Executive Overview',
    description: 'This dashboard shows C-suite metrics like ROI, utilization, and employee satisfaction. Click any card to drill down into detailed analytics.',
  },
  employerClaims: {
    id: 'tip-employer-claims',
    title: 'Claims Processing Queue',
    description: 'Process employee claims with SLA tracking. Red badges indicate urgent items approaching their deadline.',
  },
  employeeBenefits: {
    id: 'tip-employee-benefits',
    title: 'Your Benefits at a Glance',
    description: 'Each card shows your annual allowance and how much you\'ve utilized. Click any benefit to see details and submit claims.',
  },
  policyPublishing: {
    id: 'tip-policy-publishing',
    title: 'Policy Version Control',
    description: 'Edit and publish policy updates. Changes go live immediately to all employees once published.',
  },
  recommendations: {
    id: 'tip-recommendations',
    title: 'AI-Powered Insights',
    description: 'Recommendations are generated based on utilization patterns and employee feedback. Each includes expected ROI impact.',
  },
};
