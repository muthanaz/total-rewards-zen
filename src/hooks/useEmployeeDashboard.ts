import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types for employee dashboard
export interface EmployeeBenefit {
  id: string;
  name: string;
  benefitType: string;
  annualAllowance: number;
  utilizedAmount: number;
  utilizationPercent: number;
  remaining: number;
  lifeArea: string;
  icon?: string;
  description?: string;
}

export interface LeaveBalance {
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface PendingRequest {
  id: string;
  subject: string;
  category: string;
  status: string;
  amount?: number;
  createdAt: string;
  slaDueAt?: string;
  isUrgent: boolean;
}

export interface EmployeeDashboardData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    grade: string;
    department: string;
    position: string;
    monthlySalary: number;
    employmentDate: string;
    profileCompleteness: number;
    missingFields: string[];
  };
  benefits: EmployeeBenefit[];
  leaveBalances: LeaveBalance[];
  pendingRequests: PendingRequest[];
  totals: {
    annualSalary: number;
    guaranteedBenefits: number;
    totalBenefitsValue: number;
    totalUtilized: number;
    utilizationPercent: number;
    totalCompensation: number;
  };
  payroll: {
    nextPayDate: string;
    lastPayDate: string;
    currency: string;
  };
  lastUpdated: string;
}

// Calculate profile completeness
function calculateProfileCompleteness(profile: any): { percent: number; missing: string[] } {
  const requiredFields = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'date_of_birth', label: 'Date of Birth' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'emirates_id', label: 'Emirates ID' },
    { key: 'emergency_contact_name', label: 'Emergency Contact' },
    { key: 'home_location', label: 'Home Location' },
    { key: 'marital_status', label: 'Marital Status' },
  ];

  const missing: string[] = [];
  let filled = 0;

  requiredFields.forEach(field => {
    if (profile[field.key] && profile[field.key].toString().trim() !== '') {
      filled++;
    } else {
      missing.push(field.label);
    }
  });

  return {
    percent: Math.round((filled / requiredFields.length) * 100),
    missing,
  };
}

// Get next pay date (assumes monthly on 28th)
function getNextPayDate(): string {
  const now = new Date();
  const payDay = 28;
  
  if (now.getDate() >= payDay) {
    // Next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, payDay);
    return nextMonth.toISOString();
  } else {
    // This month
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), payDay);
    return thisMonth.toISOString();
  }
}

// Main hook for employee dashboard data
export function useEmployeeDashboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['employee_dashboard', user?.id],
    queryFn: async (): Promise<EmployeeDashboardData> => {
      if (!user) throw new Error('No user');

      // Fetch all data in parallel
      const [profileResult, entitlementsResult, leaveResult, requestsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('benefit_entitlements').select('*, benefits(*)').eq('user_id', user.id),
        supabase.from('leave_balances').select('*').eq('user_id', user.id),
        supabase.from('requests').select('*').eq('user_id', user.id).in('status', ['pending', 'submitted', 'in_review']).order('created_at', { ascending: false }).limit(5),
      ]);

      const profile = profileResult.data;
      const entitlements = entitlementsResult.data || [];
      const leaveBalances = leaveResult.data || [];
      const pendingRequests = requestsResult.data || [];

      // Calculate profile completeness
      const { percent: profileCompleteness, missing: missingFields } = profile 
        ? calculateProfileCompleteness(profile)
        : { percent: 0, missing: [] };

      // Transform benefits
      const benefits: EmployeeBenefit[] = entitlements.map(e => {
        const benefit = e.benefits as any;
        const utilized = e.utilized_amount || 0;
        const annual = e.annual_allowance || 0;
        return {
          id: e.id,
          name: benefit?.name || 'Unknown Benefit',
          benefitType: benefit?.benefit_type || 'other',
          annualAllowance: annual,
          utilizedAmount: utilized,
          utilizationPercent: annual > 0 ? Math.round((utilized / annual) * 100) : 0,
          remaining: Math.max(0, annual - utilized),
          lifeArea: benefit?.life_area || 'other',
          icon: benefit?.icon,
          description: benefit?.description,
        };
      });

      // Transform leave balances
      const leaves: LeaveBalance[] = leaveBalances.map(l => ({
        leaveType: l.leave_type,
        totalDays: l.total_days,
        usedDays: l.used_days || 0,
        remainingDays: l.total_days - (l.used_days || 0),
        year: l.year || new Date().getFullYear(),
      }));

      // Transform pending requests
      const requests: PendingRequest[] = pendingRequests.map(r => {
        const slaDue = r.sla_due_at ? new Date(r.sla_due_at) : null;
        const now = new Date();
        const isUrgent = slaDue ? (slaDue.getTime() - now.getTime()) < 24 * 60 * 60 * 1000 : false;
        
        return {
          id: r.id,
          subject: r.subject,
          category: r.category,
          status: r.status || 'pending',
          amount: r.amount,
          createdAt: r.created_at,
          slaDueAt: r.sla_due_at,
          isUrgent,
        };
      });

      // Calculate totals
      const monthlySalary = profile?.monthly_salary || 0;
      const annualSalary = monthlySalary * 12;
      const totalBenefitsValue = benefits.reduce((sum, b) => sum + b.annualAllowance, 0);
      const totalUtilized = benefits.reduce((sum, b) => sum + b.utilizedAmount, 0);
      
      // Guaranteed benefits = cash allowances (housing, transport, education)
      const guaranteedTypes = ['cash_allowances', 'guaranteed_allowance', 'housing', 'transport', 'education', 'schooling'];
      const guaranteedBenefits = benefits
        .filter(b => guaranteedTypes.includes(b.benefitType))
        .reduce((sum, b) => sum + b.annualAllowance, 0);

      return {
        profile: {
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          email: profile?.email || user.email || '',
          grade: profile?.grade || '',
          department: profile?.department || '',
          position: profile?.position || '',
          monthlySalary,
          employmentDate: profile?.employment_date || '',
          profileCompleteness,
          missingFields,
        },
        benefits,
        leaveBalances: leaves,
        pendingRequests: requests,
        totals: {
          annualSalary,
          guaranteedBenefits,
          totalBenefitsValue,
          totalUtilized,
          utilizationPercent: totalBenefitsValue > 0 ? Math.round((totalUtilized / totalBenefitsValue) * 100) : 0,
          totalCompensation: annualSalary + guaranteedBenefits,
        },
        payroll: {
          nextPayDate: getNextPayDate(),
          lastPayDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 28).toISOString(),
          currency: 'AED',
        },
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Hook for utilization trends
export function useUtilizationHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['utilization_history', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data } = await supabase
        .from('utilization_events')
        .select('created_at, amount, benefit_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!data || data.length < 3) {
        // Return demo trend data
        return [
          { month: 'Oct', amount: 18500, percent: 42 },
          { month: 'Nov', amount: 24200, percent: 51 },
          { month: 'Dec', amount: 31800, percent: 58 },
          { month: 'Jan', amount: 38500, percent: 64 },
        ];
      }

      // Group by month
      const months: { [key: string]: number } = {};
      data.forEach(e => {
        const date = new Date(e.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short' });
        months[key] = (months[key] || 0) + (e.amount || 0);
      });

      let cumulative = 0;
      return Object.entries(months).map(([month, amount]) => {
        cumulative += amount;
        return {
          month,
          amount: cumulative,
          percent: Math.round((cumulative / 282000) * 100), // Approximate total
        };
      });
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
  });
}

// Format time ago helper
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Format days until
export function formatDaysUntil(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
