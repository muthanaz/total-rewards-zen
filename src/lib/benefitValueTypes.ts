/**
 * Benefit Value Type System
 * 
 * Provides classification, mapping, and display utilities for benefit value types.
 * Ensures benefits are displayed truthfully based on what they actually are:
 * - CASH: Paid directly (spendable money)
 * - REIMBURSEMENT: Potential recovery after expense
 * - COVERAGE: Employer-paid program/insurance (not employee money)
 * - ACCESS: Entitlement to services (not monetary value)
 */

import type { 
  BenefitMechanism, 
  CanonicalLifeArea,
} from './taxonomy';

// Re-export BenefitValueType from taxonomy for convenience
export type { BenefitValueType } from './taxonomy';
import { 
  Wallet, 
  Receipt, 
  Shield, 
  Key, 
  type LucideIcon,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
} from 'lucide-react';

// ============================================================================
// VALUE TYPE METADATA
// ============================================================================

import { BenefitValueType } from './taxonomy';

export interface ValueTypeMetadata {
  key: BenefitValueType;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  icon: LucideIcon;
  /** Whether AED values should be shown as "remaining balance" */
  showMonetaryRemaining: boolean;
  /** Whether utilization % makes sense for this type */
  showUtilizationPercent: boolean;
  /** Label for the AED amount field */
  amountLabel: string;
  amountLabelAr: string;
  /** Semantic class for styling */
  colorClass: string;
}

