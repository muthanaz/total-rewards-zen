/**
 * Mock Employee Data for Segment Builder
 * 
 * Rich mock data with OBJECTIVE BEHAVIORAL METRICS.
 * No subjective satisfaction surveys - only claim/spend data.
 */

import { MockEmployee, DEPARTMENTS, NATIONALITIES, GRADES, TENURE_OPTIONS } from './types';

const FIRST_NAMES = ['Ahmed', 'Sara', 'Mohammed', 'Fatima', 'John', 'Emily', 'Wei', 'Priya', 'Omar', 'Layla', 'James', 'Aisha', 'David', 'Noor', 'Chen'];
const LAST_NAMES = ['Al-Rashid', 'Khan', 'Smith', 'Williams', 'Li', 'Sharma', 'Abdullah', 'Al-Maktoum', 'Brown', 'Lee', 'Patel', 'O\'Connor', 'Zhang', 'Hassan'];

const BENEFIT_TYPES = ['Housing', 'Schooling', 'Health', 'Transport', 'Flight', 'L&D', 'Wellbeing', 'Equity'];

const EMPLOYEE_NEEDS = [
  'Schooling Allowance Increase',
  'Faster Pre-Approval Process',
  'Housing Policy Clarification',
  'More Provider Options',
  'Transport Allowance Extension',
  'Flexible Benefits Selection',
  'Dependent Coverage Expansion',
  'Remote Work Allowance',
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSalary(grade: string): number {
  const baseSalaries: Record<string, [number, number]> = {
    'Intern': [5000, 8000],
    'G1': [8000, 15000],
    'G2': [15000, 25000],
    'G3': [25000, 40000],
    'G4': [40000, 60000],
    'G5': [60000, 80000],
    'C-Suite': [80000, 150000],
  };
  const range = baseSalaries[grade] || [10000, 30000];
  return randomBetween(range[0], range[1]);
}

function generateBenefitMix(): { name: string; percentage: number }[] {
  const shuffled = [...BENEFIT_TYPES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, randomBetween(3, 5));
  let remaining = 100;
  
  return selected.map((name, index) => {
    const isLast = index === selected.length - 1;
    const percentage = isLast ? remaining : randomBetween(10, Math.min(50, remaining - 10));
    remaining -= percentage;
    return { name, percentage };
  }).sort((a, b) => b.percentage - a.percentage);
}

function generateNeeds(): string[] {
  const shuffled = [...EMPLOYEE_NEEDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, randomBetween(1, 3));
}

// Generate 150 mock employees with objective behavioral data
export const MOCK_EMPLOYEES: MockEmployee[] = Array.from({ length: 150 }, (_, i) => {
  const grade = randomChoice(GRADES);
  const salary = generateSalary(grade);
  
  // Budget allocated based on grade (% of salary for benefits)
  const budgetMultiplier = grade === 'C-Suite' ? 0.40 : 
                           ['G4', 'G5'].includes(grade) ? 0.35 : 0.30;
  const budgetAllocated = Math.round(salary * budgetMultiplier * 12); // Annual
  
  // Adoption: ~70% of employees have made at least 1 claim
  const hasMadeClaim = Math.random() < 0.70;
  const claimCount = hasMadeClaim ? randomBetween(1, 12) : 0;
  
  // Amount spent varies - some heavy users, some light
  const spendRate = hasMadeClaim 
    ? Math.random() < 0.3 ? randomBetween(80, 98) : randomBetween(20, 75) // 30% heavy users
    : 0;
  const amountSpent = Math.round(budgetAllocated * (spendRate / 100));
  
  return {
    id: `emp-${i + 1}`,
    name: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
    department: randomChoice(DEPARTMENTS),
    nationality: randomChoice(NATIONALITIES),
    grade,
    salary,
    tenure: randomChoice(TENURE_OPTIONS).value,
    // Objective behavioral data
    budgetAllocated,
    amountSpent,
    hasMadeClaim,
    claimCount,
    topBenefits: generateBenefitMix(),
    topNeeds: generateNeeds(),
  };
});

// AI Watchlist segments (pre-defined smart segments)
export const AI_WATCHLIST_SEGMENTS = [
  {
    id: 'low-adoption',
    name: 'Low Adoption',
    description: 'Eligible employees not claiming benefits',
    icon: 'AlertTriangle',
    filters: {
      departments: [],
      nationalities: [],
      grades: [],
      salaryRange: [5000, 100000] as [number, number],
      tenure: null,
    },
    isAI: true,
    behavioralGap: 'low-engagement' as const,
  },
  {
    id: 'high-potentials',
    name: 'High Potentials',
    description: 'Rising stars to retain',
    icon: 'Star',
    filters: {
      departments: [],
      nationalities: [],
      grades: ['G2', 'G3'],
      salaryRange: [15000, 40000] as [number, number],
      tenure: '1-3',
    },
    isAI: true,
    behavioralGap: 'balanced' as const,
  },
  {
    id: 'new-joiners',
    name: 'New Joiners',
    description: 'Employees in first year',
    icon: 'UserPlus',
    filters: {
      departments: [],
      nationalities: [],
      grades: [],
      salaryRange: [5000, 100000] as [number, number],
      tenure: '<1',
    },
    isAI: true,
    behavioralGap: 'low-engagement' as const,
  },
  {
    id: 'heavy-users',
    name: 'Heavy Users',
    description: 'High budget utilization',
    icon: 'TrendingUp',
    filters: {
      departments: [],
      nationalities: [],
      grades: ['G4', 'G5', 'C-Suite'],
      salaryRange: [40000, 100000] as [number, number],
      tenure: null,
    },
    isAI: true,
    behavioralGap: 'concentrated-spend' as const,
  },
];
