/**
 * UAE Total Rewards Standards
 * 
 * Centralized constants for realistic UAE market benefit values.
 * All monetary values in AED.
 */

// ============================================================
// BENEFIT VALUE RANGES (Annual unless specified)
// ============================================================

export const UAE_BENEFIT_RANGES = {
  housing: {
    label: 'Housing Allowance',
    labelAr: 'بدل السكن',
    type: 'annual',
    min: 60000,
    max: 250000,
    byGrade: {
      'L1': { min: 60000, max: 80000 },
      'L2': { min: 70000, max: 90000 },
      'L3': { min: 80000, max: 110000 },
      'L4': { min: 100000, max: 140000 },
      'L5': { min: 130000, max: 180000 },
      'L6': { min: 160000, max: 220000 },
      'L7': { min: 180000, max: 250000 },
      'C-Suite': { min: 200000, max: 250000 },
    },
  },
  
  schooling: {
    label: 'Schooling Allowance',
    labelAr: 'بدل التعليم',
    type: 'per_child_annual',
    min: 25000,
    max: 65000,
    byGrade: {
      'L1': { min: 25000, max: 35000 },
      'L2': { min: 30000, max: 40000 },
      'L3': { min: 35000, max: 45000 },
      'L4': { min: 40000, max: 50000 },
      'L5': { min: 45000, max: 55000 },
      'L6': { min: 50000, max: 60000 },
      'L7': { min: 55000, max: 65000 },
      'C-Suite': { min: 60000, max: 65000 },
    },
  },
  
  annualTicket: {
    label: 'Annual Flight Ticket',
    labelAr: 'تذكرة الطيران السنوية',
    type: 'annual',
    min: 2000,
    max: 15000,
    byClass: {
      'economy_regional': { min: 2000, max: 4000 },
      'economy_international': { min: 4000, max: 8000 },
      'business_regional': { min: 6000, max: 10000 },
      'business_international': { min: 10000, max: 15000 },
    },
    byGrade: {
      'L1': { min: 2000, max: 4000, class: 'economy' },
      'L2': { min: 2500, max: 5000, class: 'economy' },
      'L3': { min: 3000, max: 6000, class: 'economy' },
      'L4': { min: 4000, max: 8000, class: 'economy' },
      'L5': { min: 6000, max: 10000, class: 'economy_plus' },
      'L6': { min: 8000, max: 12000, class: 'business' },
      'L7': { min: 10000, max: 15000, class: 'business' },
      'C-Suite': { min: 12000, max: 15000, class: 'business' },
    },
  },
  
  parkingTransport: {
    label: 'Parking/Transport',
    labelAr: 'الموقف/النقل',
    type: 'monthly',
    min: 100,
    max: 500,
    parking: {
      standard: { min: 100, max: 200 },
      premium: { min: 200, max: 350 },
      valet: { min: 300, max: 500 },
    },
    transport: {
      metro: { min: 100, max: 200 },
      fuel: { min: 300, max: 600 },
      carAllowance: { min: 1500, max: 4000 },
    },
  },
  
  medical: {
    label: 'Medical Consultation',
    labelAr: 'استشارة طبية',
    type: 'per_visit',
    gp: { min: 200, max: 400 },
    specialist: { min: 400, max: 800 },
    dental: { min: 300, max: 2500 },
    surgery: { min: 5000, max: 100000 },
  },
  
  wellbeing: {
    label: 'Wellbeing',
    labelAr: 'العافية',
    type: 'annual',
    min: 2000,
    max: 6000,
    gym: { min: 2000, max: 5000 },
    wellness: { min: 1000, max: 3000 },
  },
  
  learningDevelopment: {
    label: 'Learning & Development',
    labelAr: 'التعلم والتطوير',
    type: 'annual',
    min: 3000,
    max: 15000,
    byGrade: {
      'L1': { min: 3000, max: 5000 },
      'L2': { min: 4000, max: 6000 },
      'L3': { min: 5000, max: 8000 },
      'L4': { min: 6000, max: 10000 },
      'L5': { min: 8000, max: 12000 },
      'L6': { min: 10000, max: 15000 },
      'L7': { min: 12000, max: 15000 },
      'C-Suite': { min: 15000, max: 20000 },
    },
  },
} as const;

// ============================================================
// SLA THRESHOLDS (in hours)
// ============================================================

