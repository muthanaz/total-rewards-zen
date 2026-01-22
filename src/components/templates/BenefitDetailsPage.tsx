/**
 * BenefitDetailsPage - Universal Benefit Details Template
 * 
 * ONE shared component used by ALL category pages.
 * Renders consistently for Housing, Health, Education, Transport, etc.
 * 
 * Sections:
 * 1. What You Get (plain language summary)
 * 2. Eligibility (rule-based, explainable)
 * 3. How It Works (request/claim/both workflow)
 * 4. Limits & Caps (with examples)
 * 5. Required Documents Checklist
 * 6. Timeline & Steps
 * 7. FAQs + Pitfalls
 * 8. Category-specific content (via children)
 */

import { ReactNode, useMemo, useState } from 'react';
import { LucideIcon, CheckCircle, AlertTriangle, FileText, HelpCircle, Wallet, TrendingDown, Percent, ChevronDown, ChevronUp, Send, BookOpen, Clock, Shield, Eye } from 'lucide-react';
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
import { ZeroState } from '@/components/shared/ZeroState';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUniversalBenefit } from '@/hooks/useUniversalBenefit';
import { BENEFIT_CATEGORIES, BenefitCategoryKey } from '@/lib/benefitCategories';
import { 
  UniversalPolicyLogic, 
  UniversalPolicyContent,
  getTransactionModelAction,
  getMonthName,
  TRANSACTION_MODEL_LABELS,
} from '@/lib/universalBenefitSchema';

// =============================================================================
// TYPES
// =============================================================================

export interface BenefitUtilization {
  annualValue: number;
  utilized: number;
  remaining: number;
  utilizationPercent: number;
}

export interface BenefitDetailsPageProps {
  /** Category key from BENEFIT_CATEGORIES */
  categoryKey: BenefitCategoryKey;
  
  /** Override title (defaults to category label) */
  title?: string;
  
  /** Override description */
  description?: string;
  
  /** Override icon */
  icon?: LucideIcon;
  
  /** Override icon gradient class */
  iconClassName?: string;
  
  /** Category-specific content rendered after standard sections */
  children?: ReactNode;
  
  /** Whether this is a read-only benefit (e.g., Equity) */
  isReadOnly?: boolean;
  
  /** Custom utilization override (for demo/testing) */
  customUtilization?: BenefitUtilization;
  
