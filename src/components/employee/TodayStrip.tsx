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
      color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500',
    },
    {
      label: language === 'ar' ? 'طلب مستند' : 'Request Document',
      icon: FileText,
      path: '/employee/documents',
      color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500',
    },
    {
      label: language === 'ar' ? 'تصفح العروض' : 'Browse Offers',
      icon: ShoppingBag,
      path: '/employee/marketplace',
      color: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 hover:border-violet-500/40',
      iconBg: 'bg-violet-500',
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
