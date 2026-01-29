/**
 * BenefitDetailTemplate - Standardized layout for all employee benefit pages
 * 
 * Sections (in order):
 * A) Header: Benefit name + definition + policy ref badge
 * B) "Your Entitlement" strip (3 compact cards): Annual, Used, Remaining
 * C) "How it works" (max 4 bullets; collapsible)
 * D) "What you can claim/request" (rules from policy)
 * E) "Required documents" checklist
 * F) "Start claim/request" primary CTA
 * G) "Recent activity" (last 3 claims)
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PageHeader } from '@/components/shared/PageHeader';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { DataConfidenceChip } from '@/components/employee/DataConfidenceChip';
import { 
  ChevronDown, ChevronRight, FileText, CheckCircle, Circle, 
  AlertCircle, Wallet, TrendingDown, Percent, Clock, ArrowRight,
  Info, Lock, ExternalLink
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent, formatDate } from '@/lib/utils';
import { useBenefitPolicy, getActionLabel } from '@/hooks/useBenefitPolicy';
import type { BenefitDetailTemplateProps } from './types';
import { getCanonicalStatusLabel } from '@/lib/workflow/statusLabels';

export function BenefitDetailTemplate({
  category,
  name,
  description,
  icon: Icon,
  iconClassName,
  howItWorksBullets = [],
  customContent,
  children,
  showMarketplaceLink = true,
  policyRefOverride,
}: BenefitDetailTemplateProps) {
  const navigate = useNavigate();
  const [howItWorksOpen, setHowItWorksOpen] = useState(true);
  
  const {
    policy,
    policyVersion,
    policyRef,
    policyStatus,
    content,
    logic,
    entitlement,
    recentClaims,
    requiredDocuments,
    dataConfidence,
    missingDataReasons,
    isLoading,
  } = useBenefitPolicy(category);

  const actionLabels = getActionLabel(logic.transaction_model);
  const displayPolicyRef = policyRefOverride || policyRef;

  // Format currency helper
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  // Handle CTA click
  const handleStartClaim = () => {
    navigate(`/employee/requests/new?category=${encodeURIComponent(category)}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  // Policy not found state
  if (policyStatus === 'not_found') {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title={name}
          description={description}
          icon={Icon}
          iconClassName={iconClassName}
        />
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Policy Not Published Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The {name.toLowerCase()} policy hasn't been published by your HR team yet. 
                  Check back later or visit the Knowledge Hub for more information.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 gap-2"
                  asChild
                >
                  <Link to="/employee/knowledge-hub">
                    <ExternalLink className="w-4 h-4" />
                    Go to Knowledge Hub
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No entitlement state
  const showConnectToUnlock = !entitlement.hasEntitlement || entitlement.annualAllowance === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* A) Header: Benefit name + definition + policy ref badge */}
      <PageHeader
        title={name}
        description={description}
        icon={Icon}
        iconClassName={iconClassName}
        partnerOffersCategory={showMarketplaceLink ? name : undefined}
        badge={displayPolicyRef ? {
          label: displayPolicyRef,
          icon: FileText,
          variant: 'default',
        } : undefined}
        confidenceBadge={
          dataConfidence !== 'high' && (
            <DataConfidenceChip 
              level={dataConfidence === 'medium' ? 'estimated' : 'projected'}
              reason={missingDataReasons.join('. ')}
            />
          )
        }
      />

      {/* Data completeness warning if needed */}
      {showConnectToUnlock && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Entitlement Not Set Up</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your {name.toLowerCase()} entitlement hasn't been configured yet. 
                  Contact HR to set up your benefit allocation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* B) "Your Entitlement" strip (3 compact cards) */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryStatsCard
          icon={Icon}
          value={formatCurrency(entitlement.annualAllowance)}
          label="Annual"
          formula="Annual allowance for this benefit"
          dataSource={policyStatus === 'published' ? 'Policy' : 'Estimated'}
          variant="primary"
        />
        <SummaryStatsCard
          icon={Wallet}
          value={formatCurrency(entitlement.utilized)}
          label="Used"
          formula="Total claimed/used this year"
          dataSource="Benefits System"
          variant="utilized"
        />
        <SummaryStatsCard
          icon={TrendingDown}
          value={formatCurrency(entitlement.remaining)}
          label="Remaining"
          formula="Annual - Used"
          dataSource="System"
          variant="remaining"
        />
      </div>

      {/* C) "How it works" (max 4 bullets; collapsible) */}
      <Collapsible open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
        <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-accent/5 transition-colors">
              <CardTitle className="text-base font-display flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-accent" />
                  How It Works
                </span>
                {howItWorksOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid md:grid-cols-4 gap-3">
                {(content.summary.length > 0 ? content.summary.slice(0, 4) : howItWorksBullets.slice(0, 4)).map((bullet, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-card border"
                  >
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{bullet}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* D) "What you can claim/request" (rules from policy) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            What You Can {actionLabels.verb}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Limits & Caps */}
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-medium text-sm mb-3">Limits & Caps</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {logic.limits_caps?.annual_cap && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>Annual cap: {formatCurrency(logic.limits_caps.annual_cap)}</span>
                  </li>
                )}
                {logic.limits_caps?.per_transaction_cap && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>Per transaction: {formatCurrency(logic.limits_caps.per_transaction_cap)}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Cycle: {logic.limits_caps?.frequency || 'Annual'}</span>
                </li>
                {logic.limits_caps?.pre_approval_threshold && (
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" />
                    <span>Pre-approval needed above {formatCurrency(logic.limits_caps.pre_approval_threshold)}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Processing */}
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-medium text-sm mb-3">Processing</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>SLA: {logic.workflow?.sla_days || 3} business days</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Approver: {logic.workflow?.approver_role || 'Manager'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Type: {logic.transaction_model === 'claim_only' ? 'Reimbursement claim' : logic.transaction_model === 'request_only' ? 'Pre-approval request' : 'Both supported'}</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* E) "Required documents" checklist */}
      {requiredDocuments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {requiredDocuments.map((doc, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  {doc.required ? (
                    <Circle className="w-4 h-4 text-destructive shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "shrink-0 text-[10px]",
                      doc.required 
                        ? "bg-destructive/10 text-destructive border-destructive/30" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {doc.required ? 'Required' : 'Optional'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* F) "Start claim/request" primary CTA */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/10 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Ready to {actionLabels.verb.toLowerCase()}?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {entitlement.remaining > 0 
                  ? `You have ${formatCurrency(entitlement.remaining)} remaining in your allowance.`
                  : 'Review your entitlement and submit your claim.'}
              </p>
            </div>
            <Button 
              size="lg" 
              className="gap-2 shrink-0"
              onClick={handleStartClaim}
              disabled={showConnectToUnlock}
            >
              {actionLabels.primary}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* G) "Recent activity" (last 3 claims) */}
      {recentClaims.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link to={`/employee/requests?category=${encodeURIComponent(category)}`}>
                  View All
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentClaims.slice(0, 3).map((claim) => (
                <Link
                  key={claim.id}
                  to={`/employee/requests/${claim.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium group-hover:text-accent transition-colors">
                        {claim.request_type === 'claim' ? 'Claim' : 'Request'} #{claim.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(claim.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {claim.amount && (
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(claim.amount)}
                      </span>
                    )}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        claim.status === 'approved' || claim.status === 'paid' 
                          ? "bg-success/10 text-success border-success/30"
                          : claim.status === 'rejected'
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-warning/10 text-warning border-warning/30"
                      )}
                    >
                      {getCanonicalStatusLabel(claim.status)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom content / children */}
      {customContent}
      {children}
    </div>
  );
}