export const UAE_SLA_THRESHOLDS = {
  simple: {
    label: 'Simple Claims',
    description: 'Parking, transport, fuel reimbursement',
    categories: ['Transport', 'Parking', 'Fuel'],
    slaHours: 48,
    overdueThreshold: 24, // Hours before due to show warning
  },
  
  standard: {
    label: 'Standard Claims',
    description: 'Medical consultations, wellbeing, L&D',
    categories: ['Health Insurance', 'Wellbeing', 'Learning & Development', 'Per Diem'],
    slaHours: 72,
    overdueThreshold: 24,
  },
  
  complex: {
    label: 'Complex Claims',
    description: 'Schooling, housing, high-value medical',
    categories: ['Schooling', 'Housing', 'Education'],
    slaHours: 120, // 5 days
    overdueThreshold: 48,
  },
  
  leave: {
    label: 'Leave Requests',
    description: 'Annual, sick, and special leave',
    categories: ['Leave', 'Annual Leave', 'Sick Leave'],
    slaHours: 48,
    overdueThreshold: 12,
  },
  
  urgent: {
    label: 'Urgent/Emergency',
    description: 'Emergency medical, urgent travel',
    categories: [],
    slaHours: 24,
    overdueThreshold: 6,
  },
} as const;

// Get SLA hours for a category
export function getSlaHoursForCategory(category: string): number {
  const thresholds = [
    UAE_SLA_THRESHOLDS.simple,
    UAE_SLA_THRESHOLDS.standard,
    UAE_SLA_THRESHOLDS.complex,
    UAE_SLA_THRESHOLDS.leave,
  ];
  
  for (const config of thresholds) {
    if (config.categories.some(c => 
      category.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().includes(category.toLowerCase())
    )) {
      return config.slaHours;
    }
  }
  return UAE_SLA_THRESHOLDS.standard.slaHours; // Default
}

// ============================================================
// REJECTION REASONS (Realistic UAE context)
// ============================================================

export const UAE_REJECTION_REASONS = [
  { 
    value: 'receipt_predates_policy', 
    label: 'Receipt Pre-dates Policy',
    labelAr: 'الإيصال يسبق السياسة',
    description: 'The receipt date is before the policy effective date',
  },
  { 
    value: 'exceeds_category_cap', 
    label: 'Exceeds Category Cap',
    labelAr: 'يتجاوز الحد الأقصى للفئة',
    description: 'Amount exceeds the maximum allowed for this benefit category',
  },
  { 
    value: 'duplicate_submission', 
    label: 'Duplicate Submission',
    labelAr: 'طلب مكرر',
    description: 'This claim has already been submitted and processed',
  },
  { 
    value: 'incomplete_documentation', 
    label: 'Incomplete Documentation',
    labelAr: 'وثائق ناقصة',
    description: 'Required documents are missing or incomplete',
  },
  { 
    value: 'not_eligible', 
    label: 'Not Eligible for Benefit',
    labelAr: 'غير مؤهل للمنفعة',
    description: 'Employee grade or tenure does not qualify for this benefit',
  },
  { 
    value: 'outside_claim_period', 
    label: 'Outside Claim Period',
    labelAr: 'خارج فترة المطالبة',
    description: 'Claim submitted after the allowed submission window (typically 30-90 days)',
  },
  { 
    value: 'provider_not_approved', 
    label: 'Provider Not Approved',
    labelAr: 'المزود غير معتمد',
    description: 'The service provider is not on the approved vendor list',
  },
  { 
    value: 'budget_exhausted', 
    label: 'Annual Budget Exhausted',
    labelAr: 'استنفاد الميزانية السنوية',
    description: 'Employee has fully utilized their annual entitlement for this benefit',
  },
  { 
    value: 'policy_violation', 
    label: 'Policy Violation',
    labelAr: 'مخالفة السياسة',
    description: 'Claim violates specific policy terms and conditions',
  },
  { 
    value: 'invalid_receipt', 
    label: 'Invalid or Altered Receipt',
    labelAr: 'إيصال غير صالح أو معدل',
    description: 'Receipt appears to be invalid, incomplete, or altered',
  },
] as const;

// ============================================================
// MISSING DOCUMENT TYPES
// ============================================================

export const UAE_MISSING_DOC_TYPES = [
  'Original receipt with VAT details',
  'Medical report from treating physician',
  'Hospital discharge summary',
  'School fee invoice (itemized)',
  'Tenancy contract (Ejari registered)',
  'Travel itinerary and boarding passes',
  'Manager pre-approval form',
  'Course completion certificate',
  'Payment proof (bank statement)',
  'Emirates ID copy',
  'Dependent relationship proof',
  'Medical certificate (for sick leave)',
  'Prescription copy',
  'Insurance claim reference number',
] as const;

