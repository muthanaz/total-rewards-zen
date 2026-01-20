/**
 * Coherent Demo Data
 * 
 * This file provides consistent sample data across all portals.
 * The same employees, entitlements, requests, and policies appear
 * in Employee, Employer, and Admin views.
 */

// Demo Organization
export const demoOrganization = {
  id: 'demo-org-001',
  name: 'Horizon Financial Services',
  industry: 'Financial Services',
  employeeCount: 247,
  region: 'UAE',
  city: 'Dubai',
};

// Demo Employees (consistent across portals)
export const demoEmployees = [
  { id: 'emp-001', firstName: 'Sarah', lastName: 'Al-Rashid', department: 'Finance', grade: 'M1', position: 'Senior Analyst', salary: 35000 },
  { id: 'emp-002', firstName: 'Ahmed', lastName: 'Hassan', department: 'Technology', grade: 'M2', position: 'Tech Lead', salary: 45000 },
  { id: 'emp-003', firstName: 'Fatima', lastName: 'Khan', department: 'HR', grade: 'S2', position: 'HR Business Partner', salary: 28000 },
  { id: 'emp-004', firstName: 'Michael', lastName: 'Chen', department: 'Sales', grade: 'M1', position: 'Account Manager', salary: 32000 },
  { id: 'emp-005', firstName: 'Layla', lastName: 'Mohammed', department: 'Operations', grade: 'S1', position: 'Operations Coordinator', salary: 22000 },
];

// Demo Benefits (same across Employee & Employer)
export const demoBenefits = [
  { id: 'ben-001', name: 'Housing Allowance', category: 'housing', annualValue: 120000, description: 'Monthly housing allowance paid with salary' },
  { id: 'ben-002', name: 'Schooling Allowance', category: 'education', annualValue: 60000, description: 'School fee coverage for dependents up to 18 years' },
  { id: 'ben-003', name: 'Health Insurance', category: 'health', annualValue: 45000, description: 'Comprehensive health coverage including dental and optical' },
  { id: 'ben-004', name: 'Transport & Mobility', category: 'transport', annualValue: 39000, description: 'Monthly transport allowance plus annual flight tickets' },
  { id: 'ben-005', name: 'Wellbeing Program', category: 'wellbeing', annualValue: 6000, description: 'Gym membership and wellness app subscriptions' },
  { id: 'ben-006', name: 'Learning & Development', category: 'learning', annualValue: 12000, description: 'Professional courses and certifications' },
];

// Demo Entitlements (Employee-specific, visible in Employer claims)
export const demoEntitlements = [
  { benefitId: 'ben-001', employeeId: 'emp-001', annualAllowance: 120000, utilized: 120000, remaining: 0 },
  { benefitId: 'ben-002', employeeId: 'emp-001', annualAllowance: 60000, utilized: 42000, remaining: 18000 },
  { benefitId: 'ben-003', employeeId: 'emp-001', annualAllowance: 45000, utilized: 12500, remaining: 32500 },
  { benefitId: 'ben-004', employeeId: 'emp-001', annualAllowance: 39000, utilized: 33000, remaining: 6000 },
  { benefitId: 'ben-005', employeeId: 'emp-001', annualAllowance: 6000, utilized: 3200, remaining: 2800 },
  { benefitId: 'ben-006', employeeId: 'emp-001', annualAllowance: 12000, utilized: 4500, remaining: 7500 },
];

