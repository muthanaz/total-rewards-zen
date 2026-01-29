/**
 * BenefitDetailTemplate
 * 
 * Standardized template for ALL employee benefit pages.
 * Renders 7 fixed sections in exact order with consistent spacing/typography.
 * Connected to policy_versions for dynamic content.
 * 
 * Sections:
 * A) Header: Benefit name + 1-line definition + policy ref badge
 * B) Your Entitlement strip: Annual, Used, Remaining (3 equal cards)
 * C) How it works (max 4 bullets, collapsible)
 * D) What you can claim/request (rules: caps, cycle, eligible items)
 * E) Required documents checklist
 * F) Start claim/request CTA
 * G) Recent activity (last 3 claims)
 */

import { useState } from 'react';
import { LucideIcon, Send, FileText, Clock, AlertCircle, BookOpen, CheckCircle, ChevronDown, ChevronUp, Wallet, TrendingDown, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PageHeader } from '@/components/shared/PageHeader';
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
  transactionModel?: TransactionModel;
  
  // Limits from logic_json
  annualCap?: number | null;
  perTransactionCap?: number | null;
  frequency?: 'annual' | 'monthly';
  
  // Recent activity
  recentClaims?: RecentClaim[];
  
  // Category-specific content (rendered after standard sections)
  children?: React.ReactNode;
  
  // Loading state
  isLoading?: boolean;
  
  // States
  hasPolicyPublished?: boolean;
  hasEntitlementData?: boolean;
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
  recentClaims = [],
  children,
  isLoading = false,
  hasPolicyPublished = true,
  hasEntitlementData = true,
}: BenefitDetailTemplateProps) {
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  
  const category = BENEFIT_CATEGORIES[categoryKey];
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });
  
  // Determine action text based on transaction model
  const actionLabel = transactionModel === 'claim_only' 
    ? 'Submit Claim' 
    : transactionModel === 'request_only' 
      ? 'Submit Request' 
      : 'Start Request';
  
  const requestType: 'claim' | 'request' = transactionModel === 'claim_only' ? 'claim' : 'request';

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
          <Button onClick={() => setRequestSheetOpen(true)} className="gap-2">
            <Send className="h-4 w-4" />
            {actionLabel}
          </Button>
        }
      />

      {/* B) Your Entitlement Strip (3 equal cards) */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryStatsCard
          icon={Icon}
          value={formatCurrency(entitlement.annualValue)}
          label={frequency === 'annual' ? 'Annual' : 'Monthly'}
          formula={`Total ${frequency} benefit value`}
          dataSource="Policy"
          variant="primary"
        />
        <SummaryStatsCard
          icon={Wallet}
          value={formatCurrency(entitlement.utilized)}
          label="Used"
          formula={`${requestType === 'claim' ? 'Claims' : 'Requests'} YTD`}
          dataSource={entitlement.isEstimated ? 'Estimated' : 'System'}
          variant="utilized"
        />
        <SummaryStatsCard
          icon={TrendingDown}
          value={formatCurrency(entitlement.remaining)}
          label="Remaining"
          formula={`${frequency === 'annual' ? 'Annual' : 'Monthly'} - Used`}
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

      {/* C) How it works (collapsible, max 4 bullets) */}
      {howItWorks.length > 0 && (
        <Collapsible open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    How it works
                    <Badge variant="secondary" className="ml-2">{Math.min(howItWorks.length, 4)}</Badge>
                  </CardTitle>
                  {howItWorksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {howItWorks.slice(0, 4).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* D) What you can claim/request */}
      {(whatYouCanClaim.length > 0 || annualCap || perTransactionCap) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              What you can {requestType === 'claim' ? 'claim' : 'request'}
            </CardTitle>
            <CardDescription>Rules, caps, and eligible items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Caps display */}
            {(annualCap || perTransactionCap) && (
              <div className="grid grid-cols-2 gap-3">
                {annualCap && (
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-xs text-muted-foreground">{frequency === 'annual' ? 'Annual Cap' : 'Monthly Cap'}</p>
                    <p className="font-semibold text-sm">{formatCurrency(annualCap)}</p>
                  </div>
                )}
                {perTransactionCap && (
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="text-xs text-muted-foreground">Per Transaction Cap</p>
                    <p className="font-semibold text-sm">{formatCurrency(perTransactionCap)}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Eligible items */}
            {whatYouCanClaim.length > 0 && (
              <ul className="space-y-2">
                {whatYouCanClaim.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* E) Required documents checklist */}
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
            <div className="space-y-2">
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
                  <Badge variant={doc.is_required ? 'default' : 'outline'} className="text-xs">
                    {doc.is_required ? 'Required' : 'Optional'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* F) Start claim/request CTA */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">{actionLabel}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {transactionModel === 'claim_only' 
                  ? 'Submit your receipts and get reimbursed'
                  : 'Request approval before incurring the expense'}
              </p>
            </div>
            <Button onClick={() => setRequestSheetOpen(true)} size="lg" className="gap-2">
              <Send className="h-4 w-4" />
              {actionLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* G) Recent activity (last 3 claims) */}
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
              <Link to="/employee/requests">View all claims</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Category-specific content */}
      {children}

      {/* Request/Claim Sheet */}
      <EmployeeCreateRequestSheet
        open={requestSheetOpen}
        onOpenChange={setRequestSheetOpen}
        initialType={requestType}
        initialCategory={title}
      />
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
