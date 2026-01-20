import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, ExternalLink, Calendar } from 'lucide-react';
import { SubmitClaimButton } from './SubmitClaimButton';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface PolicyHighlightsCardProps {
  title?: string;
  policies: string[];
  category: string;
  actionLabel?: string;
  policyLabel?: string;
  showClaimButton?: boolean;
  isRTL?: boolean;
  className?: string;
  /** Callback when View Policy is clicked - if not provided, opens internal sheet */
  onViewPolicy?: () => void;
  /** Policy details for the sheet */
  policyDetails?: {
    name: string;
    version?: number;
    effectiveFrom?: string;
    fullText?: string;
    attachmentUrl?: string;
  };
}

export function PolicyHighlightsCard({
  title = 'Policy Highlights',
  policies,
  category,
  actionLabel = 'Submit Claim',
  policyLabel = 'View Full Policy',
  showClaimButton = true,
  isRTL = false,
  className,
  onViewPolicy,
  policyDetails,
}: PolicyHighlightsCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleViewPolicy = () => {
    if (onViewPolicy) {
      onViewPolicy();
    } else {
      setSheetOpen(true);
    }
  };

  // Default policy details if not provided
  const currentPolicy = policyDetails || {
    name: `${category} Policy`,
    version: 1,
    effectiveFrom: new Date().toISOString().split('T')[0],
    fullText: policies.join('\n\n'),
  };

  return (
    <>
      <Card className={cn("relative", className)}>
        <CardHeader className="pb-3">
          <div className={cn(
            "flex items-start justify-between gap-4",
            isRTL && "flex-row-reverse"
          )}>
            <CardTitle className={cn(
              "text-base font-display flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <FileText className="w-5 h-5 text-accent" />
              {title}
            </CardTitle>
            <div className={cn(
              "flex items-center gap-2 shrink-0",
              isRTL && "flex-row-reverse"
            )}>
              {showClaimButton && (
                <SubmitClaimButton 
                  category={category} 
                  buttonText={actionLabel}
                  buttonSize="sm"
                />
              )}
              <Button variant="outline" size="sm" onClick={handleViewPolicy}>
                {policyLabel}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className={cn(
            "grid md:grid-cols-2 gap-2 text-sm text-muted-foreground",
            isRTL && "text-right"
          )}>
            {policies.map((policy, index) => (
              <li 
                key={index} 
                className={cn(
                  "flex items-start gap-2",
                  isRTL && "flex-row-reverse"
                )}
              >
                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                {policy}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Policy Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  {currentPolicy.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-3 mt-2">
                  {currentPolicy.version && (
                    <Badge variant="outline" className="text-xs">
                      Version {currentPolicy.version}
                    </Badge>
                  )}
                  {currentPolicy.effectiveFrom && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Effective from {new Date(currentPolicy.effectiveFrom).toLocaleDateString()}
                    </span>
                  )}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Policy Highlights */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Policy Summary</h4>
              <ul className="space-y-2">
                {policies.map((policy, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    {policy}
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Policy Text (if available) */}
            {currentPolicy.fullText && currentPolicy.fullText !== policies.join('\n\n') && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Full Policy Details</h4>
                <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground whitespace-pre-wrap">
                  {currentPolicy.fullText}
                </div>
              </div>
            )}

            {/* Attachment Link */}
            {currentPolicy.attachmentUrl && (
              <div className="pt-4 border-t border-border">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href={currentPolicy.attachmentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Download Full Policy Document
                  </a>
                </Button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> This is the currently active policy version. For questions about policy applicability or exceptions, please contact HR.
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}