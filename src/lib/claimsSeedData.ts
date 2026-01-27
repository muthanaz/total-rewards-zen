/**
 * Claims Seed Data for Demo
 * 
 * Realistic seed data for the Claims & Approvals Console
 * Covers various categories, statuses, SLA states, and value bands
 * 
 * UAE Market Values (2024):
 * - Parking: AED 100-200/month
 * - Medical Consultation: AED 400-800
 * - Schooling: AED 12,000-40,000/year per child
 * - Housing: AED 80,000-180,000/year (varies by grade)
 * - Fuel: AED 300-600/month
 */

import { addDays, subDays, subHours } from 'date-fns';

export interface SeedClaim {
  id: string;
  user_id: string;
  organization_id: string;
  employee_name: string;
  employee_code: string;
  department: string;
  grade: string;
  category: string;
  request_type: 'claim' | 'request';
  subject: string;
  description: string;
  amount: number;
  /** Annual or per-transaction cap for this benefit category */
  cap_limit?: number;
  /** For leave requests, number of days instead of amount */
  duration_days?: number;
  currency: string;
  value_band: 'Low' | 'Standard' | 'Premium';
  status: 'pending' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'paid' | 'needs_info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitted_at: Date;
  sla_due_at: Date;
  sla_hours: number;
  policy_ref: string;
  missing_docs: string[];
  location: string;
  assigned_owner_name?: string;
}

const now = new Date();

