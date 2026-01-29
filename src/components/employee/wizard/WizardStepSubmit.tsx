/**
 * Wizard Step 5: Review & Submit
 * 
 * Final review before submission.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Currency } from '@/components/ui/Currency';
import { BENEFIT_CATEGORIES, BenefitCategoryKey } from '@/lib/benefitCategories';
import { TransactionModel } from '@/lib/policyEngine';
import { ClaimDetailsData } from './WizardStepDetails';
import { CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UploadedDoc {
  docType: string;
  fileName: string;
  uploaded: boolean;
}

interface WizardStepSubmitProps {
  category: BenefitCategoryKey;
  transactionModel: TransactionModel;
  policyRef: string | null;
  details: ClaimDetailsData;
  uploadedDocs: UploadedDoc[];
  estimatedPayable: number | null;
  isRequest: boolean;
}

export function WizardStepSubmit({
  category,
  transactionModel,
  policyRef,
  details,
  uploadedDocs,
  estimatedPayable,
  isRequest,
}: WizardStepSubmitProps) {
  const categoryInfo = BENEFIT_CATEGORIES[category];
  const Icon = categoryInfo.icon;
  const uploadedCount = uploadedDocs.filter((d) => d.uploaded).length;
  const parsedAmount = details.amount ? parseFloat(details.amount) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">
          Review your {isRequest ? 'request' : 'claim'} details before submitting.
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2.5 rounded-lg text-white bg-gradient-to-br',
              categoryInfo.gradientClass
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{categoryInfo.fullLabel}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRequest ? 'Request' : 'Claim'} • {policyRef || 'No policy'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {details.subType && (
              <div>
                <span className="text-muted-foreground">Type</span>
                <p className="font-medium capitalize">{details.subType.replace(/_/g, ' ')}</p>
              </div>
            )}
            
            {details.serviceDate && (
              <div>
                <span className="text-muted-foreground">Date</span>
                <p className="font-medium">
                  {format(new Date(details.serviceDate), 'd MMM yyyy')}
                </p>
              </div>
            )}

            {details.providerName && (
              <div>
                <span className="text-muted-foreground">Provider</span>
                <p className="font-medium">{details.providerName}</p>
              </div>
            )}

            {details.dependentName && (
              <div>
                <span className="text-muted-foreground">Dependent</span>
                <p className="font-medium">{details.dependentName}</p>
              </div>
            )}
          </div>

          {details.description && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes</span>
              <p className="font-medium">{details.description}</p>
            </div>
          )}

          <Separator />

          {/* Amount Summary */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                {isRequest ? 'Requested Amount' : 'Claimed Amount'}
              </span>
              {parsedAmount ? (
                <p className="text-lg font-semibold tabular-nums">
                  <Currency amount={parsedAmount} size="lg" />
                </p>
              ) : (
                <p className="text-lg font-semibold">—</p>
              )}
            </div>

            {!isRequest && estimatedPayable != null && (
              <div className="text-right space-y-1">
                <span className="text-sm text-muted-foreground">Estimated Payable</span>
                <p className="text-lg font-semibold tabular-nums text-primary">
                  <Currency amount={estimatedPayable} size="lg" />
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Documents */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Documents Uploaded</span>
            </div>
            <div className="flex items-center gap-2">
              {uploadedCount > 0 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="font-medium">{uploadedCount} file(s)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-muted-foreground">None</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Model Badge */}
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="secondary" className="gap-1">
          {transactionModel === 'claim_only' && 'Direct Claim'}
          {transactionModel === 'request_only' && 'Pre-Approval Request'}
          {transactionModel === 'request_and_claim' && (isRequest ? 'Pre-Approval Required' : 'Claim After Approval')}
        </Badge>
        
        {transactionModel === 'request_and_claim' && (
          <span className="text-xs text-muted-foreground">
            {isRequest 
              ? 'You can submit a claim after this request is approved.'
              : 'This claim follows an approved request.'}
          </span>
        )}
      </div>
    </div>
  );
}

export default WizardStepSubmit;
