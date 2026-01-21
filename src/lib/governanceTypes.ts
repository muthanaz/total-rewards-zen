/**
 * Unified types for Marketplace Governance
 */

import type { Json } from '@/integrations/supabase/types';

// =============================================================================
// MODERATION TYPES
// =============================================================================

export type ModerationItemType = 'vendor' | 'offer' | 'image' | 'copy';
export type ModerationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'changes_requested';
export type Priority = 'high' | 'medium' | 'low';

export interface ModerationItem {
  id: string;
  type: ModerationItemType;
  title: string;
  submittedBy: string;
  submittedAt: Date;
  orgId?: string;
  vendorId?: string;
  vendorName?: string;
  organizationName?: string;
  priority: Priority;
  slaDueAt: Date;
  status: ModerationStatus;
  reason?: string;
  tags: string[];
  assignedTo?: string;
  details?: Record<string, any>;
}

// =============================================================================
// KYB TYPES
// =============================================================================

export type KYBStage = 
  | 'docs_submitted' 
  | 'verification_in_progress' 
  | 'contract_signed' 
  | 'banking_verified' 
  | 'approved';

export type KYBDocStatus = 'verified' | 'pending' | 'missing' | 'expired' | 'rejected';

export interface KYBDocument {
  id: string;
  name: string;
  nameAr: string;
  type: 'trade_license' | 'owner_id' | 'bank_details' | 'address_proof' | 'vat_trn' | 'contact_info' | 'contract';
  status: KYBDocStatus;
  uploadedAt?: Date;
  expiresAt?: Date;
  url?: string;
  notes?: string;
}

export interface KYBProgress {
  stage: KYBStage;
  completedSteps: number;
  totalSteps: number;
  missingItems: string[];
  documents: KYBDocument[];
}

export const KYB_STAGES: { stage: KYBStage; label: string; labelAr: string; order: number }[] = [
  { stage: 'docs_submitted', label: 'Documents Submitted', labelAr: 'تم تقديم الوثائق', order: 1 },
  { stage: 'verification_in_progress', label: 'Verification in Progress', labelAr: 'التحقق جارٍ', order: 2 },
  { stage: 'contract_signed', label: 'Contract Signed', labelAr: 'تم توقيع العقد', order: 3 },
  { stage: 'banking_verified', label: 'Banking Verified', labelAr: 'تم التحقق من البنك', order: 4 },
  { stage: 'approved', label: 'Approved', labelAr: 'موافق عليه', order: 5 },
];

// =============================================================================
// VENDOR TYPES
// =============================================================================

export type VendorStatus = 'draft' | 'pending' | 'active' | 'suspended' | 'rejected';

