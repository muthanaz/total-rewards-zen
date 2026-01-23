import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile as useSupabaseProfile } from '@/hooks/useSupabaseData';
import { useIsDemo } from '@/contexts/DemoModeContext';
import { DEMO_EXEC_METRICS, DEMO_SPEND_ALLOCATION, DEMO_ORG } from '@/lib/demoScenario';
import { DEMO_FALLBACKS } from '@/lib/metrics/computations';

// Types for employer dashboard data
export interface EmployerMetrics {
  totalInvestment: number;
  budgetUtilized: number;
  utilizationRate: number;
  targetUtilization: number;
  employeeCount: number;
  costPerEmployee: number;
  industryBenchmark: number;
  peerBenchmark: number;
  roi: number;
  roiBenchmark: number;
  retentionRate: number;
  retentionBenchmark: number;
  zombieSpend: number;
  recoveryPotential: number;
  esatScore: number;
  esatBenchmark: number;
  esatTrend: number;
  turnoverRate: number;
  turnoverBenchmark: number;
  lastUpdated: string;
  dataConfidence: 'high' | 'medium' | 'low';
  dataSources: string[];
}

export interface TrendData {
  period: string;
  current: number;
  previous: number;
  target?: number;
}

export interface StrategicPriority {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'monitor';
  title: string;
  metric: string;
  impact: string;
  expectedImpact: string;
  action: string;
  owner: string;
  path: string;
  dueDate?: string;
}

export interface ClaimMetrics {
  pending: number;
  urgent: number;
  avgProcessingDays: number;
  slaCompliance: number;
  openQuestions: number;
  avgResponseTime: number;
  enrollmentsPending: number;
  policyUpdatesDue: number;
  claimsThisMonth: number;
  claimsLastMonth: number;
  approvalRate: number;
  rejectionRate: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  amount: number;
  trend: number;
}

// Calculate data confidence based on sample size and data freshness
function calculateConfidence(sampleSize: number, lastUpdated: Date): 'high' | 'medium' | 'low' {
  const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
  
  if (sampleSize >= 100 && hoursSinceUpdate < 24) return 'high';
  if (sampleSize >= 50 && hoursSinceUpdate < 72) return 'medium';
  return 'low';
}

