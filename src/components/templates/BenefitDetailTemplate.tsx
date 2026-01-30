/**
 * BenefitDetailTemplate
 * 
 * Standardized template for ALL employee benefit pages.
 * Renders sections in exact order with consistent spacing/typography.
 * Connected to policy_versions for dynamic content.
 * 
 * Section Order:
 * A) Header: Benefit name + 1-line definition + policy ref badge + primary CTA
 * B) Entitlement strip: Annual entitlement, Paid YTD, Remaining (3 equal cards)
 * C) Policy highlights (nicely designed bullet points with icons)
 * D) How your allowance works (step-based workflow)
 * E) Benefit-specific content (children - housing market, transport components, etc.)
 * F) Eligible items / What you can claim (list only, no caps duplication)
 * G) Required documents checklist
 * H) Recent activity (last 3 claims)
 */

import { useState } from 'react';
import { LucideIcon, Send, FileText, Clock, AlertCircle, CheckCircle, Wallet, TrendingDown, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PageHeader } from '@/components/shared/PageHeader';
import { PolicyHighlightsBullets } from '@/components/employee/PolicyHighlightsBullets';
import { HowYourAllowanceWorks } from '@/components/employee/HowYourAllowanceWorks';
import { EmployeeCreateRequestSheet } from '@/components/employee/EmployeeCreateRequestSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrencyAED, formatDate } from '@/lib/utils';
import { BENEFIT_CATEGORIES, BenefitCategoryKey } from '@/lib/benefitCategories';
import { TransactionModel } from '@/lib/policyEngine';
import type { PolicyRequiredDoc } from '@/lib/policyEngine';
import { Link } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

export interface BenefitEntitlement {
  annualValue: number;
  utilized: number;
  remaining: number;
  utilizationPercent: number;
  isEstimated?: boolean;
}

export interface RecentClaim {
  id: string;
  date: string;
  amount: number;
  status: 'submitted' | 'in_review' | 'approved' | 'rejected' | 'paid';
  type: 'claim' | 'request';
}

export interface BenefitDetailTemplateProps {
  // Identity
  categoryKey: BenefitCategoryKey;
  title: string;
  description: string;
  icon: LucideIcon;
  policyRef?: string | null;
  
  // Entitlement data
  entitlement?: BenefitEntitlement | null;
  
  // Policy-driven content (from policy_versions content_json)
  howItWorks?: string[];
  whatYouCanClaim?: string[];
  requiredDocs?: PolicyRequiredDoc[];
  transactionModel?: TransactionModel | 'informational';
  
  // Limits from logic_json
  annualCap?: number | null;
  perTransactionCap?: number | null;
  frequency?: 'annual' | 'monthly';
  
  // Policy meta info
  sla?: string | null;
  enforcementMode?: 'soft' | 'strict' | null;
  eligibilityHighlights?: string[];
  isDeferredValue?: boolean;
  
  // Recent activity
  recentClaims?: RecentClaim[];
  
  // Custom section title for eligible items
  eligibleItemsTitle?: string;
  
  // How it works section customization
  howItWorksTitle?: string;
  howItWorksVariant?: 'vertical' | 'horizontal' | 'compact';
  
  // Category-specific content (rendered AFTER policy highlights & how it works)
  children?: React.ReactNode;
  
  // Loading state
  isLoading?: boolean;
  
  // States
  hasPolicyPublished?: boolean;
  hasEntitlementData?: boolean;
  