// ============================================================
// LEAVE ENTITLEMENTS (UAE Labor Law compliant)
// ============================================================

export const UAE_LEAVE_ENTITLEMENTS = {
  annual: {
    label: 'Annual Leave',
    daysPerYear: 30,
    carryoverMax: 10,
    encashmentAllowed: true,
  },
  sick: {
    label: 'Sick Leave',
    daysPerYear: 90, // 15 full pay, 30 half pay, 45 unpaid
    fullPayDays: 15,
    halfPayDays: 30,
    unpaidDays: 45,
    certificateRequired: true,
    certificateAfterDays: 2,
  },
  maternity: {
    label: 'Maternity Leave',
    totalDays: 60,
    fullPayDays: 45,
    halfPayDays: 15,
  },
  paternity: {
    label: 'Paternity Leave',
    totalDays: 5,
    withinMonths: 6, // Must be taken within 6 months of birth
  },
  compassionate: {
    label: 'Compassionate Leave',
    spouse: 5,
    parent: 3,
    sibling: 3,
  },
  hajj: {
    label: 'Hajj Leave',
    days: 30,
    unpaid: true,
    oncePerEmployment: true,
  },
} as const;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get a random value within a benefit range
 */
export function getRandomBenefitValue(
  benefitType: keyof typeof UAE_BENEFIT_RANGES,
  grade?: string
): number {
  const benefit = UAE_BENEFIT_RANGES[benefitType];
  
  if (grade && 'byGrade' in benefit && benefit.byGrade) {
    const gradeRange = (benefit.byGrade as Record<string, { min: number; max: number }>)[grade];
    if (gradeRange) {
      return Math.floor(Math.random() * (gradeRange.max - gradeRange.min + 1)) + gradeRange.min;
    }
  }
  
  // Handle benefits with min/max at top level
  if ('min' in benefit && 'max' in benefit) {
    return Math.floor(Math.random() * (benefit.max - benefit.min + 1)) + benefit.min;
  }
  
  // Fallback
  return 5000;
}

/**
 * Get housing allowance for a grade (quarterly)
 */
export function getQuarterlyHousingAllowance(grade: string): { amount: number; cap: number } {
  const gradeRange = UAE_BENEFIT_RANGES.housing.byGrade[grade as keyof typeof UAE_BENEFIT_RANGES.housing.byGrade];
  if (gradeRange) {
    const annual = Math.floor(Math.random() * (gradeRange.max - gradeRange.min + 1)) + gradeRange.min;
    return {
      amount: Math.round(annual / 4),
      cap: Math.round(gradeRange.max / 4),
    };
  }
  return { amount: 25000, cap: 35000 };
}

/**
 * Get realistic parking claim value
 */
export function getRealisticParkingValue(): { amount: number; cap: number } {
  const parking = UAE_BENEFIT_RANGES.parkingTransport.parking;
  const amount = Math.floor(Math.random() * (parking.premium.max - parking.standard.min + 1)) + parking.standard.min;
  return {
    amount,
    cap: parking.premium.max,
  };
}

/**
 * Get realistic schooling claim value (per term)
 */
export function getSchoolingTermValue(grade: string): { amount: number; cap: number } {
  const gradeRange = UAE_BENEFIT_RANGES.schooling.byGrade[grade as keyof typeof UAE_BENEFIT_RANGES.schooling.byGrade];
  if (gradeRange) {
    // Term is roughly 1/3 of annual
    const termAmount = Math.floor((Math.random() * (gradeRange.max - gradeRange.min) + gradeRange.min) / 3);
    return {
      amount: termAmount,
      cap: Math.round(gradeRange.max / 3),
    };
  }
  return { amount: 12000, cap: 18000 };
}

/**
 * Get realistic annual ticket value
 */
export function getAnnualTicketValue(grade: string): { amount: number; cap: number } {
  const gradeRange = UAE_BENEFIT_RANGES.annualTicket.byGrade[grade as keyof typeof UAE_BENEFIT_RANGES.annualTicket.byGrade];
  if (gradeRange) {
    const amount = Math.floor(Math.random() * (gradeRange.max - gradeRange.min + 1)) + gradeRange.min;
    return {
      amount,
      cap: gradeRange.max,
    };
  }
  return { amount: 5000, cap: 8000 };
}