// Demo Requests/Claims (same items visible in Employee & Employer portals)
export const demoRequests = [
  { 
    id: 'req-001', 
    employeeId: 'emp-001', 
    employeeName: 'Sarah Al-Rashid',
    type: 'claim', 
    category: 'Schooling', 
    subject: 'Q1 School Fees - Emirates International School',
    amount: 15000, 
    status: 'approved', 
    submittedAt: '2026-01-10T09:30:00Z',
    reviewedAt: '2026-01-12T14:15:00Z',
    reviewerNotes: 'Approved - all documentation verified',
  },
  { 
    id: 'req-002', 
    employeeId: 'emp-002', 
    employeeName: 'Ahmed Hassan',
    type: 'claim', 
    category: 'Health', 
    subject: 'Dental Treatment - Root Canal',
    amount: 4500, 
    status: 'pending', 
    submittedAt: '2026-01-15T11:00:00Z',
    priority: 'normal',
    slaDueAt: '2026-01-18T11:00:00Z',
  },
  { 
    id: 'req-003', 
    employeeId: 'emp-003', 
    employeeName: 'Fatima Khan',
    type: 'claim', 
    category: 'Learning', 
    subject: 'PMP Certification Course',
    amount: 8500, 
    status: 'pending', 
    submittedAt: '2026-01-16T08:45:00Z',
    priority: 'high',
    slaDueAt: '2026-01-17T08:45:00Z',
    notes: 'Course starts next week - urgent approval needed',
  },
  { 
    id: 'req-004', 
    employeeId: 'emp-004', 
    employeeName: 'Michael Chen',
    type: 'claim', 
    category: 'Wellbeing', 
    subject: 'Annual Gym Membership - Fitness First',
    amount: 4800, 
    status: 'approved', 
    submittedAt: '2026-01-08T10:20:00Z',
    reviewedAt: '2026-01-09T16:00:00Z',
  },
  { 
    id: 'req-005', 
    employeeId: 'emp-001', 
    employeeName: 'Sarah Al-Rashid',
    type: 'request', 
    category: 'Leave', 
    subject: 'Annual Leave - 5 days',
    status: 'pending', 
    submittedAt: '2026-01-18T09:00:00Z',
    priority: 'normal',
  },
];

// Demo Policies (visible in Employee benefit pages & Employer policy management)
export const demoPolicies = [
  { 
    id: 'pol-001', 
    benefitId: 'ben-002', 
    name: 'Schooling Allowance Policy',
    version: 3,
    status: 'published',
    effectiveFrom: '2025-01-01',
    highlights: [
      'Per child up to 18 years of age',
      'Covers tuition fees at approved schools only',
      'Maximum AED 60,000 per child per year',
      'Requires original fee receipts within 30 days',
    ],
    lastUpdated: '2025-01-15T10:00:00Z',
  },
  { 
    id: 'pol-002', 
    benefitId: 'ben-003', 
    name: 'Health Insurance Policy',
    version: 5,
    status: 'published',
    effectiveFrom: '2025-01-01',
    highlights: [
      'Comprehensive coverage for employee and dependents',
      'Includes dental and optical coverage',
      'Pre-approval required for hospital admissions',
      'Annual wellness check covered 100%',
    ],
    lastUpdated: '2025-02-01T09:30:00Z',
  },
];

// Demo Executive Metrics
export const demoExecutiveMetrics = {
  totalInvestment: 8500000,
  budgetUtilized: 5780000,
  utilizationRate: 68,
  targetUtilization: 75,
  costPerEmployee: 34412,
  industryBenchmark: 38000,
  peerBenchmark: 36500,
  roi: 3.2,
  roiBenchmark: 2.8,
  esatScore: 82,
  esatBenchmark: 78,
  esatTrend: 4.5,
  retentionRate: 94,
  retentionBenchmark: 88,
  turnoverRate: 6,
  turnoverBenchmark: 12,
  zombieSpend: 425000,
  employeeCount: 247,
  dataConfidence: 'high' as const,
  dataSources: ['HR System', 'Payroll', 'Benefits Platform'],
  lastUpdated: new Date().toISOString(),
};

// Demo Claims Metrics (HR Ops)
export const demoClaimMetrics = {
  pending: 12,
  urgent: 3,
  approved: 45,
  rejected: 4,
  openQuestions: 8,
  enrollmentsPending: 5,
  avgProcessingDays: 2.3,
  slaCompliance: 94,
  approvalRate: 87,
  claimsThisMonth: 45,
  claimsLastMonth: 42,
  policyUpdatesDue: 2,
};

// Demo Vendor Metrics
export const demoVendorMetrics = {
  activeOffers: 12,
  totalViews: 4562,
  redemptions: 847,
  totalEarnings: 24500,
  conversionRate: 18.6,
  pendingPayout: 3250,
  commissionRate: 10,
};

// Demo Platform Metrics (Admin)
export const demoPlatformMetrics = {
  totalOrganizations: 47,
  activeEmployees: 12847,
  platformGMV: 24500000,
  activeVendors: 156,
  dataQualityScore: 87,
  integrationHealth: 94,
};
