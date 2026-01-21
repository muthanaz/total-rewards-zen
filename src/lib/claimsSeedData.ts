/**
 * Claims Seed Data for Demo
 * 
 * Realistic seed data for the Claims & Approvals Console
 * Covers various categories, statuses, SLA states, and value bands
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

// Generate realistic claims data
export const seedClaims: SeedClaim[] = [
  // Health Insurance claims
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
    amount: 3500,
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
    description: 'Knee consultation and MRI at American Hospital',
    amount: 8500,
    currency: 'AED',
    value_band: 'Premium',
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
    subject: 'Hospital Admission - Surgery',
    description: 'Appendix surgery at Mediclinic City Hospital',
    amount: 45000,
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
  
  // Schooling claims
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
    amount: 25000,
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
    amount: 12000,
    currency: 'AED',
    value_band: 'Premium',
    status: 'approved',
    priority: 'low',
    submitted_at: subDays(now, 7),
    sla_due_at: subDays(now, 4),
    sla_hours: 72,
    policy_ref: 'ED-2024-v2',
    missing_docs: [],
    location: 'Dubai',
  },
  
  // Transport claims
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
    amount: 800,
    currency: 'AED',
    value_band: 'Standard',
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
    subject: 'Parking Expenses',
    description: 'Monthly parking at DIFC',
    amount: 2500,
    currency: 'AED',
    value_band: 'Standard',
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
    amount: 35000,
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
  
  // Leave claims
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
    subject: 'Annual Leave - 10 Days',
    description: 'Annual leave request for December holidays',
    amount: 0,
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
    amount: 4500,
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
    amount: 5500,
    currency: 'AED',
    value_band: 'Premium',
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
    subject: 'Annual Health Checkup',
    description: 'Comprehensive health screening at Aster Clinic',
    amount: 1200,
    currency: 'AED',
    value_band: 'Standard',
    status: 'paid',
    priority: 'low',
    submitted_at: subDays(now, 14),
    sla_due_at: subDays(now, 11),
    sla_hours: 72,
    policy_ref: 'HI-2024-v3',
    missing_docs: [],
    location: 'Dubai',
  },
  
  // Rejected claim
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
    subject: 'Gym Membership',
    description: 'Annual gym membership at Fitness First',
    amount: 3600,
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
    amount: 350,
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
    amount: 450,
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
  
  return {
    total: seedClaims.length,
    pending,
    inReview,
    needsInfo,
    approved,
    slaRisk,
    missingDocs,
    highValue,
  };
}