// Generate realistic claims data with UAE market values
export const seedClaims: SeedClaim[] = [
  // Health Insurance claims - realistic UAE consultation rates
  {
    id: 'claim-001',
    user_id: 'user-emp-001',
    organization_id: 'org-001',
    employee_name: 'Ahmed Al Rashid',
    employee_code: 'EMP-1234',
    department: 'Engineering',
    grade: 'L4',
    category: 'Health Insurance',
    request_type: 'claim',
    subject: 'Dental Treatment - Root Canal',
    description: 'Root canal treatment at Dr. Smile Clinic, JBR',
    amount: 2200, // Realistic UAE dental
    cap_limit: 5000, // Annual dental cap
    currency: 'AED',
    value_band: 'Standard',
    status: 'pending',
    priority: 'medium',
    submitted_at: subDays(now, 2),
    sla_due_at: addDays(now, 1),
    sla_hours: 72,
    policy_ref: 'HI-2024-v3',
    missing_docs: [],
    location: 'Dubai',
  },
  {
    id: 'claim-002',
    user_id: 'user-emp-002',
    organization_id: 'org-001',
    employee_name: 'Sara Hassan',
    employee_code: 'EMP-2345',
    department: 'Marketing',
    grade: 'L5',
    category: 'Health Insurance',
    request_type: 'claim',
    subject: 'Specialist Consultation - Orthopedic',
    description: 'Knee consultation and X-ray at American Hospital',
    amount: 650, // Realistic specialist consultation
    cap_limit: 1000, // Per-visit cap for specialist
    currency: 'AED',
    value_band: 'Standard',
    status: 'in_review',
    priority: 'high',
    submitted_at: subDays(now, 1),
    sla_due_at: subHours(now, 6), // SLA breaching soon
    sla_hours: 48,
    policy_ref: 'HI-2024-v3',
    missing_docs: [],
    location: 'Abu Dhabi',
    assigned_owner_name: 'HR Manager',
  },
  {
    id: 'claim-003',
    user_id: 'user-emp-003',
    organization_id: 'org-001',
    employee_name: 'Mohammed Al Farsi',
    employee_code: 'EMP-3456',
    department: 'Finance',
    grade: 'L6',
    category: 'Health Insurance',
    request_type: 'claim',
    subject: 'Hospital Admission - Minor Surgery',
    description: 'Day surgery at Mediclinic City Hospital',
    amount: 18500, // Realistic minor surgery
    cap_limit: 50000, // Annual major medical cap
    currency: 'AED',
    value_band: 'Premium',
    status: 'needs_info',
    priority: 'urgent',
    submitted_at: subDays(now, 3),
    sla_due_at: subDays(now, 1), // Already overdue
    sla_hours: 48,
    policy_ref: 'HI-2024-v3',
    missing_docs: ['Itemized hospital bill', 'Discharge summary'],
    location: 'Dubai',
  },
  
  // Schooling claims - realistic UAE school fees
  {
    id: 'claim-004',
    user_id: 'user-emp-004',
    organization_id: 'org-001',
    employee_name: 'Fatima Al Zahra',
    employee_code: 'EMP-4567',
    department: 'Operations',
    grade: 'L4',
    category: 'Schooling',
    request_type: 'claim',
    subject: 'School Fees - Term 2',
    description: 'Dubai British School - Grade 5 tuition',
    amount: 18500, // Realistic mid-tier school term fees
    cap_limit: 40000, // Annual schooling cap per child
    currency: 'AED',
    value_band: 'Premium',
    status: 'pending',
    priority: 'medium',
    submitted_at: subDays(now, 4),
    sla_due_at: addDays(now, 2),
    sla_hours: 72,
    policy_ref: 'ED-2024-v2',
    missing_docs: [],
    location: 'Dubai',
  },
  {
    id: 'claim-005',
    user_id: 'user-emp-005',
    organization_id: 'org-001',
    employee_name: 'Khalid Ibrahim',
    employee_code: 'EMP-5678',
    department: 'HR',
    grade: 'L5',
    category: 'Schooling',
    request_type: 'claim',
    subject: 'School Registration Fees',
    description: 'GEMS Wellington - New registration',
    amount: 8500, // Registration fee
    cap_limit: 12000, // Registration cap
    currency: 'AED',
    value_band: 'Standard',
    status: 'approved',
    priority: 'low',
    submitted_at: subDays(now, 7),
    sla_due_at: subDays(now, 4),
    sla_hours: 72,
    policy_ref: 'ED-2024-v2',
    missing_docs: [],
    location: 'Dubai',
  },
  
  // Transport claims - realistic UAE values
  {
    id: 'claim-006',
    user_id: 'user-emp-006',
    organization_id: 'org-001',
    employee_name: 'Layla Ahmed',
    employee_code: 'EMP-6789',
    department: 'Sales',
    grade: 'L3',
    category: 'Transport',
    request_type: 'claim',
    subject: 'Monthly Fuel Allowance',
    description: 'Fuel receipts for November 2024',
    amount: 420, // Realistic monthly fuel
    cap_limit: 600, // Monthly fuel cap
    currency: 'AED',
    value_band: 'Low',
    status: 'pending',
    priority: 'low',
    submitted_at: subDays(now, 1),
    sla_due_at: addDays(now, 4),
    sla_hours: 120,
    policy_ref: 'TR-2024-v1',
    missing_docs: [],
    location: 'Sharjah',
  },
  {
    id: 'claim-007',
    user_id: 'user-emp-007',
    organization_id: 'org-001',
    employee_name: 'Omar Saeed',
    employee_code: 'EMP-7890',
    department: 'Engineering',
    grade: 'L4',
    category: 'Transport',
    request_type: 'claim',
    subject: 'Parking Pass - Monthly',
    description: 'Monthly parking at DIFC office building',
    amount: 150, // Realistic parking pass
    cap_limit: 200, // Monthly parking cap
    currency: 'AED',
    value_band: 'Low',
    status: 'in_review',
    priority: 'medium',
    submitted_at: subDays(now, 2),
    sla_due_at: addDays(now, 1),
    sla_hours: 72,
    policy_ref: 'TR-2024-v1',
    missing_docs: ['Parking contract copy'],
    location: 'Dubai',
    assigned_owner_name: 'HR Specialist',
  },
  
  // Housing claims
  {
    id: 'claim-008',
    user_id: 'user-emp-008',
    organization_id: 'org-001',
    employee_name: 'Nadia Mahmoud',
    employee_code: 'EMP-8901',
    department: 'Legal',
    grade: 'L6',
    category: 'Housing',
    request_type: 'claim',
    subject: 'Housing Allowance - Q4',
    description: 'Quarterly housing allowance claim',
    amount: 35000, // Quarterly = 140k/year for L6
    cap_limit: 45000, // Quarterly cap
    currency: 'AED',
    value_band: 'Premium',
    status: 'pending',
    priority: 'high',
    submitted_at: subDays(now, 1),
    sla_due_at: addDays(now, 1),
    sla_hours: 48,
    policy_ref: 'HS-2024-v2',
    missing_docs: [],
    location: 'Dubai',
  },
  
  // Leave requests - use duration_days instead of amount
  {
    id: 'claim-009',
    user_id: 'user-emp-009',
    organization_id: 'org-001',
    employee_name: 'Yusuf Al Maktoum',
    employee_code: 'EMP-9012',
    department: 'Product',
    grade: 'L5',
    category: 'Leave',
    request_type: 'request',
    subject: 'Annual Leave',
    description: 'Annual leave request for December holidays',
    amount: 0, // Leave uses days, not amount
    duration_days: 10,
    cap_limit: 30, // Annual leave entitlement
    currency: 'AED',
    value_band: 'Low',
    status: 'pending',
    priority: 'medium',
    submitted_at: subDays(now, 3),
    sla_due_at: addDays(now, 0),
    sla_hours: 48,
    policy_ref: 'LV-2024-v1',
    missing_docs: [],
    location: 'Dubai',
  },
  {
    id: 'claim-016',
    user_id: 'user-emp-016',
    organization_id: 'org-001',
    employee_name: 'Amina Rashid',
    employee_code: 'EMP-6677',
    department: 'Marketing',
    grade: 'L4',
    category: 'Leave',
    request_type: 'request',
    subject: 'Sick Leave',
    description: 'Medical sick leave with doctor certificate',
    amount: 0,
    duration_days: 2,
    cap_limit: 15, // Sick leave entitlement
    currency: 'AED',
    value_band: 'Low',
    status: 'pending',
    priority: 'high',
    submitted_at: subDays(now, 1),
    sla_due_at: addDays(now, 1),
    sla_hours: 24,
    policy_ref: 'LV-2024-v1',
    missing_docs: [],
    location: 'Dubai',
  },
  
  // Per Diem claims
  {
    id: 'claim-010',
    user_id: 'user-emp-010',
    organization_id: 'org-001',
    employee_name: 'Hala Qasim',
    employee_code: 'EMP-0123',
    department: 'Sales',
    grade: 'L4',
    category: 'Per Diem',
    request_type: 'claim',
    subject: 'Business Trip - London',
    description: 'Per diem for 5-day business trip to London office',
    amount: 3750, // 5 days x 750 AED
    cap_limit: 1000, // Per day cap
    currency: 'AED',
    value_band: 'Standard',
    status: 'approved',
    priority: 'medium',
    submitted_at: subDays(now, 5),
    sla_due_at: subDays(now, 4),
    sla_hours: 24,
    policy_ref: 'PD-2024-v1',
    missing_docs: [],
    location: 'Dubai',
  },
  
  // Learning & Development
  {
    id: 'claim-011',
    user_id: 'user-emp-011',
    organization_id: 'org-001',
    employee_name: 'Rania Fares',
    employee_code: 'EMP-1122',
    department: 'Engineering',
    grade: 'L4',
    category: 'Learning & Development',
    request_type: 'claim',
    subject: 'AWS Certification Course',
    description: 'AWS Solutions Architect certification training',
    amount: 4200, // Realistic certification cost
    cap_limit: 5000, // Annual L&D cap
    currency: 'AED',
    value_band: 'Standard',
    status: 'needs_info',
    priority: 'low',
    submitted_at: subDays(now, 6),
    sla_due_at: subHours(now, 12), // Almost overdue
    sla_hours: 72,
    policy_ref: 'LD-2024-v2',
    missing_docs: ['Course completion certificate', 'Payment receipt'],
    location: 'Dubai',
  },
  
  // Paid claims for history
  {
    id: 'claim-012',
    user_id: 'user-emp-012',
    organization_id: 'org-001',
    employee_name: 'Tariq Abbas',
    employee_code: 'EMP-2233',
    department: 'Finance',
    grade: 'L5',
    category: 'Health Insurance',
    request_type: 'claim',
    subject: 'General Practitioner Visit',
    description: 'GP consultation and medication at Aster Clinic',
    amount: 450, // Realistic GP visit
    cap_limit: 500, // Per-visit cap
    currency: 'AED',
    value_band: 'Low',
    status: 'paid',
    priority: 'low',
    submitted_at: subDays(now, 14),
    sla_due_at: subDays(now, 11),
    sla_hours: 72,
    policy_ref: 'HI-2024-v3',
    missing_docs: [],
    location: 'Dubai',
  },
  
  // Wellbeing - over cap example
  {
    id: 'claim-013',
    user_id: 'user-emp-013',
    organization_id: 'org-001',
    employee_name: 'Maryam Al Suwaidi',
    employee_code: 'EMP-3344',
    department: 'Marketing',
    grade: 'L3',
    category: 'Wellbeing',
    request_type: 'claim',
    subject: 'Gym Membership - Annual',
    description: 'Annual gym membership at Fitness First',
    amount: 4800, // Exceeds cap!
    cap_limit: 3000, // Annual wellbeing cap
    currency: 'AED',
    value_band: 'Standard',
    status: 'rejected',
    priority: 'low',
    submitted_at: subDays(now, 10),
    sla_due_at: subDays(now, 7),
    sla_hours: 72,
    policy_ref: 'WB-2024-v1',
    missing_docs: [],
    location: 'Abu Dhabi',
  },
  
  // More pending claims for bulk actions demo
  {
    id: 'claim-014',
    user_id: 'user-emp-014',
    organization_id: 'org-001',
    employee_name: 'Sami Nour',
    employee_code: 'EMP-4455',
    department: 'Engineering',
    grade: 'L4',
    category: 'Transport',
    request_type: 'claim',
    subject: 'Metro Card Top-up',
    description: 'Monthly metro card expenses',
    amount: 250, // Realistic metro
    cap_limit: 350, // Monthly transport cap for non-car
    currency: 'AED',
    value_band: 'Low',
    status: 'pending',
    priority: 'low',
    submitted_at: subDays(now, 1),
    sla_due_at: addDays(now, 4),
    sla_hours: 120,
    policy_ref: 'TR-2024-v1',
    missing_docs: [],
    location: 'Dubai',
  },
  {
    id: 'claim-015',
    user_id: 'user-emp-015',
    organization_id: 'org-001',
    employee_name: 'Dana Khalil',
    employee_code: 'EMP-5566',
    department: 'Operations',
    grade: 'L3',
    category: 'Transport',
    request_type: 'claim',
    subject: 'Taxi Expenses',
    description: 'Late night work taxi receipts',
    amount: 380,
    cap_limit: 500, // Monthly taxi cap
    currency: 'AED',
    value_band: 'Low',
    status: 'pending',
    priority: 'low',
    submitted_at: subDays(now, 2),
    sla_due_at: addDays(now, 3),
    sla_hours: 120,
    policy_ref: 'TR-2024-v1',
    missing_docs: [],
    location: 'Dubai',
  },
  // Medical consultation - showing cap exceeded
  {
    id: 'claim-017',
    user_id: 'user-emp-017',
    organization_id: 'org-001',
    employee_name: 'Leila Khoury',
    employee_code: 'EMP-7788',
    department: 'Sales',
    grade: 'L4',
    category: 'Health Insurance',
    request_type: 'claim',
    subject: 'Specialist Consultation - Dermatology',
    description: 'Dermatology consultation and treatment',
    amount: 1200, // Exceeds per-visit cap
    cap_limit: 800, // Per-visit specialist cap
    currency: 'AED',
    value_band: 'Standard',
    status: 'pending',
    priority: 'medium',
    submitted_at: subDays(now, 1),
    sla_due_at: addDays(now, 2),
    sla_hours: 72,
    policy_ref: 'HI-2024-v3',
    missing_docs: [],
    location: 'Dubai',
  },
  // Schooling - high value
  {
    id: 'claim-018',
    user_id: 'user-emp-018',
    organization_id: 'org-001',
    employee_name: 'Hassan Diab',
    employee_code: 'EMP-8899',
    department: 'Finance',
    grade: 'L6',
    category: 'Schooling',
    request_type: 'claim',
    subject: 'School Fees - Full Year',
    description: 'Dubai College - Year 10 annual tuition',
    amount: 65000, // Premium school exceeds cap
    cap_limit: 50000, // Annual schooling cap for L6
    currency: 'AED',
    value_band: 'Premium',
    status: 'in_review',
    priority: 'high',
    submitted_at: subDays(now, 3),
    sla_due_at: addDays(now, 1),
    sla_hours: 72,
    policy_ref: 'ED-2024-v2',
    missing_docs: [],
    location: 'Dubai',
    assigned_owner_name: 'Finance Lead',
  },
];

