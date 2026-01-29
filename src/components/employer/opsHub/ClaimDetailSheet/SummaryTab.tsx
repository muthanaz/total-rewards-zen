/**
 * ClaimDetailSheet - Summary Tab
 * 
 * Shows employee info, policy reference, amounts, entitlement calculation breakdown
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  FileText,
  Calculator,
  Shield,
  Calendar,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';
import type { ClaimSummary } from './types';

interface SummaryTabProps {
  claim: ClaimSummary;
}

function InfoRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex justify-between items-center py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function SummaryTab({ claim }: SummaryTabProps) {
  const payableCalculation = {
    claimed: claim.amountClaimed ?? 0,
    eligible: claim.eligibleAmount ?? claim.amountClaimed ?? 0,
    remaining: claim.remainingEntitlement,
    copay: claim.employeeCopay ?? 0,
    payable: claim.payableAmount,
  };

  return (
    <div className="space-y-4">
      {/* Employee Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <InfoRow label="Name" value={claim.employeeName} />
          <InfoRow label="Grade" value={<Badge variant="outline">{claim.employeeGrade}</Badge>} />
          {claim.employeeCode && <InfoRow label="Employee ID" value={claim.employeeCode} />}
        </CardContent>
      </Card>

      {/* Policy Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            Policy Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <InfoRow 
            label="Policy" 
            value={
              claim.policyRef ? (
                <span className="font-mono text-xs">{claim.policyRef}</span>
              ) : (
                <span className="text-muted-foreground italic">No policy linked</span>
              )
            } 
          />
          <InfoRow label="Category" value={claim.category} />
          <InfoRow label="Type" value={claim.claimType} />
        </CardContent>
      </Card>

      {/* Amounts & Calculation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            Payable Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Amount claimed */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount Claimed</span>
            <span className="text-sm font-semibold tabular-nums">
              {formatCurrencyAED(payableCalculation.claimed)}
            </span>
          </div>
          
          {/* Eligible amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Eligible Amount</span>
            <span className="text-sm tabular-nums">
              {formatCurrencyAED(payableCalculation.eligible)}
            </span>
          </div>
          
          {/* Remaining entitlement */}
          {payableCalculation.remaining !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Remaining Entitlement</span>
              <span className={cn(
                "text-sm tabular-nums",
                payableCalculation.remaining < payableCalculation.eligible && "text-warning"
              )}>
                {formatCurrencyAED(payableCalculation.remaining)}
              </span>
            </div>
          )}
          
          {/* Copay deduction */}
          {payableCalculation.copay > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Minus className="w-3 h-3" />
                Employee Copay
              </span>
              <span className="text-sm tabular-nums text-destructive">
                -{formatCurrencyAED(payableCalculation.copay)}
              </span>
            </div>
          )}
          
          <Separator />
          
          {/* Payable amount */}
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-medium">Payable Amount</span>
            <span className="text-lg font-bold tabular-nums text-primary">
              {payableCalculation.payable !== null
                ? formatCurrencyAED(payableCalculation.payable)
                : <span className="text-muted-foreground text-sm italic">Not computed</span>
              }
            </span>
          </div>
          
          {/* Formula tooltip */}
          <p className="text-[10px] text-muted-foreground italic">
            Formula: max(0, min(Eligible, Remaining) - Copay)
          </p>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Submission Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <InfoRow 
            label="Submitted" 
            value={claim.submittedAt ? format(new Date(claim.submittedAt), 'dd MMM yyyy, HH:mm') : '—'} 
          />
          <InfoRow 
            label="Assigned To" 
            value={claim.assignedToName || <span className="text-muted-foreground italic">Unassigned</span>} 
          />
          <InfoRow 
            label="Subject" 
            value={claim.subject || '—'} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
