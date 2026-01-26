/**
 * Out-of-Pocket Optimizer - Computation Engine
 * 
 * Generates prioritized actions to help employees reduce out-of-pocket costs.
 * 
 * CRITICAL RULES:
 * 1. NEVER show spendable AED remaining for coverage/access/deferred benefits
 * 2. All savings must include: timeframe, confidence, calculation method
 * 3. Only cash/reimbursement/budget benefits can show AED impact
 * 4. Coverage benefits show "Use coverage" actions without monetary value
 * 
 * Action Priority (descending):
 * 1. Blockers (missing docs) - unblocks money
 * 2. Due soon - time-sensitive
 * 3. Highest net impact - biggest savings
 * 4. Lowest effort - quick wins
 */

import { BenefitValueType, canShowUnusedAmount } from '@/lib/benefitValueTypes';
import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Receipt,
  Shield,
  Gift,
  CreditCard,
  Heart,
  GraduationCap,
  Home,
  Car,
  Dumbbell,
  BookOpen,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ConfidenceLevel } from '@/lib/metrics/types';

// ============================================================================
// TYPES
// ============================================================================

export type ActionTimeframe = 'this_month' | 'one_time' | 'this_year';
export type ActionConfidence = 'measured' | 'estimated' | 'proxy' | 'missing';
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'action_required' | 'pending' | 'in_progress' | 'blocked';
export type ActionType = 
  | 'upload_docs' 
  | 'submit_claim' 
  | 'redeem_offer' 
  | 'link_card' 
  | 'use_coverage' 
  | 'view_policy'
  | 'education';

export interface OptimizerAction {
  id: string;
  title: string;
  titleAr: string;
  whyItMatters: string;
  whyItMattersAr: string;
  
  // Impact - ONLY for cash/reimbursement/budget
  estimatedImpact: number | null;
  impactLabel: string;
  impactLabelAr: string;
  timeframe: ActionTimeframe;
  
  // Confidence with calculation explanation
  confidence: ActionConfidence;
  confidenceNote: string;
  howCalculated: string;
  howCalculatedAr: string;
  
  // Priority
  priority: ActionPriority;
  priorityScore: number;
  status: ActionStatus;
  
  // Action metadata
  actionType: ActionType;
  category: string;
  categoryAr: string;
  severityTag?: string;
  severityTagAr?: string;
  
  // Navigation
  route: string;
  ctaLabel: string;
  ctaLabelAr: string;
  icon: LucideIcon;
  
  // Prerequisites
  prerequisites?: string[];
  prerequisitesAr?: string[];
  documentChecklist?: string[];
  
  // Benefit type (for filtering)
  benefitValueType?: BenefitValueType;
  
  // Is this an educational action (no real savings)?
  isEducational?: boolean;
}

export interface ReducibleCostBreakdown {
  actionId: string;
  label: string;
  amount: number;
  timeframe: ActionTimeframe;
  confidence: ActionConfidence;
}

export interface OptimizerSummary {
  // Primary KPI - only actionable, reducible costs
  reducibleCosts: number;
  reducibleCostsTimeframe: ActionTimeframe;
  reducibleCostsConfidence: ActionConfidence;
  reducibleCostsBreakdown: ReducibleCostBreakdown[];
  
  // Secondary KPIs
  actionCount: number;
  estimatedMinutes: number;
  
  // Metadata
  hasBlockers: boolean;
  blockerCount: number;
}

// ============================================================================
// DEMO DATA - Would come from real hooks in production
// ============================================================================

interface DemoBenefit {
  id: string;
  name: string;
  nameAr: string;
  valueType: BenefitValueType;
  annualAllowance: number;
  utilizedAmount: number;
  pendingAmount: number;
  lifeArea: string;
  icon: LucideIcon;
  route: string;
}

interface DemoPendingRequest {
  id: string;
  benefitName: string;
  benefitNameAr: string;
  amount: number;
  status: 'info_requested' | 'pending' | 'in_review';
  missingDocs: string[];
  missingDocsAr: string[];
}

interface DemoMarketplaceOffer {
  id: string;
  title: string;
  titleAr: string;
  merchant: string;
  discountPercent?: number;
  discountAmount?: number;
  isSponsored: boolean;
  cardLinked: boolean;
  route: string;
}