// Hook for Executive Dashboard metrics
export function useExecutiveMetrics(organizationId?: string) {
  const isDemoMode = useIsDemo();
  
  return useQuery({
    queryKey: ['executive_metrics', organizationId, isDemoMode],
    queryFn: async (): Promise<EmployerMetrics> => {
      // In demo mode, return cohesive Nexa Holdings data
      if (isDemoMode) {
        return {
          totalInvestment: DEMO_EXEC_METRICS.totalInvestment,
          budgetUtilized: DEMO_EXEC_METRICS.budgetUtilized,
          utilizationRate: DEMO_EXEC_METRICS.utilizationRate,
          targetUtilization: DEMO_EXEC_METRICS.targetUtilization,
          employeeCount: DEMO_ORG.employeeCount,
          costPerEmployee: DEMO_EXEC_METRICS.costPerEmployee,
          industryBenchmark: DEMO_EXEC_METRICS.industryBenchmark,
          peerBenchmark: DEMO_EXEC_METRICS.peerBenchmark,
          roi: DEMO_EXEC_METRICS.roi,
          roiBenchmark: DEMO_EXEC_METRICS.roiBenchmark,
          retentionRate: DEMO_EXEC_METRICS.retentionRate,
          retentionBenchmark: DEMO_EXEC_METRICS.retentionBenchmark,
          zombieSpend: DEMO_EXEC_METRICS.zombieSpend,
          recoveryPotential: DEMO_EXEC_METRICS.recoveryPotential,
          esatScore: DEMO_EXEC_METRICS.esatScore,
          esatBenchmark: DEMO_EXEC_METRICS.esatBenchmark,
          esatTrend: DEMO_EXEC_METRICS.esatTrend,
          turnoverRate: DEMO_EXEC_METRICS.turnoverRate,
          turnoverBenchmark: DEMO_EXEC_METRICS.turnoverBenchmark,
          lastUpdated: DEMO_EXEC_METRICS.lastUpdated,
          dataConfidence: DEMO_EXEC_METRICS.dataConfidence,
          dataSources: [...DEMO_EXEC_METRICS.dataSources],
        };
      }
      
      // Fetch real data from multiple sources
      // NOTE: Utilization metrics should ONLY include cap-based benefits (cash, reimbursement, budget)
      // Coverage and deferred benefits are EXCLUDED from utilization/unused calculations
      const [profilesResult, entitlementsResult, benefitsResult, requestsResult, satisfactionResult] = await Promise.all([
        supabase.from('profiles').select('id, monthly_salary, employment_date, organization_id'),
        supabase.from('benefit_entitlements').select('annual_allowance, utilized_amount, user_id, benefit_id'),
        supabase.from('benefits').select('id, life_area, benefit_type'),
        supabase.from('requests').select('id, status, created_at, amount'),
        supabase.from('employee_satisfaction_ratings').select('rating, category, period_year, period_month'),
      ]);

      const profiles = profilesResult.data || [];
      const entitlements = entitlementsResult.data || [];
      const benefits = benefitsResult.data || [];
      const requests = requestsResult.data || [];
      const satisfaction = satisfactionResult.data || [];

      // Create a map of benefit_id -> life_area for filtering
      const benefitLifeAreaMap = new Map(benefits.map(b => [b.id, b.life_area]));
      
      // Filter entitlements to only include cap-based benefits for utilization metrics
      // Exclude: health (coverage), financial (deferred like equity), bonus (deferred)
      const capBasedLifeAreas = ['home_living', 'family_parenting', 'mobility', 'career', 'lifestyle'];
      const excludedLifeAreas = ['health', 'money']; // Coverage and deferred
      
      const capBasedEntitlements = entitlements.filter(e => {
        const lifeArea = benefitLifeAreaMap.get(e.benefit_id);
        return lifeArea && !excludedLifeAreas.includes(lifeArea);
      });
      
      // ALL entitlements for total investment (employer invests in all benefits)
      const allEntitlements = entitlements;

      // Calculate metrics - Total investment includes ALL benefits
      const employeeCount = profiles.length || DEMO_FALLBACKS.employeeCount;
      const totalInvestmentAll = allEntitlements.reduce((sum, e) => sum + (e.annual_allowance || 0), 0);
      
      // Utilization only for cap-based benefits
      const capBasedAllowance = capBasedEntitlements.reduce((sum, e) => sum + (e.annual_allowance || 0), 0);
      const capBasedUtilized = capBasedEntitlements.reduce((sum, e) => sum + (e.utilized_amount || 0), 0);
      
      // Calculate average satisfaction
      const recentSatisfaction = satisfaction.filter(s => s.period_year === 2024);
      const avgSatisfaction = recentSatisfaction.length > 0
        ? recentSatisfaction.reduce((sum, s) => sum + s.rating, 0) / recentSatisfaction.length
        : 4.2;

      // Calculate tenure-based retention (employees > 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const retainedEmployees = profiles.filter(p => 
        p.employment_date && new Date(p.employment_date) < oneYearAgo
      ).length;

      const lastUpdated = new Date();
      const dataConfidence = calculateConfidence(employeeCount, lastUpdated);

      // Use calculated values with sensible fallbacks from DEMO_FALLBACKS
      const totalInvestment = totalInvestmentAll > 0 ? totalInvestmentAll : DEMO_FALLBACKS.totalInvestment;
      const budgetUtilized = capBasedUtilized > 0 ? capBasedUtilized : DEMO_FALLBACKS.budgetUtilized;
      
      // Utilization rate is cap-based only (excludes coverage/deferred)
      const utilizationRate = capBasedAllowance > 0 
        ? Math.round((capBasedUtilized / capBasedAllowance) * 100) 
        : DEMO_FALLBACKS.utilizationRate;
      
      // Zombie spend only applies to cap-based benefits (where "unused" makes sense)
      const capBasedUnused = Math.max(0, capBasedAllowance - capBasedUtilized);
      const zombieSpend = capBasedAllowance > 0 
        ? Math.round(capBasedUnused * 0.6) // 60% of unused is estimated as "zombie"
        : DEMO_FALLBACKS.zombieSpend;
      const recoveryPotential = Math.round(zombieSpend * 0.6); // 60% recovery estimate

      return {
        totalInvestment,
        budgetUtilized,
        utilizationRate,
        targetUtilization: DEMO_FALLBACKS.targetUtilization,
        employeeCount,
        costPerEmployee: employeeCount > 0 ? Math.round(totalInvestment / employeeCount) : DEMO_FALLBACKS.costPerEmployee,
        industryBenchmark: DEMO_FALLBACKS.industryBenchmark,
        peerBenchmark: DEMO_FALLBACKS.peerBenchmark,
        roi: DEMO_FALLBACKS.roi,
        roiBenchmark: DEMO_FALLBACKS.roiBenchmark,
        retentionRate: retainedEmployees > 0 ? Math.round((retainedEmployees / employeeCount) * 100) : DEMO_FALLBACKS.retentionRate,
        retentionBenchmark: DEMO_FALLBACKS.retentionBenchmark,
        zombieSpend,
        recoveryPotential,
        esatScore: Math.round(avgSatisfaction * 20), // Convert to 0-100 scale
        esatBenchmark: DEMO_FALLBACKS.esatBenchmark,
        esatTrend: DEMO_FALLBACKS.esatTrend,
        turnoverRate: DEMO_FALLBACKS.turnoverRate,
        turnoverBenchmark: DEMO_FALLBACKS.turnoverBenchmark,
        lastUpdated: lastUpdated.toISOString(),
        dataConfidence,
        dataSources: ['HRIS', 'Benefits Platform', 'Payroll'],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}

// Hook for utilization trends
export function useUtilizationTrends() {
  return useQuery({
    queryKey: ['utilization_trends'],
    queryFn: async (): Promise<TrendData[]> => {
      // In production, this would aggregate from utilization_events by quarter
      const { data: events } = await supabase
        .from('utilization_events')
        .select('created_at, amount')
        .order('created_at', { ascending: true });

      // Group by quarter - fallback to mock data for demo
      if (!events || events.length < 10) {
        return [
          { period: 'Q1 2023', current: 58, previous: 52, target: 75 },
          { period: 'Q2 2023', current: 61, previous: 58, target: 75 },
          { period: 'Q3 2023', current: 62, previous: 61, target: 75 },
          { period: 'Q4 2023', current: 64, previous: 62, target: 75 },
          { period: 'Q1 2024', current: 67, previous: 64, target: 75 },
        ];
      }

      // Process real events into quarterly data
      const quarters: { [key: string]: number[] } = {};
      events.forEach(event => {
        const date = new Date(event.created_at);
        const q = Math.floor(date.getMonth() / 3) + 1;
        const key = `Q${q} ${date.getFullYear()}`;
        if (!quarters[key]) quarters[key] = [];
        quarters[key].push(event.amount || 0);
      });

      return Object.entries(quarters).map(([period, amounts], index, arr) => ({
        period,
        current: Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length),
        previous: index > 0 ? arr[index - 1][1].reduce((a: number, b: number) => a + b, 0) / arr[index - 1][1].length : 0,
        target: 75,
      }));
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for ESAT trends
export function useESATTrends() {
  return useQuery({
    queryKey: ['esat_trends'],
    queryFn: async (): Promise<TrendData[]> => {
      const { data } = await supabase
        .from('employee_satisfaction_ratings')
        .select('rating, category, period_year, period_month')
        .order('period_year', { ascending: true })
        .order('period_month', { ascending: true });

      if (!data || data.length < 5) {
        return [
          { period: 'Oct', current: 76, previous: 74 },
          { period: 'Nov', current: 78, previous: 76 },
          { period: 'Dec', current: 79, previous: 78 },
          { period: 'Jan', current: 82, previous: 79 },
          { period: 'Feb', current: 84, previous: 82 },
        ];
      }

      // Group by month
      const months: { [key: string]: number[] } = {};
      data.forEach(item => {
        const key = `${item.period_year}-${item.period_month}`;
        if (!months[key]) months[key] = [];
        months[key].push(item.rating * 20); // Convert to 0-100
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return Object.entries(months).slice(-5).map(([key, ratings], index, arr) => ({
        period: monthNames[parseInt(key.split('-')[1]) - 1],
        current: Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length),
        previous: index > 0 ? Math.round(arr[index - 1][1].reduce((a, b) => a + b, 0) / arr[index - 1][1].length) : 0,
      }));
    },
    staleTime: 30 * 60 * 1000,
  });
}

// Hook for strategic priorities
export function useStrategicPriorities(metrics?: EmployerMetrics) {
  return useQuery({
    queryKey: ['strategic_priorities', metrics?.utilizationRate],
    queryFn: async (): Promise<StrategicPriority[]> => {
      if (!metrics) return [];

      const priorities: StrategicPriority[] = [];
      
      // Utilization gap priority
      const utilizationGap = metrics.targetUtilization - metrics.utilizationRate;
      if (utilizationGap > 10) {
        priorities.push({
          id: 'utilization-gap',
          priority: 'critical',
          title: 'Utilization Gap',
          metric: `${utilizationGap}% below target`,
          impact: `AED ${((utilizationGap / 100) * metrics.totalInvestment / 1000000).toFixed(1)}M at risk`,
          expectedImpact: `+${Math.round(utilizationGap * 0.6)}% utilization in 90 days`,
          action: 'Review underutilized benefits',
          owner: 'HR Director',
          path: '/employer/zombie',
          dueDate: '2024-02-15',
        });
      }

      // Cost efficiency priority
      const costDelta = metrics.costPerEmployee - metrics.industryBenchmark;
      if (costDelta > 10000) {
        priorities.push({
          id: 'cost-efficiency',
          priority: costDelta > 20000 ? 'high' : 'medium',
          title: 'Cost Efficiency',
          metric: `AED ${Math.round(costDelta / 1000)}K above benchmark`,
          impact: 'Competitive positioning at risk',
          expectedImpact: `Save AED ${((costDelta * metrics.employeeCount) / 1000000).toFixed(1)}M annually`,
          action: 'Benchmark analysis & optimization',
          owner: 'C&B Manager',
          path: '/employer/spend',
        });
      }

      // ESAT improvement opportunity
      if (metrics.esatScore < metrics.esatBenchmark) {
        priorities.push({
          id: 'esat-improvement',
          priority: 'high',
          title: 'Employee Satisfaction',
          metric: `${metrics.esatScore}% vs ${metrics.esatBenchmark}% benchmark`,
          impact: 'Engagement & retention impact',
          expectedImpact: '+5% ESAT in 60 days',
          action: 'Launch targeted initiatives',
          owner: 'HR Business Partner',
          path: '/employer/recommendations',
        });
      }

      // L&D investment (always show as opportunity)
      priorities.push({
        id: 'ld-investment',
        priority: 'monitor',
        title: 'L&D Investment',
        metric: '38% utilization',
        impact: 'Talent development opportunity',
        expectedImpact: '+15% L&D engagement',
        action: 'Launch awareness campaign',
        owner: 'L&D Manager',
        path: '/employer/recommendations',
      });

      return priorities.slice(0, 3); // Top 3 priorities
    },
    enabled: !!metrics,
  });
}

// Hook for HR Ops claim metrics
export function useClaimMetrics() {
  return useQuery({
    queryKey: ['claim_metrics'],
    queryFn: async (): Promise<ClaimMetrics> => {
      const { data: requests } = await supabase
        .from('requests')
        .select('id, status, created_at, amount, reviewed_at, sla_due_at')
        .order('created_at', { ascending: false });

      const now = new Date();
      const thisMonth = requests?.filter(r => {
        const created = new Date(r.created_at);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }) || [];

      const lastMonth = requests?.filter(r => {
        const created = new Date(r.created_at);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return created.getMonth() === lastMonthDate.getMonth() && created.getFullYear() === lastMonthDate.getFullYear();
      }) || [];

      const pending = requests?.filter(r => ['pending', 'submitted', 'in_review'].includes(r.status || '')) || [];
      const urgent = pending.filter(r => {
        if (!r.sla_due_at) return false;
        const slaDue = new Date(r.sla_due_at);
        const hoursUntilDue = (slaDue.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDue < 24 && hoursUntilDue > 0;
      });

      const approved = requests?.filter(r => r.status === 'approved') || [];
      const rejected = requests?.filter(r => r.status === 'rejected') || [];

      // Calculate SLA compliance
      const completedWithSla = requests?.filter(r => 
        r.reviewed_at && r.sla_due_at && ['approved', 'rejected', 'paid'].includes(r.status || '')
      ) || [];
      const withinSla = completedWithSla.filter(r => 
        new Date(r.reviewed_at!) <= new Date(r.sla_due_at!)
      );
      const slaCompliance = completedWithSla.length > 0 
        ? Math.round((withinSla.length / completedWithSla.length) * 100)
        : 94;

      // Calculate avg processing time
      const processedRequests = requests?.filter(r => r.reviewed_at && r.created_at) || [];
      const avgProcessingMs = processedRequests.length > 0
        ? processedRequests.reduce((sum, r) => {
            return sum + (new Date(r.reviewed_at!).getTime() - new Date(r.created_at).getTime());
          }, 0) / processedRequests.length
        : 2.3 * 24 * 60 * 60 * 1000;
      const avgProcessingDays = avgProcessingMs / (24 * 60 * 60 * 1000);

      return {
        pending: pending.length || 12,
        urgent: urgent.length || 3,
        avgProcessingDays: Math.round(avgProcessingDays * 10) / 10 || 2.3,
        slaCompliance,
        openQuestions: 8, // Would come from a questions/tickets table
        avgResponseTime: 4.2,
        enrollmentsPending: 5,
        policyUpdatesDue: 2,
        claimsThisMonth: thisMonth.length || 45,
        claimsLastMonth: lastMonth.length || 42,
        approvalRate: requests && requests.length > 0 
          ? Math.round((approved.length / (approved.length + rejected.length || 1)) * 100)
          : 87,
        rejectionRate: requests && requests.length > 0
          ? Math.round((rejected.length / (approved.length + rejected.length || 1)) * 100)
          : 13,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for ops data
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for claims by category
export function useClaimsByCategory() {
  return useQuery({
    queryKey: ['claims_by_category'],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const { data: requests } = await supabase
        .from('requests')
        .select('category, amount')
        .eq('request_type', 'claim');

      if (!requests || requests.length < 5) {
        return [
          { name: 'Health Insurance', value: 35, amount: 245000, trend: 5.2 },
          { name: 'Transport', value: 28, amount: 196000, trend: -2.1 },
          { name: 'Learning & Development', value: 18, amount: 126000, trend: 12.5 },
          { name: 'Wellbeing', value: 12, amount: 84000, trend: 8.3 },
          { name: 'Other', value: 7, amount: 49000, trend: -1.5 },
        ];
      }

      // Group by category
      const categories: { [key: string]: { count: number; amount: number } } = {};
      requests.forEach(r => {
        const cat = r.category || 'Other';
        if (!categories[cat]) categories[cat] = { count: 0, amount: 0 };
        categories[cat].count++;
        categories[cat].amount += r.amount || 0;
      });

      const total = Object.values(categories).reduce((sum, c) => sum + c.count, 0);
      
      return Object.entries(categories)
        .map(([name, data]) => ({
          name,
          value: Math.round((data.count / total) * 100),
          amount: data.amount,
          trend: Math.round((Math.random() - 0.3) * 20 * 10) / 10, // Simulated trend
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Hook for recent activity
export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent_activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('requests')
        .select(`
          id, 
          status, 
          category, 
          amount, 
          created_at, 
          reviewed_at,
          request_type
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!data || data.length === 0) {
        return [
          { action: 'Claim Approved', employee: 'Ahmed Al-Rashid', category: 'Health', amount: 450, time: '2 hours ago' },
          { action: 'Question Answered', employee: 'Lisa Chen', category: 'Housing', amount: null, time: '3 hours ago' },
          { action: 'Claim Rejected', employee: 'Omar Khalil', category: 'Wellbeing', amount: 3600, time: '5 hours ago' },
          { action: 'Enrollment Completed', employee: 'New Hire Batch', category: 'All Benefits', amount: null, time: 'Yesterday' },
        ];
      }

      return data.map(item => {
        const action = item.status === 'approved' ? 'Claim Approved' 
          : item.status === 'rejected' ? 'Claim Rejected'
          : item.status === 'paid' ? 'Claim Paid'
          : 'Claim Submitted';
        
        const timeAgo = formatTimeAgo(new Date(item.reviewed_at || item.created_at));
        
        return {
          id: item.id,
          action,
          employee: 'Employee', // Would join with profiles
          category: item.category,
          amount: item.amount,
          time: timeAgo,
        };
      });
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Hook for spend allocation by category
export function useSpendAllocation() {
  return useQuery({
    queryKey: ['spend_allocation'],
    queryFn: async () => {
      const { data } = await supabase
        .from('benefit_entitlements')
        .select('annual_allowance, utilized_amount, benefits(name, benefit_type)');

      if (!data || data.length < 5) {
        return [
          { name: 'Cash Allowances', value: 45, amount: 27900000 },
          { name: 'Health & Insurance', value: 25, amount: 15500000 },
          { name: 'Time & Leave', value: 15, amount: 9300000 },
          { name: 'Growth & L&D', value: 10, amount: 6200000 },
          { name: 'Wellbeing', value: 5, amount: 3100000 },
        ];
      }

      // Group by benefit type using standard labels from constants
      const BENEFIT_TYPE_LABEL_MAP: Record<string, string> = {
        cash_allowances: 'Cash Entitlements',
        health_protection: 'Health & Protection',
        time_off_flex: 'Leave & Flexibility',
        growth_career: 'Career Development',
        wealth_ownership: 'Wealth & Equity',
        wellbeing: 'Wellbeing',
        reimbursement: 'Reimbursement',
        insurance: 'Insurance Coverage',
        time_off: 'Time Off',
        other: 'Other Benefits',
      };
      
      const types: { [key: string]: number } = {};
      data.forEach(e => {
        const type = (e.benefits as any)?.benefit_type || 'other';
        const label = BENEFIT_TYPE_LABEL_MAP[type] || 'Other Benefits';
        if (!types[label]) types[label] = 0;
        types[label] += e.annual_allowance || 0;
      });

      const total = Object.values(types).reduce((sum, v) => sum + v, 0);
      
      return Object.entries(types)
        .map(([name, amount]) => ({
          name,
          value: Math.round((amount / total) * 100),
          amount,
        }))
        .sort((a, b) => b.value - a.value);
    },
    staleTime: 30 * 60 * 1000,
  });
}
