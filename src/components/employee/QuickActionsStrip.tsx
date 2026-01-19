import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Calendar, 
  Receipt, 
  Plane, 
  ChevronRight,
  Clock,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  labelAr: string;
  icon: React.ElementType;
  path: string;
  variant?: 'default' | 'outline';
}

interface QuickActionsStripProps {
  pendingCount?: number;
  urgentCount?: number;
  nextPayDate?: string;
  isRTL?: boolean;
  className?: string;
}

const quickActions: QuickAction[] = [
  { label: 'Submit Claim', labelAr: 'تقديم مطالبة', icon: Receipt, path: '/employee/requests', variant: 'default' },
  { label: 'Request Leave', labelAr: 'طلب إجازة', icon: Calendar, path: '/employee/leave', variant: 'outline' },
  { label: 'View Payslip', labelAr: 'عرض كشف الراتب', icon: FileText, path: '/employee/documents', variant: 'outline' },
  { label: 'Book Travel', labelAr: 'حجز السفر', icon: Plane, path: '/employee/requests', variant: 'outline' },
];

export function QuickActionsStrip({ 
  pendingCount = 0, 
  urgentCount = 0,
  nextPayDate,
  isRTL = false,
  className,
}: QuickActionsStripProps) {
  const formatPayDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysUntilPay = getDaysUntil(nextPayDate);
  const formattedPayDate = formatPayDate(nextPayDate);

  return (
    <Card className={cn("border-border/40 bg-gradient-to-r from-card to-primary/3", className)}>
      <CardContent className="p-5">
        <div className={cn(
          "flex flex-col lg:flex-row lg:items-center justify-between gap-4",
          isRTL && "lg:flex-row-reverse"
        )}>
          {/* Left side: Quick actions */}
          <div className={cn("flex items-center gap-3 flex-wrap", isRTL && "flex-row-reverse")}>
            <span className="text-[13px] font-medium text-muted-foreground mr-1">
              {isRTL ? 'إجراءات سريعة:' : 'Quick Actions:'}
            </span>
            {quickActions.map((action) => (
              <Link key={action.path + action.label} to={action.path}>
                <Button 
                  size="sm" 
                  variant={action.variant}
                  className={cn(
                    "h-9 gap-2 text-[13px]",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isRTL ? action.labelAr : action.label}
                  </span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side: Status indicators */}
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            {/* Next Payroll indicator */}
            {formattedPayDate && daysUntilPay !== null && (
              <div className={cn(
                "flex items-center gap-2.5 px-4 py-2 rounded-lg bg-success/8 border border-success/15",
                isRTL && "flex-row-reverse"
              )}>
                <Wallet className="w-4 h-4 text-success" />
                <span className="text-[13px] text-success font-medium">
                  {isRTL 
                    ? `الراتب: ${formattedPayDate}`
                    : `Payroll: ${formattedPayDate}`
                  }
                </span>
                <Badge variant="outline" className="bg-success/8 text-success border-success/15 text-[12px] px-2 py-0.5">
                  {daysUntilPay} {isRTL ? 'يوم' : 'd'}
                </Badge>
              </div>
            )}

            {/* Pending requests indicator */}
            {pendingCount > 0 && (
              <Link to="/employee/requests">
                <div className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer",
                  isRTL && "flex-row-reverse"
                )}>
                  {urgentCount > 0 ? (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Clock className="w-4 h-4 text-warning" />
                  )}
                  <span className="text-[13px]">
                    {isRTL 
                      ? `${pendingCount} طلب قيد الانتظار`
                      : `${pendingCount} pending`
                    }
                  </span>
                  {urgentCount > 0 && (
                    <Badge variant="outline" className="bg-destructive/8 text-destructive border-destructive/15 text-[12px] px-2 py-0.5">
                      {urgentCount} {isRTL ? 'عاجل' : 'urgent'}
                    </Badge>
                  )}
                  <ChevronRight className={cn("w-4 h-4 text-muted-foreground", isRTL && "rotate-180")} />
                </div>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
