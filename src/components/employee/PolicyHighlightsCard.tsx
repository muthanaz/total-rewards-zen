import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, ExternalLink, Calendar, AlertCircle, Mail, Loader2 } from 'lucide-react';
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
import { 
  usePublishedPolicy, 
  formatPolicyDate, 
  getPolicyStatusBadge,
  type PublishedPolicy 
} from '@/hooks/usePublishedPolicy';
import { formatRelativeTime } from '@/lib/crossPortalContract';

interface PolicyHighlightsCardProps {
  title?: string;
  /** Policy bullet points to display (fallback if no DB policy) */
  policies: string[];
  /** Benefit category for fetching published policy */
  category: string;
  actionLabel?: string;
  policyLabel?: string;
  showClaimButton?: boolean;
  isRTL?: boolean;
  className?: string;
  /** Callback when View Policy is clicked - if not provided, opens internal sheet */
  onViewPolicy?: () => void;
  /** Skip fetching from DB and use provided details instead */
  policyDetails?: {
    name: string;
    version?: number;
    effectiveFrom?: string;
    fullText?: string;
    attachmentUrl?: string;
  };
  /** Disable automatic policy fetching */
  skipFetch?: boolean;
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
  skipFetch = false,
}: PolicyHighlightsCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch published policy from database
  const { data: publishedPolicy, isLoading, error } = usePublishedPolicy({
    benefitCategory: category,
    enabled: !skipFetch && !policyDetails,
  });

  const handleViewPolicy = () => {
    if (onViewPolicy) {
      onViewPolicy();
    } else {
      setSheetOpen(true);
    }
  };

  // Determine current policy - prioritize DB data, fallback to props
  const currentPolicy: {
    name: string;
    version: number | null;
    effectiveFrom: string | null;
    fullText: string | null;
    attachmentUrl: string | null;
    updatedAt: string | null;
    isActive: boolean;
  } = publishedPolicy
    ? {
        name: publishedPolicy.benefitName,
        version: publishedPolicy.version,
        effectiveFrom: publishedPolicy.effectiveFrom,
        fullText: publishedPolicy.policyText,
        attachmentUrl: publishedPolicy.attachmentUrl,
        updatedAt: publishedPolicy.updatedAt,
        isActive: publishedPolicy.isActive,
      }
    : policyDetails
    ? {
        name: policyDetails.name,
        version: policyDetails.version ?? null,
        effectiveFrom: policyDetails.effectiveFrom ?? null,
        fullText: policyDetails.fullText ?? null,
        attachmentUrl: policyDetails.attachmentUrl ?? null,
        updatedAt: null,
        isActive: true,
      }
    : {
        name: `${category} Policy`,
        version: null,
        effectiveFrom: null,
        fullText: null,
        attachmentUrl: null,
        updatedAt: null,
        isActive: false,
      };

  const hasPublishedPolicy = publishedPolicy !== null || policyDetails !== undefined;
  const statusBadge = getPolicyStatusBadge(publishedPolicy ?? null);

  return (
    <>
      <Card className={cn("relative", className)}>
        <CardHeader className="pb-3">
          <div className={cn(
            "flex items-start justify-between gap-4",
            isRTL && "flex-row-reverse"
          )}>
            <div className="flex items-center gap-2">
              <CardTitle className={cn(
                "text-base font-display flex items-center gap-2",
                isRTL && "flex-row-reverse"
              )}>
                <FileText className="w-5 h-5 text-accent" />
                {title}
              </CardTitle>
              {/* Version badge */}
              {!isLoading && publishedPolicy && (
                <Badge variant={statusBadge.variant} className={cn("text-xs", statusBadge.className)}>
                  {statusBadge.label}
                </Badge>
              )}
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewPolicy}
                disabled={isLoading}
              >
                {policyLabel}
              </Button>
            </div>
          </div>
          {/* Last updated indicator */}
          {currentPolicy.updatedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated {formatRelativeTime(currentPolicy.updatedAt)}
            </p>
          )}
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
                <SheetDescription className="flex items-center gap-3 mt-2 flex-wrap">
                  {currentPolicy.version && (
                    <Badge variant={statusBadge.variant} className={cn("text-xs", statusBadge.className)}>
                      Version {currentPolicy.version}
                    </Badge>
                  )}
                  {currentPolicy.effectiveFrom && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Effective from {formatPolicyDate(currentPolicy.effectiveFrom)}
                    </span>
                  )}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* No Policy Empty State */}
            {!hasPublishedPolicy && !isLoading && (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">No Published Policy</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    There's no published policy document for this benefit yet. Contact HR for policy details.
                  </p>
                </div>
                <Button variant="outline" className="gap-2" asChild>
                  <a href="mailto:hr@company.com?subject=Policy%20Inquiry%20-%20{category}">
                    <Mail className="w-4 h-4" />
                    Contact HR
                  </a>
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading policy...</p>
              </div>
            )}

            {/* Policy Content */}
            {hasPublishedPolicy && !isLoading && (
              <>
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
                {currentPolicy.fullText && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Full Policy Details</h4>
                    <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
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

                {/* Active Policy Disclaimer */}
                {currentPolicy.isActive && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                    <strong>Active Policy:</strong> This is the currently published policy version. For questions about policy applicability or exceptions, please contact HR.
                  </div>
                )}

                {/* Inactive Policy Warning */}
                {!currentPolicy.isActive && currentPolicy.version && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> This policy version may be outdated. Contact HR for the current policy.
                  </div>
                )}
              </>
            )}

            {/* Error State */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-400">
                <strong>Error:</strong> Unable to load policy. Please try again later.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