export const VALUE_TYPE_METADATA: Record<BenefitValueType, ValueTypeMetadata> = {
  cash: {
    key: 'cash',
    label: 'Cash Entitlement',
    labelAr: 'استحقاق نقدي',
    description: 'Paid directly with your salary',
    descriptionAr: 'يُدفع مباشرة مع راتبك',
    icon: Wallet,
    showMonetaryRemaining: true,
    showUtilizationPercent: true,
    amountLabel: 'Annual Entitlement',
    amountLabelAr: 'الاستحقاق السنوي',
    colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  reimbursement: {
    key: 'reimbursement',
    label: 'Reimbursement Cap',
    labelAr: 'سقف التعويض',
    description: 'Claim back eligible expenses up to cap',
    descriptionAr: 'استرد المصروفات المؤهلة حتى الحد الأقصى',
    icon: Receipt,
    showMonetaryRemaining: true,
    showUtilizationPercent: true,
    amountLabel: 'Maximum Reimbursement',
    amountLabelAr: 'الحد الأقصى للتعويض',
    colorClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  coverage: {
    key: 'coverage',
    label: 'Coverage',
    labelAr: 'تغطية',
    description: 'Employer-paid insurance or program',
    descriptionAr: 'تأمين أو برنامج مدفوع من صاحب العمل',
    icon: Shield,
    showMonetaryRemaining: false,
    showUtilizationPercent: false,
    amountLabel: 'Employer Investment',
    amountLabelAr: 'استثمار صاحب العمل',
    colorClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  },
  access: {
    key: 'access',
    label: 'Access',
    labelAr: 'وصول',
    description: 'Entitlement to use services/programs',
    descriptionAr: 'الحق في استخدام الخدمات/البرامج',
    icon: Key,
    showMonetaryRemaining: false,
    showUtilizationPercent: false,
    amountLabel: 'Program Access',
    amountLabelAr: 'الوصول للبرنامج',
    colorClass: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
};

// ============================================================================
// MECHANISM TO VALUE TYPE MAPPING
// ============================================================================

/**
 * Default mapping from benefit mechanism to value type
 * Used when no explicit value_type is set in the policy
 */
export const MECHANISM_TO_VALUE_TYPE: Record<BenefitMechanism, BenefitValueType> = {
  allowance: 'cash',
  reimbursement: 'reimbursement',
  program: 'access',
  leave: 'access',
  insurance: 'coverage',
  other: 'access',
};

/**
 * Default mapping from life area to value type
 * Used as fallback when mechanism is not specified
 */
export const LIFE_AREA_DEFAULT_VALUE_TYPE: Record<CanonicalLifeArea, BenefitValueType> = {
  housing: 'cash',
  education: 'reimbursement',
  health: 'coverage',
  transport: 'cash',
  wellbeing: 'reimbursement',
  financial: 'cash',
  learning: 'reimbursement',
  leave: 'access',
  bonus: 'cash',
  equity: 'access',
  perks: 'access',
  documents: 'access',
  other: 'access',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Determine the value type for a benefit based on available data
 * Priority: explicit value_type > mechanism mapping > life area default
 */
export function getBenefitValueType(
  explicitValueType?: BenefitValueType | null,
  mechanism?: BenefitMechanism | null,
  lifeArea?: CanonicalLifeArea | null
): BenefitValueType {
  if (explicitValueType) return explicitValueType;
  if (mechanism) return MECHANISM_TO_VALUE_TYPE[mechanism] || 'access';
  if (lifeArea) return LIFE_AREA_DEFAULT_VALUE_TYPE[lifeArea] || 'access';
  return 'access';
}

/**
 * Get metadata for a value type
 */
export function getValueTypeMetadata(valueType: BenefitValueType): ValueTypeMetadata {
  return VALUE_TYPE_METADATA[valueType];
}

/**
 * Check if a benefit type should show monetary "remaining" values
 */
export function shouldShowMonetaryRemaining(valueType: BenefitValueType): boolean {
  return VALUE_TYPE_METADATA[valueType]?.showMonetaryRemaining ?? false;
}

/**
 * Check if a benefit type should show utilization percentage
 */
export function shouldShowUtilizationPercent(valueType: BenefitValueType): boolean {
  return VALUE_TYPE_METADATA[valueType]?.showUtilizationPercent ?? false;
}

/**
 * Get the appropriate label for the AED amount based on value type
 */
export function getAmountLabel(
  valueType: BenefitValueType,
  isArabic: boolean = false
): string {
  const metadata = VALUE_TYPE_METADATA[valueType];
  return isArabic ? metadata.amountLabelAr : metadata.amountLabel;
}

/**
 * Check if an amount represents "spendable" money for the employee
 * Only CASH type benefits are truly spendable
 */
export function isSpendableMoney(valueType: BenefitValueType): boolean {
  return valueType === 'cash';
}

/**
 * Check if showing "unused AED" makes sense for this benefit type
 * This prevents misleading "unused spend" for coverage/access benefits
 */
export function canShowUnusedAmount(valueType: BenefitValueType): boolean {
  return valueType === 'cash' || valueType === 'reimbursement';
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

export interface BenefitDisplayConfig {
  /** Primary value label (e.g., "Annual Entitlement" vs "Maximum Reimbursement") */
  primaryValueLabel: string;
  primaryValueLabelAr: string;
  /** Whether to show "X remaining" in AED */
  showRemainingAed: boolean;
  /** Label for remaining (if applicable) */
  remainingLabel: string;
  remainingLabelAr: string;
  /** Whether to show utilization progress bar */
  showProgressBar: boolean;
  /** Alternative metrics for non-monetary types */
  alternativeMetrics: {
    key: string;
    label: string;
    labelAr: string;
    icon: LucideIcon;
  }[];
  /** Disclaimer text for non-cash benefits */
  disclaimer?: string;
  disclaimerAr?: string;
  /** How to use instructions */
  howToUse: string[];
  howToUseAr: string[];
}

/**
 * Get display configuration for a benefit based on its value type
 */
export function getBenefitDisplayConfig(valueType: BenefitValueType): BenefitDisplayConfig {
  switch (valueType) {
    case 'cash':
      return {
        primaryValueLabel: 'Annual Entitlement',
        primaryValueLabelAr: 'الاستحقاق السنوي',
        showRemainingAed: true,
        remainingLabel: 'Remaining',
        remainingLabelAr: 'المتبقي',
        showProgressBar: true,
        alternativeMetrics: [],
        howToUse: [
          'This amount is paid directly with your monthly salary',
          'No action required - automatically credited',
          'Check your payslip for breakdown',
        ],
        howToUseAr: [
          'يُدفع هذا المبلغ مباشرة مع راتبك الشهري',
          'لا يلزم اتخاذ أي إجراء - يُضاف تلقائياً',
          'راجع كشف الراتب للتفاصيل',
        ],
      };
    case 'reimbursement':
      return {
        primaryValueLabel: 'Maximum Reimbursement',
        primaryValueLabelAr: 'الحد الأقصى للتعويض',
        showRemainingAed: true,
        remainingLabel: 'Available to claim',
        remainingLabelAr: 'متاح للمطالبة',
        showProgressBar: true,
        alternativeMetrics: [],
        disclaimer: 'Reimbursement is subject to approval and documentation requirements',
        disclaimerAr: 'التعويض يخضع للموافقة ومتطلبات التوثيق',
        howToUse: [
          'Pay for eligible expenses first',
          'Submit claim with receipts/invoices',
          'Receive reimbursement after approval',
          'Processing typically takes 3-5 business days',
        ],
        howToUseAr: [
          'ادفع المصروفات المؤهلة أولاً',
          'قدم المطالبة مع الإيصالات/الفواتير',
          'استلم التعويض بعد الموافقة',
          'تستغرق المعالجة عادة 3-5 أيام عمل',
        ],
      };
    case 'coverage':
      return {
        primaryValueLabel: 'Employer Investment',
        primaryValueLabelAr: 'استثمار صاحب العمل',
        showRemainingAed: false,
        remainingLabel: 'Coverage utilization',
        remainingLabelAr: 'استخدام التغطية',
        showProgressBar: false,
        alternativeMetrics: [
          { key: 'claims', label: 'Claims this year', labelAr: 'المطالبات هذا العام', icon: FileText },
          { key: 'usage', label: 'Services used', labelAr: 'الخدمات المستخدمة', icon: CheckCircle },
        ],
        disclaimer: 'This is employer-paid coverage, not employee cash value',
        disclaimerAr: 'هذه تغطية مدفوعة من صاحب العمل وليست قيمة نقدية للموظف',
        howToUse: [
          'Show your insurance card at network providers',
          'Check network directory before visits',
          'Pre-approval may be required for some services',
          'Co-pays and exclusions may apply',
        ],
        howToUseAr: [
          'أظهر بطاقة التأمين لدى مقدمي الخدمة في الشبكة',
          'تحقق من دليل الشبكة قبل الزيارات',
          'قد تكون الموافقة المسبقة مطلوبة لبعض الخدمات',
          'قد تنطبق المشاركة في التكاليف والاستثناءات',
        ],
      };
    case 'access':
      return {
        primaryValueLabel: 'Program Access',
        primaryValueLabelAr: 'الوصول للبرنامج',
        showRemainingAed: false,
        remainingLabel: 'Program usage',
        remainingLabelAr: 'استخدام البرنامج',
        showProgressBar: false,
        alternativeMetrics: [
          { key: 'sessions', label: 'Sessions used', labelAr: 'الجلسات المستخدمة', icon: Clock },
          { key: 'active', label: 'Active status', labelAr: 'الحالة النشطة', icon: CheckCircle },
        ],
        howToUse: [
          'Activate your access if not already active',
          'Check included services and limits',
          'Book or use services as needed',
        ],
        howToUseAr: [
          'قم بتفعيل وصولك إذا لم يكن مفعلاً',
          'تحقق من الخدمات والحدود المشمولة',
          'احجز أو استخدم الخدمات حسب الحاجة',
        ],
      };
  }
}

// ============================================================================
// TERMINOLOGY SAFETY
// ============================================================================

/**
 * Get safe terminology for utilization based on value type
 * Prevents misleading labels like "unused spend" for coverage
 */
export function getUtilizationTerminology(
  valueType: BenefitValueType,
  isArabic: boolean = false
): { utilized: string; remaining: string; rate: string } {
  switch (valueType) {
    case 'cash':
      return isArabic
        ? { utilized: 'مدفوع', remaining: 'متبقي', rate: 'معدل الدفع' }
        : { utilized: 'Paid', remaining: 'Remaining', rate: 'Payment rate' };
    case 'reimbursement':
      return isArabic
        ? { utilized: 'تم المطالبة', remaining: 'متاح للمطالبة', rate: 'معدل المطالبة' }
        : { utilized: 'Claimed', remaining: 'Available to claim', rate: 'Claim rate' };
    case 'coverage':
      return isArabic
        ? { utilized: 'تم الاستخدام', remaining: 'التغطية', rate: 'استخدام التغطية' }
        : { utilized: 'Used', remaining: 'Coverage', rate: 'Coverage utilization' };
    case 'access':
      return isArabic
        ? { utilized: 'تم الوصول', remaining: 'متاح', rate: 'استخدام البرنامج' }
        : { utilized: 'Accessed', remaining: 'Available', rate: 'Program usage' };
  }
}

// ============================================================================
// CHART ELIGIBILITY
// ============================================================================

/**
 * Check if AED-based charts are appropriate for this value type
 */
export function canShowAedChart(valueType: BenefitValueType): boolean {
  return valueType === 'cash' || valueType === 'reimbursement';
}

/**
 * Get appropriate chart types for a value type
 */
export function getRecommendedChartTypes(valueType: BenefitValueType): string[] {
  switch (valueType) {
    case 'cash':
      return ['bar', 'area', 'donut'];
    case 'reimbursement':
      return ['bar', 'area', 'donut'];
    case 'coverage':
      return ['count', 'timeline', 'status'];
    case 'access':
      return ['count', 'status', 'adoption'];
  }
}
