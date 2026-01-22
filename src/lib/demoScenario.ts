/**
 * North Star Demo Scenario - "Nexa Holdings (UAE)"
 * 
 * A cohesive 10-minute demo story that works across all portals.
 * Organization: Nexa Holdings (UAE)
 * Time Window: Last 90 days
 */

import { formatCurrencyAED } from '@/lib/utils';

// ============================================
// ORGANIZATION & SEGMENTS
// ============================================

export const DEMO_ORG = {
  id: 'nexa-holdings-001',
  name: 'Nexa Holdings',
  displayName: 'Nexa Holdings (UAE)',
  industry: 'Investment Holding',
  region: 'UAE',
  city: 'Dubai',
  employeeCount: 312,
  currency: 'AED',
  fiscalYearStart: '2026-01-01',
  dataWindow: {
    start: '2025-10-21',
    end: '2026-01-21',
    label: 'Last 90 Days',
  },
} as const;

export const DEMO_SEGMENTS = [
  {
    id: 'segment-hq',
    name: 'HQ Office',
    nameAr: 'المقر الرئيسي',
    grade: 'B',
    profile: 'Family',
    employeeCount: 142,
    avgAge: 38,
    dependentRatio: 2.1,
    primaryBenefits: ['Schooling', 'Health Insurance', 'Housing'],
    characteristics: ['Family-focused', 'Schooling-heavy', 'Health claims active'],
    color: 'hsl(var(--primary))',
  },
  {
    id: 'segment-field',
    name: 'Field Ops',
    nameAr: 'العمليات الميدانية',
    grade: 'C',
    profile: 'Single',
    employeeCount: 128,
    avgAge: 29,
    dependentRatio: 0.4,
    primaryBenefits: ['Transport', 'Overtime', 'Wellbeing'],
    characteristics: ['Mobile workforce', 'Transport-heavy', 'Wellbeing engagement'],
    color: 'hsl(var(--success))',
  },
  {
    id: 'segment-leadership',
    name: 'Leadership',
    nameAr: 'القيادة',
    grade: 'A',
    profile: 'Senior',
    employeeCount: 42,
    avgAge: 48,
    dependentRatio: 1.8,
    primaryBenefits: ['Long-term Financials', 'Premium Health', 'Education Allowance'],
    characteristics: ['Executive benefits', 'Long-term focused', 'High retention value'],
    color: 'hsl(var(--warning))',
  },
] as const;

// ============================================
// EXECUTIVE METRICS
// ============================================

export const DEMO_EXEC_METRICS = {
  // Budget & Investment
  totalInvestment: 24600000,      // AED 24.6M
  budgetUtilized: 16728000,       // AED 16.7M (68%)
  utilizationRate: 68,
  targetUtilization: 80,
  utilizationGap: 12,             // 12% below target
  
  // Per Employee
  costPerEmployee: 78846,         // AED 78.8K
  industryBenchmark: 82000,
  peerBenchmark: 79500,
  
  // ROI & Value
  roi: 3.4,
  roiBenchmark: 2.9,
  zombieSpend: 2952000,           // AED 2.95M (12% of investment)
  recoveryPotential: 1870000,     // AED 1.87M realistically recoverable
  
  // Satisfaction & Retention
  esatScore: 76,
  esatBenchmark: 72,
  esatTrend: 4.2,                 // +4.2 MoM
  retentionRate: 91,
  retentionBenchmark: 86,
  turnoverRate: 9,
  turnoverBenchmark: 14,
  
  // Claims SLA
  claimsSlaCompliance: 87,        // Below 95% target = risk flag
  claimsSlaTarget: 95,
  pendingClaims: 47,
  urgentClaims: 8,
  
  // Marketplace
  marketplaceSavings: 127500,     // AED 127.5K saved this quarter
  activeOffers: 12,
  redemptions: 234,
  
  // Data Quality
  dataConfidence: 'high' as const,
  dataSources: ['Oracle HCM', 'Benefits Platform', 'Claims System'],
  lastUpdated: new Date().toISOString(),
} as const;

// ============================================
// SPEND ALLOCATION BY CATEGORY
// ============================================

