/**
 * RecentClaimsPanel
 * 
 * Shows last 3 claims with minimal info.
 * Clean, scannable, no clutter.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '@/lib/crossPortalContract';

export interface RecentClaimItem {
  id: string;
  category: string;
  amount: number;
  status: 'submitted' | 'in_review' | 'approved' | 'rejected' | 'paid';
  date: string;
}

interface RecentClaimsPanelProps {
  claims: RecentClaimItem[];
  isRTL?: boolean;
  className?: string;
}

const statusConfig: Record<RecentClaimItem['status'], {
  icon: React.ElementType;
  label: string;
  labelAr: string;
  className: string;
}> = {
  submitted: {
    icon: Clock,
    label: 'Submitted',
    labelAr: 'مقدم',
    className: 'bg-muted text-muted-foreground border-border',
  },
  in_review: {
    icon: Clock,
    label: 'In Review',
    labelAr: 'قيد المراجعة',
    className: 'bg-info/10 text-info border-info/20',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    labelAr: 'موافق عليه',
    className: 'bg-success/10 text-success border-success/20',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    labelAr: 'مرفوض',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  paid: {
    icon: CheckCircle,
    label: 'Paid',
    labelAr: 'مدفوع',
    className: 'bg-success/10 text-success border-success/20',
  },
};

export function RecentClaimsPanel({ 
  claims, 
  isRTL = false,
  className,
}: RecentClaimsPanelProps) {
  const navigate = useNavigate();
  
  // No claims yet
  if (!claims || claims.length === 0) {
    return (
      <Card className={cn("border-border/40", className)}>
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "text-base font-semibold flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Receipt className="w-4 h-4 text-muted-foreground" />
            {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-dashed border-border",
            isRTL && "flex-row-reverse"
          )}>
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div className={cn("flex-1", isRTL && "text-right")}>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'لا توجد مطالبات حديثة' : 'No recent claims'}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {isRTL 
                  ? 'ستظهر مطالباتك هنا عند تقديمها'
                  : 'Your claims will appear here once submitted'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("border-border/40", className)}>
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn(
            "text-base font-semibold flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Receipt className="w-4 h-4 text-muted-foreground" />
            {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={() => navigate('/employee/requests')}
          >
            {isRTL ? 'عرض الكل' : 'View all'}
            <ChevronRight className={cn("w-3 h-3", isRTL && "rotate-180")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {claims.slice(0, 3).map((claim) => {
          const config = statusConfig[claim.status];
          const StatusIcon = config.icon;
          
          return (
            <button
              key={claim.id}
              onClick={() => navigate(`/employee/requests?id=${claim.id}`)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group",
                isRTL && "flex-row-reverse text-right"
              )}
            >
              {/* Category & Status */}
              <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                <div className={cn(
                  "flex items-center gap-2 mb-0.5",
                  isRTL && "flex-row-reverse justify-end"
                )}>
                  <span className="text-sm font-medium text-foreground truncate">
                    {claim.category}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-[10px] px-1.5 py-0 gap-1", config.className)}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {isRTL ? config.labelAr : config.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(claim.date)}
                </p>
              </div>
              
              {/* Amount */}
              <div className={cn("text-right shrink-0", isRTL && "text-left")}>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatCurrencyAED(claim.amount)}
                </span>
              </div>
              
              {/* Arrow */}
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0",
                isRTL && "rotate-180"
              )} />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
