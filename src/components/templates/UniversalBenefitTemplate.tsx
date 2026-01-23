/**
 * Universal Benefit Template
 * 
 * Category-agnostic template for displaying ANY benefit type.
 * Renders consistently for all categories (Housing, Health, Education, etc.)
 * 
 * Sections:
 * 1. What You Get (plain language summary)
 * 2. Eligibility (rule-based, explainable)
 * 3. How It Works (request/claim/both)
 * 4. Limits & Caps (with examples)
 * 5. Required Documents Checklist
 * 6. Timeline & Steps
 * 7. FAQs + Pitfalls
 */

import { ReactNode, useMemo, useState } from 'react';
import { LucideIcon, CheckCircle, AlertCircle, FileText, Clock, HelpCircle, AlertTriangle, Wallet, TrendingDown, Percent, ChevronDown, ChevronUp, Send, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PageHeader } from '@/components/shared/PageHeader';
import { PolicyHighlightsCard } from '@/components/employee/PolicyHighlightsCard';
import { BenefitCrossLinks } from '@/components/employee/BenefitCrossLinks';
import { EmployeeCreateRequestSheet } from '@/components/employee/EmployeeCreateRequestSheet';
import { HelpfulOptionsModule } from '@/components/employee/HelpfulOptionsModule';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { 
  UniversalPolicyLogic, 
  UniversalPolicyContent,
  getTransactionModelInfo,
  generateWorkflowDisplay,
  getLifeAreaLabel,
} from '@/lib/universalBenefitEngine';
import { BENEFIT_CATEGORIES, BenefitCategoryKey } from '@/lib/benefitCategories';

// ============================================================================
// TYPES
// ============================================================================

export interface BenefitUtilization {
  annualValue: number;
  utilized: number;
  remaining: number;
  utilizationPercent: number;
}

export interface UniversalBenefitTemplateProps {
  // Identity
  categoryKey: BenefitCategoryKey;
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  
  // Policy data (from published policy version)
  policyLogic?: UniversalPolicyLogic | null;
  policyContent?: UniversalPolicyContent | null;
  policyRef?: string;
  
  // Utilization data
  utilization?: BenefitUtilization;
  
  // Policy highlights (fallback if no policy content)
  policyHighlights?: string[];
  
  // Category-specific content (rendered after standard sections)
  children?: ReactNode;
  
  // Actions
  onSubmitClaim?: () => void;
  onViewPolicy?: () => void;
  
