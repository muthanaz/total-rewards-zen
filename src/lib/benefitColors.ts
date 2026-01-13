// =============================================================================
// BENEFIT COLOR SYSTEM - SINGLE SOURCE OF TRUTH
// =============================================================================
// Psychology-based color palette for employee benefits
// Modern, accessible, and consistent across all pages
//
// Color Psychology Applied:
// - Housing (Sky Blue): Trust, stability, home security
// - Education (Violet): Wisdom, creativity, knowledge
// - Health (Rose): Care, compassion, vitality  
// - Transport (Amber): Energy, movement, warmth
// - Wellbeing (Teal): Balance, calm, renewal
// - Financial (Emerald): Growth, prosperity, security
// - Learning (Indigo): Depth, focus, intellect
// - Bonus (Orange): Enthusiasm, success, reward
// - Equity (Purple): Premium, ownership, value
// - Leave (Cyan): Freedom, clarity, rest

import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, TrendingUp, Award, Calendar, LucideIcon
} from 'lucide-react';

// =============================================================================
// CORE BENEFIT COLORS
// =============================================================================

export interface BenefitColorConfig {
  key: string;
  label: string;
  labelAr: string;
  // Primary color in HSL format
  hsl: string;
  // Chart color (CSS hsl() value)
  chartColor: string;
  // Tailwind utility classes
  bg: string;           // Solid background
  bgLight: string;      // Light/transparent background
  text: string;         // Text color (light mode)
  textDark: string;     // Text color (dark mode)  
  border: string;       // Border color
  gradient: string;     // Gradient classes
  ring: string;         // Focus ring
  // Associated icon
  icon: LucideIcon;
  // Route path
  route: string;
}

