/**
 * Demo Claims - 20 claims across multiple categories with mixed statuses
 * 
 * Statuses: submitted, in_review, info_requested, approved, paid
 * Ensures utilized_amount only reflects PAID claims.
 */

import { subDays, addDays, subHours } from 'date-fns';
import { DEMO_EMPLOYEES, DEMO_ENTITLEMENTS, DemoEntitlement } from './demoEmployees';
import { DEMO_BENEFIT_CATEGORIES, getCategoryCap } from './demoOrganization';

export type ClaimStatus = 'submitted' | 'in_review' | 'info_requested' | 'approved' | 'rejected' | 'ready_for_payment' | 'paid';

export interface DemoClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  grade: string;
  categoryId: string;
  category: string;
  requestType: 'claim' | 'request';
  subject: string;
  description: string;
  amount: number;
  payableAmount: number; // After cap/deductions
  status: ClaimStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: Date;
  slaDueAt: Date;
  slaHours: number;
  policyRef: string;
  missingDocs: string[];
  reviewedAt?: Date;
  paidAt?: Date;
  settlementBatchId?: string;
}

const now = new Date();

// ============================================================
// 20 DEMO CLAIMS - REALISTIC UAE VALUES
// ============================================================

export const DEMO_CLAIMS: DemoClaim[] = [
  // === PAID CLAIMS (6) - These contribute to utilized_amount ===
  {
    id: 'claim-001',
    employeeId: 'emp-001',
    employeeName: 'Ahmed Al Rashid',
    employeeCode: 'NX-1001',
    department: 'Engineering',
    grade: 'L5',
    categoryId: 'housing',
    category: 'Housing',
    requestType: 'claim',
    subject: 'Q4 2025 Housing Allowance',
    description: 'Quarterly housing allowance - Marina residence',
    amount: 36000, // 3 months x 12,000
    payableAmount: 36000,
    status: 'paid',
    priority: 'low',
    submittedAt: subDays(now, 45),
    slaDueAt: subDays(now, 40),
    slaHours: 120,
    policyRef: 'POL-HOU-001',
    missingDocs: [],
    reviewedAt: subDays(now, 42),
    paidAt: subDays(now, 35),
    settlementBatchId: 'batch-001',
  },
  {
    id: 'claim-002',
    employeeId: 'emp-005',
    employeeName: 'James Wilson',
    employeeCode: 'NX-1005',
    department: 'Engineering',
    grade: 'L6',
    categoryId: 'schooling',
    category: 'Schooling',
    requestType: 'claim',
    subject: 'Term 1 Fees - Dubai British School',
    description: 'Tuition fees for 2 children - Grade 5 and Grade 8',
    amount: 85000,
    payableAmount: 85000,
    status: 'paid',
    priority: 'medium',
    submittedAt: subDays(now, 60),
    slaDueAt: subDays(now, 55),
    slaHours: 120,
    policyRef: 'POL-SCH-001',
    missingDocs: [],
    reviewedAt: subDays(now, 57),
    paidAt: subDays(now, 50),
    settlementBatchId: 'batch-001',
  },
  {
    id: 'claim-003',
    employeeId: 'emp-011',
    employeeName: 'Layla Mohammed',
    employeeCode: 'NX-2001',
    department: 'Sales & Marketing',
    grade: 'L5',
    categoryId: 'transport',
    category: 'Transport',
    requestType: 'claim',
    subject: 'Monthly Fuel - October',
    description: 'Fuel reimbursement for October 2025',
    amount: 1800,
    payableAmount: 1800,
    status: 'paid',
    priority: 'low',
    submittedAt: subDays(now, 30),
    slaDueAt: subDays(now, 25),
    slaHours: 48,
    policyRef: 'POL-TRN-001',
    missingDocs: [],
    reviewedAt: subDays(now, 28),
    paidAt: subDays(now, 22),
    settlementBatchId: 'batch-002',
  },
  {
    id: 'claim-004',
    employeeId: 'emp-008',
    employeeName: 'Raj Patel',
    employeeCode: 'NX-1008',
    department: 'Engineering',
    grade: 'L5',
    categoryId: 'health',
    category: 'Health',
    requestType: 'claim',
    subject: 'Dental Treatment - Root Canal',
    description: 'Root canal procedure at Dr. Joy Dental Clinic',
    amount: 3200,
    payableAmount: 3200,
    status: 'paid',
    priority: 'medium',
    submittedAt: subDays(now, 20),
    slaDueAt: subDays(now, 17),
    slaHours: 72,
    policyRef: 'POL-HEA-001',
    missingDocs: [],
    reviewedAt: subDays(now, 18),
    paidAt: subDays(now, 12),
    settlementBatchId: 'batch-002',
  },
  {
    id: 'claim-005',
    employeeId: 'emp-019',
    employeeName: 'Khalid Ibrahim',
    employeeCode: 'NX-3001',
    department: 'Operations',
    grade: 'L5',
    categoryId: 'wellbeing',
    category: 'Wellbeing',
    requestType: 'claim',
    subject: 'Annual Gym Membership',
    description: 'Fitness First annual membership',
    amount: 4200,
    payableAmount: 4200,
    status: 'paid',
    priority: 'low',
    submittedAt: subDays(now, 25),
    slaDueAt: subDays(now, 22),
    slaHours: 72,
    policyRef: 'POL-WEL-001',
    missingDocs: [],
    reviewedAt: subDays(now, 23),
    paidAt: subDays(now, 18),
    settlementBatchId: 'batch-002',
  },
  {
    id: 'claim-006',
    employeeId: 'emp-026',
    employeeName: 'Mohammed Al Farsi',
    employeeCode: 'NX-4001',
    department: 'Corporate Services',
    grade: 'L6',
    categoryId: 'housing',
    category: 'Housing',
    requestType: 'claim',
    subject: 'Q4 2025 Housing Allowance',
    description: 'Quarterly housing - Palm Jumeirah villa',
    amount: 48000,
    payableAmount: 48000,
    status: 'paid',
    priority: 'low',
    submittedAt: subDays(now, 40),
    slaDueAt: subDays(now, 35),
    slaHours: 120,
    policyRef: 'POL-HOU-001',
    missingDocs: [],
    reviewedAt: subDays(now, 37),
    paidAt: subDays(now, 30),
    settlementBatchId: 'batch-001',
  },

  // === APPROVED (Ready for Payment) (3) ===
  {
    id: 'claim-007',
    employeeId: 'emp-002',
    employeeName: 'Priya Sharma',
    employeeCode: 'NX-1002',
    department: 'Engineering',
    grade: 'L4',
    categoryId: 'schooling',
    category: 'Schooling',
    requestType: 'claim',
    subject: 'Term 2 Fees - GEMS Wellington',
    description: 'Tuition for 1 child - Grade 3',
    amount: 18000,
    payableAmount: 18000,
    status: 'approved',
    priority: 'medium',
    submittedAt: subDays(now, 8),
    slaDueAt: subDays(now, 3),
    slaHours: 120,
    policyRef: 'POL-SCH-001',
    missingDocs: [],
    reviewedAt: subDays(now, 5),
  },
  {
    id: 'claim-008',
    employeeId: 'emp-015',
    employeeName: 'Aisha Qasim',
    employeeCode: 'NX-2005',
    department: 'Sales & Marketing',
    grade: 'L6',
    categoryId: 'learning',
    category: 'Learning',
    requestType: 'claim',
    subject: 'Executive MBA Module',
    description: 'INSEAD Executive MBA - Module 3',
    amount: 12500,
    payableAmount: 12500,
    status: 'approved',
    priority: 'high',
    submittedAt: subDays(now, 10),
    slaDueAt: subDays(now, 5),
    slaHours: 120,
    policyRef: 'POL-LRN-001',
    missingDocs: [],
    reviewedAt: subDays(now, 7),
  },
  {
    id: 'claim-009',
    employeeId: 'emp-024',
    employeeName: 'Rania Al Suwaidi',
    employeeCode: 'NX-3006',
    department: 'Operations',
    grade: 'L5',
    categoryId: 'health',
    category: 'Health',
    requestType: 'claim',
    subject: 'Specialist Consultation - Orthopedic',
    description: 'Knee consultation and MRI at American Hospital',
    amount: 2800,
    payableAmount: 2800,
    status: 'approved',
    priority: 'medium',
    submittedAt: subDays(now, 6),
    slaDueAt: subDays(now, 3),
    slaHours: 72,
    policyRef: 'POL-HEA-001',
    missingDocs: [],
    reviewedAt: subDays(now, 4),
  },

  // === IN REVIEW (4) ===
  {
    id: 'claim-010',
    employeeId: 'emp-013',
    employeeName: 'Nadia Mahmoud',
    employeeCode: 'NX-2003',
    department: 'Sales & Marketing',
    grade: 'L4',
    categoryId: 'schooling',
    category: 'Schooling',
    requestType: 'claim',
    subject: 'Term 2 Fees - Dubai American Academy',
    description: 'Tuition for 1 child - Grade 6',
    amount: 22000,
    payableAmount: 22000,
    status: 'in_review',
    priority: 'medium',
    submittedAt: subDays(now, 3),
    slaDueAt: addDays(now, 2),
    slaHours: 120,
    policyRef: 'POL-SCH-001',
    missingDocs: [],
  },
  {
    id: 'claim-011',
    employeeId: 'emp-003',
    employeeName: 'Chen Wei',
    employeeCode: 'NX-1003',
    department: 'Engineering',
    grade: 'L4',
    categoryId: 'transport',
    category: 'Transport',
    requestType: 'claim',
    subject: 'Monthly Parking - November',
    description: 'DIFC office parking for November',
    amount: 1200,
    payableAmount: 1200,
    status: 'in_review',
    priority: 'low',
    submittedAt: subDays(now, 2),
    slaDueAt: addDays(now, 2),
    slaHours: 48,
    policyRef: 'POL-TRN-001',
    missingDocs: [],
  },
  {
    id: 'claim-012',
    employeeId: 'emp-027',
    employeeName: 'Dana Khoury',
    employeeCode: 'NX-4002',
    department: 'Corporate Services',
    grade: 'L5',
    categoryId: 'wellbeing',
    category: 'Wellbeing',
    requestType: 'claim',
    subject: 'Wellness App Subscription',
    description: 'Headspace premium annual subscription',
    amount: 450,
    payableAmount: 450,
    status: 'in_review',
    priority: 'low',
    submittedAt: subDays(now, 1),
    slaDueAt: addDays(now, 2),
    slaHours: 72,
    policyRef: 'POL-WEL-001',
    missingDocs: [],
  },
  {
    id: 'claim-013',
    employeeId: 'emp-022',
    employeeName: 'Hala Rashid',
    employeeCode: 'NX-3004',
    department: 'Operations',
    grade: 'L4',
    categoryId: 'health',
    category: 'Health',
    requestType: 'claim',
    subject: 'GP Consultation and Medication',
    description: 'General checkup at Aster Clinic',
    amount: 650,
    payableAmount: 650,
    status: 'in_review',
    priority: 'medium',
    submittedAt: subHours(now, 18),
    slaDueAt: addDays(now, 2),
    slaHours: 72,
    policyRef: 'POL-HEA-001',
    missingDocs: [],
  },

  // === SUBMITTED (Pending Review) (3) ===
  {
    id: 'claim-014',
    employeeId: 'emp-009',
    employeeName: 'Maria Santos',
    employeeCode: 'NX-1009',
    department: 'Engineering',
    grade: 'L4',
    categoryId: 'schooling',
    category: 'Schooling',
    requestType: 'claim',
    subject: 'Term 2 Fees - Raffles World Academy',
    description: 'Tuition for 1 child - Grade 4',
    amount: 16500,
    payableAmount: 16500,
    status: 'submitted',
    priority: 'medium',
    submittedAt: subHours(now, 4),
    slaDueAt: addDays(now, 5),
    slaHours: 120,
    policyRef: 'POL-SCH-001',
    missingDocs: [],
  },
  {
    id: 'claim-015',
    employeeId: 'emp-012',
    employeeName: 'Michael Chen',
    employeeCode: 'NX-2002',
    department: 'Sales & Marketing',
    grade: 'L4',
    categoryId: 'transport',
    category: 'Transport',
    requestType: 'claim',
    subject: 'Monthly Fuel - November',
    description: 'Fuel receipts for November 2025',
    amount: 1400,
    payableAmount: 1400,
    status: 'submitted',
    priority: 'low',
    submittedAt: subHours(now, 2),
    slaDueAt: addDays(now, 2),
    slaHours: 48,
    policyRef: 'POL-TRN-001',
    missingDocs: [],
  },
  {
    id: 'claim-016',
    employeeId: 'emp-028',
    employeeName: 'Leila Ahmed',
    employeeCode: 'NX-4003',
    department: 'Corporate Services',
    grade: 'L4',
    categoryId: 'learning',
    category: 'Learning',
    requestType: 'request',
    subject: 'PMP Certification Course',
    description: 'Project Management Professional certification',
    amount: 5500,
    payableAmount: 5500,
    status: 'submitted',
    priority: 'medium',
    submittedAt: subHours(now, 6),
    slaDueAt: addDays(now, 5),
    slaHours: 120,
    policyRef: 'POL-LRN-001',
    missingDocs: [],
  },

  // === INFO REQUESTED (2) ===
  {
    id: 'claim-017',
    employeeId: 'emp-017',
    employeeName: 'Emma Johnson',
    employeeCode: 'NX-2007',
    department: 'Sales & Marketing',
    grade: 'L4',
    categoryId: 'schooling',
    category: 'Schooling',
    requestType: 'claim',
    subject: 'Term 2 Fees - Repton School',
    description: 'Tuition for 1 child - Year 5',
    amount: 28000,
    payableAmount: 28000,
    status: 'info_requested',
    priority: 'high',
    submittedAt: subDays(now, 5),
    slaDueAt: subHours(now, 12), // SLA paused
    slaHours: 120,
    policyRef: 'POL-SCH-001',
    missingDocs: ['Original fee receipt', 'Child birth certificate'],
  },
  {
    id: 'claim-018',
    employeeId: 'emp-006',
    employeeName: 'Fatima Khan',
    employeeCode: 'NX-1006',
    department: 'Engineering',
    grade: 'L4',
    categoryId: 'learning',
    category: 'Learning',
    requestType: 'claim',
    subject: 'AWS Certification',
    description: 'AWS Solutions Architect Professional',
    amount: 4800,
    payableAmount: 4800,
    status: 'info_requested',
    priority: 'medium',
    submittedAt: subDays(now, 7),
    slaDueAt: subDays(now, 2),
    slaHours: 120,
    policyRef: 'POL-LRN-001',
    missingDocs: ['Course completion certificate'],
  },

  // === REJECTED (2) ===
  {
    id: 'claim-019',
    employeeId: 'emp-014',
    employeeName: 'David Brown',
    employeeCode: 'NX-2004',
    department: 'Sales & Marketing',
    grade: 'L3',
    categoryId: 'wellbeing',
    category: 'Wellbeing',
    requestType: 'claim',
    subject: 'Premium Gym Membership',
    description: 'Equinox premium membership - exceeds cap',
    amount: 8500,
    payableAmount: 3000, // Only cap is payable
    status: 'rejected',
    priority: 'low',
    submittedAt: subDays(now, 12),
    slaDueAt: subDays(now, 9),
    slaHours: 72,
    policyRef: 'POL-WEL-001',
    missingDocs: [],
    reviewedAt: subDays(now, 10),
  },
  {
    id: 'claim-020',
    employeeId: 'emp-007',
    employeeName: 'Omar Saeed',
    employeeCode: 'NX-1007',
    department: 'Engineering',
    grade: 'L3',
    categoryId: 'health',
    category: 'Health',
    requestType: 'claim',
    subject: 'Elective Cosmetic Procedure',
    description: 'Cosmetic dental whitening - not covered',
    amount: 2200,
    payableAmount: 0,
    status: 'rejected',
    priority: 'low',
    submittedAt: subDays(now, 15),
    slaDueAt: subDays(now, 12),
    slaHours: 72,
    policyRef: 'POL-HEA-001',
    missingDocs: [],
    reviewedAt: subDays(now, 13),
  },
];

