// =============================================================================
// BENEFIT COLOR SYSTEM - UNIFIED PLATFORM THEME
// =============================================================================
// Uses platform's Navy + Teal theme with harmonious accent colors
// Simple, modern, easy on the eye - consistent across all pages

import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, TrendingUp, Award, Calendar, LucideIcon
} from 'lucide-react';

// =============================================================================
// CORE BENEFIT COLORS - Platform Unified Palette
// =============================================================================
// All benefits use variations of the platform's teal-based color scheme
// This creates visual harmony while maintaining category distinction

export interface BenefitColorConfig {
  key: string;
  label: string;
  labelAr: string;
  // Primary color in HSL format
  hsl: string;
  // Chart color (CSS hsl() value) - UNIFIED for charts
  chartColor: string;
  // Tailwind utility classes
  bg: string;
  bgLight: string;
  text: string;
  textDark: string;
  border: string;
  gradient: string;
  ring: string;
  // Associated icon
  icon: LucideIcon;
  // Route path
  route: string;
}

// Platform theme colors (from index.css)
// Accent: 174 60% 45% (Teal)
// Chart colors use platform accent variations

export const BENEFIT_COLORS: Record<string, BenefitColorConfig> = {
  housing: {
    key: 'housing',
    label: 'Housing',
    labelAr: 'السكن',
    hsl: '174 60% 45%',
    chartColor: 'hsl(174, 60%, 45%)', // Platform teal
    bg: 'bg-accent',
    bgLight: 'bg-accent/10',
    text: 'text-accent',
    textDark: 'text-accent',
    border: 'border-accent/25',
    gradient: 'from-accent to-accent/80',
    ring: 'ring-accent/30',
    icon: Home,
    route: '/employee/housing',
  },
  education: {
    key: 'education',
    label: 'Education',
    labelAr: 'التعليم',
    hsl: '199 89% 48%',
    chartColor: 'hsl(199, 89%, 48%)', // Sky blue
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-500/10',
    text: 'text-sky-600',
    textDark: 'text-sky-400',
    border: 'border-sky-500/25',
    gradient: 'from-sky-400 to-sky-600',
    ring: 'ring-sky-500/30',
    icon: GraduationCap,
    route: '/employee/schooling',
  },
  health: {
    key: 'health',
    label: 'Health',
    labelAr: 'الصحة',
    hsl: '174 55% 40%',
    chartColor: 'hsl(174, 55%, 40%)', // Deep teal
    bg: 'bg-teal-600',
    bgLight: 'bg-teal-600/10',
    text: 'text-teal-600',
    textDark: 'text-teal-400',
    border: 'border-teal-600/25',
    gradient: 'from-teal-500 to-teal-700',
    ring: 'ring-teal-600/30',
    icon: Heart,
    route: '/employee/health',
  },
  transport: {
    key: 'transport',
    label: 'Transport',
    labelAr: 'النقل',
    hsl: '185 70% 42%',
    chartColor: 'hsl(185, 70%, 42%)', // Cyan-teal
    bg: 'bg-cyan-600',
    bgLight: 'bg-cyan-600/10',
    text: 'text-cyan-600',
    textDark: 'text-cyan-400',
    border: 'border-cyan-600/25',
    gradient: 'from-cyan-500 to-cyan-700',
    ring: 'ring-cyan-600/30',
    icon: Car,
    route: '/employee/transport',
  },
  wellbeing: {
    key: 'wellbeing',
    label: 'Wellbeing',
    labelAr: 'الرفاهية',
    hsl: '160 84% 39%',
    chartColor: 'hsl(160, 84%, 39%)', // Emerald-teal
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    textDark: 'text-emerald-400',
    border: 'border-emerald-500/25',
    gradient: 'from-emerald-400 to-emerald-600',
    ring: 'ring-emerald-500/30',
    icon: Dumbbell,
    route: '/employee/wellbeing',
  },
  financial: {
    key: 'financial',
    label: 'Financial',
    labelAr: 'المالية',
    hsl: '152 70% 42%',
    chartColor: 'hsl(152, 70%, 42%)', // Green
    bg: 'bg-green-500',
    bgLight: 'bg-green-500/10',
    text: 'text-green-600',
    textDark: 'text-green-400',
    border: 'border-green-500/25',
    gradient: 'from-green-400 to-green-600',
    ring: 'ring-green-500/30',
    icon: PiggyBank,
    route: '/employee/financial',
  },
  learning: {
    key: 'learning',
    label: 'Learning',
    labelAr: 'التعلم',
    hsl: '192 75% 45%',
    chartColor: 'hsl(192, 75%, 45%)', // Blue-cyan
    bg: 'bg-cyan-500',
    bgLight: 'bg-cyan-500/10',
    text: 'text-cyan-600',
    textDark: 'text-cyan-400',
    border: 'border-cyan-500/25',
    gradient: 'from-cyan-400 to-cyan-600',
    ring: 'ring-cyan-500/30',
    icon: BookOpen,
    route: '/employee/learning',
  },
  rewards: {
    key: 'rewards',
    label: 'Bonus',
    labelAr: 'المكافأة',
    hsl: '38 92% 52%',
    chartColor: 'hsl(38, 92%, 52%)', // Amber/gold (reward color)
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    text: 'text-amber-600',
    textDark: 'text-amber-400',
    border: 'border-amber-500/25',
    gradient: 'from-amber-400 to-amber-600',
    ring: 'ring-amber-500/30',
    icon: Award,
    route: '/employee/bonus',
  },
  equity: {
    key: 'equity',
    label: 'Equity',
    labelAr: 'الأسهم',
    hsl: '222 47% 30%',
    chartColor: 'hsl(222, 47%, 30%)', // Navy (premium)
    bg: 'bg-slate-700',
    bgLight: 'bg-slate-700/10',
    text: 'text-slate-700',
    textDark: 'text-slate-300',
    border: 'border-slate-700/25',
    gradient: 'from-slate-600 to-slate-800',
    ring: 'ring-slate-700/30',
    icon: TrendingUp,
    route: '/employee/equity',
  },
  timeoff: {
    key: 'timeoff',
    label: 'Leave',
    labelAr: 'الإجازات',
    hsl: '200 85% 50%',
    chartColor: 'hsl(200, 85%, 50%)', // Light blue
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    text: 'text-blue-600',
    textDark: 'text-blue-400',
    border: 'border-blue-500/25',
    gradient: 'from-blue-400 to-blue-600',
    ring: 'ring-blue-500/30',
    icon: Calendar,
    route: '/employee/leave',
  },
};