  /** Custom policy highlights override */
  customHighlights?: string[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BenefitDetailsPage({
  categoryKey,
  title: titleOverride,
  description: descriptionOverride,
  icon: iconOverride,
  iconClassName: iconClassNameOverride,
  children,
  isReadOnly = false,
  customUtilization,
  customHighlights,
}: BenefitDetailsPageProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);
  
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [showFaqs, setShowFaqs] = useState(false);
  
  // Fetch universal benefit data
  const { data: benefitData, isLoading, error } = useUniversalBenefit(categoryKey);
  
  // Get category config
  const category = BENEFIT_CATEGORIES[categoryKey];
  const Icon = iconOverride || category.icon;
  const title = titleOverride || category.fullLabel;
  const description = descriptionOverride || category.description;
  const iconClassName = iconClassNameOverride || category.gradientClass;
  
  // Extract policy data
  const policyLogic = benefitData?.policyLogic;
  const policyContent = benefitData?.policyContent;
  const policyRef = benefitData?.policyRef;
  const utilization = customUtilization || benefitData?.utilization;
  const policyHighlights = customHighlights || policyContent?.summary || benefitData?.policyHighlights || [];
  
  // Determine if read-only from policy or prop
  const effectiveReadOnly = isReadOnly || policyLogic?.is_read_only;
  
  // Derive workflow steps
  const workflowSteps = useMemo(() => {
    if (!policyLogic) return [];
    return policyLogic.workflow_steps || [];
  }, [policyLogic]);
  
  // Extract content pieces
  const requiredDocs = policyLogic?.required_docs?.filter(d => d.is_required) || [];
  const faqs = policyContent?.faqs || policyLogic?.faqs || [];
  const pitfalls = policyContent?.pitfalls || policyLogic?.pitfalls || [];
  const examples = policyContent?.examples || policyLogic?.examples || [];
  const guidance = policyContent?.employee_guidance || policyLogic?.employee_guidance;
  
  // Action button text
  const getActionButtonText = () => {
    if (effectiveReadOnly) return t('View Details', 'عرض التفاصيل');
    if (!policyLogic) return t('Submit Request', 'تقديم طلب');
    return getTransactionModelAction(policyLogic.transaction_model);
  };
  
  const getInitialRequestType = (): 'claim' | 'request' => {
    if (!policyLogic) return 'claim';
    return policyLogic.transaction_model === 'claim_only' ? 'claim' : 'request';
  };
  
  // Format currency helper
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title={title}
          description={description}
          icon={Icon}
          iconClassName={iconClassName}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={title}
          description={description}
          icon={Icon}
          iconClassName={iconClassName}
        />
        <ZeroState 
          pageId={`employee-${categoryKey}`}
          portal="employee"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        icon={Icon}
        iconClassName={`from-${categoryKey} to-${categoryKey}/80 shadow-${categoryKey}/25 ${iconClassName}`}
        badge={policyRef ? {
          label: policyRef,
          variant: 'default',
        } : undefined}
        actions={!effectiveReadOnly ? (
          <Button onClick={() => setRequestSheetOpen(true)} className="gap-2">
            <Send className={cn("h-4 w-4", isRTL && "rotate-180")} />
            {getActionButtonText()}
          </Button>
        ) : undefined}
      />

      {/* 1. Summary Stats (Utilization) */}
      {utilization && utilization.annualValue > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryStatsCard
            icon={Icon}
            value={formatCurrency(utilization.annualValue)}
            label={t('Annual Value', 'القيمة السنوية')}
            formula={t('Total annual benefit value', 'إجمالي قيمة المنفعة السنوية')}
            dataSource={t('Policy', 'السياسة')}
            variant="primary"
          />
          <SummaryStatsCard
            icon={Wallet}
            value={formatCurrency(utilization.utilized)}
            label={t('Utilized', 'المستخدم')}
            formula={t('Total claims/usage YTD', 'إجمالي المطالبات/الاستخدام')}
            dataSource={t('System', 'النظام')}
            variant="utilized"
          />
          <SummaryStatsCard
            icon={TrendingDown}
            value={formatCurrency(utilization.remaining)}
            label={t('Remaining', 'المتبقي')}
            formula={t('Annual Value - Utilized', 'القيمة السنوية - المستخدم')}
            dataSource={t('System', 'النظام')}
            variant="remaining"
          />
          <SummaryStatsCard
            icon={Percent}
            value={`${utilization.utilizationPercent}%`}
            label={t('Utilization', 'نسبة الاستخدام')}
            formula={t('(Utilized / Value) × 100', '(المستخدم / القيمة) × 100')}
            dataSource={t('System', 'النظام')}
            variant="utilization"
            progress={utilization.utilizationPercent}
          />
        </div>
      )}

      {/* 2. Policy Highlights */}
      {policyHighlights.length > 0 && (
        <PolicyHighlightsCard
          title={t(`${title} Policy Highlights`, `أبرز سياسة ${title}`)}
          policies={policyHighlights}
          category={title}
          actionLabel={getActionButtonText()}
          policyLabel={t('View Full Policy', 'عرض السياسة الكاملة')}
        />
      )}

      {/* Cross-links */}
      <BenefitCrossLinks benefitCategory={title} showClaimLink={false} />