// Demo benefits with proper value types
const demoBenefits: DemoBenefit[] = [
  {
    id: 'housing',
    name: 'Housing Allowance',
    nameAr: 'بدل السكن',
    valueType: 'cash',
    annualAllowance: 90000,
    utilizedAmount: 90000,
    pendingAmount: 0,
    lifeArea: 'housing',
    icon: Home,
    route: '/employee/housing',
  },
  {
    id: 'schooling',
    name: 'Schooling',
    nameAr: 'التعليم',
    valueType: 'reimbursement',
    annualAllowance: 60000,
    utilizedAmount: 35000,
    pendingAmount: 8000,
    lifeArea: 'education',
    icon: GraduationCap,
    route: '/employee/schooling',
  },
  {
    id: 'health',
    name: 'Health Insurance',
    nameAr: 'التأمين الصحي',
    valueType: 'coverage',
    annualAllowance: 25000,
    utilizedAmount: 0,
    pendingAmount: 0,
    lifeArea: 'health',
    icon: Heart,
    route: '/employee/health',
  },
  {
    id: 'transport',
    name: 'Transport',
    nameAr: 'النقل',
    valueType: 'reimbursement',
    annualAllowance: 12000,
    utilizedAmount: 4800,
    pendingAmount: 1500,
    lifeArea: 'transport',
    icon: Car,
    route: '/employee/transport',
  },
  {
    id: 'wellbeing',
    name: 'Wellbeing',
    nameAr: 'الرفاهية',
    valueType: 'budget',
    annualAllowance: 6000,
    utilizedAmount: 2200,
    pendingAmount: 0,
    lifeArea: 'wellbeing',
    icon: Dumbbell,
    route: '/employee/wellbeing',
  },
  {
    id: 'learning',
    name: 'Learning & Development',
    nameAr: 'التعلم والتطوير',
    valueType: 'reimbursement',
    annualAllowance: 12000,
    utilizedAmount: 4500,
    pendingAmount: 2000,
    lifeArea: 'learning',
    icon: BookOpen,
    route: '/employee/learning',
  },
];

const demoPendingRequests: DemoPendingRequest[] = [
  {
    id: 'req-001',
    benefitName: 'Schooling',
    benefitNameAr: 'التعليم',
    amount: 8000,
    status: 'info_requested',
    missingDocs: ['School tuition receipt', 'Fee breakdown'],
    missingDocsAr: ['إيصال رسوم المدرسة', 'تفصيل الرسوم'],
  },
  {
    id: 'req-002',
    benefitName: 'Transport',
    benefitNameAr: 'النقل',
    amount: 1500,
    status: 'pending',
    missingDocs: [],
    missingDocsAr: [],
  },
];

const demoMarketplaceOffers: DemoMarketplaceOffer[] = [
  {
    id: 'offer-001',
    title: '25% Off Gym Membership',
    titleAr: 'خصم 25% على اشتراك الجيم',
    merchant: 'Fitness First',
    discountPercent: 25,
    isSponsored: true,
    cardLinked: false,
    route: '/employee/marketplace',
  },
  {
    id: 'offer-002',
    title: 'AED 500 Learning Credit',
    titleAr: 'رصيد تعليمي AED 500',
    merchant: 'Coursera',
    discountAmount: 500,
    isSponsored: true,
    cardLinked: false,
    route: '/employee/marketplace',
  },
];

// ============================================================================
// COMPUTATION ENGINE
// ============================================================================

