import { DirectoryEmployee, EmployeeBenefitsSnapshot, EmployeeEntitlement, EmployeeRequest, EmployeeMissingDoc } from './types';
import { addDays, subDays } from 'date-fns';

export const mockEmployees: DirectoryEmployee[] = [
  {
    id: 'emp-001',
    firstName: 'Sarah',
    lastName: 'Ahmed',
    email: 'sarah.ahmed@nexaholdings.ae',
    department: 'Technology',
    location: 'Dubai, UAE',
    grade: 'G5',
    status: 'active',
    openRequestsCount: 2,
    missingDocsCount: 0,
    eligibilityHighlights: ['Health Premium', 'Education'],
    utilizationPercent: 72,
  },
  {
    id: 'emp-002',
    firstName: 'Mohammed',
    lastName: 'Al-Rashid',
    email: 'mohammed.r@nexaholdings.ae',
    department: 'Finance',
    location: 'Abu Dhabi, UAE',
    grade: 'M2',
    status: 'active',
    openRequestsCount: 0,
    missingDocsCount: 1,
    eligibilityHighlights: ['Executive Health', 'Car Allowance', 'Education'],
    utilizationPercent: 88,
  },
  {
    id: 'emp-003',
    firstName: 'Fatima',
    lastName: 'Khan',
    email: 'fatima.k@nexaholdings.ae',
    department: 'Human Resources',
    location: 'Dubai, UAE',
    grade: 'G4',
    status: 'active',
    openRequestsCount: 1,
    missingDocsCount: 0,
    eligibilityHighlights: ['Health Standard', 'Education'],
    utilizationPercent: 65,
  },
  {
    id: 'emp-004',
    firstName: 'Ali',
    lastName: 'Hassan',
    email: 'ali.h@nexaholdings.ae',
    department: 'Operations',
    location: 'Dubai, UAE',
    grade: 'M1',
    status: 'on_leave',
    openRequestsCount: 0,
    missingDocsCount: 0,
    eligibilityHighlights: ['Health Premium', 'Education', 'Housing'],
    utilizationPercent: 45,
  },
  {
    id: 'emp-005',
    firstName: 'Layla',
    lastName: 'Omar',
    email: 'layla.o@nexaholdings.ae',
    department: 'Marketing',
    location: 'Dubai, UAE',
    grade: 'G5',
    status: 'active',
    openRequestsCount: 3,
    missingDocsCount: 2,
    eligibilityHighlights: ['Health Premium', 'Education'],
    utilizationPercent: 82,
  },
  {
    id: 'emp-006',
    firstName: 'Khalid',
    lastName: 'Ibrahim',
    email: 'khalid.i@nexaholdings.ae',
    department: 'Technology',
    location: 'Dubai, UAE',
    grade: 'G3',
    status: 'probation',
    openRequestsCount: 1,
    missingDocsCount: 3,
    eligibilityHighlights: ['Health Standard'],
    utilizationPercent: 12,
  },
  {
    id: 'emp-007',
    firstName: 'Amira',
    lastName: 'Saleh',
    email: 'amira.s@nexaholdings.ae',
    department: 'Legal',
    location: 'Abu Dhabi, UAE',
    grade: 'M2',
    status: 'active',
    openRequestsCount: 0,
    missingDocsCount: 0,
    eligibilityHighlights: ['Executive Health', 'Education', 'Housing'],
    utilizationPercent: 91,
  },
  {
    id: 'emp-008',
    firstName: 'Omar',
    lastName: 'Youssef',
    email: 'omar.y@nexaholdings.ae',
    department: 'Technology',
    location: 'Dubai, UAE',
    grade: 'G2',
    status: 'active',
    openRequestsCount: 0,
    missingDocsCount: 1,
    eligibilityHighlights: ['Health Standard'],
    utilizationPercent: 38,
  },
  {
    id: 'emp-009',
    firstName: 'Nadia',
    lastName: 'Mansour',
    email: 'nadia.m@nexaholdings.ae',
    department: 'Product',
    location: 'Dubai, UAE',
    grade: 'G5',
    status: 'active',
    openRequestsCount: 1,
    missingDocsCount: 0,
    eligibilityHighlights: ['Health Premium', 'Education'],
    utilizationPercent: 67,
  },
  {
    id: 'emp-010',
    firstName: 'Yusuf',
    lastName: 'Al-Farsi',
    email: 'yusuf.f@nexaholdings.ae',
    department: 'Finance',
    location: 'Dubai, UAE',
    grade: 'G3',
    status: 'offboarding',
    openRequestsCount: 0,
    missingDocsCount: 0,
    eligibilityHighlights: ['Health Standard', 'Education'],
    utilizationPercent: 54,
  },
];