      {/* 3. How It Works */}
      {policyLogic && workflowSteps.length > 0 && (
        <Card className={cn("border-accent/30 bg-gradient-to-r from-accent/5 to-transparent", isRTL && "bg-gradient-to-l")}>
          <CardHeader className="pb-3">
            <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Icon className="w-5 h-5 text-accent" />
              {t(`How ${title} Works`, `كيف يعمل ${title}`)}
            </CardTitle>
            <CardDescription>
              {TRANSACTION_MODEL_LABELS[policyLogic.transaction_model]?.description || ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "grid gap-4",
              workflowSteps.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-4"
            )}>
              {workflowSteps.map((step) => (
                <div key={step.step_number} className={cn("flex items-start gap-3 p-3 rounded-lg bg-card border", isRTL && "flex-row-reverse")}>
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                    {step.step_number}
                  </div>
                  <div className={cn(isRTL && "text-right")}>
                    <p className="font-medium text-sm">
                      {language === 'ar' && step.step_name_ar ? step.step_name_ar : step.step_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'ar' && step.description_ar ? step.description_ar : step.description}
                    </p>
                    {step.sla_hours && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.sla_hours}h SLA
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. What You Get (from employee_guidance) */}
      {guidance?.what_you_get && guidance.what_you_get.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Shield className="w-5 h-5 text-muted-foreground" />
              {t('What You Get', 'ما تحصل عليه')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-2">
              {(language === 'ar' && guidance.what_you_get_ar ? guidance.what_you_get_ar : guidance.what_you_get).map((item, i) => (
                <li key={i} className={cn("flex items-start gap-2 text-sm", isRTL && "flex-row-reverse text-right")}>
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 5. Eligibility Rules */}
      {policyLogic?.eligibility_rules && (
        <EligibilitySection rules={policyLogic.eligibility_rules} isRTL={isRTL} t={t} />
      )}

      {/* 6. Limits & Caps */}
      {policyLogic?.limits_caps && (policyLogic.limits_caps.annual_cap || policyLogic.limits_caps.per_transaction_cap) && (
        <LimitsSection limits={policyLogic.limits_caps} examples={examples} isRTL={isRTL} t={t} />
      )}

      {/* 7. Required Documents */}
      {requiredDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <FileText className="w-5 h-5 text-muted-foreground" />
              {t('Required Documents', 'المستندات المطلوبة')}
            </CardTitle>
            <CardDescription className={cn(isRTL && "text-right")}>
              {t("You'll need to provide these documents when submitting", 'ستحتاج إلى تقديم هذه المستندات عند التقديم')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {requiredDocs.map((doc, i) => (
                <div key={doc.id || i} className={cn("flex items-start gap-3 p-3 rounded-lg border", isRTL && "flex-row-reverse")}>
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className={cn(isRTL && "text-right")}>
                    <p className="font-medium text-sm">{doc.doc_name}</p>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                    )}
                    <Badge variant="outline" className="mt-1 text-xs">
                      {doc.transaction_type === 'both' ? t('Request & Claim', 'طلب ومطالبة') : 
                       doc.transaction_type === 'request' ? t('Request Only', 'طلب فقط') : t('Claim Only', 'مطالبة فقط')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 8. Tips & Guidance */}
      {guidance && (guidance.tips?.length > 0 || guidance.common_mistakes?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              {t('Tips & Guidance', 'نصائح وإرشادات')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {guidance.tips && guidance.tips.length > 0 && (
              <div>
                <p className={cn("text-sm font-medium mb-2", isRTL && "text-right")}>{t('Pro Tips', 'نصائح احترافية')}</p>
                <ul className="space-y-1.5">
                  {(language === 'ar' && guidance.tips_ar ? guidance.tips_ar : guidance.tips).map((tip, i) => (
                    <li key={i} className={cn("flex items-start gap-2 text-sm text-muted-foreground", isRTL && "flex-row-reverse text-right")}>
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {guidance.common_mistakes && guidance.common_mistakes.length > 0 && (
              <div>
                <p className={cn("text-sm font-medium mb-2", isRTL && "text-right")}>{t('Common Mistakes to Avoid', 'أخطاء شائعة يجب تجنبها')}</p>
                <ul className="space-y-1.5">
                  {(language === 'ar' && guidance.common_mistakes_ar ? guidance.common_mistakes_ar : guidance.common_mistakes).map((mistake, i) => (
                    <li key={i} className={cn("flex items-start gap-2 text-sm text-muted-foreground", isRTL && "flex-row-reverse text-right")}>
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

      {/* 9. FAQs & Pitfalls */}
      {(faqs.length > 0 || pitfalls.length > 0) && (
        <Collapsible open={showFaqs} onOpenChange={setShowFaqs}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    {t('FAQs & Common Issues', 'الأسئلة الشائعة والمشكلات')}
                    <Badge variant="secondary" className="ms-2">{faqs.length + pitfalls.length}</Badge>
                  </CardTitle>
                  {showFaqs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <p className={cn("font-medium text-sm mb-2 flex items-start gap-2", isRTL && "flex-row-reverse text-right")}>
                      <HelpCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      {language === 'ar' && faq.question_ar ? faq.question_ar : faq.question}
                    </p>
                    <p className={cn("text-sm text-muted-foreground", isRTL ? "pe-6 text-right" : "pl-6")}>
                      {language === 'ar' && faq.answer_ar ? faq.answer_ar : faq.answer}
                    </p>
                  </div>
                ))}
                {pitfalls.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className={cn("font-medium text-sm mb-2 flex items-center gap-2 text-amber-600", isRTL && "flex-row-reverse")}>
                        <AlertTriangle className="w-4 h-4" />
                        {t('Watch Out For', 'احذر من')}
                      </p>
                      <ul className={cn("space-y-1.5", isRTL ? "pe-6" : "pl-6")}>
                        {(language === 'ar' && policyLogic?.pitfalls_ar ? policyLogic.pitfalls_ar : pitfalls).map((pitfall, i) => (
                          <li key={i} className={cn("text-sm text-muted-foreground", isRTL && "text-right")}>• {pitfall}</li>
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

      {/* Request/Claim Sheet */}
      {!effectiveReadOnly && (
        <EmployeeCreateRequestSheet
          open={requestSheetOpen}
          onOpenChange={setRequestSheetOpen}
          initialType={getInitialRequestType()}
          initialCategory={title}
        />
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface EligibilitySectionProps {
  rules: UniversalPolicyLogic['eligibility_rules'];
  isRTL: boolean;
  t: (en: string, ar: string) => string;
}

function EligibilitySection({ rules, isRTL, t }: EligibilitySectionProps) {
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
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <div className={cn(isRTL && "text-right")}>
              <p className="font-medium text-sm">{t('Open to All Employees', 'متاح لجميع الموظفين')}</p>
              <p className="text-xs text-muted-foreground">{t('No specific eligibility restrictions apply', 'لا توجد قيود أهلية محددة')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <CheckCircle className="w-5 h-5 text-muted-foreground" />
          {t('Eligibility Requirements', 'متطلبات الأهلية')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {rules.grades.length > 0 && (
            <EligibilityItem 
              label={t('Eligible Grades', 'الدرجات المؤهلة')}
              value={rules.grades.join(', ')} 
              isRTL={isRTL}
            />
          )}
          {rules.departments.length > 0 && (
            <EligibilityItem 
              label={t('Eligible Departments', 'الأقسام المؤهلة')}
              value={rules.departments.join(', ')} 
              isRTL={isRTL}
            />
          )}
          {rules.locations.length > 0 && (
            <EligibilityItem 
              label={t('Eligible Locations', 'المواقع المؤهلة')}
              value={rules.locations.join(', ')} 
              isRTL={isRTL}
            />
          )}
          {rules.contract_types.length > 0 && (
            <EligibilityItem 
              label={t('Contract Types', 'أنواع العقود')}
              value={rules.contract_types.join(', ')} 
              isRTL={isRTL}
            />
          )}
          {rules.min_tenure_months > 0 && (
            <EligibilityItem 
              label={t('Minimum Tenure', 'الحد الأدنى للخدمة')}
              value={t(`${rules.min_tenure_months} months`, `${rules.min_tenure_months} شهر`)}
              isRTL={isRTL}
            />
          )}
          {rules.probation_passed && (
            <EligibilityItem 
              label={t('Probation', 'فترة الاختبار')}
              value={t('Must have completed probation', 'يجب أن يكون قد أكمل فترة الاختبار')}
              isRTL={isRTL}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EligibilityItem({ label, value, isRTL }: { label: string; value: string; isRTL: boolean }) {
  return (
    <div className={cn("p-3 rounded-lg border", isRTL && "text-right")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm mt-1">{value}</p>
    </div>
  );
}

interface LimitsSectionProps {
  limits: UniversalPolicyLogic['limits_caps'];
  examples: UniversalPolicyLogic['examples'];
  isRTL: boolean;
  t: (en: string, ar: string) => string;
}

function LimitsSection({ limits, examples, isRTL, t }: LimitsSectionProps) {
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Wallet className="w-5 h-5 text-muted-foreground" />
          {t('Limits & Caps', 'الحدود والسقف')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {limits.annual_cap && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">{t('Annual Cap', 'الحد السنوي')}</p>
              <p className="text-lg font-bold text-primary mt-1">
                {formatCurrency(limits.annual_cap)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t(`Per ${limits.frequency} (resets in ${getMonthName(limits.reset_month)})`, `لكل ${limits.frequency === 'annual' ? 'سنة' : 'شهر'}`)}
              </p>
            </div>
          )}
          {limits.per_transaction_cap && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">{t('Per Transaction', 'لكل معاملة')}</p>
              <p className="text-lg font-bold mt-1">
                {formatCurrency(limits.per_transaction_cap)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('Maximum per claim', 'الحد الأقصى لكل مطالبة')}</p>
            </div>
          )}
          {limits.pre_approval_threshold && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-muted-foreground">{t('Pre-Approval Threshold', 'حد الموافقة المسبقة')}</p>
              <p className="text-lg font-bold text-amber-600 mt-1">
                {formatCurrency(limits.pre_approval_threshold)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('Pre-approval required above this', 'موافقة مسبقة مطلوبة فوق هذا المبلغ')}</p>
            </div>
          )}
        </div>

        {examples && examples.length > 0 && (
          <>
            <Separator />
            <div>
              <p className={cn("text-sm font-medium mb-3", isRTL && "text-right")}>{t('Examples', 'أمثلة')}</p>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <div key={i} className={cn("flex items-start gap-3 p-3 rounded-lg bg-muted/50", isRTL && "flex-row-reverse")}>
                    <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                    <div className={cn("flex-1", isRTL && "text-right")}>
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

export default BenefitDetailsPage;