// =============================================================================
// RAG (Red-Amber-Green) UTILIZATION SYSTEM
// =============================================================================
// Used ONLY for utilization status indicators in the top-right corner
// Kept separate from benefit colors - never mix!

export type RAGStatus = 'green' | 'amber' | 'red';

export interface RAGConfig {
  status: RAGStatus;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  progressClass: string;
  dotClass: string;
  icon: 'check' | 'clock' | 'alert';
}

export const RAG_THRESHOLDS = {
  green: 70,
  amber: 30,
  red: 0,
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
// UNIFIED CHART COLORS - Platform Palette
// =============================================================================
// Single source of truth for all charts across the platform

export const CHART_COLORS = {
  // Primary sequence for charts (teal-based harmonious palette)
  sequence: [
    'hsl(174, 60%, 45%)',  // Teal (primary)
    'hsl(199, 89%, 48%)',  // Sky blue
    'hsl(160, 84%, 39%)',  // Emerald
    'hsl(185, 70%, 42%)',  // Cyan
    'hsl(152, 70%, 42%)',  // Green
    'hsl(192, 75%, 45%)',  // Blue-cyan
    'hsl(38, 92%, 52%)',   // Amber
    'hsl(200, 85%, 50%)',  // Blue
    'hsl(222, 47%, 30%)',  // Navy
    'hsl(174, 55%, 40%)',  // Deep teal
  ],
  
  // Named colors for specific data
  primary: 'hsl(174, 60%, 45%)',
  secondary: 'hsl(199, 89%, 48%)',
  accent: 'hsl(38, 92%, 52%)',
  
  // Status colors (for non-RAG use)
  success: 'hsl(160, 84%, 39%)',
  warning: 'hsl(38, 92%, 52%)',
  info: 'hsl(199, 89%, 48%)',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export type BenefitKey = keyof typeof BENEFIT_COLORS;

const BENEFIT_ALIASES: Record<string, BenefitKey> = {
  housing: 'housing',
  housingallowance: 'housing',
  'housing allowance': 'housing',
  education: 'education',
  educationallowance: 'education',
  'education allowance': 'education',
  schooling: 'education',
  health: 'health',
  healthinsurance: 'health',
  'health insurance': 'health',
  transport: 'transport',
  transportmobility: 'transport',
  'transport & mobility': 'transport',
  mobility: 'transport',
  wellbeing: 'wellbeing',
  wellbeingprogram: 'wellbeing',
  'wellbeing program': 'wellbeing',
  financial: 'financial',
  financialplanning: 'financial',
  'financial planning': 'financial',
  savingsplan: 'financial',
  'savings plan': 'financial',
  learning: 'learning',
  learningdevelopment: 'learning',
  'learning & development': 'learning',
  rewards: 'rewards',
  bonus: 'rewards',
  annualbonus: 'rewards',
  'annual bonus': 'rewards',
  equity: 'equity',
  equityoptions: 'equity',
  'equity & options': 'equity',
  timeoff: 'timeoff',
  leave: 'timeoff',
  leavemanagement: 'timeoff',
  'leave management': 'timeoff',
};

export function getBenefitColor(nameOrKey: string): BenefitColorConfig {
  const normalized = nameOrKey.toLowerCase().replace(/[^a-z\s&]/g, '').trim();
  const key = BENEFIT_ALIASES[normalized] || BENEFIT_ALIASES[normalized.replace(/\s+/g, '')];
  
  if (key && BENEFIT_COLORS[key]) {
    return BENEFIT_COLORS[key];
  }
  
  return BENEFIT_COLORS.housing; // Default to housing (primary teal)
}

export function getRAGStatus(utilizationPercent: number): RAGStatus {
  if (utilizationPercent >= RAG_THRESHOLDS.green) return 'green';
  if (utilizationPercent >= RAG_THRESHOLDS.amber) return 'amber';
  return 'red';
}

export function getRAGIndicator(utilizationPercent: number): RAGConfig {
  return RAG_CONFIG[getRAGStatus(utilizationPercent)];
}

export function getProgressColorClass(utilizationPercent: number): string {
  return getRAGIndicator(utilizationPercent).progressClass;
}

export function getBenefitChartColors(): { name: string; color: string }[] {
  return Object.values(BENEFIT_COLORS).map(b => ({
    name: b.label,
    color: b.chartColor,
  }));
}

export function getChartColorArray(): string[] {
  return CHART_COLORS.sequence;
}

export function getChartColor(index: number): string {
  return CHART_COLORS.sequence[index % CHART_COLORS.sequence.length];
}

export function getSidebarIconColor(path: string): string {
  const benefit = Object.values(BENEFIT_COLORS).find(b => b.route === path);
  if (benefit) {
    return `${benefit.text} dark:${benefit.textDark}`;
  }
  return 'text-sidebar-foreground/70';
}