// Generate mock snapshot data for an employee
export function getMockBenefitsSnapshot(employee: DirectoryEmployee): EmployeeBenefitsSnapshot {
  const isManager = employee.grade.startsWith('M');
  const gradeLevel = parseInt(employee.grade.replace(/\D/g, '')) || 3;
  
  const baseAllowance = isManager ? 50000 : 20000 + (gradeLevel * 5000);
  
  const entitlements: EmployeeEntitlement[] = [
    {
      id: 'ent-1',
      benefitName: isManager ? 'Executive Health Insurance' : 'Health Insurance',
      category: 'health',
      annualAllowance: isManager ? 45000 : 25000,
      utilized: Math.round((isManager ? 45000 : 25000) * (employee.utilizationPercent / 100) * 0.9),
      remainingBalance: 0,
      utilizationPercent: Math.round(employee.utilizationPercent * 0.9),
      expiresAt: addDays(new Date(), 335),
    },
    {
      id: 'ent-2',
      benefitName: 'Education Allowance',
      category: 'education',
      annualAllowance: baseAllowance,
      utilized: Math.round(baseAllowance * (employee.utilizationPercent / 100)),
      remainingBalance: 0,
      utilizationPercent: employee.utilizationPercent,
      expiresAt: addDays(new Date(), 90),
    },
  ];
  
  // Add more entitlements for managers
  if (isManager) {
    entitlements.push({
      id: 'ent-3',
      benefitName: 'Car Allowance',
      category: 'transport',
      annualAllowance: 36000,
      utilized: 27000,
      remainingBalance: 9000,
      utilizationPercent: 75,
    });
    entitlements.push({
      id: 'ent-4',
      benefitName: 'Housing Allowance',
      category: 'housing',
      annualAllowance: 120000,
      utilized: 90000,
      remainingBalance: 30000,
      utilizationPercent: 75,
    });
  }
  
  // Calculate totals
  entitlements.forEach(e => {
    e.remainingBalance = e.annualAllowance - e.utilized;
  });
  
  const totalAnnualValue = entitlements.reduce((sum, e) => sum + e.annualAllowance, 0);
  const totalUtilized = entitlements.reduce((sum, e) => sum + e.utilized, 0);
  
  // Generate open requests
  const openRequests: EmployeeRequest[] = [];
  if (employee.openRequestsCount > 0) {
    for (let i = 0; i < employee.openRequestsCount; i++) {
      openRequests.push({
        id: `req-${employee.id}-${i}`,
        type: i === 0 ? 'claim' : 'request',
        benefitCategory: i === 0 ? 'Education' : 'Health',
        amountAED: 2500 + (i * 1000),
        status: i === 0 ? 'pending' : 'in_review',
        submittedAt: subDays(new Date(), 2 + i),
        slaStatus: i === 0 ? 'at_risk' : 'on_track',
        missingDocs: i === 0 ? ['Receipt'] : [],
      });
    }
  }
  
  // Generate missing docs
  const missingDocs: EmployeeMissingDoc[] = [];
  if (employee.missingDocsCount > 0) {
    const docTypes = ['Emirates ID', 'Passport Copy', 'Visa Copy', 'Bank Statement'];
    for (let i = 0; i < employee.missingDocsCount; i++) {
      missingDocs.push({
        id: `doc-${employee.id}-${i}`,
        documentType: docTypes[i % docTypes.length],
        requiredFor: i === 0 ? 'Claims Processing' : 'Profile Compliance',
        status: i === 0 ? 'expired' : 'not_uploaded',
        dueDate: i === 0 ? subDays(new Date(), 5) : addDays(new Date(), 14),
      });
    }
  }
  
  return {
    employee,
    entitlements,
    openRequests,
    missingDocs,
    totalAnnualValue,
    totalUtilized,
    overallUtilizationPercent: Math.round((totalUtilized / totalAnnualValue) * 100),
  };
}
