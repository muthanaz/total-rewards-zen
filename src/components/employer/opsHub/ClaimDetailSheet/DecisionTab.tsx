/**
 * ClaimDetailSheet - Decision Tab
 * 
 * Approve / Reject / Request Info with required reason codes and validation
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  XCircle,
  FileQuestion,
  AlertTriangle,
  Info,
  Shield,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import type { DecisionPayload, ClaimSummary, ClaimDocument, SettlementReadiness } from './types';

interface DecisionTabProps {
  claim: ClaimSummary;
  documents: ClaimDocument[];
  settlementReadiness: SettlementReadiness | null;
  onDecision: (payload: DecisionPayload) => void;
  isProcessing: boolean;
}

const APPROVAL_REASON_CODES = [
  { value: 'STANDARD_APPROVAL', label: 'Standard Approval - All criteria met' },
  { value: 'APPROVE_WITH_EXCEPTION', label: 'Approve with Exception' },
];

const REJECTION_REASON_CODES = [
  { value: 'INSUFFICIENT_DOCS', label: 'Insufficient Documentation' },
  { value: 'EXCEEDS_ENTITLEMENT', label: 'Exceeds Entitlement Limit' },
  { value: 'NOT_ELIGIBLE', label: 'Not Eligible per Policy' },
  { value: 'DUPLICATE_CLAIM', label: 'Duplicate Submission' },
  { value: 'POLICY_VIOLATION', label: 'Policy Violation' },
  { value: 'FRAUDULENT', label: 'Suspected Fraudulent Claim' },
  { value: 'OTHER', label: 'Other Reason' },
];

const INFO_REQUEST_CODES = [
  { value: 'MISSING_DOCS', label: 'Missing Required Documents' },
  { value: 'CLARIFICATION_NEEDED', label: 'Clarification Needed' },
  { value: 'ADDITIONAL_INFO', label: 'Additional Information Required' },
];

const MIN_REASON_LENGTH = 20;

export function DecisionTab({ 
  claim, 
  documents, 
  settlementReadiness,
  onDecision, 
  isProcessing 
}: DecisionTabProps) {
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [reasonCode, setReasonCode] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [messageToEmployee, setMessageToEmployee] = useState('');
  const [acknowledgeOverride, setAcknowledgeOverride] = useState(false);

  // Validation checks
  const allRequiredDocsVerified = documents.filter(d => d.isRequired).every(d => d.status === 'verified');
  const hasPayableAmount = claim.payableAmount !== null && claim.payableAmount > 0;
  const pendingDocCount = documents.filter(d => d.isRequired && d.status !== 'verified').length;

  const canApprove = useMemo(() => {
    if (!hasPayableAmount) return false;
    if (!allRequiredDocsVerified && reasonCode !== 'APPROVE_WITH_EXCEPTION') return false;
    if (reasonCode === 'APPROVE_WITH_EXCEPTION' && !acknowledgeOverride) return false;
    return reasonText.length >= MIN_REASON_LENGTH;
  }, [hasPayableAmount, allRequiredDocsVerified, reasonCode, acknowledgeOverride, reasonText]);

  const canReject = useMemo(() => {
    return reasonCode && reasonText.length >= MIN_REASON_LENGTH;
  }, [reasonCode, reasonText]);

  const canRequestInfo = useMemo(() => {
    return reasonCode && messageToEmployee.length >= MIN_REASON_LENGTH;
  }, [reasonCode, messageToEmployee]);

  const handleSubmit = () => {
    if (!selectedAction || !reasonCode) return;

    const payload: DecisionPayload = {
      action: selectedAction,
      reasonCode,
      reasonText: selectedAction === 'request_info' ? messageToEmployee : reasonText,
      messageToEmployee: selectedAction === 'request_info' ? messageToEmployee : undefined,
      overrideCode: reasonCode === 'APPROVE_WITH_EXCEPTION' ? 'OVERRIDE_DOCS' : undefined,
    };

    onDecision(payload);
  };

  const isActionDisabled = () => {
    if (!selectedAction) return true;
    if (selectedAction === 'approve') return !canApprove;
    if (selectedAction === 'reject') return !canReject;
    if (selectedAction === 'request_info') return !canRequestInfo;
    return true;
  };

  return (
    <div className="space-y-4">
      {/* Pre-decision Checks */}
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Pre-Decision Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center gap-2">
            {allRequiredDocsVerified ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-warning" />
            )}
            <span className="text-sm">
              Required documents: {allRequiredDocsVerified ? 'All verified' : `${pendingDocCount} pending`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasPayableAmount ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">
              Payable amount: {hasPayableAmount ? formatCurrencyAED(claim.payableAmount!) : 'Not computed'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Selection */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant={selectedAction === 'approve' ? 'default' : 'outline'}
          className={cn(
            'h-auto py-4 flex-col gap-2',
            selectedAction === 'approve' && 'bg-success text-success-foreground hover:bg-success/90'
          )}
          onClick={() => {
            setSelectedAction('approve');
            setReasonCode('STANDARD_APPROVAL');
            setReasonText('');
          }}
        >
          <CheckCircle className="w-5 h-5" />
          <span>Approve</span>
        </Button>
        
        <Button
          variant={selectedAction === 'reject' ? 'default' : 'outline'}
          className={cn(
            'h-auto py-4 flex-col gap-2',
            selectedAction === 'reject' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          )}
          onClick={() => {
            setSelectedAction('reject');
            setReasonCode('');
            setReasonText('');
          }}
        >
          <XCircle className="w-5 h-5" />
          <span>Reject</span>
        </Button>
        
        <Button
          variant={selectedAction === 'request_info' ? 'default' : 'outline'}
          className={cn(
            'h-auto py-4 flex-col gap-2',
            selectedAction === 'request_info' && 'bg-warning text-warning-foreground hover:bg-warning/90'
          )}
          onClick={() => {
            setSelectedAction('request_info');
            setReasonCode('MISSING_DOCS');
            setMessageToEmployee('');
          }}
        >
          <FileQuestion className="w-5 h-5" />
          <span>Request Info</span>
        </Button>
      </div>

      {/* Action Form */}
      {selectedAction && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm capitalize">{selectedAction.replace('_', ' ')} Claim</CardTitle>
            <CardDescription>
              {selectedAction === 'approve' && 'Confirm approval with reason code and notes'}
              {selectedAction === 'reject' && 'Select rejection reason and provide explanation'}
              {selectedAction === 'request_info' && 'Specify what information is needed from the employee'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Reason Code Select */}
            <div className="space-y-2">
              <Label>Reason Code *</Label>
              <Select value={reasonCode} onValueChange={setReasonCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedAction === 'approve' && APPROVAL_REASON_CODES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                  {selectedAction === 'reject' && REJECTION_REASON_CODES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                  {selectedAction === 'request_info' && INFO_REQUEST_CODES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Override acknowledgment for approval with exception */}
            {selectedAction === 'approve' && reasonCode === 'APPROVE_WITH_EXCEPTION' && (
              <Alert className="border-warning/30 bg-warning/5">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <AlertTitle className="text-sm">Exception Override Required</AlertTitle>
                <AlertDescription className="text-xs">
                  Not all required documents are verified. Approving with exception requires explicit acknowledgment.
                </AlertDescription>
                <div className="flex items-center gap-2 mt-3">
                  <Checkbox 
                    id="override" 
                    checked={acknowledgeOverride}
                    onCheckedChange={(checked) => setAcknowledgeOverride(!!checked)}
                  />
                  <Label htmlFor="override" className="text-xs cursor-pointer">
                    I acknowledge this approval is an exception to policy
                  </Label>
                </div>
              </Alert>
            )}

            {/* Reason Text / Message */}
            <div className="space-y-2">
              <Label>
                {selectedAction === 'request_info' ? 'Message to Employee *' : 'Reason Notes *'}
                <span className="text-muted-foreground ml-2 text-xs">
                  (min {MIN_REASON_LENGTH} characters)
                </span>
              </Label>
              <Textarea
                placeholder={
                  selectedAction === 'approve' 
                    ? 'Describe the basis for approval...'
                    : selectedAction === 'reject'
                    ? 'Explain the reason for rejection...'
                    : 'Specify what documents or information is needed...'
                }
                value={selectedAction === 'request_info' ? messageToEmployee : reasonText}
                onChange={(e) => {
                  if (selectedAction === 'request_info') {
                    setMessageToEmployee(e.target.value);
                  } else {
                    setReasonText(e.target.value);
                  }
                }}
                rows={4}
              />
              <p className={cn(
                'text-xs',
                (selectedAction === 'request_info' ? messageToEmployee.length : reasonText.length) < MIN_REASON_LENGTH
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              )}>
                {(selectedAction === 'request_info' ? messageToEmployee.length : reasonText.length)}/{MIN_REASON_LENGTH} characters minimum
              </p>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              variant={selectedAction === 'reject' ? 'destructive' : selectedAction === 'approve' ? 'default' : 'secondary'}
              onClick={handleSubmit}
              disabled={isActionDisabled() || isProcessing}
            >
              {isProcessing ? 'Processing...' : (
                <>
                  {selectedAction === 'approve' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {selectedAction === 'reject' && <XCircle className="w-4 h-4 mr-2" />}
                  {selectedAction === 'request_info' && <FileQuestion className="w-4 h-4 mr-2" />}
                  Confirm {selectedAction.replace('_', ' ')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info about SLA pause */}
      {selectedAction === 'request_info' && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription className="text-xs">
            Requesting information will pause the SLA timer and move the claim to "Awaiting Employee" status.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
