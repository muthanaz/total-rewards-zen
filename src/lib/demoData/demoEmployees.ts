/**
 * Demo Employees - 30 employees across 4 departments and 3 grades
 * 
 * Realistic UAE workforce composition with varied:
 * - Nationalities (UAE, Arab, Asian, Western)
 * - Grades (L3, L4, L5, L6)
 * - Dependents (for schooling eligibility)
 * - Tenure (for utilization patterns)
 */

import { DEMO_DEPARTMENTS, DEMO_GRADES, DEMO_BENEFIT_CATEGORIES, getCategoryCap } from './demoOrganization';

export interface DemoEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  department: string;
  grade: string;
  monthlySalary: number;
  nationality: string;
  joinDate: string; // ISO date
  hasDependents: boolean;
  dependentCount: number;
  status: 'active' | 'probation' | 'notice';
}

export interface DemoEntitlement {
  employeeId: string;
  categoryId: string;
  category: string;
  annualCap: number;
  utilized: number;
  pending: number;
  remaining: number;
}

// Fixed seed for consistent data
const EMPLOYEE_DATA: Omit<DemoEmployee, 'email'>[] = [
  // Engineering (10 employees)
  { id: 'emp-001', employeeCode: 'NX-1001', firstName: 'Ahmed', lastName: 'Al Rashid', departmentId: 'dept-eng', department: 'Engineering', grade: 'L5', monthlySalary: 32000, nationality: 'UAE', joinDate: '2022-03-15', hasDependents: true, dependentCount: 2, status: 'active' },
  { id: 'emp-002', employeeCode: 'NX-1002', firstName: 'Priya', lastName: 'Sharma', departmentId: 'dept-eng', department: 'Engineering', grade: 'L4', monthlySalary: 22000, nationality: 'Indian', joinDate: '2023-06-01', hasDependents: true, dependentCount: 1, status: 'active' },
  { id: 'emp-003', employeeCode: 'NX-1003', firstName: 'Chen', lastName: 'Wei', departmentId: 'dept-eng', department: 'Engineering', grade: 'L4', monthlySalary: 24000, nationality: 'Chinese', joinDate: '2023-01-10', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-004', employeeCode: 'NX-1004', firstName: 'Sara', lastName: 'Hassan', departmentId: 'dept-eng', department: 'Engineering', grade: 'L3', monthlySalary: 15000, nationality: 'Egyptian', joinDate: '2024-02-01', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-005', employeeCode: 'NX-1005', firstName: 'James', lastName: 'Wilson', departmentId: 'dept-eng', department: 'Engineering', grade: 'L6', monthlySalary: 55000, nationality: 'British', joinDate: '2021-08-01', hasDependents: true, dependentCount: 3, status: 'active' },
  { id: 'emp-006', employeeCode: 'NX-1006', firstName: 'Fatima', lastName: 'Khan', departmentId: 'dept-eng', department: 'Engineering', grade: 'L4', monthlySalary: 21000, nationality: 'Pakistani', joinDate: '2023-09-15', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-007', employeeCode: 'NX-1007', firstName: 'Omar', lastName: 'Saeed', departmentId: 'dept-eng', department: 'Engineering', grade: 'L3', monthlySalary: 14000, nationality: 'Jordanian', joinDate: '2024-06-01', hasDependents: false, dependentCount: 0, status: 'probation' },
  { id: 'emp-008', employeeCode: 'NX-1008', firstName: 'Raj', lastName: 'Patel', departmentId: 'dept-eng', department: 'Engineering', grade: 'L5', monthlySalary: 35000, nationality: 'Indian', joinDate: '2022-01-15', hasDependents: true, dependentCount: 2, status: 'active' },
  { id: 'emp-009', employeeCode: 'NX-1009', firstName: 'Maria', lastName: 'Santos', departmentId: 'dept-eng', department: 'Engineering', grade: 'L4', monthlySalary: 23000, nationality: 'Filipino', joinDate: '2023-04-01', hasDependents: true, dependentCount: 1, status: 'active' },
  { id: 'emp-010', employeeCode: 'NX-1010', firstName: 'Yusuf', lastName: 'Al Maktoum', departmentId: 'dept-eng', department: 'Engineering', grade: 'L3', monthlySalary: 16000, nationality: 'UAE', joinDate: '2024-01-15', hasDependents: false, dependentCount: 0, status: 'active' },

  // Sales & Marketing (8 employees)
  { id: 'emp-011', employeeCode: 'NX-2001', firstName: 'Layla', lastName: 'Mohammed', departmentId: 'dept-sales', department: 'Sales & Marketing', grade: 'L5', monthlySalary: 38000, nationality: 'UAE', joinDate: '2021-06-01', hasDependents: true, dependentCount: 2, status: 'active' },
  { id: 'emp-012', employeeCode: 'NX-2002', firstName: 'Michael', lastName: 'Chen', departmentId: 'dept-sales', department: 'Sales & Marketing', grade: 'L4', monthlySalary: 25000, nationality: 'Australian', joinDate: '2022-11-01', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-013', employeeCode: 'NX-2003', firstName: 'Nadia', lastName: 'Mahmoud', departmentId: 'dept-sales', department: 'Sales & Marketing', grade: 'L4', monthlySalary: 24000, nationality: 'Lebanese', joinDate: '2023-03-15', hasDependents: true, dependentCount: 1, status: 'active' },
  { id: 'emp-014', employeeCode: 'NX-2004', firstName: 'David', lastName: 'Brown', departmentId: 'dept-sales', department: 'Sales & Marketing', grade: 'L3', monthlySalary: 17000, nationality: 'American', joinDate: '2024-03-01', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-015', employeeCode: 'NX-2005', firstName: 'Aisha', lastName: 'Qasim', departmentId: 'dept-sales', department: 'Sales & Marketing', grade: 'L6', monthlySalary: 52000, nationality: 'UAE', joinDate: '2020-09-01', hasDependents: true, dependentCount: 2, status: 'active' },
  { id: 'emp-016', employeeCode: 'NX-2006', firstName: 'Hassan', lastName: 'Ali', departmentId: 'dept-sales', department: 'Sales & Marketing', grade: 'L3', monthlySalary: 15000, nationality: 'Syrian', joinDate: '2024-05-15', hasDependents: false, dependentCount: 0, status: 'probation' },
  { id: 'emp-017', employeeCode: 'NX-2007', firstName: 'Emma', lastName: 'Johnson', departmentId: 'dept-sales', department: 'Sales & Marketing', grade: 'L4', monthlySalary: 26000, nationality: 'British', joinDate: '2023-07-01', hasDependents: true, dependentCount: 1, status: 'active' },
  { id: 'emp-018', employeeCode: 'NX-2008', firstName: 'Tariq', lastName: 'Abbas', departmentId: 'dept-sales', department: 'Sales & Marketing', grade: 'L4', monthlySalary: 23000, nationality: 'Saudi', joinDate: '2023-02-01', hasDependents: false, dependentCount: 0, status: 'active' },

  // Operations (7 employees)
  { id: 'emp-019', employeeCode: 'NX-3001', firstName: 'Khalid', lastName: 'Ibrahim', departmentId: 'dept-ops', department: 'Operations', grade: 'L5', monthlySalary: 30000, nationality: 'Egyptian', joinDate: '2022-05-01', hasDependents: true, dependentCount: 2, status: 'active' },
  { id: 'emp-020', employeeCode: 'NX-3002', firstName: 'Sana', lastName: 'Fares', departmentId: 'dept-ops', department: 'Operations', grade: 'L4', monthlySalary: 22000, nationality: 'Jordanian', joinDate: '2023-08-15', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-021', employeeCode: 'NX-3003', firstName: 'Ali', lastName: 'Nour', departmentId: 'dept-ops', department: 'Operations', grade: 'L3', monthlySalary: 14000, nationality: 'Yemeni', joinDate: '2024-04-01', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-022', employeeCode: 'NX-3004', firstName: 'Hala', lastName: 'Rashid', departmentId: 'dept-ops', department: 'Operations', grade: 'L4', monthlySalary: 24000, nationality: 'Iraqi', joinDate: '2023-05-01', hasDependents: true, dependentCount: 1, status: 'active' },
  { id: 'emp-023', employeeCode: 'NX-3005', firstName: 'John', lastName: 'Smith', departmentId: 'dept-ops', department: 'Operations', grade: 'L3', monthlySalary: 16000, nationality: 'South African', joinDate: '2024-02-15', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-024', employeeCode: 'NX-3006', firstName: 'Rania', lastName: 'Al Suwaidi', departmentId: 'dept-ops', department: 'Operations', grade: 'L5', monthlySalary: 33000, nationality: 'UAE', joinDate: '2021-11-01', hasDependents: true, dependentCount: 3, status: 'active' },
  { id: 'emp-025', employeeCode: 'NX-3007', firstName: 'Maryam', lastName: 'Khalil', departmentId: 'dept-ops', department: 'Operations', grade: 'L4', monthlySalary: 21000, nationality: 'Omani', joinDate: '2023-10-01', hasDependents: false, dependentCount: 0, status: 'active' },

  // Corporate Services (5 employees)
  { id: 'emp-026', employeeCode: 'NX-4001', firstName: 'Mohammed', lastName: 'Al Farsi', departmentId: 'dept-corp', department: 'Corporate Services', grade: 'L6', monthlySalary: 58000, nationality: 'UAE', joinDate: '2020-01-15', hasDependents: true, dependentCount: 2, status: 'active' },
  { id: 'emp-027', employeeCode: 'NX-4002', firstName: 'Dana', lastName: 'Khoury', departmentId: 'dept-corp', department: 'Corporate Services', grade: 'L5', monthlySalary: 36000, nationality: 'Lebanese', joinDate: '2022-07-01', hasDependents: true, dependentCount: 1, status: 'active' },
  { id: 'emp-028', employeeCode: 'NX-4003', firstName: 'Leila', lastName: 'Ahmed', departmentId: 'dept-corp', department: 'Corporate Services', grade: 'L4', monthlySalary: 25000, nationality: 'Egyptian', joinDate: '2023-01-15', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-029', employeeCode: 'NX-4004', firstName: 'Sami', lastName: 'Hassan', departmentId: 'dept-corp', department: 'Corporate Services', grade: 'L3', monthlySalary: 15000, nationality: 'Bahraini', joinDate: '2024-01-01', hasDependents: false, dependentCount: 0, status: 'active' },
  { id: 'emp-030', employeeCode: 'NX-4005', firstName: 'Amina', lastName: 'Rashid', departmentId: 'dept-corp', department: 'Corporate Services', grade: 'L4', monthlySalary: 23000, nationality: 'Moroccan', joinDate: '2023-06-15', hasDependents: true, dependentCount: 2, status: 'active' },
];

// Generate employees with email
export const DEMO_EMPLOYEES: DemoEmployee[] = EMPLOYEE_DATA.map(emp => ({
  ...emp,
  email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@nexaholdings.ae`,
}));

// ============================================================
// ENTITLEMENTS COMPUTATION
// ============================================================

function computeEntitlements(): DemoEntitlement[] {
  const entitlements: DemoEntitlement[] = [];
  
  for (const emp of DEMO_EMPLOYEES) {
    for (const cat of DEMO_BENEFIT_CATEGORIES) {
      // Check eligibility
      if (!cat.eligibleGrades.includes(emp.grade)) continue;
      if (cat.requiresDependents && !emp.hasDependents) continue;
      
      const annualCap = getCategoryCap(cat.id, emp.grade);
      
      // Schooling: multiply by dependent count
      const adjustedCap = cat.id === 'schooling' 
        ? annualCap * emp.dependentCount 
        : annualCap;
      
      // Initial: all remaining (no claims yet)
      entitlements.push({
        employeeId: emp.id,
        categoryId: cat.id,
        category: cat.name,
        annualCap: adjustedCap,
        utilized: 0,
        pending: 0,
        remaining: adjustedCap,
      });
    }
  }
  
  return entitlements;
}

export const DEMO_ENTITLEMENTS: DemoEntitlement[] = computeEntitlements();

// ============================================================
// AGGREGATED TOTALS
// ============================================================

export function getTotalEntitlements(): number {
  return DEMO_ENTITLEMENTS.reduce((sum, e) => sum + e.annualCap, 0);
}

export function getEntitlementsByCategory(): Record<string, number> {
  const byCategory: Record<string, number> = {};
  for (const e of DEMO_ENTITLEMENTS) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.annualCap;
  }
  return byCategory;
}

// Get employees with dependents (for schooling)
export function getEmployeesWithDependents(): DemoEmployee[] {
  return DEMO_EMPLOYEES.filter(e => e.hasDependents);
}

// Summary stats
export const EMPLOYEE_STATS = {
  total: DEMO_EMPLOYEES.length,
  byDepartment: DEMO_DEPARTMENTS.map(d => ({
    ...d,
    count: DEMO_EMPLOYEES.filter(e => e.departmentId === d.id).length,
  })),
  byGrade: DEMO_GRADES.map(g => ({
    ...g,
    count: DEMO_EMPLOYEES.filter(e => e.grade === g.id).length,
  })),
  withDependents: DEMO_EMPLOYEES.filter(e => e.hasDependents).length,
  onProbation: DEMO_EMPLOYEES.filter(e => e.status === 'probation').length,
};
