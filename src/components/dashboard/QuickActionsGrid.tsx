import { Card } from '@/components/ui/card';
import { 
  FileCheck, 
  Download, 
  Heart, 
  Star,
  Calendar,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  route?: string;
  onClick?: () => void;
}

const quickActions: QuickAction[] = [
  {
    id: 'statement',
    title: 'My Statement',
    titleAr: 'كشف حسابي',
    icon: FileCheck,
    color: 'text-accent',
    bgColor: 'bg-accent/10 hover:bg-accent/20',
    route: '/employee/benefits-analysis',
  },
  {
    id: 'claim',
    title: 'Submit Claim',
    titleAr: 'تقديم مطالبة',
    icon: Download,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    route: '/employee/documents',
  },
  {
    id: 'health',
    title: 'Book Health',
    titleAr: 'حجز صحي',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10 hover:bg-rose-500/20',
    route: '/employee/health',
  },
  {
    id: 'recognize',
    title: 'Recognize',
    titleAr: 'تقدير',
    icon: Star,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
  },
  {
    id: 'leave',
    title: 'Request Leave',
    titleAr: 'طلب إجازة',
    icon: Calendar,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    route: '/employee/leave',
  },
  {
    id: 'help',
    title: 'Get Help',
    titleAr: 'المساعدة',
    icon: HelpCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    route: '/employee/knowledge',
  },
];

interface QuickActionsGridProps {
  isRTL?: boolean;
  isArabic?: boolean;
  onActionClick?: (action: QuickAction) => void;
}

export function QuickActionsGrid({
  isRTL = false,
  isArabic = false,
  onActionClick,
}: QuickActionsGridProps) {
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {quickActions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Card
            className={cn(
              "action-card flex flex-col items-center justify-center p-4 h-24 text-center cursor-pointer transition-all duration-200 hover:scale-105",
              action.bgColor,
              "border-0"
            )}
            onClick={() => onActionClick?.(action)}
          >
            <div className={cn("p-2 rounded-xl mb-2", action.bgColor)}>
              <action.icon className={cn("w-5 h-5", action.color)} />
            </div>
            <span className={cn("text-xs font-medium text-foreground", action.color)}>
              {isArabic ? action.titleAr : action.title}
            </span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
