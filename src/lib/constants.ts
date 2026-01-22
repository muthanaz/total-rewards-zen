/**
 * Constants - Re-exports canonical labels from taxonomy.ts
 * 
 * NOTE: taxonomy.ts is the single source of truth for benefit taxonomy.
 * These exports maintain backward compatibility.
 */

import { 
  BENEFIT_TYPE_LABELS_SIMPLE,
  LIFE_AREA_LABELS_SIMPLE,
  LEGACY_DB_LIFE_AREA_LABELS,
} from '@/lib/taxonomy';

/**
 * Benefit Type Labels (Pillar labels)
 * @see taxonomy.ts BENEFIT_PILLAR_METADATA for full metadata
 */
export const BENEFIT_TYPE_LABELS: Record<string, string> = BENEFIT_TYPE_LABELS_SIMPLE;

/**
 * Life Area Labels - Canonical labels
 * For legacy DB enum labels, use LEGACY_DB_LIFE_AREA_LABELS
 * @see taxonomy.ts LIFE_AREA_METADATA for full metadata
 */
export const LIFE_AREA_LABELS: Record<string, string> = {
  ...LIFE_AREA_LABELS_SIMPLE,
  // Include legacy DB enum values for backward compatibility
  ...LEGACY_DB_LIFE_AREA_LABELS,
};

export const BENEFIT_TYPE_COLORS: Record<string, string> = {
  cash_allowances: 'tag-cash',
  health_protection: 'tag-health',
  time_off_flex: 'tag-time',
  growth_career: 'tag-growth',
  wealth_ownership: 'tag-wealth',
  wellbeing: 'tag-wellbeing',
};

export const MARKETPLACE_CATEGORIES = [
  'Everyday Essentials',
  'Food & Coffee',
  'Health & Fitness',
  'Family & Parenting',
  'Learning & Skills',
  'Home & Living',
  'Mobility',
  'Lifestyle & Shopping',
  'Travel & Experiences',
];

export const DOCUMENT_TYPES = [
  { id: 'salary_certificate_bank', name: 'Salary Certificate (Bank)', description: 'For financial institution applications' },
  { id: 'salary_certificate_embassy', name: 'Salary Certificate (Embassy)', description: 'For visa and consular applications' },
  { id: 'salary_certificate_landlord', name: 'Salary Certificate (Landlord)', description: 'For tenancy agreements' },
  { id: 'employment_letter', name: 'Employment Verification Letter', description: 'Confirms employment status' },
  { id: 'noc_letter', name: 'No Objection Certificate', description: 'For various administrative purposes' },
  { id: 'leave_statement', name: 'Leave Entitlement Statement', description: 'Current leave accrual and balance' },
  { id: 'insurance_confirmation', name: 'Insurance Coverage Confirmation', description: 'Medical insurance details' },
  { id: 'dependent_letter', name: 'Dependent Support Letter', description: 'For dependent visa sponsorship' },
  { id: 'experience_letter', name: 'Experience Certificate', description: 'For external applications' },
  { id: 'service_letter', name: 'Service Continuity Letter', description: 'For continuous service verification' },
];

export const GOV_CONNECT_CATEGORIES = [
  {
    id: 'identity',
    name: 'Identity & Immigration',
    description: 'Manage your identity documents and residency',
    links: [
      { name: 'UAE Pass', url: 'https://uaepass.ae', description: 'Digital identity platform' },
      { name: 'ICP Portal', url: 'https://icp.gov.ae', description: 'Immigration services' },
    ],
  },
  {
    id: 'employment',
    name: 'Employment & HR',
    description: 'Labour and employment services',
    links: [
      { name: 'MOHRE', url: 'https://mohre.gov.ae', description: 'Ministry of Human Resources' },
      { name: 'FAHR', url: 'https://fahr.gov.ae', description: 'Federal Authority for HR' },
    ],
  },
  {
    id: 'local',
    name: 'Local Services',
    description: 'City and utility services',
    links: [
      { name: 'TAMM', url: 'https://tamm.abudhabi', description: 'Abu Dhabi Government' },
      { name: 'Dubai Police', url: 'https://www.dubaipolice.gov.ae', description: 'Security services' },
      { name: 'DEWA', url: 'https://www.dewa.gov.ae', description: 'Electricity & Water' },
    ],
  },
  {
    id: 'health',
    name: 'Health Authorities',
    description: 'Healthcare and medical services',
    links: [
      { name: 'DHA', url: 'https://www.dha.gov.ae', description: 'Dubai Health Authority' },
      { name: 'DOH', url: 'https://www.doh.gov.ae', description: 'Abu Dhabi Health' },
    ],
  },
  {
    id: 'telecom',
    name: 'Telecom Services',
    description: 'Mobile and internet providers',
    links: [
      { name: 'Etisalat', url: 'https://www.etisalat.ae', description: 'Telecom provider' },
      { name: 'du', url: 'https://www.du.ae', description: 'Telecom provider' },
    ],
  },
];

export const LEAVE_TYPES = [
  { id: 'annual', name: 'Annual Leave', color: 'bg-blue-500' },
  { id: 'sick', name: 'Sick Leave', color: 'bg-rose-500' },
  { id: 'personal', name: 'Personal Leave', color: 'bg-purple-500' },
  { id: 'maternity', name: 'Maternity Leave', color: 'bg-pink-500' },
  { id: 'paternity', name: 'Paternity Leave', color: 'bg-cyan-500' },
  { id: 'compassionate', name: 'Compassionate Leave', color: 'bg-amber-500' },
];