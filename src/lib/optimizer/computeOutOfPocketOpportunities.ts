/**
 * Out-of-Pocket Optimizer - Action Generation Rules
 * 
 * Generates prioritized actions to help employees reduce out-of-pocket costs
 * using their benefits and marketplace offers.
 * 
 * RULES:
 * - Reimbursement/Budget benefits: Show remaining amounts as claimable
 * - Coverage benefits: Do NOT show "remaining AED" - suggest service usage
 * - Missing documents: High priority to unblock claims
 * - Marketplace: Show eligible offers with discount amounts
 * - Bank cards: Suggest linking for card-linked offers
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
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type ActionConfidence = 'high' | 'medium' | 'low' | 'estimated';
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'action_required' | 'pending' | 'in_progress' | 'blocked';

export interface OptimizerAction {
  id: string;
  title: string;
  titleAr: string;
  whyItMatters: string;
  whyItMattersAr: string;
  estimatedImpact: number | null; // AED amount, null for non-monetary
  impactLabel: string; // "AED 5,000" or "Save 20%" or "Service benefit"
  impactLabelAr: string;
  confidence: ActionConfidence;
  confidenceNote: string;
  priority: ActionPriority;
  priorityScore: number; // For sorting (higher = more urgent)
  status: ActionStatus;
  actionType: 'claim' | 'upload' | 'redeem' | 'link_card' | 'use_coverage' | 'view_policy';
  category: string;
  categoryAr: string;
  route: string;
  ctaLabel: string;
  ctaLabelAr: string;
  icon: LucideIcon;
  documentChecklist?: string[];
  benefitValueType?: BenefitValueType;
}

export interface OptimizerSummary {
  potentialSavings: number;
  savingsConfidence: ActionConfidence;
  actionCount: number;
  estimatedMinutes: number;
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
  amount: number;
  status: 'info_requested' | 'pending' | 'in_review';
  missingDocs: string[];
}

interface DemoMarketplaceOpportunity {
  id: string;
  title: string;
  merchant: string;
  discountPercent?: number;
  discountAmount?: number;
  isSponsored: boolean;
  cardLinked: boolean;
  route: string;
}

// Demo benefits with utilization data
const demoBenefits: DemoBenefit[] = [
  {
    id: 'housing',
    name: 'Housing Allowance',
    nameAr: 'بدل السكن',
    valueType: 'cash',
    annualAllowance: 90000,
    utilizedAmount: 90000, // Fully utilized (paid monthly)
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
    annualAllowance: 25000, // Employer investment, not spendable
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

// Demo pending requests with missing documents
const demoPendingRequests: DemoPendingRequest[] = [
  {
    id: 'req-001',
    benefitName: 'Schooling',
    amount: 8000,
    status: 'info_requested',
    missingDocs: ['School tuition receipt', 'Fee breakdown'],
  },
  {
    id: 'req-002',
    benefitName: 'Transport',
    amount: 1500,
    status: 'pending',
    missingDocs: [],
  },
  {
    id: 'req-003',
    benefitName: 'Learning',
    amount: 2000,
    status: 'in_review',
    missingDocs: [],
  },
];

// Demo marketplace opportunities
const demoMarketplaceOpportunities: DemoMarketplaceOpportunity[] = [
  {
    id: 'offer-001',
    title: '25% Off Gym Membership',
    merchant: 'Fitness First',
    discountPercent: 25,
    isSponsored: true,
    cardLinked: false,
    route: '/employee/marketplace',
  },
  {
    id: 'offer-002',
    title: 'AED 500 Learning Credit',
    merchant: 'Coursera',
    discountAmount: 500,
    isSponsored: true,
    cardLinked: false,
    route: '/employee/marketplace',
  },
  {
    id: 'offer-003',
    title: '15% Off Grocery Shopping',
    merchant: 'Carrefour',
    discountPercent: 15,
    isSponsored: false,
    cardLinked: true,
    route: '/employee/marketplace',
  },
];

// ============================================================================
// ACTION GENERATION LOGIC
// ============================================================================

/**
 * Generates optimizer actions based on benefit utilization, missing docs,
 * and marketplace opportunities.
 */