export const BENEFIT_COLORS: Record<string, BenefitColorConfig> = {
  housing: {
    key: 'housing',
    label: 'Housing',
    labelAr: 'السكن',
    hsl: '200 85% 55%',
    chartColor: 'hsl(200, 85%, 55%)',
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-500/10',
    text: 'text-sky-600',
    textDark: 'text-sky-400',
    border: 'border-sky-500/25',
    gradient: 'from-sky-400 to-sky-600',
    ring: 'ring-sky-500/30',
    icon: Home,
    route: '/employee/housing',
  },
  education: {
    key: 'education',
    label: 'Education',
    labelAr: 'التعليم',
    hsl: '265 70% 58%',
    chartColor: 'hsl(265, 70%, 58%)',
    bg: 'bg-violet-500',
    bgLight: 'bg-violet-500/10',
    text: 'text-violet-600',
    textDark: 'text-violet-400',
    border: 'border-violet-500/25',
    gradient: 'from-violet-400 to-violet-600',
    ring: 'ring-violet-500/30',
    icon: GraduationCap,
    route: '/employee/schooling',
  },
  health: {
    key: 'health',
    label: 'Health',
    labelAr: 'الصحة',
    hsl: '345 75% 55%',
    chartColor: 'hsl(345, 75%, 55%)',
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-500/10',
    text: 'text-rose-600',
    textDark: 'text-rose-400',
    border: 'border-rose-500/25',
    gradient: 'from-rose-400 to-rose-600',
    ring: 'ring-rose-500/30',
    icon: Heart,
    route: '/employee/health',
  },
  transport: {
    key: 'transport',
    label: 'Transport',
    labelAr: 'النقل',
    hsl: '38 92% 52%',
    chartColor: 'hsl(38, 92%, 52%)',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    text: 'text-amber-600',
    textDark: 'text-amber-400',
    border: 'border-amber-500/25',
    gradient: 'from-amber-400 to-amber-600',
    ring: 'ring-amber-500/30',
    icon: Car,
    route: '/employee/transport',
  },
  wellbeing: {
    key: 'wellbeing',
    label: 'Wellbeing',
    labelAr: 'الرفاهية',
    hsl: '172 66% 42%',
    chartColor: 'hsl(172, 66%, 42%)',
    bg: 'bg-teal-500',
    bgLight: 'bg-teal-500/10',
    text: 'text-teal-600',
    textDark: 'text-teal-400',
    border: 'border-teal-500/25',
    gradient: 'from-teal-400 to-teal-600',
    ring: 'ring-teal-500/30',
    icon: Dumbbell,
    route: '/employee/wellbeing',
  },
  financial: {
    key: 'financial',
    label: 'Financial',
    labelAr: 'المالية',
    hsl: '152 70% 42%',
    chartColor: 'hsl(152, 70%, 42%)',
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    textDark: 'text-emerald-400',
    border: 'border-emerald-500/25',
    gradient: 'from-emerald-400 to-emerald-600',
    ring: 'ring-emerald-500/30',
    icon: PiggyBank,
    route: '/employee/financial',
  },
  learning: {
    key: 'learning',
    label: 'Learning',
    labelAr: 'التعلم',
    hsl: '230 70% 58%',
    chartColor: 'hsl(230, 70%, 58%)',
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-500/10',
    text: 'text-indigo-600',
    textDark: 'text-indigo-400',
    border: 'border-indigo-500/25',
    gradient: 'from-indigo-400 to-indigo-600',
    ring: 'ring-indigo-500/30',
    icon: BookOpen,
    route: '/employee/learning',
  },
  rewards: {
    key: 'rewards',
    label: 'Bonus',
    labelAr: 'المكافأة',
    hsl: '28 90% 52%',
    chartColor: 'hsl(28, 90%, 52%)',
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-500/10',
    text: 'text-orange-600',
    textDark: 'text-orange-400',
    border: 'border-orange-500/25',
    gradient: 'from-orange-400 to-orange-600',
    ring: 'ring-orange-500/30',
    icon: Award,
    route: '/employee/bonus',
  },
  equity: {
    key: 'equity',
    label: 'Equity',
    labelAr: 'الأسهم',
    hsl: '280 65% 55%',
    chartColor: 'hsl(280, 65%, 55%)',
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-500/10',
    text: 'text-purple-600',
    textDark: 'text-purple-400',
    border: 'border-purple-500/25',
    gradient: 'from-purple-400 to-purple-600',
    ring: 'ring-purple-500/30',
    icon: TrendingUp,
    route: '/employee/equity',
  },
  timeoff: {
    key: 'timeoff',
    label: 'Leave',
    labelAr: 'الإجازات',
    hsl: '188 85% 45%',
    chartColor: 'hsl(188, 85%, 45%)',
    bg: 'bg-cyan-500',
    bgLight: 'bg-cyan-500/10',
    text: 'text-cyan-600',
    textDark: 'text-cyan-400',
    border: 'border-cyan-500/25',
    gradient: 'from-cyan-400 to-cyan-600',
    ring: 'ring-cyan-500/30',
    icon: Calendar,
    route: '/employee/leave',
  },
};

// =============================================================================
// RAG (Red-Amber-Green) UTILIZATION SYSTEM
// =============================================================================
// Used ONLY for utilization status indicators
// Kept separate from benefit colors - never mix!

export type RAGStatus = 'green' | 'amber' | 'red';

export interface RAGConfig {
  status: RAGStatus;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  // Styling
  bgClass: string;
  textClass: string;
  borderClass: string;
  progressClass: string;
  dotClass: string;
  icon: 'check' | 'clock' | 'alert';
}

export const RAG_THRESHOLDS = {
  green: 70,   // 70%+ = On Track
  amber: 30,   // 30-69% = Needs Attention
  red: 0,      // <30% = Underutilized
};

