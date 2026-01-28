import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CreditCard, 
  DollarSign, 
  User, 
  Copy,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { BatchException } from './types';
import { format } from 'date-fns';

interface ExceptionsPanelProps {
  exceptions: BatchException[];
  onResolve?: (exception: BatchException) => void;
  onViewClaim?: (claimId: string) => void;
  className?: string;
}

const exceptionConfig = {
  failed_payment: {
    label: 'Failed Payment',
    icon: CreditCard,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  amount_mismatch: {
    label: 'Amount Mismatch',
    icon: DollarSign,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  missing_bank_details: {
    label: 'Missing Bank Details',
    icon: User,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  duplicate_entry: {
    label: 'Duplicate Entry',
    icon: Copy,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
};

export function ExceptionsPanel({ 
  exceptions, 
  onResolve, 
  onViewClaim,
  className 
}: ExceptionsPanelProps) {
  const criticalCount = exceptions.filter(e => e.severity === 'critical').length;
  const warningCount = exceptions.filter(e => e.severity === 'warning').length;
  const totalAtRisk = exceptions.reduce((sum, e) => sum + e.expectedAmount, 0);

  if (exceptions.length === 0) {
    return (
      <Card className={cn('border-success/30 bg-success/5', className)}>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
          <p className="font-medium text-success">No Exceptions</p>
          <p className="text-sm text-muted-foreground mt-1">
            All payments are reconciled successfully
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-destructive/30', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Payment Exceptions
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="text-xs border-warning text-warning">
                {warningCount} Warning
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Total at risk: <span className="font-semibold tabular-nums">{formatCurrencyAED(totalAtRisk)}</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exceptions.map((exception) => {
            const config = exceptionConfig[exception.type];
            const Icon = config.icon;

            return (
              <div
                key={exception.id}
                className={cn(
                  'p-3 rounded-lg border',
                  exception.severity === 'critical' 
                    ? 'bg-destructive/5 border-destructive/30' 
                    : exception.severity === 'warning'
                    ? 'bg-warning/5 border-warning/30'
                    : 'bg-muted/50 border-border'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', config.bg)}>
                      <Icon className={cn('w-4 h-4', config.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{exception.employeeName}</span>
                        <Badge variant="secondary" className="text-[10px] px-1">
                          {exception.employeeGrade}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {config.label} • {exception.claimId}
                      </p>
                      <p className="text-xs mt-1">
                        {exception.description}
                      </p>
                      {exception.actualAmount !== undefined && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="text-muted-foreground">
                            Expected: <span className="tabular-nums font-medium">{formatCurrencyAED(exception.expectedAmount)}</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-destructive">
                            Actual: <span className="tabular-nums font-medium">{formatCurrencyAED(exception.actualAmount)}</span>
                          </span>
                        </div>
                      )}
                      {exception.bankDetails && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={exception.bankDetails.hasIban ? 'secondary' : 'destructive'}
                            className="text-[10px]"
                          >
                            IBAN {exception.bankDetails.hasIban ? '✓' : '✗'}
                          </Badge>
                          <Badge 
                            variant={exception.bankDetails.hasBankName ? 'secondary' : 'destructive'}
                            className="text-[10px]"
                          >
                            Bank {exception.bankDetails.hasBankName ? '✓' : '✗'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrencyAED(exception.expectedAmount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onViewClaim?.(exception.claimId)}
                      >
                        View Claim
                      </Button>
                      {!exception.resolvedAt && onResolve && (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onResolve(exception)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