export interface VendorDisplay {
  id: string;
  companyName: string;
  status: VendorStatus;
  kybProgress: KYBProgress;
  categories: string[];
  rating: number;
  totalOffers: number;
  activeOffers: number;
  totalRedemptions: number;
  complaintRate: number;
  commissionRate: number;
  contactEmail?: string;
  contactPhone?: string;
  tradeLicense?: string;
  vatNumber?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// =============================================================================
// OFFER TYPES
// =============================================================================

export type OfferStatus = 'draft' | 'pending_review' | 'active' | 'suspended' | 'expired' | 'rejected';

export interface OfferDisplay {
  id: string;
  title: string;
  vendorId: string;
  vendorName: string;
  category: string;
  status: OfferStatus;
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  originalPrice?: number;
  discountedPrice?: number;
  validFrom?: Date;
  validTo?: Date;
  blackoutDates?: string[];
  redemptionCapPerUser?: number;
  redemptionCapTotal?: number;
  minSpend?: number;
  redemptionMethod: 'online' | 'in_store' | 'both';
  voucherType: 'public_code' | 'unique_codes';
  voucherCode?: string;
  uniqueCodesCount?: number;
  terms?: string;
  imageUrl?: string;
  rating?: number;
  totalRedemptions: number;
  governanceChecklist: GovernanceCheck[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface GovernanceCheck {
  id: string;
  name: string;
  nameAr: string;
  status: 'pass' | 'warning' | 'fail' | 'pending';
  message?: string;
  required: boolean;
}

// =============================================================================
// DECISION TEMPLATES
// =============================================================================

export interface ReasonTemplate {
  id: string;
  label: string;
  labelAr: string;
  text: string;
  textAr: string;
  category: 'kyb' | 'terms' | 'discount' | 'content' | 'image' | 'general';
  applicableTo: ModerationItemType[];
}

export const REASON_TEMPLATES: ReasonTemplate[] = [
  {
    id: 'kyb-missing',
    label: 'Missing KYB Documents',
    labelAr: 'وثائق KYB مفقودة',
    text: 'The following KYB documents are required before approval:\n- Trade license (valid and unexpired)\n- Owner/Authorized signatory ID\n- Bank account verification letter\n\nPlease upload the missing documents and resubmit.',
    textAr: 'المستندات التالية مطلوبة قبل الموافقة:\n- الرخصة التجارية (سارية)\n- هوية المالك/المفوض\n- خطاب التحقق من الحساب البنكي',
    category: 'kyb',
    applicableTo: ['vendor'],
  },
  {
    id: 'kyb-expired',
    label: 'Expired Documents',
    labelAr: 'وثائق منتهية الصلاحية',
    text: 'One or more submitted documents have expired. Please provide updated versions.',
    textAr: 'انتهت صلاحية مستند أو أكثر. يرجى تقديم نسخ محدثة.',
    category: 'kyb',
    applicableTo: ['vendor'],
  },
  {
    id: 'terms-missing',
    label: 'Missing Terms & Conditions',
    labelAr: 'شروط مفقودة',
    text: 'The offer is missing required terms and conditions. All offers must include validity period, eligibility criteria, exclusions, and redemption instructions.',
    textAr: 'العرض يفتقر إلى الشروط والأحكام المطلوبة.',
    category: 'terms',
    applicableTo: ['offer', 'copy'],
  },
  {
    id: 'terms-unclear',
    label: 'Unclear Terms',
    labelAr: 'شروط غير واضحة',
    text: 'The offer terms require clarification. Please provide clear, unambiguous terms.',
    textAr: 'شروط العرض تحتاج توضيح.',
    category: 'terms',
    applicableTo: ['offer', 'copy'],
  },
  {
    id: 'discount-invalid',
    label: 'Invalid Discount',
    labelAr: 'خصم غير صالح',
    text: 'The discount structure cannot be verified. Original price appears inflated or discount exceeds maximum allowed.',
    textAr: 'لا يمكن التحقق من هيكل الخصم.',
    category: 'discount',
    applicableTo: ['offer'],
  },
  {
    id: 'content-prohibited',
    label: 'Prohibited Content',
    labelAr: 'محتوى محظور',
    text: 'The submission contains content that violates marketplace guidelines.',
    textAr: 'المحتوى يخالف إرشادات السوق.',
    category: 'content',
    applicableTo: ['offer', 'copy', 'image'],
  },
  {
    id: 'image-quality',
    label: 'Low Image Quality',
    labelAr: 'جودة صورة منخفضة',
    text: 'The image does not meet quality requirements. Minimum resolution: 1080p.',
    textAr: 'الصورة لا تلبي متطلبات الجودة.',
    category: 'image',
    applicableTo: ['image'],
  },
  {
    id: 'image-inappropriate',
    label: 'Inappropriate Image',
    labelAr: 'صورة غير مناسبة',
    text: 'The submitted image is not appropriate for the marketplace.',
    textAr: 'الصورة غير مناسبة للسوق.',
    category: 'image',
    applicableTo: ['image'],
  },
];

// =============================================================================
// AUDIT LOG TYPES
// =============================================================================

export interface GovernanceAuditEntry {
  timestamp: Date;
  userId: string;
  userEmail?: string;
  actionType: string;
  resourceType: 'vendor' | 'offer' | 'moderation_item';
  resourceId: string;
  orgId?: string;
  details: Record<string, any>;
}

// =============================================================================
// SLA HELPERS
// =============================================================================

export function calculateSLADue(submittedAt: Date, priority: Priority): Date {
  const hoursToAdd = {
    high: 8,
    medium: 48,
    low: 168, // 7 days
  };
  return new Date(submittedAt.getTime() + hoursToAdd[priority] * 60 * 60 * 1000);
}

export function getSLAStatus(slaDueAt: Date, priority: Priority): { 
  status: 'ok' | 'warning' | 'breach'; 
  label: string;
  labelAr: string;
} {
  const now = new Date();
  const hoursUntilDue = (slaDueAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  const warningThreshold = {
    high: 2,
    medium: 12,
    low: 48,
  };
  
  if (hoursUntilDue <= 0) {
    return { status: 'breach', label: 'SLA Breach', labelAr: 'خرق SLA' };
  } else if (hoursUntilDue <= warningThreshold[priority]) {
    return { status: 'warning', label: 'SLA Warning', labelAr: 'تحذير SLA' };
  }
  return { status: 'ok', label: '', labelAr: '' };
}

// =============================================================================
// KYB HELPERS
// =============================================================================

export function calculateKYBProgress(documents: KYBDocument[]): { 
  completedSteps: number; 
  totalSteps: number; 
  percentage: number;
  missingItems: string[];
} {
  const totalSteps = documents.length;
  const completedSteps = documents.filter(d => d.status === 'verified').length;
  const missingItems = documents
    .filter(d => d.status === 'missing' || d.status === 'expired')
    .map(d => d.name);
  
  return {
    completedSteps,
    totalSteps,
    percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
    missingItems,
  };
}

export const DEFAULT_KYB_DOCUMENTS: KYBDocument[] = [
  { id: '1', name: 'Trade License', nameAr: 'الرخصة التجارية', type: 'trade_license', status: 'pending' },
  { id: '2', name: 'Owner/Signatory ID', nameAr: 'هوية المالك', type: 'owner_id', status: 'pending' },
  { id: '3', name: 'Bank Account Details', nameAr: 'تفاصيل الحساب البنكي', type: 'bank_details', status: 'pending' },
  { id: '4', name: 'Business Address Proof', nameAr: 'إثبات العنوان', type: 'address_proof', status: 'pending' },
  { id: '5', name: 'VAT/TRN Certificate', nameAr: 'شهادة الضريبة', type: 'vat_trn', status: 'pending' },
  { id: '6', name: 'Contact Information', nameAr: 'معلومات الاتصال', type: 'contact_info', status: 'pending' },
];

// =============================================================================
// GOVERNANCE CHECKLIST
// =============================================================================

export function getOfferGovernanceChecklist(offer: Partial<OfferDisplay>): GovernanceCheck[] {
  return [
    {
      id: 'terms',
      name: 'Terms & Conditions',
      nameAr: 'الشروط والأحكام',
      status: offer.terms && offer.terms.length > 20 ? 'pass' : 'fail',
      message: offer.terms ? undefined : 'Terms are required before activation',
      required: true,
    },
    {
      id: 'validity',
      name: 'Validity Period',
      nameAr: 'فترة الصلاحية',
      status: offer.validFrom && offer.validTo ? 'pass' : 'warning',
      message: offer.validFrom ? undefined : 'Set start and end dates',
      required: true,
    },
    {
      id: 'discount',
      name: 'Discount Value',
      nameAr: 'قيمة الخصم',
      status: (offer.discountValue && offer.discountValue > 0 && offer.discountValue <= 80) ? 'pass' : 'warning',
      message: offer.discountValue && offer.discountValue > 50 ? 'High discount - verify with vendor' : undefined,
      required: true,
    },
    {
      id: 'image',
      name: 'Offer Image',
      nameAr: 'صورة العرض',
      status: offer.imageUrl ? 'pass' : 'warning',
      message: offer.imageUrl ? undefined : 'Add an image for better visibility',
      required: false,
    },
    {
      id: 'vendor',
      name: 'Vendor Status',
      nameAr: 'حالة البائع',
      status: 'pass', // Would check vendor status in real impl
      required: true,
    },
    {
      id: 'category',
      name: 'Category Assigned',
      nameAr: 'الفئة المحددة',
      status: offer.category ? 'pass' : 'fail',
      required: true,
    },
  ];
}