export function computeOutOfPocketOpportunities(
  hasLinkedBankCards: boolean = false
): { actions: OptimizerAction[]; summary: OptimizerSummary } {
  const actions: OptimizerAction[] = [];
  const reducibleCostsBreakdown: ReducibleCostBreakdown[] = [];

  // =========================================================================
  // A) BLOCKERS: Missing Documents (Critical Priority)
  // =========================================================================
  demoPendingRequests
    .filter(req => req.status === 'info_requested' && req.missingDocs.length > 0)
    .forEach(req => {
      actions.push({
        id: `blocker-${req.id}`,
        title: `Upload documents to unblock ${req.benefitName} claim`,
        titleAr: `ارفع المستندات لفتح مطالبة ${req.benefitNameAr}`,
        whyItMatters: 'Your claim is blocked. Upload documents to release your reimbursement.',
        whyItMattersAr: 'مطالبتك محظورة. ارفع المستندات للحصول على استردادك.',
        estimatedImpact: req.amount,
        impactLabel: `Unlocks AED ${req.amount.toLocaleString('en-US')}`,
        impactLabelAr: `يفتح AED ${req.amount.toLocaleString('en-US')}`,
        timeframe: 'one_time',
        confidence: 'measured',
        confidenceNote: 'Based on your submitted claim amount',
        howCalculated: `This is the exact amount from your claim submission (${req.benefitName}).`,
        howCalculatedAr: `هذا هو المبلغ الدقيق من تقديم مطالبتك (${req.benefitNameAr}).`,
        priority: 'critical',
        priorityScore: 100,
        status: 'blocked',
        actionType: 'upload_docs',
        category: 'Missing Documents',
        categoryAr: 'مستندات ناقصة',
        severityTag: 'Blocked',
        severityTagAr: 'محظور',
        route: '/employee/requests',
        ctaLabel: 'Upload now',
        ctaLabelAr: 'ارفع الآن',
        icon: AlertTriangle,
        documentChecklist: req.missingDocs,
        prerequisites: req.missingDocs,
        prerequisitesAr: req.missingDocsAr,
      });

      // Add to breakdown
      reducibleCostsBreakdown.push({
        actionId: `blocker-${req.id}`,
        label: `${req.benefitName} claim (blocked)`,
        amount: req.amount,
        timeframe: 'one_time',
        confidence: 'measured',
      });
    });

  // =========================================================================
  // B) REIMBURSEMENT/BUDGET: Claim Remaining Balance
  // =========================================================================
  demoBenefits
    .filter(b => canShowUnusedAmount(b.valueType))
    .filter(b => {
      const remaining = b.annualAllowance - b.utilizedAmount - b.pendingAmount;
      return remaining >= 500; // Only meaningful amounts
    })
    .forEach(benefit => {
      const remaining = benefit.annualAllowance - benefit.utilizedAmount - benefit.pendingAmount;
      const monthsLeft = 12 - new Date().getMonth(); // Remaining months in year
      const monthlyEstimate = Math.round(remaining / monthsLeft);

      actions.push({
        id: `claim-${benefit.id}`,
        title: `Claim your ${benefit.name} reimbursement`,
        titleAr: `قدم مطالبة استرداد ${benefit.nameAr}`,
        whyItMatters: `You have AED ${remaining.toLocaleString('en-US')} unused this year. Submit eligible expenses.`,
        whyItMattersAr: `لديك AED ${remaining.toLocaleString('en-US')} غير مستخدمة هذا العام. قدم مصاريفك المؤهلة.`,
        estimatedImpact: monthlyEstimate,
        impactLabel: `~AED ${monthlyEstimate.toLocaleString('en-US')}/mo`,
        impactLabelAr: `~AED ${monthlyEstimate.toLocaleString('en-US')}/شهر`,
        timeframe: 'this_month',
        confidence: 'estimated',
        confidenceNote: 'Estimated based on remaining balance ÷ months left',
        howCalculated: `Remaining: AED ${remaining.toLocaleString('en-US')} ÷ ${monthsLeft} months = ~AED ${monthlyEstimate.toLocaleString('en-US')}/month. Actual depends on your expenses.`,
        howCalculatedAr: `المتبقي: AED ${remaining.toLocaleString('en-US')} ÷ ${monthsLeft} شهر = ~AED ${monthlyEstimate.toLocaleString('en-US')}/شهر. الفعلي يعتمد على مصاريفك.`,
        priority: remaining > 5000 ? 'high' : 'medium',
        priorityScore: remaining > 5000 ? 80 : 60,
        status: 'action_required',
        actionType: 'submit_claim',
        category: benefit.name,
        categoryAr: benefit.nameAr,
        route: benefit.route,
        ctaLabel: 'Submit claim',
        ctaLabelAr: 'قدم مطالبة',
        icon: benefit.icon,
        benefitValueType: benefit.valueType,
      });

      // Add to breakdown
      reducibleCostsBreakdown.push({
        actionId: `claim-${benefit.id}`,
        label: `${benefit.name} (est. monthly)`,
        amount: monthlyEstimate,
        timeframe: 'this_month',
        confidence: 'estimated',
      });
    });

  // =========================================================================
  // C) COVERAGE: Use Benefits (NO AED shown)
  // =========================================================================
  demoBenefits
    .filter(b => b.valueType === 'coverage')
    .forEach(benefit => {
      actions.push({
        id: `coverage-${benefit.id}`,
        title: `Use your ${benefit.name}`,
        titleAr: `استخدم ${benefit.nameAr}`,
        whyItMatters: 'Find in-network providers for covered services. No out-of-pocket for covered care.',
        whyItMattersAr: 'ابحث عن مقدمي الخدمات ضمن الشبكة. لا مصاريف من جيبك للرعاية المغطاة.',
        estimatedImpact: null, // NO monetary value for coverage
        impactLabel: 'Covered benefit',
        impactLabelAr: 'ميزة مغطاة',
        timeframe: 'this_month',
        confidence: 'measured',
        confidenceNote: 'Employer-paid coverage',
        howCalculated: 'This is employer-paid coverage. Using in-network providers avoids out-of-pocket costs.',
        howCalculatedAr: 'هذه تغطية مدفوعة من صاحب العمل. استخدام مقدمي الخدمات ضمن الشبكة يتجنب التكاليف من جيبك.',
        priority: 'low',
        priorityScore: 25,
        status: 'action_required',
        actionType: 'use_coverage',
        category: 'Coverage',
        categoryAr: 'التغطية',
        route: benefit.route,
        ctaLabel: 'View coverage',
        ctaLabelAr: 'عرض التغطية',
        icon: Shield,
        benefitValueType: benefit.valueType,
        isEducational: true,
      });
    });

  // =========================================================================
  // D) MARKETPLACE: Sponsored Offers
  // =========================================================================
  demoMarketplaceOffers
    .filter(offer => offer.isSponsored)
    .slice(0, 2)
    .forEach(offer => {
      const impactLabel = offer.discountAmount 
        ? `AED ${offer.discountAmount} off`
        : `${offer.discountPercent}% off`;

      actions.push({
        id: `offer-${offer.id}`,
        title: offer.title,
        titleAr: offer.titleAr,
        whyItMatters: `Employer-sponsored offer at ${offer.merchant}. Exclusive to your organization.`,
        whyItMattersAr: `عرض مدعوم من صاحب العمل في ${offer.merchant}. حصري لمنظمتك.`,
        estimatedImpact: offer.discountAmount || null,
        impactLabel,
        impactLabelAr: impactLabel,
        timeframe: 'one_time',
        confidence: 'measured',
        confidenceNote: 'Employer-sponsored offer',
        howCalculated: offer.discountAmount 
          ? `Fixed discount of AED ${offer.discountAmount} on purchase.`
          : `${offer.discountPercent}% off your purchase price.`,
        howCalculatedAr: offer.discountAmount
          ? `خصم ثابت AED ${offer.discountAmount} على الشراء.`
          : `خصم ${offer.discountPercent}% على سعر الشراء.`,
        priority: 'medium',
        priorityScore: 45,
        status: 'action_required',
        actionType: 'redeem_offer',
        category: 'Marketplace',
        categoryAr: 'السوق',
        route: offer.route,
        ctaLabel: 'View offer',
        ctaLabelAr: 'عرض العرض',
        icon: Gift,
      });

      if (offer.discountAmount) {
        reducibleCostsBreakdown.push({
          actionId: `offer-${offer.id}`,
          label: `${offer.title} (offer)`,
          amount: offer.discountAmount,
          timeframe: 'one_time',
          confidence: 'measured',
        });
      }
    });

  // =========================================================================
  // E) BANK CARD: Link for Card-Linked Offers
  // =========================================================================
  const cardLinkedOffers = demoMarketplaceOffers.filter(o => o.cardLinked);
  if (!hasLinkedBankCards && cardLinkedOffers.length > 0) {
    actions.push({
      id: 'link-card',
      title: 'Link your bank card to unlock offers',
      titleAr: 'اربط بطاقتك المصرفية لفتح العروض',
      whyItMatters: `${cardLinkedOffers.length} exclusive offers require a linked card.`,
      whyItMattersAr: `${cardLinkedOffers.length} عروض حصرية تتطلب بطاقة مرتبطة.`,
      estimatedImpact: null,
      impactLabel: `${cardLinkedOffers.length} offers`,
      impactLabelAr: `${cardLinkedOffers.length} عروض`,
      timeframe: 'one_time',
      confidence: 'measured',
      confidenceNote: 'Card-linked offers available',
      howCalculated: 'Link your card to access card-linked discounts automatically.',
      howCalculatedAr: 'اربط بطاقتك للوصول إلى خصومات البطاقة تلقائيًا.',
      priority: 'low',
      priorityScore: 35,
      status: 'action_required',
      actionType: 'link_card',
      category: 'Setup',
      categoryAr: 'الإعداد',
      route: '/employee/profile#linked-cards',
      ctaLabel: 'Link card',
      ctaLabelAr: 'ربط البطاقة',
      icon: CreditCard,
    });
  }

  // =========================================================================
  // SORT: Priority Score (blockers first, then impact, then effort)
  // =========================================================================
  actions.sort((a, b) => b.priorityScore - a.priorityScore);

  // =========================================================================
  // COMPUTE SUMMARY
  // =========================================================================
  const blockers = actions.filter(a => a.status === 'blocked');
  
  // Reducible costs = only actionable AED amounts (no coverage)
  const reducibleCosts = reducibleCostsBreakdown.reduce((sum, b) => sum + b.amount, 0);
  const hasEstimated = reducibleCostsBreakdown.some(b => b.confidence === 'estimated');

  const summary: OptimizerSummary = {
    reducibleCosts,
    reducibleCostsTimeframe: 'this_month',
    reducibleCostsConfidence: hasEstimated ? 'estimated' : 'measured',
    reducibleCostsBreakdown,
    actionCount: actions.filter(a => !a.isEducational).length,
    estimatedMinutes: Math.max(5, actions.length * 2),
    hasBlockers: blockers.length > 0,
    blockerCount: blockers.length,
  };

  return { actions, summary };
}