export const DEMO_SPEND_ALLOCATION = [
  { 
    category: 'Health Insurance', 
    categoryAr: 'التأمين الصحي',
    budget: 7380000, 
    utilized: 5166000, 
    utilizationRate: 70,
    claimCount: 892,
    trend: 3.2,
    segments: { 'HQ Office': 45, 'Field Ops': 35, 'Leadership': 20 },
  },
  { 
    category: 'Schooling', 
    categoryAr: 'التعليم',
    budget: 5412000, 
    utilized: 4546080, 
    utilizationRate: 84,
    claimCount: 156,
    trend: 12.5,
    segments: { 'HQ Office': 72, 'Field Ops': 8, 'Leadership': 20 },
  },
  { 
    category: 'Housing', 
    categoryAr: 'السكن',
    budget: 4920000, 
    utilized: 4920000, 
    utilizationRate: 100,  // Guaranteed allowance
    claimCount: 0,
    trend: 0,
    segments: { 'HQ Office': 45, 'Field Ops': 40, 'Leadership': 15 },
  },
  { 
    category: 'Transport', 
    categoryAr: 'النقل',
    budget: 3198000, 
    utilized: 2558400, 
    utilizationRate: 80,
    claimCount: 423,
    trend: -2.1,
    segments: { 'HQ Office': 25, 'Field Ops': 65, 'Leadership': 10 },
  },
  { 
    category: 'Wellbeing', 
    categoryAr: 'الرفاهية',
    budget: 1230000, 
    utilized: 492000, 
    utilizationRate: 40,   // Low utilization = zombie spend opportunity
    claimCount: 89,
    trend: 8.3,
    segments: { 'HQ Office': 30, 'Field Ops': 55, 'Leadership': 15 },
  },
  { 
    category: 'Learning & Development', 
    categoryAr: 'التعلم والتطوير',
    budget: 1476000, 
    utilized: 531360, 
    utilizationRate: 36,   // Very low = major zombie spend
    claimCount: 67,
    trend: -5.4,
    segments: { 'HQ Office': 40, 'Field Ops': 35, 'Leadership': 25 },
  },
  { 
    category: 'Long-term Financials', 
    categoryAr: 'التخطيط المالي طويل الأمد',
    budget: 984000, 
    utilized: 514320, 
    utilizationRate: 52,
    claimCount: 24,
    trend: 6.7,
    segments: { 'HQ Office': 15, 'Field Ops': 10, 'Leadership': 75 },
  },
] as const;

// ============================================
// ZOMBIE SPEND OPPORTUNITIES
// ============================================

export const DEMO_ZOMBIE_OPPORTUNITIES = [
  {
    id: 'zombie-001',
    category: 'Learning & Development',
    categoryAr: 'التعلم والتطوير',
    impact: 944640,              // AED 944.6K
    utilizationRate: 36,
    targetRate: 65,
    affectedEmployees: 187,
    rootCause: 'Low awareness of available courses and certifications',
    rootCauseAr: 'انخفاض الوعي بالدورات والشهادات المتاحة',
    suggestedAction: 'Launch L&D awareness campaign with manager nudges',
    suggestedActionAr: 'إطلاق حملة توعية للتعلم مع تنبيهات للمديرين',
    owner: 'L&D Manager',
    priority: 'high' as const,
    estimatedRecovery: 580000,
    timeToValue: '60 days',
  },
  {
    id: 'zombie-002',
    category: 'Wellbeing',
    categoryAr: 'الرفاهية',
    impact: 738000,              // AED 738K
    utilizationRate: 40,
    targetRate: 70,
    affectedEmployees: 245,
    rootCause: 'Gym partnerships not aligned with employee locations',
    rootCauseAr: 'شراكات النوادي الرياضية لا تتوافق مع مواقع الموظفين',
    suggestedAction: 'Add Field Ops locations to gym network',
    suggestedActionAr: 'إضافة مواقع العمليات الميدانية إلى شبكة النوادي',
    owner: 'HR Business Partner',
    priority: 'medium' as const,
    estimatedRecovery: 420000,
    timeToValue: '45 days',
  },
  {
    id: 'zombie-003',
    category: 'Long-term Financials',
    categoryAr: 'التخطيط المالي طويل الأمد',
    impact: 469680,              // AED 469.7K
    utilizationRate: 52,
    targetRate: 75,
    affectedEmployees: 42,
    rootCause: 'Leadership unaware of enhanced retirement matching',
    rootCauseAr: 'القيادة غير مطلعة على مطابقة التقاعد المحسنة',
    suggestedAction: 'Executive briefing on financial planning benefits',
    suggestedActionAr: 'جلسة إحاطة تنفيذية عن مزايا التخطيط المالي',
    owner: 'C&B Manager',
    priority: 'medium' as const,
    estimatedRecovery: 310000,
    timeToValue: '30 days',
  },
] as const;