  // Hide the primary CTA (for informational benefits)
  hidePrimaryCta?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BenefitDetailTemplate({
  categoryKey,
  title,
  description,
  icon: Icon,
  policyRef,
  entitlement,
  howItWorks = [],
  whatYouCanClaim = [],
  requiredDocs = [],
  transactionModel = 'claim_only',
  annualCap,
  perTransactionCap,
  frequency = 'annual',
  sla,
  enforcementMode,
  eligibilityHighlights = [],
  isDeferredValue = false,
  recentClaims = [],
  eligibleItemsTitle,
  howItWorksTitle = "How your allowance works",
  howItWorksVariant = 'vertical',
  children,
  isLoading = false,
  hasPolicyPublished = true,
  hasEntitlementData = true,
  hidePrimaryCta = false,
}: BenefitDetailTemplateProps) {
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  
  const category = BENEFIT_CATEGORIES[categoryKey];
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });
  
  // Determine if this is an informational-only benefit
  const isInformational = transactionModel === 'informational' || hidePrimaryCta;
  
  // Determine action text based on transaction model
  const actionLabel = transactionModel === 'claim_only' 
    ? 'Submit Claim' 
    : transactionModel === 'request_only' 
      ? 'Submit Request' 
      : 'Start Request';
  
  const requestType: 'claim' | 'request' = transactionModel === 'claim_only' ? 'claim' : 'request';
  
  // Default eligible items title based on transaction model
  const defaultEligibleTitle = transactionModel === 'claim_only' 
    ? 'What you can claim' 
    : transactionModel === 'request_only'
      ? 'What you can request'
      : 'Eligible items';
  
  const sectionTitle = eligibleItemsTitle || defaultEligibleTitle;

  // Loading state
  if (isLoading) {
    return <BenefitDetailSkeleton />;
  }

  // Policy not published state
  if (!hasPolicyPublished) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title={title}
          description={description}
          icon={Icon}
          iconClassName={category?.gradientClass}
        />
        <PolicyNotPublishedState categoryKey={categoryKey} />
      </div>
    );
  }

  // No entitlement data state
  if (!hasEntitlementData || !entitlement) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title={title}
          description={description}
          icon={Icon}
          iconClassName={category?.gradientClass}
          badge={policyRef ? { label: policyRef, variant: 'default' } : undefined}
        />
        <ConnectToUnlockState title={title} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* A) Header */}
      <PageHeader
        title={title}
        description={description}
        icon={Icon}
        iconClassName={category?.gradientClass}
        badge={policyRef ? { label: policyRef, variant: 'default' } : undefined}
        actions={
          !isInformational ? (
            <Button onClick={() => setRequestSheetOpen(true)} className="gap-2">
              <Send className="h-4 w-4" />
              {actionLabel}
            </Button>
          ) : undefined
        }
      />

      {/* B) Entitlement Strip (3 equal cards) - ALWAYS FIRST */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryStatsCard
          icon={Icon}
          value={formatCurrency(entitlement.annualValue)}
          label="Annual entitlement"
          formula="Total annual benefit value"
          dataSource="Policy"
          variant="primary"
        />
        <SummaryStatsCard
          icon={Wallet}
          value={formatCurrency(entitlement.utilized)}
          label="Paid YTD"
          formula="Paid claims only"
          dataSource={entitlement.isEstimated ? 'Estimated' : 'System'}
          variant="utilized"
        />
        <SummaryStatsCard
          icon={TrendingDown}
          value={formatCurrency(entitlement.remaining)}
          label="Remaining"
          formula="Annual entitlement - Paid YTD"
          dataSource="System"
          variant="remaining"
        />
      </div>

      {/* Estimate reliability badge if data is estimated */}
      {entitlement.isEstimated && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-xs text-amber-700">
            Estimate reliability: Medium — Based on policy rules + submitted data. Final amounts may change after HR review.
          </span>
        </div>
      )}

      {/* C) Policy Highlights (nicely designed bullet points) */}
      <PolicyHighlightsBullets
        transactionModel={transactionModel}
        sla={sla}
        perTransactionCap={perTransactionCap}
        frequency={frequency}
        enforcementMode={enforcementMode}
        isDeferredValue={isDeferredValue}
      />

      {/* D) How your allowance works (step-based workflow) */}
      {howItWorks.length > 0 && (
        <HowYourAllowanceWorks
          title={howItWorksTitle}
          steps={howItWorks}
          variant={howItWorksVariant}
        />
      )}

      {/* E) Benefit-specific content (children - housing market, transport components, etc.) */}
      {children}

      {/* F) Eligible items / What you can claim (list only - NO CAPS here) */}
      {whatYouCanClaim.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              {sectionTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid sm:grid-cols-2 gap-2">
              {whatYouCanClaim.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* G) Required documents checklist */}
      {requiredDocs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Required Documents
            </CardTitle>
            <CardDescription>Documents needed when submitting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-2">
              {requiredDocs.map((doc, i) => (
                <div key={doc.id || i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.doc_name}</p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={doc.is_required ? 'default' : 'outline'} className="text-xs shrink-0">
                    {doc.is_required ? 'Required' : 'Optional'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* H) Recent activity (last 3 claims) */}
      {recentClaims.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClaims.slice(0, 3).map((claim) => (
                <Link 
                  key={claim.id} 
                  to={`/employee/requests/${claim.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      claim.status === 'approved' || claim.status === 'paid' ? 'bg-success' :
                      claim.status === 'rejected' ? 'bg-destructive' :
                      claim.status === 'in_review' ? 'bg-warning' : 'bg-muted'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{formatCurrency(claim.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(new Date(claim.date))}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={claim.status} />
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3" asChild>
              <Link to="/employee/requests">See all requests</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Request/Claim Sheet */}
      {!isInformational && (
        <EmployeeCreateRequestSheet
          open={requestSheetOpen}
          onOpenChange={setRequestSheetOpen}
          initialType={requestType}
          initialCategory={title}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: RecentClaim['status'] }) {
  const statusConfig = {
    submitted: { label: 'Submitted', className: 'bg-muted text-muted-foreground' },
    in_review: { label: 'In Review', className: 'bg-warning/10 text-warning' },
    approved: { label: 'Approved', className: 'bg-success/10 text-success' },
    rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
    paid: { label: 'Paid', className: 'bg-success/10 text-success' },
  };
  
  const config = statusConfig[status];
  return <Badge className={cn('border-0', config.className)}>{config.label}</Badge>;
}

function BenefitDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-32" />
      <Skeleton className="h-48" />
    </div>
  );
}

function PolicyNotPublishedState({ categoryKey }: { categoryKey: BenefitCategoryKey }) {
  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="font-display font-semibold text-lg mb-2">Policy not published yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The policy for this benefit hasn't been published by HR yet. 
          Check back later or contact HR for more information.
        </p>
        <Button variant="outline" asChild>
          <Link to="/employee/knowledge-hub">Visit Knowledge Hub</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ConnectToUnlockState({ title }: { title: string }) {
  return (
    <Card className="border-muted">
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display font-semibold text-lg mb-2">Entitlement data unavailable</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your {title} entitlement hasn't been set up yet. 
          This usually happens during onboarding or when your benefits package is being configured.
        </p>
        <p className="text-xs text-muted-foreground">
          Contact HR if you believe this is an error.
        </p>
      </CardContent>
    </Card>
  );
}

export default BenefitDetailTemplate;
