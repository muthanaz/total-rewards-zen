/**
 * PolicyContextWidget - Quick context panel for claim review
 * 
 * Shows employee context for rapid decision-making:
 * - Employee grade and eligibility status
 * - Remaining balance YTD with visual progress
 * - Previous claims history in this category
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  GraduationCap,
  Wallet,
  History,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useSharedRequests } from '@/hooks/useSharedRequests';
import { format } from 'date-fns';

interface PolicyContextWidgetProps {
  employeeId: string | null;
  employeeName: string | null;
  employeeGrade: string | null;
  category: string | null;
  currentRequestId: string | null;
  organizationId: string | null;
  // Entitlement data from useClaimEntitlementCheck
  entitlement?: {
    annualAllowance: number;
    utilizedAmount: number;
    remainingAmount: number;
    utilizationRate: number;
  } | null;
  isLoading?: boolean;
  className?: string;
}

interface PreviousClaim {
  id: string;
  subject: string;
  amount: number | null;
  status: string | null;
  created_at: string | null;
}

const statusIcons: Record<string, typeof CheckCircle> = {
  approved: CheckCircle,
  paid: CheckCircle,
  rejected: XCircle,
  pending: Clock,
  in_review: Clock,
};

const statusColors: Record<string, string> = {
  approved: 'text-success',
  paid: 'text-success',
  rejected: 'text-destructive',
  pending: 'text-warning',
  in_review: 'text-muted-foreground',
};

export function PolicyContextWidget({
  employeeId,
  employeeName,
  employeeGrade,
  category,
  currentRequestId,
  organizationId,
  entitlement,
  isLoading = false,
  className,
}: PolicyContextWidgetProps) {
  // Fetch all employee claims to filter by category
  const { data: allClaims = [], isLoading: claimsLoading } = useSharedRequests({
    userId: employeeId || undefined,
    limit: 50,
  });

  // Filter for previous claims in same category
  const previousClaims: PreviousClaim[] = useMemo(() => {
    if (!category || !allClaims.length) return [];
    
    return allClaims
      .filter(claim => 
        claim.category === category && 
        claim.id !== currentRequestId &&
        ['approved', 'paid', 'rejected'].includes(claim.status || '')
      )
      .slice(0, 5)
      .map(claim => ({
        id: claim.id,
        subject: claim.subject,
        amount: claim.amount,
        status: claim.status,
        created_at: claim.created_at,
      }));
  }, [allClaims, category, currentRequestId]);

  // Calculate category total (approved/paid only)
  const categoryTotal = useMemo(() => {
    if (!category || !allClaims.length) return 0;
    
    return allClaims
      .filter(claim => 
        claim.category === category && 
        ['approved', 'paid'].includes(claim.status || '')
      )
      .reduce((sum, claim) => sum + (claim.amount || 0), 0);
  }, [allClaims, category]);

  if (isLoading) {
    return (
      <Card className={cn('border-primary/20', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Policy Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const utilizationPercent = entitlement?.utilizationRate || 0;
  const isNearLimit = utilizationPercent >= 80;
  const isOverLimit = utilizationPercent >= 100;

  return (
    <Card className={cn('border-primary/20 bg-primary/5', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Policy Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Info Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{employeeName || 'Unknown Employee'}</p>
              {employeeGrade && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GraduationCap className="w-3 h-3" />
                  Grade: {employeeGrade}
                </div>
              )}
            </div>
          </div>
          {employeeGrade && (
            <Badge variant="outline" className="text-xs">
              {employeeGrade}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Remaining Balance YTD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              Remaining Balance
            </span>
            <span className={cn(
              'font-semibold font-mono',
              isOverLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : 'text-foreground'
            )}>
              {formatCurrencyAED(entitlement?.remainingAmount || 0)}
            </span>
          </div>
          
          <Progress 
            value={Math.min(utilizationPercent, 100)} 
            className={cn(
              'h-2',
              isOverLimit && '[&>div]:bg-destructive',
              isNearLimit && !isOverLimit && '[&>div]:bg-warning'
            )}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Used: {formatCurrencyAED(entitlement?.utilizedAmount || 0)} ({utilizationPercent}%)
            </span>
            <span>
              Cap: {formatCurrencyAED(entitlement?.annualAllowance || 0)}
            </span>
          </div>
          
          {isNearLimit && (
            <div className={cn(
              'flex items-center gap-1.5 text-xs p-2 rounded-md',
              isOverLimit 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-warning/10 text-warning'
            )}>
              <AlertCircle className="w-3.5 h-3.5" />
              {isOverLimit 
                ? 'Annual allowance exceeded' 
                : 'Approaching annual limit'
              }
            </div>
          )}
        </div>

        <Separator />

        {/* Previous Claims History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <History className="w-4 h-4" />
              Previous {category} Claims
            </span>
            <Badge variant="secondary" className="text-xs">
              {previousClaims.length} found
            </Badge>
          </div>

          {claimsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : previousClaims.length > 0 ? (
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {previousClaims.map((claim) => {
                  const StatusIcon = statusIcons[claim.status || ''] || Clock;
                  const statusColor = statusColors[claim.status || ''] || 'text-muted-foreground';
                  
                  return (
                    <div 
                      key={claim.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <StatusIcon className={cn('w-4 h-4 shrink-0', statusColor)} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{claim.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {claim.created_at 
                              ? format(new Date(claim.created_at), 'MMM d, yyyy')
                              : '—'
                            }
                          </p>
                        </div>
                      </div>
                      {claim.amount !== null && claim.amount > 0 && (
                        <span className="text-xs font-mono shrink-0 ml-2">
                          {formatCurrencyAED(claim.amount)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No previous claims in this category
            </div>
          )}

          {/* Category YTD Total */}
          {categoryTotal > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground">YTD Total (Approved)</span>
              <span className="font-mono font-medium">{formatCurrencyAED(categoryTotal)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PolicyContextWidget;
