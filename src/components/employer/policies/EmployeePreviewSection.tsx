/**
 * Employee Preview Section Component
 * 
 * Shows exactly what employees will see for this policy.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  HelpCircle,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { EmployeePreviewData } from './types';

interface EmployeePreviewSectionProps {
  preview: EmployeePreviewData;
}

export function EmployeePreviewSection({ preview }: EmployeePreviewSectionProps) {
  const utilizationPercent = preview.annualAllowance > 0
    ? (preview.utilized / preview.annualAllowance) * 100
    : 0;

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3 bg-primary/5">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Employee View Preview
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          This is exactly how employees will see this policy
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Policy Title & Eligibility */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{preview.policyTitle}</h3>
            <Badge
              className={cn(
                'mt-1',
                preview.eligibilityStatus === 'eligible'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : preview.eligibilityStatus === 'pending'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              )}
            >
              {preview.eligibilityStatus === 'eligible' && (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  You are eligible
                </>
              )}
              {preview.eligibilityStatus === 'pending' && (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Eligibility pending
                </>
              )}
              {preview.eligibilityStatus === 'ineligible' && (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Not eligible
                </>
              )}
            </Badge>
            {preview.eligibilityReason && (
              <p className="text-xs text-muted-foreground mt-1">
                {preview.eligibilityReason}
              </p>
            )}
          </div>
        </div>

        {/* Allowance Card */}
        <div className="p-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Annual Allowance</span>
            <span className="text-lg font-bold tabular-nums">
              {formatCurrencyAED(preview.annualAllowance)}
            </span>
          </div>
          <Progress value={utilizationPercent} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Used: {formatCurrencyAED(preview.utilized)}
            </span>
            <span className="font-medium text-emerald-600">
              Remaining: {formatCurrencyAED(preview.remaining)}
            </span>
          </div>
        </div>

        {/* Summary Points */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Key Points
          </h4>
          <ul className="space-y-1.5">
            {preview.summary.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Required Documents */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Documents Required
          </h4>
          {preview.requiredDocs.length > 0 ? (
            <ul className="space-y-1">
              {preview.requiredDocs.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30"
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  {doc}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No documents required</p>
          )}
        </div>

        <Separator />

        {/* Examples */}
        {preview.exampleScenarios.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Example Scenarios
            </h4>
            <div className="space-y-2">
              {preview.exampleScenarios.map((example, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm"
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {preview.faqs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              Frequently Asked Questions
            </h4>
            <div className="space-y-3">
              {preview.faqs.map((faq, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-sm font-medium">{faq.question}</p>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