// Helper to get claims by status
export function getClaimsByStatus(status: string): SeedClaim[] {
  return seedClaims.filter(c => c.status === status);
}

// Helper to get SLA risk claims
export function getSlaRiskClaims(): SeedClaim[] {
  const now = new Date();
  return seedClaims.filter(c => {
    if (['approved', 'rejected', 'paid'].includes(c.status)) return false;
    const hoursRemaining = (c.sla_due_at.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursRemaining < 24;
  });
}

// Helper to get missing docs claims
export function getMissingDocsClaims(): SeedClaim[] {
  return seedClaims.filter(c => c.missing_docs.length > 0);
}

// Helper to get high value claims
export function getHighValueClaims(threshold: number = 5000): SeedClaim[] {
  return seedClaims.filter(c => c.amount >= threshold);
}

// Helper to get claims over cap
export function getOverCapClaims(): SeedClaim[] {
  return seedClaims.filter(c => c.cap_limit && c.amount > c.cap_limit);
}

// Summary statistics
export function getClaimsSummary() {
  const now = new Date();
  const pending = seedClaims.filter(c => c.status === 'pending' || c.status === 'submitted').length;
  const inReview = seedClaims.filter(c => c.status === 'in_review').length;
  const needsInfo = seedClaims.filter(c => c.status === 'needs_info').length;
  const approved = seedClaims.filter(c => c.status === 'approved').length;
  const slaRisk = seedClaims.filter(c => {
    if (['approved', 'rejected', 'paid'].includes(c.status)) return false;
    const hoursRemaining = (c.sla_due_at.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursRemaining < 24;
  }).length;
  const missingDocs = seedClaims.filter(c => c.missing_docs.length > 0).length;
  const highValue = seedClaims.filter(c => c.amount >= 5000).length;
  const overCap = seedClaims.filter(c => c.cap_limit && c.amount > c.cap_limit).length;
  
  return {
    total: seedClaims.length,
    pending,
    inReview,
    needsInfo,
    approved,
    slaRisk,
    missingDocs,
    highValue,
    overCap,
  };
}
