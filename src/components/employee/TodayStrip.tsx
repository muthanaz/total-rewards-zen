import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Receipt, FileText, ShoppingBag, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface TodayStripProps {
  className?: string;
}

/**
 * Quick action strip for Employee Dashboard
 * Shows 3 primary actions: Submit Claim, Request Document, Browse Marketplace
 */
export function TodayStrip({ className }: TodayStripProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const actions = [
    {
      label: language === 'ar' ? 'تقديم مطالبة' : 'Submit Claim',
      icon: Receipt,
      path: '/employee/requests',
      color: 'from-success/10 to-success/5 border-success/20 hover:border-success/40',
      iconBg: 'bg-success',
    },
    {
      label: language === 'ar' ? 'طلب مستند' : 'Request Document',
      icon: FileText,
      path: '/employee/documents',
      color: 'from-info/10 to-info/5 border-info/20 hover:border-info/40',
      iconBg: 'bg-info',
    },
    {
      label: language === 'ar' ? 'تصفح السوق' : 'Browse Marketplace',
      icon: ShoppingBag,
      path: '/employee/marketplace',
      color: 'from-chart-3/10 to-chart-3/5 border-chart-3/20 hover:border-chart-3/40',
      iconBg: 'bg-chart-3',
    },
  ];

  return (
    <Card className={cn('p-4 border-border/40', className)}>
      <div className={cn('flex items-center gap-2 mb-3', isRTL && 'flex-row-reverse')}>
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        </span>
      </div>
      
      <div className={cn('grid grid-cols-3 gap-3', isRTL && 'direction-rtl')}>
        {actions.map((action) => (
          <Button
            key={action.path}
            variant="ghost"
            className={cn(
              'h-auto py-3 px-4 flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br transition-all',
              action.color,
              'hover:shadow-md'
            )}
            onClick={() => navigate(action.path)}
          >
            <div className={cn('p-2 rounded-lg text-white', action.iconBg)}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
