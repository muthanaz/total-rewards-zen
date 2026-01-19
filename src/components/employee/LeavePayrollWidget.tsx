import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Wallet, 
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaveBalance } from '@/hooks/useEmployeeDashboard';

interface LeavePayrollWidgetProps {
  leaveBalances: LeaveBalance[];
  nextPayDate: string;
  lastUpdated: string;
  isRTL?: boolean;
  className?: string;
}

export function LeavePayrollWidget({
  leaveBalances,
  nextPayDate,
  lastUpdated,
  isRTL = false,
  className,
}: LeavePayrollWidgetProps) {
  const annualLeave = leaveBalances.find(l => l.leaveType.toLowerCase().includes('annual'));
  const sickLeave = leaveBalances.find(l => l.leaveType.toLowerCase().includes('sick'));
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysUntilPay = getDaysUntil(nextPayDate);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-3", className)}>
      {/* Annual Leave Balance */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-info/10">
              <Calendar className="w-4 h-4 text-info" />
            </div>
            {annualLeave && annualLeave.remainingDays <= 5 && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-0 text-[10px]">
                {isRTL ? 'منخفض' : 'Low'}
              </Badge>
            )}
          </div>
          <div className={cn("mt-3", isRTL && "text-right")}>
            <p className="text-2xl font-bold">
              {annualLeave?.remainingDays ?? '--'}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {isRTL ? 'يوم' : 'days'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRTL ? 'رصيد الإجازة السنوية' : 'Annual Leave Balance'}
            </p>
          </div>
          {annualLeave && (
            <div className="mt-3">
              <div className={cn("flex items-center justify-between text-xs mb-1", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">
                  {annualLeave.usedDays} {isRTL ? 'مستخدم' : 'used'}
                </span>
                <span className="text-muted-foreground">
                  {annualLeave.totalDays} {isRTL ? 'إجمالي' : 'total'}
                </span>
              </div>
              <Progress 
                value={(annualLeave.usedDays / annualLeave.totalDays) * 100} 
                className="h-1.5 [&>div]:bg-info" 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sick Leave Balance */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-chart-5/10">
              <AlertCircle className="w-4 h-4 text-chart-5" />
            </div>
          </div>
          <div className={cn("mt-3", isRTL && "text-right")}>
            <p className="text-2xl font-bold">
              {sickLeave?.remainingDays ?? '--'}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {isRTL ? 'يوم' : 'days'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRTL ? 'رصيد الإجازة المرضية' : 'Sick Leave Balance'}
            </p>
          </div>
          {sickLeave && (
            <div className="mt-3">
              <div className={cn("flex items-center justify-between text-xs mb-1", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">
                  {sickLeave.usedDays} {isRTL ? 'مستخدم' : 'used'}
                </span>
                <span className="text-muted-foreground">
                  {sickLeave.totalDays} {isRTL ? 'إجمالي' : 'total'}
                </span>
              </div>
              <Progress 
                value={(sickLeave.usedDays / sickLeave.totalDays) * 100} 
                className="h-1.5 [&>div]:bg-chart-5" 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Payroll */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-success/10">
              <Wallet className="w-4 h-4 text-success" />
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-0 text-[10px] gap-1">
              <Clock className="w-3 h-3" />
              {daysUntilPay} {isRTL ? 'يوم' : 'd'}
            </Badge>
          </div>
          <div className={cn("mt-3", isRTL && "text-right")}>
            <p className="text-2xl font-bold">
              {formatDate(nextPayDate)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRTL ? 'موعد الراتب القادم' : 'Next Payroll Date'}
            </p>
          </div>
          <div className={cn("mt-3 flex items-center gap-1.5 text-xs text-success", isRTL && "flex-row-reverse justify-end")}>
            <TrendingUp className="w-3 h-3" />
            <span>{isRTL ? 'في الموعد المحدد' : 'On schedule'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