// ============================================
// HR OPS CLAIMS QUEUE (12 requests, 3 at SLA risk)
// ============================================

export const DEMO_CLAIMS_QUEUE = [
  // SLA Risk - Urgent (3)
  {
    id: 'req-demo-001',
    employeeId: 'emp-hq-023',
    employeeName: 'Fatima Al-Hassan',
    department: 'Finance',
    grade: 'B2',
    segment: 'HQ Office',
    type: 'claim' as const,
    category: 'Schooling',
    subject: 'Q1 School Fees - GEMS Wellington',
    amount: 18500,
    status: 'pending' as const,
    priority: 'urgent' as const,
    submittedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), // 2.5 days ago
    slaHours: 72,
    slaDueAt: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(), // Due in 12 hours
    slaStatus: 'at_risk' as const,
    docsComplete: true,
    hasDecisionGuidance: true,
    suggestedDecision: 'approve',
    eligibilityCheck: { passed: true, message: 'Within entitlement limit' },
  },
  {
    id: 'req-demo-002',
    employeeId: 'emp-field-087',
    employeeName: 'Ahmed Khalil',
    department: 'Operations',
    grade: 'C1',
    segment: 'Field Ops',
    type: 'claim' as const,
    category: 'Transport',
    subject: 'December Fuel Reimbursement',
    amount: 2450,
    status: 'pending' as const,
    priority: 'urgent' as const,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    slaHours: 48,
    slaDueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Due in 2 hours!
    slaStatus: 'critical' as const,
    docsComplete: true,
    hasDecisionGuidance: true,
    suggestedDecision: 'approve',
    eligibilityCheck: { passed: true, message: 'Standard monthly claim' },
  },
  {
    id: 'req-demo-003',
    employeeId: 'emp-lead-005',
    employeeName: 'Nadia Qureshi',
    department: 'Strategy',
    grade: 'A1',
    segment: 'Leadership',
    type: 'claim' as const,
    category: 'Health',
    subject: 'Specialist Consultation - Orthopedic',
    amount: 3200,
    status: 'need_info' as const,
    priority: 'urgent' as const,
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    slaDueAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Overdue!
    slaStatus: 'overdue' as const,
    docsComplete: false,
    missingDocs: ['Referral letter from primary physician'],
    hasDecisionGuidance: true,
    suggestedDecision: 'request_info',
    eligibilityCheck: { passed: true, message: 'Within premium health coverage' },
  },
  
  // Standard Queue (9)
  {
    id: 'req-demo-004',
    employeeId: 'emp-hq-045',
    employeeName: 'Omar Al-Maktoum',
    department: 'IT',
    grade: 'B1',
    segment: 'HQ Office',
    type: 'claim' as const,
    category: 'Learning',
    subject: 'AWS Solutions Architect Certification',
    amount: 4200,
    status: 'pending' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    slaDueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'on_track' as const,
    docsComplete: true,
    hasDecisionGuidance: true,
    suggestedDecision: 'approve',
    eligibilityCheck: { passed: true, message: 'Approved certification track' },
  },
  {
    id: 'req-demo-005',
    employeeId: 'emp-field-034',
    employeeName: 'Rashid Abdullah',
    department: 'Logistics',
    grade: 'C2',
    segment: 'Field Ops',
    type: 'claim' as const,
    category: 'Wellbeing',
    subject: 'Annual Gym Membership - Fitness First',
    amount: 4800,
    status: 'pending' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    slaHours: 48,
    slaDueAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'on_track' as const,
    docsComplete: true,
    hasDecisionGuidance: true,
    suggestedDecision: 'approve',
    eligibilityCheck: { passed: true, message: 'Within wellbeing budget' },
  },
  {
    id: 'req-demo-006',
    employeeId: 'emp-hq-112',
    employeeName: 'Layla Ibrahim',
    department: 'Marketing',
    grade: 'B2',
    segment: 'HQ Office',
    type: 'question' as const,
    category: 'Schooling',
    subject: 'Can I claim for nursery fees?',
    amount: 0,
    status: 'pending' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    slaHours: 24,
    slaDueAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'on_track' as const,
    docsComplete: true,
    hasDecisionGuidance: true,
    suggestedDecision: 'respond',
    policyGuidance: 'Yes, nursery is covered for children aged 3+',
  },
  {
    id: 'req-demo-007',
    employeeId: 'emp-hq-078',
    employeeName: 'Sara Al-Farsi',
    department: 'HR',
    grade: 'B1',
    segment: 'HQ Office',
    type: 'claim' as const,
    category: 'Health',
    subject: 'Dental Treatment - Root Canal',
    amount: 2100,
    status: 'in_review' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    slaDueAt: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'on_track' as const,
    docsComplete: true,
    hasDecisionGuidance: true,
    suggestedDecision: 'approve',
    eligibilityCheck: { passed: true, message: 'Dental coverage included' },
  },
  {
    id: 'req-demo-008',
    employeeId: 'emp-field-056',
    employeeName: 'Mohammed Al-Balushi',
    department: 'Maintenance',
    grade: 'C1',
    segment: 'Field Ops',
    type: 'request' as const,
    category: 'Leave',
    subject: 'Annual Leave Request - 10 days',
    amount: 0,
    status: 'pending' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    slaHours: 48,
    slaDueAt: new Date(Date.now() + 42 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'on_track' as const,
    docsComplete: true,
    hasDecisionGuidance: true,
    suggestedDecision: 'approve',
    eligibilityCheck: { passed: true, message: '18 days remaining' },
  },
  {
    id: 'req-demo-009',
    employeeId: 'emp-lead-012',
    employeeName: 'Tariq Al-Hashemi',
    department: 'Legal',
    grade: 'A2',
    segment: 'Leadership',
    type: 'claim' as const,
    category: 'Long-term Financials',
    subject: 'Executive Financial Planning Session',
    amount: 3500,
    status: 'pending' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    slaDueAt: new Date(Date.now() + 54 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'on_track' as const,
    docsComplete: true,
    hasDecisionGuidance: true,
    suggestedDecision: 'approve',
    eligibilityCheck: { passed: true, message: 'Executive benefit tier' },
  },
  {
    id: 'req-demo-010',
    employeeId: 'emp-hq-089',
    employeeName: 'Aisha Malik',
    department: 'Finance',
    grade: 'B2',
    segment: 'HQ Office',
    type: 'claim' as const,
    category: 'Schooling',
    subject: 'School Uniform & Supplies',
    amount: 1850,
    status: 'approved' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'completed' as const,
    docsComplete: true,
    eligibilityCheck: { passed: true, message: 'Within ancillary allowance' },
  },
  {
    id: 'req-demo-011',
    employeeId: 'emp-field-098',
    employeeName: 'Hassan Al-Amri',
    department: 'Distribution',
    grade: 'C2',
    segment: 'Field Ops',
    type: 'claim' as const,
    category: 'Transport',
    subject: 'Annual Flight Ticket - Home Country',
    amount: 3200,
    status: 'pending' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    slaDueAt: new Date(Date.now() + 64 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'on_track' as const,
    docsComplete: false,
    missingDocs: ['Flight ticket copy'],
    hasDecisionGuidance: true,
    suggestedDecision: 'request_info',
    eligibilityCheck: { passed: true, message: 'Annual entitlement available' },
  },
  {
    id: 'req-demo-012',
    employeeId: 'emp-hq-156',
    employeeName: 'Rania Youssef',
    department: 'Customer Service',
    grade: 'B1',
    segment: 'HQ Office',
    type: 'claim' as const,
    category: 'Wellbeing',
    subject: 'Mental Health Counseling Sessions',
    amount: 1200,
    status: 'rejected' as const,
    priority: 'normal' as const,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    slaHours: 72,
    reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: 'completed' as const,
    docsComplete: true,
    rejectionReason: 'Provider not in approved network - resubmit with in-network provider',
    eligibilityCheck: { passed: false, message: 'Out-of-network provider' },
  },
] as const;

// ============================================
// POLICIES (2 versions for demo)
// ============================================

export const DEMO_POLICIES = [
  {
    id: 'pol-schooling-v3',
    benefitCategory: 'Schooling',
    name: 'Schooling Allowance Policy',
    nameAr: 'سياسة بدل التعليم',
    version: 3,
    status: 'published' as const,
    effectiveFrom: '2026-01-01',
    effectiveUntil: null,
    publishedAt: '2025-12-15T10:00:00Z',
    publishedBy: 'HR Director',
    summary: 'Updated to include nursery coverage for children aged 3+',
    highlights: [
      'Per child up to 18 years of age',
      'NEW: Nursery coverage for children 3+ years',
      'Maximum AED 60,000 per child per year',
      'Covers tuition, registration, and uniforms',
      'Requires original fee receipts within 30 days',
    ],
    highlightsAr: [
      'لكل طفل حتى 18 عاماً',
      'جديد: تغطية الحضانة للأطفال من 3 سنوات فما فوق',
      'الحد الأقصى AED 60,000 لكل طفل سنوياً',
      'يشمل الرسوم الدراسية والتسجيل والزي المدرسي',
      'يتطلب إيصالات أصلية خلال 30 يوماً',
    ],
    changes: [
      { type: 'added', text: 'Nursery coverage for children aged 3+' },
      { type: 'modified', text: 'Uniform allowance increased from AED 1,500 to AED 2,000' },
    ],
    linkedBenefitId: 'ben-002',
  },
  {
    id: 'pol-schooling-v2',
    benefitCategory: 'Schooling',
    name: 'Schooling Allowance Policy',
    nameAr: 'سياسة بدل التعليم',
    version: 2,
    status: 'superseded' as const,
    effectiveFrom: '2025-01-01',
    effectiveUntil: '2025-12-31',
    publishedAt: '2024-12-01T10:00:00Z',
    publishedBy: 'HR Director',
    summary: 'Previous version without nursery coverage',
    highlights: [
      'Per child up to 18 years of age',
      'Maximum AED 60,000 per child per year',
      'Covers tuition, registration, and uniforms (up to AED 1,500)',
      'Requires original fee receipts within 30 days',
    ],
    linkedBenefitId: 'ben-002',
  },
  {
    id: 'pol-health-v5',
    benefitCategory: 'Health Insurance',
    name: 'Health Insurance Policy',
    nameAr: 'سياسة التأمين الصحي',
    version: 5,
    status: 'published' as const,
    effectiveFrom: '2026-01-01',
    effectiveUntil: null,
    publishedAt: '2025-12-20T10:00:00Z',
    publishedBy: 'HR Director',
    summary: 'Comprehensive health coverage for employee and dependents',
    highlights: [
      'Covers employee, spouse, and up to 4 children',
      'Includes dental and optical coverage',
      'Pre-approval required for hospital admissions',
      'Annual wellness check covered 100%',
      'Leadership tier: Enhanced mental health coverage',
    ],
    linkedBenefitId: 'ben-003',
  },
] as const;

// ============================================
// EMPLOYEE DEMO DATA (for Employee Portal)
// ============================================

export const DEMO_EMPLOYEE = {
  id: 'emp-hq-023',
  firstName: 'Fatima',
  lastName: 'Al-Hassan',
  email: 'fatima.alhassan@nexaholdings.ae',
  grade: 'B2',
  department: 'Finance',
  position: 'Senior Financial Analyst',
  segment: 'HQ Office',
  monthlySalary: 28000,
  employmentDate: '2021-03-15',
  profileCompleteness: 85,
  missingFields: ['Emergency Contact Phone', 'Bank Certificate'],
  
  benefits: [
    { name: 'Housing Allowance', annualValue: 84000, utilized: 84000, category: 'housing', type: 'guaranteed' },
    { name: 'Schooling Allowance', annualValue: 60000, utilized: 42000, category: 'education', type: 'guaranteed' },
    { name: 'Health Insurance', annualValue: 38000, utilized: 12500, category: 'health', type: 'employer_cost' },
    { name: 'Transport', annualValue: 24000, utilized: 20000, category: 'transport', type: 'guaranteed' },
    { name: 'Wellbeing', annualValue: 6000, utilized: 1800, category: 'wellbeing', type: 'budget' },
    { name: 'Learning & Development', annualValue: 12000, utilized: 0, category: 'learning', type: 'budget' },
  ],
  
  leaveBalances: [
    { type: 'Annual Leave', total: 30, used: 8, remaining: 22 },
    { type: 'Sick Leave', total: 15, used: 2, remaining: 13 },
  ],
  
  pendingRequests: [
    { id: 'req-demo-001', subject: 'Q1 School Fees - GEMS Wellington', status: 'pending', category: 'Schooling' },
  ],
  
  recentActivity: [
    { action: 'Claim Approved', subject: 'Dental Check-up', amount: 450, date: '2026-01-18' },
    { action: 'Claim Submitted', subject: 'Q1 School Fees', amount: 18500, date: '2026-01-19' },
  ],
};

// ============================================
// MARKETPLACE OFFERS (6 active)
// ============================================

export const DEMO_MARKETPLACE_OFFERS = [
  {
    id: 'offer-001',
    title: '30% Off Annual Gym Membership',
    merchant: 'FitLife Wellness',
    category: 'Wellbeing',
    discountPercent: 30,
    originalPrice: 6000,
    discountedPrice: 4200,
    savedAmount: 1800,
    rating: 4.7,
    redemptions: 67,
    validUntil: '2026-03-31',
    isSponsored: true,
    employerContribution: 50, // 50% employer contribution
  },
  {
    id: 'offer-002',
    title: '25% Off Leadership Courses',
    merchant: 'TechLearn Academy',
    category: 'Learning',
    discountPercent: 25,
    originalPrice: 4000,
    discountedPrice: 3000,
    savedAmount: 1000,
    rating: 4.5,
    redemptions: 34,
    validUntil: '2026-04-15',
    isSponsored: true,
    employerContribution: 100,
  },
  {
    id: 'offer-003',
    title: '35% Off Monthly Commute Pass',
    merchant: 'RideShare Corporate',
    category: 'Transport',
    discountPercent: 35,
    originalPrice: 800,
    discountedPrice: 520,
    savedAmount: 280,
    rating: 4.4,
    redemptions: 89,
    validUntil: '2026-12-31',
    isSponsored: false,
    employerContribution: 0,
  },
  {
    id: 'offer-004',
    title: 'Free Trial Week - After School Program',
    merchant: 'Family First Childcare',
    category: 'Family',
    discountPercent: 100,
    originalPrice: 500,
    discountedPrice: 0,
    savedAmount: 500,
    rating: 4.8,
    redemptions: 23,
    validUntil: '2026-02-28',
    isSponsored: true,
    employerContribution: 100,
  },
  {
    id: 'offer-005',
    title: '20% Off Dental Check-ups',
    merchant: 'SmileCare Dental',
    category: 'Health',
    discountPercent: 20,
    originalPrice: 350,
    discountedPrice: 280,
    savedAmount: 70,
    rating: 4.6,
    redemptions: 45,
    validUntil: '2026-06-30',
    isSponsored: false,
    employerContribution: 0,
  },
  {
    id: 'offer-006',
    title: '15% Off Financial Planning Consultation',
    merchant: 'WealthWise Advisors',
    category: 'Financial',
    discountPercent: 15,
    originalPrice: 1200,
    discountedPrice: 1020,
    savedAmount: 180,
    rating: 4.3,
    redemptions: 12,
    validUntil: '2026-05-31',
    isSponsored: true,
    employerContribution: 30,
  },
] as const;

// ============================================
// ADMIN AUDIT LOG ENTRIES (Demo events)
// ============================================

export const DEMO_AUDIT_EVENTS = [
  {
    id: 'audit-001',
    action: 'POLICY_PUBLISHED',
    entityType: 'policy',
    entityId: 'pol-schooling-v3',
    entityName: 'Schooling Allowance Policy v3',
    actor: 'Mariam Al-Suwaidi',
    actorRole: 'HR Director',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    details: { version: 3, changes: ['Added nursery coverage', 'Updated uniform allowance'] },
  },
  {
    id: 'audit-002',
    action: 'CLAIM_APPROVED',
    entityType: 'claim',
    entityId: 'req-demo-010',
    entityName: 'School Uniform & Supplies',
    actor: 'Sara Al-Farsi',
    actorRole: 'HR Ops',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    details: { amount: 1850, category: 'Schooling', employee: 'Aisha Malik' },
  },
  {
    id: 'audit-003',
    action: 'OFFER_ACTIVATED',
    entityType: 'marketplace_offer',
    entityId: 'offer-001',
    entityName: '30% Off Annual Gym Membership',
    actor: 'Ahmed Khalil',
    actorRole: 'Employee',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    details: { vendor: 'FitLife Wellness', savedAmount: 1800 },
  },
  {
    id: 'audit-004',
    action: 'FLAG_TOGGLE',
    entityType: 'feature_flag',
    entityId: 'marketplace_enabled',
    entityName: 'Marketplace',
    actor: 'Platform Admin',
    actorRole: 'Admin',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    details: { organization: 'Nexa Holdings', previousValue: false, newValue: true },
  },
  {
    id: 'audit-005',
    action: 'CLAIM_REJECTED',
    entityType: 'claim',
    entityId: 'req-demo-012',
    entityName: 'Mental Health Counseling Sessions',
    actor: 'Sara Al-Farsi',
    actorRole: 'HR Ops',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    details: { amount: 1200, reason: 'Out-of-network provider', employee: 'Rania Youssef' },
  },
] as const;

// ============================================
// FEATURE FLAGS FOR NEXA HOLDINGS
// ============================================

export const DEMO_FEATURE_FLAGS = {
  marketplace_enabled: true,
  gov_connect_enabled: true,
  advanced_insights_enabled: false, // This one is OFF for demo
  benefits_ai_enabled: true,
  sso_enabled: true,
  mobile_app_enabled: true,
} as const;

// ============================================
// ALERTS FOR DEMO
// ============================================

export const DEMO_ALERTS = [
  {
    id: 'alert-001',
    type: 'claims_sla',
    severity: 'high' as const,
    title: 'Claims SLA Compliance Below Target',
    titleAr: 'امتثال اتفاقية مستوى الخدمة للمطالبات أقل من الهدف',
    message: 'SLA compliance dropped to 87% (target: 95%). 8 urgent claims require attention.',
    messageAr: 'انخفض الامتثال لاتفاقية مستوى الخدمة إلى 87% (الهدف: 95%). 8 مطالبات عاجلة تتطلب الانتباه.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/employer/claims',
    isRead: false,
  },
  {
    id: 'alert-002',
    type: 'security',
    severity: 'critical' as const,
    title: 'Unusual Login Pattern Detected',
    titleAr: 'تم اكتشاف نمط تسجيل دخول غير عادي',
    message: 'Multiple failed login attempts from new IP range for admin account.',
    messageAr: 'محاولات تسجيل دخول فاشلة متعددة من نطاق IP جديد لحساب المسؤول.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/admin/security',
    isRead: false,
  },
  {
    id: 'alert-003',
    type: 'data_quality',
    severity: 'medium' as const,
    title: 'Missing Grade Data for 23 Employees',
    titleAr: 'بيانات الدرجة الوظيفية مفقودة لـ 23 موظفاً',
    message: 'Benefit eligibility calculations may be affected. Update HRIS data.',
    messageAr: 'قد تتأثر حسابات أهلية المزايا. قم بتحديث بيانات نظام الموارد البشرية.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/admin/data-quality',
    isRead: true,
  },
  {
    id: 'alert-004',
    type: 'sync_failure',
    severity: 'high' as const,
    title: 'SFTP Payroll Sync Failed',
    titleAr: 'فشلت مزامنة كشوف المرتبات عبر SFTP',
    message: 'Authentication timeout. Last successful sync: 26 hours ago.',
    messageAr: 'انتهت مهلة المصادقة. آخر مزامنة ناجحة: قبل 26 ساعة.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/admin/sync-monitor',
    isRead: false,
  },
] as const;

// ============================================
// CONNECTOR/SYNC STATUS
// ============================================

export const DEMO_CONNECTORS = [
  {
    id: 'conn-001',
    name: 'Oracle HCM',
    type: 'HRIS',
    status: 'success' as const,
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    recordsSynced: 312,
    recordsFailed: 0,
    coverage: 100,
    nextScheduled: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conn-002',
    name: 'SAP Payroll',
    type: 'Payroll',
    status: 'running' as const,
    lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    recordsSynced: 0,
    recordsFailed: 0,
    coverage: 98,
    progress: 67,
  },
  {
    id: 'conn-003',
    name: 'SFTP Benefits Export',
    type: 'Benefits',
    status: 'failed' as const,
    lastSync: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    recordsSynced: 0,
    recordsFailed: 0,
    coverage: 95,
    errorMessage: 'SFTP authentication timeout after 3 retries',
    errorCode: 'SFTP_AUTH_TIMEOUT',
  },
] as const;

// ============================================
// BILLING/INVOICES (1 overdue, 1 pending)
// ============================================

export const DEMO_INVOICES = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    organizationName: 'Nexa Holdings',
    plan: 'Enterprise',
    period: 'January 2026',
    amount: 24750,
    status: 'overdue' as const,
    dueDate: '2026-01-15',
    daysPastDue: 6,
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-002',
    organizationName: 'Nexa Holdings',
    plan: 'Enterprise',
    period: 'February 2026',
    amount: 24750,
    status: 'pending' as const,
    dueDate: '2026-02-15',
    daysPastDue: 0,
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2025-012',
    organizationName: 'Nexa Holdings',
    plan: 'Enterprise',
    period: 'December 2025',
    amount: 24750,
    status: 'paid' as const,
    dueDate: '2025-12-15',
    paidAt: '2025-12-14',
  },
] as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getDemoClaimsBySLA() {
  const urgent = DEMO_CLAIMS_QUEUE.filter(c => c.slaStatus === 'critical' || c.slaStatus === 'overdue');
  const atRisk = DEMO_CLAIMS_QUEUE.filter(c => c.slaStatus === 'at_risk');
  const onTrack = DEMO_CLAIMS_QUEUE.filter(c => c.slaStatus === 'on_track');
  const completed = DEMO_CLAIMS_QUEUE.filter(c => c.slaStatus === 'completed');
  
  return { urgent, atRisk, onTrack, completed };
}