// ============================================================
// COMPUTED TOTALS FROM CLAIMS
// ============================================================

// Only PAID claims count toward utilized
export function getPaidClaimsTotalByCategory(): Record<string, number> {
  const paidClaims = DEMO_CLAIMS.filter(c => c.status === 'paid');
  const byCategory: Record<string, number> = {};
  for (const claim of paidClaims) {
    byCategory[claim.category] = (byCategory[claim.category] || 0) + claim.payableAmount;
  }
  return byCategory;
}

// Approved (pending payment) totals
export function getApprovedClaimsTotalByCategory(): Record<string, number> {
  const approvedClaims = DEMO_CLAIMS.filter(c => c.status === 'approved');
  const byCategory: Record<string, number> = {};
  for (const claim of approvedClaims) {
    byCategory[claim.category] = (byCategory[claim.category] || 0) + claim.payableAmount;
  }
  return byCategory;
}

// Pending (submitted + in_review + info_requested)
export function getPendingClaimsTotalByCategory(): Record<string, number> {
  const pendingClaims = DEMO_CLAIMS.filter(c => 
    ['submitted', 'in_review', 'info_requested'].includes(c.status)
  );
  const byCategory: Record<string, number> = {};
  for (const claim of pendingClaims) {
    byCategory[claim.category] = (byCategory[claim.category] || 0) + claim.payableAmount;
  }
  return byCategory;
}