  // Loading state
  isLoading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UniversalBenefitTemplate({
  categoryKey,
  title,
  description,
  icon: Icon,
  iconClassName,
  policyLogic,
  policyContent,
  policyRef,
  utilization,
  policyHighlights,
  children,
  onViewPolicy,
  isLoading,
}: UniversalBenefitTemplateProps) {
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [showFaqs, setShowFaqs] = useState(false);
  
  const category = BENEFIT_CATEGORIES[categoryKey];
  
  // Derive display data from policy
  const transactionInfo = useMemo(() => {
    if (!policyLogic) return null;
    return getTransactionModelInfo(policyLogic.transaction_model);
  }, [policyLogic]);
  
  const workflowSteps = useMemo(() => {
    if (!policyLogic) return [];
    return generateWorkflowDisplay(
      policyLogic.transaction_model,
      policyLogic.workflow_steps
    );
  }, [policyLogic]);
  
  const requiredDocs = policyLogic?.required_docs?.filter(d => d.is_required) || [];
  const faqs = policyContent?.faqs || policyLogic?.faqs || [];
  const pitfalls = policyContent?.pitfalls || policyLogic?.pitfalls || [];
  const examples = policyContent?.examples || policyLogic?.examples || [];
  const guidance = policyContent?.employee_guidance || policyLogic?.employee_guidance;
  
  // Format currency helper
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });
  
  // Determine action button text based on transaction model
  const getActionButtonText = () => {
    if (!policyLogic) return 'Submit Request';
    switch (policyLogic.transaction_model) {
      case 'request_only': return 'Submit Request';
      case 'claim_only': return 'Submit Claim';
      case 'request_and_claim': return 'Start Request';
      default: return 'Submit';
    }
  };
  
  const getInitialRequestType = (): 'claim' | 'request' => {
    if (!policyLogic) return 'claim';
    return policyLogic.transaction_model === 'claim_only' ? 'claim' : 'request';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={title}
        description={description || category?.description}
        icon={Icon}
        iconClassName={iconClassName || `${category?.gradientClass} shadow-${categoryKey}/25`}
        badge={policyRef ? {
          label: policyRef,
          variant: 'default',
        } : undefined}
        actions={
          <Button onClick={() => setRequestSheetOpen(true)} className="gap-2">
            <Send className="h-4 w-4" />
            {getActionButtonText()}
          </Button>
        }
      />

      {/* 1. Summary Stats (Utilization) */}
      {utilization && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryStatsCard
            icon={Icon}
            value={formatCurrency(utilization.annualValue)}
            label="Annual Value"
            formula="Total annual benefit value"
            dataSource="Policy"
            variant="primary"
          />
          <SummaryStatsCard
            icon={Wallet}
            value={formatCurrency(utilization.utilized)}
            label="Utilized"
            formula="Total claims/usage YTD"
            dataSource="System"
            variant="utilized"
          />
          <SummaryStatsCard
            icon={TrendingDown}
            value={formatCurrency(utilization.remaining)}
            label="Remaining"
            formula="Annual Value - Utilized"
            dataSource="System"
            variant="remaining"
          />
          <SummaryStatsCard
            icon={Percent}
            value={`${utilization.utilizationPercent}%`}
            label="Utilization"
            formula="(Utilized / Value) × 100"
            dataSource="System"
            variant="utilization"
            progress={utilization.utilizationPercent}
          />
        </div>
      )}

      {/* 2. Policy Highlights */}
      {(policyContent?.summary?.length || policyHighlights?.length) && (
        <PolicyHighlightsCard
          title={`${title} Policy Highlights`}
          policies={policyContent?.summary || policyHighlights || []}
          category={title}
          actionLabel={getActionButtonText()}
          policyLabel="View Full Policy"
        />
      )}

      {/* Cross-links */}
      <BenefitCrossLinks benefitCategory={title} showClaimLink={false} />

      {/* 3. How It Works */}
      {transactionInfo && workflowSteps.length > 0 && (
        <Card className={cn("border-accent/30 bg-gradient-to-r from-accent/5 to-transparent")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Icon className="w-5 h-5 text-accent" />
              How {title} Works
            </CardTitle>
            <CardDescription>{transactionInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "grid gap-4",
              workflowSteps.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-4"
            )}>
              {workflowSteps.map((step) => (
                <div key={step.step} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Eligibility Rules */}
      {policyLogic?.eligibility_rules && (
        <EligibilitySection rules={policyLogic.eligibility_rules} />
      )}

      {/* 5. Limits & Caps */}
      {policyLogic?.limits_caps && (
        <LimitsSection limits={policyLogic.limits_caps} examples={examples} />
      )}

      {/* 6. Required Documents */}
      {requiredDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Required Documents
            </CardTitle>
            <CardDescription>
              You'll need to provide these documents when submitting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {requiredDocs.map((doc, i) => (
                <div key={doc.id || i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{doc.doc_name}</p>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                    )}
                    <Badge variant="outline" className="mt-1 text-xs">
                      {doc.transaction_type === 'both' ? 'Request & Claim' : 
                       doc.transaction_type === 'request' ? 'Request Only' : 'Claim Only'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7. Employee Guidance */}
      {guidance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              Tips & Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {guidance.tips && guidance.tips.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Pro Tips</p>
                <ul className="space-y-1.5">
                  {guidance.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {guidance.common_mistakes && guidance.common_mistakes.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Common Mistakes to Avoid</p>
                <ul className="space-y-1.5">
                  {guidance.common_mistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 8. FAQs & Pitfalls */}
      {(faqs.length > 0 || pitfalls.length > 0) && (
        <Collapsible open={showFaqs} onOpenChange={setShowFaqs}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    FAQs & Common Issues
                    <Badge variant="secondary" className="ml-2">{faqs.length + pitfalls.length}</Badge>
                  </CardTitle>
                  {showFaqs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm mb-2 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      {faq.question}
                    </p>
                    <p className="text-sm text-muted-foreground pl-6">{faq.answer}</p>
                  </div>
                ))}
                {pitfalls.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="font-medium text-sm mb-2 flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        Watch Out For
                      </p>
                      <ul className="space-y-1.5 pl-6">
                        {pitfalls.map((pitfall, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {pitfall}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Category-specific content */}
      {children}

      {/* Helpful Options Module - at the very bottom, collapsed by default */}
      <HelpfulOptionsModule lifeArea={category?.lifeArea || 'other'} />

      {/* Request/Claim Sheet */}
      <EmployeeCreateRequestSheet
        open={requestSheetOpen}
        onOpenChange={setRequestSheetOpen}
        initialType={getInitialRequestType()}
        initialCategory={title}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EligibilitySection({ rules }: { rules: UniversalPolicyLogic['eligibility_rules'] }) {
  const hasRestrictions = 
    rules.grades.length > 0 || 
    rules.departments.length > 0 || 
    rules.locations.length > 0 ||
    rules.contract_types.length > 0 ||
    rules.min_tenure_months > 0 ||
    rules.probation_passed;

  if (!hasRestrictions) {
    return (
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="font-medium text-sm">Open to All Employees</p>
              <p className="text-xs text-muted-foreground">No specific eligibility restrictions apply</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-muted-foreground" />
          Eligibility Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {rules.grades.length > 0 && (
            <EligibilityItem 
              label="Eligible Grades" 
              value={rules.grades.join(', ')} 
            />
          )}
          {rules.departments.length > 0 && (
            <EligibilityItem 
              label="Eligible Departments" 
              value={rules.departments.join(', ')} 
            />
          )}
          {rules.locations.length > 0 && (
            <EligibilityItem 
              label="Eligible Locations" 
              value={rules.locations.join(', ')} 
            />
          )}
          {rules.contract_types.length > 0 && (
            <EligibilityItem 
              label="Contract Types" 
              value={rules.contract_types.join(', ')} 
            />
          )}
          {rules.min_tenure_months > 0 && (
            <EligibilityItem 
              label="Minimum Tenure" 
              value={`${rules.min_tenure_months} months`} 
            />
          )}
          {rules.probation_passed && (
            <EligibilityItem 
              label="Probation" 
              value="Must have completed probation" 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EligibilityItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm mt-1">{value}</p>
    </div>
  );
}

function LimitsSection({ 
  limits, 
  examples 
}: { 
  limits: UniversalPolicyLogic['limits_caps']; 
  examples: UniversalPolicyLogic['examples'];
}) {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Wallet className="w-5 h-5 text-muted-foreground" />
          Limits & Caps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {limits.annual_cap && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">Annual Cap</p>
              <p className="text-lg font-bold text-primary mt-1">
                {formatCurrency(limits.annual_cap)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Per {limits.frequency} (resets in {getMonthName(limits.reset_month)})
              </p>
            </div>
          )}
          {limits.per_transaction_cap && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">Per Transaction</p>
              <p className="text-lg font-bold mt-1">
                {formatCurrency(limits.per_transaction_cap)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Maximum per claim</p>
            </div>
          )}
          {limits.pre_approval_threshold && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-muted-foreground">Pre-Approval Threshold</p>
              <p className="text-lg font-bold text-amber-600 mt-1">
                {formatCurrency(limits.pre_approval_threshold)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Pre-approval required above this</p>
            </div>
          )}
        </div>

        {examples && examples.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-3">Examples</p>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                    <div className="flex-1">
                      <p className="text-sm">{ex.scenario}</p>
                      <p className="text-xs text-muted-foreground mt-1">→ {ex.outcome}</p>
                    </div>
                    {ex.amount && (
                      <span className="text-sm font-medium">{formatCurrency(ex.amount)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[(month - 1) % 12];
}

export default UniversalBenefitTemplate;