export function getDemoClaimsByStatus() {
  const pending = DEMO_CLAIMS_QUEUE.filter(c => c.status === 'pending');
  const inReview = DEMO_CLAIMS_QUEUE.filter(c => c.status === 'in_review');
  const needInfo = DEMO_CLAIMS_QUEUE.filter(c => c.status === 'need_info');
  const approved = DEMO_CLAIMS_QUEUE.filter(c => c.status === 'approved');
  const rejected = DEMO_CLAIMS_QUEUE.filter(c => c.status === 'rejected');
  
  return { pending, inReview, needInfo, approved, rejected };
}

export function getDemoEmployeeUtilization() {
  const benefits = DEMO_EMPLOYEE.benefits;
  const total = benefits.reduce((sum, b) => sum + b.annualValue, 0);
  const utilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
  const remaining = total - utilized;
  const percent = Math.round((utilized / total) * 100);
  
  return { total, utilized, remaining, percent };
}

export function getZombieSpendSummary() {
  const total = DEMO_ZOMBIE_OPPORTUNITIES.reduce((sum, z) => sum + z.impact, 0);
  const recoverable = DEMO_ZOMBIE_OPPORTUNITIES.reduce((sum, z) => sum + z.estimatedRecovery, 0);
  const highPriority = DEMO_ZOMBIE_OPPORTUNITIES.filter(z => z.priority === 'high');
  
  return { total, recoverable, highPriority: highPriority.length, opportunities: DEMO_ZOMBIE_OPPORTUNITIES.length };
}