// Overall totals
export const CLAIMS_SUMMARY = {
  total: DEMO_CLAIMS.length,
  byStatus: {
    submitted: DEMO_CLAIMS.filter(c => c.status === 'submitted').length,
    in_review: DEMO_CLAIMS.filter(c => c.status === 'in_review').length,
    info_requested: DEMO_CLAIMS.filter(c => c.status === 'info_requested').length,
    approved: DEMO_CLAIMS.filter(c => c.status === 'approved').length,
    rejected: DEMO_CLAIMS.filter(c => c.status === 'rejected').length,
    paid: DEMO_CLAIMS.filter(c => c.status === 'paid').length,
  },
  totalPaidAmount: DEMO_CLAIMS
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.payableAmount, 0),
  totalApprovedPending: DEMO_CLAIMS
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + c.payableAmount, 0),
  totalPendingReview: DEMO_CLAIMS
    .filter(c => ['submitted', 'in_review', 'info_requested'].includes(c.status))
    .reduce((sum, c) => sum + c.payableAmount, 0),
};

// Get claims for a specific employee
export function getEmployeeClaims(employeeId: string): DemoClaim[] {
  return DEMO_CLAIMS.filter(c => c.employeeId === employeeId);
}

// Get claims by category
export function getClaimsByCategory(categoryId: string): DemoClaim[] {
  return DEMO_CLAIMS.filter(c => c.categoryId === categoryId);
}