export const RAG_CONFIG: Record<RAGStatus, RAGConfig> = {
  green: {
    status: 'green',
    label: 'On Track',
    labelAr: 'على المسار',
    description: '70%+ utilized',
    descriptionAr: '٧٠٪+ مستخدم',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30',
    progressClass: '[&>div]:bg-emerald-500',
    dotClass: 'bg-emerald-500',
    icon: 'check',
  },
  amber: {
    status: 'amber',
    label: 'Needs Attention',
    labelAr: 'يحتاج اهتماماً',
    description: '30-69% utilized',
    descriptionAr: '٣٠-٦٩٪ مستخدم',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/30',
    progressClass: '[&>div]:bg-amber-500',
    dotClass: 'bg-amber-500',
    icon: 'clock',
  },
  red: {
    status: 'red',
    label: 'Underutilized',
    labelAr: 'غير مستغل',
    description: '<30% utilized',
    descriptionAr: '<٣٠٪ مستخدم',
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/30',
    progressClass: '[&>div]:bg-rose-500',
    dotClass: 'bg-rose-500',
    icon: 'alert',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export type BenefitKey = keyof typeof BENEFIT_COLORS;

// Alias map for flexible lookups
const BENEFIT_ALIASES: Record<string, BenefitKey> = {
  // Housing
  housing: 'housing',
  housingallowance: 'housing',
  'housing allowance': 'housing',
  // Education
  education: 'education',
  educationallowance: 'education',
  'education allowance': 'education',
  schooling: 'education',
  // Health
  health: 'health',
  healthinsurance: 'health',
  'health insurance': 'health',
  // Transport
  transport: 'transport',
  transportmobility: 'transport',
  'transport & mobility': 'transport',
  mobility: 'transport',
  // Wellbeing
  wellbeing: 'wellbeing',
  wellbeingprogram: 'wellbeing',
  'wellbeing program': 'wellbeing',
  // Financial
  financial: 'financial',
  financialplanning: 'financial',
  'financial planning': 'financial',
  savingsplan: 'financial',
  'savings plan': 'financial',
  // Learning
  learning: 'learning',
  learningdevelopment: 'learning',
  'learning & development': 'learning',
  // Rewards/Bonus
  rewards: 'rewards',
  bonus: 'rewards',
  annualbonus: 'rewards',
  'annual bonus': 'rewards',
  // Equity
  equity: 'equity',
  equityoptions: 'equity',
  'equity & options': 'equity',
  // Time off/Leave
  timeoff: 'timeoff',
  leave: 'timeoff',
  leavemanagement: 'timeoff',
  'leave management': 'timeoff',
};

/**
 * Get benefit color config by name/key
 * Handles various input formats flexibly
 */
export function getBenefitColor(nameOrKey: string): BenefitColorConfig {
  const normalized = nameOrKey.toLowerCase().replace(/[^a-z\s&]/g, '').trim();
  const key = BENEFIT_ALIASES[normalized] || BENEFIT_ALIASES[normalized.replace(/\s+/g, '')];
  
  if (key && BENEFIT_COLORS[key]) {
    return BENEFIT_COLORS[key];
  }
  
  // Default fallback
  return BENEFIT_COLORS.wellbeing;
}

/**
 * Get RAG status from utilization percentage
 */
export function getRAGStatus(utilizationPercent: number): RAGStatus {
  if (utilizationPercent >= RAG_THRESHOLDS.green) return 'green';
  if (utilizationPercent >= RAG_THRESHOLDS.amber) return 'amber';
  return 'red';
}

/**
 * Get full RAG config from utilization percentage
 */
export function getRAGIndicator(utilizationPercent: number): RAGConfig {
  return RAG_CONFIG[getRAGStatus(utilizationPercent)];
}

/**
 * Get progress bar color class based on utilization
 */
export function getProgressColorClass(utilizationPercent: number): string {
  return getRAGIndicator(utilizationPercent).progressClass;
}

/**
 * Get all benefit chart colors as array
 */
export function getBenefitChartColors(): { name: string; color: string }[] {
  return Object.values(BENEFIT_COLORS).map(b => ({
    name: b.label,
    color: b.chartColor,
  }));
}

/**
 * Get chart color array for Recharts
 */
export function getChartColorArray(): string[] {
  return Object.values(BENEFIT_COLORS).map(b => b.chartColor);
}

/**
 * Get sidebar icon color class for route
 */
export function getSidebarIconColor(path: string): string {
  const benefit = Object.values(BENEFIT_COLORS).find(b => b.route === path);
  if (benefit) {
    return `${benefit.text} dark:${benefit.textDark}`;
  }
  return 'text-sidebar-foreground/70';
}