export function computeOutOfPocketOpportunities(
  hasLinkedBankCards: boolean = false
): { actions: OptimizerAction[]; summary: OptimizerSummary } {
  const actions: OptimizerAction[] = [];

  // -------------------------------------------------------------------------
  // A) Missing Documents - Highest Priority
  // -------------------------------------------------------------------------
  demoPendingRequests
    .filter(req => req.status === 'info_requested' && req.missingDocs.length > 0)
    .forEach(req => {
      actions.push({
        id: `missing-docs-${req.id}`,
        title: `Upload missing documents for ${req.benefitName}`,
        titleAr: `رفع المستندات المفقودة لـ ${req.benefitName}`,
        whyItMatters: 'Your claim is blocked until documents are provided',
        whyItMattersAr: 'مطالبتك محظورة حتى يتم تقديم المستندات',
        estimatedImpact: req.amount,
        impactLabel: `Unlocks AED ${req.amount.toLocaleString('en-US')}`,
        impactLabelAr: `يفتح AED ${req.amount.toLocaleString('en-US')}`,
        confidence: 'high',
        confidenceNote: 'Amount based on submitted claim',
        priority: 'critical',
        priorityScore: 100,
        status: 'action_required',
        actionType: 'upload',
        category: 'Missing Documents',
        categoryAr: 'مستندات ناقصة',
        route: '/employee/requests',
        ctaLabel: 'Upload now',
        ctaLabelAr: 'رفع الآن',
        icon: FileText,
        documentChecklist: req.missingDocs,
      });
    });

  // -------------------------------------------------------------------------
  // B) Reimbursement/Budget Benefits with Remaining Balance
  // -------------------------------------------------------------------------
  demoBenefits
    .filter(b => canShowUnusedAmount(b.valueType))
    .filter(b => b.annualAllowance > b.utilizedAmount + b.pendingAmount)
    .forEach(benefit => {
      const remaining = benefit.annualAllowance - benefit.utilizedAmount - benefit.pendingAmount;
      const monthlyEstimate = Math.round(remaining / 12);
      
      // Only suggest if meaningful amount remaining
      if (remaining < 500) return;

      actions.push({
        id: `claim-${benefit.id}`,
        title: `Claim your ${benefit.name} reimbursement`,
        titleAr: `قدم مطالبة استرداد ${benefit.nameAr}`,
        whyItMatters: `You have AED ${remaining.toLocaleString('en-US')} remaining this year`,
        whyItMattersAr: `لديك AED ${remaining.toLocaleString('en-US')} متبقية هذا العام`,
        estimatedImpact: remaining,
        impactLabel: `Est. AED ${monthlyEstimate.toLocaleString('en-US')}/mo`,
        impactLabelAr: `تقدير AED ${monthlyEstimate.toLocaleString('en-US')}/شهر`,
        confidence: 'estimated',
        confidenceNote: 'Based on annual remaining ÷ 12 months',
        priority: remaining > 5000 ? 'high' : 'medium',
        priorityScore: remaining > 5000 ? 80 : 60,
        status: 'action_required',
        actionType: 'claim',
        category: benefit.name,
        categoryAr: benefit.nameAr,
        route: benefit.route,
        ctaLabel: 'Submit claim',
        ctaLabelAr: 'قدم مطالبة',
        icon: benefit.icon,
        benefitValueType: benefit.valueType,
      });
    });

  // -------------------------------------------------------------------------
  // C) Coverage Benefits - Suggest Usage (NO AED remaining)
  // -------------------------------------------------------------------------
  demoBenefits
    .filter(b => b.valueType === 'coverage')
    .forEach(benefit => {
      actions.push({
        id: `use-coverage-${benefit.id}`,
        title: `Use your ${benefit.name} coverage`,
        titleAr: `استخدم تغطية ${benefit.nameAr}`,
        whyItMatters: 'Find in-network providers and save on medical expenses',
        whyItMattersAr: 'ابحث عن مقدمي الخدمات ضمن الشبكة ووفر على المصاريف الطبية',
        estimatedImpact: null,
        impactLabel: 'Service benefit',
        impactLabelAr: 'ميزة خدمية',
        confidence: 'high',
        confidenceNote: 'Employer-paid coverage',
        priority: 'low',
        priorityScore: 30,
        status: 'action_required',
        actionType: 'use_coverage',
        category: benefit.name,
        categoryAr: benefit.nameAr,
        route: benefit.route,
        ctaLabel: 'View coverage',
        ctaLabelAr: 'عرض التغطية',
        icon: Shield,
        benefitValueType: benefit.valueType,
      });
    });

  // -------------------------------------------------------------------------
  // D) Marketplace Offers
  // -------------------------------------------------------------------------
  demoMarketplaceOpportunities
    .filter(offer => !offer.cardLinked || hasLinkedBankCards)
    .slice(0, 3) // Limit marketplace actions
    .forEach(offer => {
      const impactLabel = offer.discountAmount 
        ? `AED ${offer.discountAmount} off`
        : `${offer.discountPercent}% off`;

      actions.push({
        id: `offer-${offer.id}`,
        title: `Redeem: ${offer.title}`,
        titleAr: `استخدم: ${offer.title}`,
        whyItMatters: offer.isSponsored 
          ? 'Employer-sponsored offer - exclusive to you'
          : `Save at ${offer.merchant}`,
        whyItMattersAr: offer.isSponsored
          ? 'عرض مدعوم من صاحب العمل - حصري لك'
          : `وفر في ${offer.merchant}`,
        estimatedImpact: offer.discountAmount || null,
        impactLabel,
        impactLabelAr: impactLabel,
        confidence: 'high',
        confidenceNote: offer.isSponsored ? 'Employer-sponsored' : 'Partner offer',
        priority: offer.isSponsored ? 'medium' : 'low',
        priorityScore: offer.isSponsored ? 50 : 40,
        status: 'action_required',
        actionType: 'redeem',
        category: 'Marketplace',
        categoryAr: 'السوق',
        route: offer.route,
        ctaLabel: 'View offer',
        ctaLabelAr: 'عرض العرض',
        icon: Gift,
      });
    });

  // -------------------------------------------------------------------------
  // E) Bank Card Linking - If card-linked offers exist and no cards linked
  // -------------------------------------------------------------------------
  const cardLinkedOffers = demoMarketplaceOpportunities.filter(o => o.cardLinked);
  if (!hasLinkedBankCards && cardLinkedOffers.length > 0) {
    actions.push({
      id: 'link-bank-card',
      title: 'Link your bank card to unlock offers',
      titleAr: 'اربط بطاقتك المصرفية لفتح العروض',
      whyItMatters: `${cardLinkedOffers.length} exclusive offers require a linked card`,
      whyItMattersAr: `${cardLinkedOffers.length} عروض حصرية تتطلب بطاقة مرتبطة`,
      estimatedImpact: null,
      impactLabel: `${cardLinkedOffers.length} offers`,
      impactLabelAr: `${cardLinkedOffers.length} عروض`,
      confidence: 'high',
      confidenceNote: 'Link required for card-linked offers',
      priority: 'medium',
      priorityScore: 55,
      status: 'action_required',
      actionType: 'link_card',
      category: 'Marketplace',
      categoryAr: 'السوق',
      route: '/employee/profile#linked-cards',
      ctaLabel: 'Link card',
      ctaLabelAr: 'ربط البطاقة',
      icon: CreditCard,
    });
  }

  // -------------------------------------------------------------------------
  // Sort by priority score (highest first)
  // -------------------------------------------------------------------------
  actions.sort((a, b) => b.priorityScore - a.priorityScore);

  // -------------------------------------------------------------------------
  // Calculate Summary
  // -------------------------------------------------------------------------
  const monetaryActions = actions.filter(a => a.estimatedImpact !== null);
  const potentialSavings = monetaryActions.reduce((sum, a) => sum + (a.estimatedImpact || 0), 0);
  
  // Estimate 2-3 minutes per action
  const estimatedMinutes = actions.length * 2;

  const summary: OptimizerSummary = {
    potentialSavings,
    savingsConfidence: monetaryActions.some(a => a.confidence === 'estimated') ? 'estimated' : 'high',
    actionCount: actions.length,
    estimatedMinutes,
  };

  return { actions, summary };
}

/**
 * Get priority badge styling
 */
export function getPriorityStyle(priority: ActionPriority): string {
  switch (priority) {
    case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'high': return 'bg-warning/10 text-warning border-warning/20';
    case 'medium': return 'bg-accent/10 text-accent border-accent/20';
    case 'low': return 'bg-muted text-muted-foreground border-border';
  }
}

/**
 * Get confidence badge styling
 */
export function getConfidenceStyle(confidence: ActionConfidence): string {
  switch (confidence) {
    case 'high': return 'bg-success/10 text-success border-success/20';
    case 'medium': return 'bg-accent/10 text-accent border-accent/20';
    case 'low': return 'bg-warning/10 text-warning border-warning/20';
    case 'estimated': return 'bg-muted text-muted-foreground border-border';
  }
}

/**
 * Get status styling
 */
export function getStatusStyle(status: ActionStatus): string {
  switch (status) {
    case 'action_required': return 'bg-warning/10 text-warning border-warning/20';
    case 'pending': return 'bg-muted text-muted-foreground border-border';
    case 'in_progress': return 'bg-info/10 text-info border-info/20';
    case 'blocked': return 'bg-destructive/10 text-destructive border-destructive/20';
  }
}