// ============================================================================
// STYLE HELPERS
// ============================================================================

export function getPriorityStyle(priority: ActionPriority): string {
  switch (priority) {
    case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'high': return 'bg-warning/10 text-warning border-warning/20';
    case 'medium': return 'bg-accent/10 text-accent border-accent/20';
    case 'low': return 'bg-muted text-muted-foreground border-border';
  }
}

export function getConfidenceStyle(confidence: ActionConfidence): string {
  switch (confidence) {
    case 'measured': return 'bg-success/10 text-success border-success/20';
    case 'estimated': return 'bg-accent/10 text-accent border-accent/20';
    case 'proxy': return 'bg-warning/10 text-warning border-warning/20';
    case 'missing': return 'bg-muted text-muted-foreground border-border';
  }
}

export function getStatusStyle(status: ActionStatus): string {
  switch (status) {
    case 'action_required': return 'bg-warning/10 text-warning border-warning/20';
    case 'pending': return 'bg-muted text-muted-foreground border-border';
    case 'in_progress': return 'bg-info/10 text-info border-info/20';
    case 'blocked': return 'bg-destructive/10 text-destructive border-destructive/20';
  }
}

export function getTimeframeLabel(timeframe: ActionTimeframe, lang: 'en' | 'ar' = 'en'): string {
  const labels: Record<ActionTimeframe, { en: string; ar: string }> = {
    this_month: { en: 'This month', ar: 'هذا الشهر' },
    one_time: { en: 'One-time', ar: 'مرة واحدة' },
    this_year: { en: 'This year', ar: 'هذا العام' },
  };
  return labels[timeframe][lang];
}

export function getConfidenceLabel(confidence: ActionConfidence, lang: 'en' | 'ar' = 'en'): string {
  const labels: Record<ActionConfidence, { en: string; ar: string }> = {
    measured: { en: 'Measured', ar: 'مقاس' },
    estimated: { en: 'Estimated', ar: 'تقدير' },
    proxy: { en: 'Proxy', ar: 'تقريبي' },
    missing: { en: 'Missing', ar: 'مفقود' },
  };
  return labels[confidence][lang];
}
