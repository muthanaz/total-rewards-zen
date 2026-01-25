import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export interface BudgetItem {
  id: string;
  organization_id: string;
  user_id: string;
  month: string;
  item_type: 'commitment' | 'savings_goal' | 'other_income';
  category: string;
  amount: number;
  source: 'employee_input' | 'payroll' | 'policy';
  confidence: 'employee_reported' | 'measured' | 'estimated';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewBudgetItem = Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>;

const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

// Demo budget items for fallback
export const DEMO_BUDGET_ITEMS: Omit<BudgetItem, 'id' | 'organization_id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  { month: getCurrentMonth(), item_type: 'commitment', category: 'Rent', amount: 6500, source: 'employee_input', confidence: 'employee_reported', notes: null },
  { month: getCurrentMonth(), item_type: 'commitment', category: 'Loan EMI', amount: 2200, source: 'employee_input', confidence: 'employee_reported', notes: null },
  { month: getCurrentMonth(), item_type: 'commitment', category: 'Utilities', amount: 800, source: 'employee_input', confidence: 'employee_reported', notes: null },
  { month: getCurrentMonth(), item_type: 'savings_goal', category: 'Savings', amount: 2000, source: 'employee_input', confidence: 'employee_reported', notes: null },
];

export function useEmployeeBudgetItems(month?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentMonth = month || getCurrentMonth();

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['employee-budget-items', user?.id, currentMonth],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('employee_budget_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as BudgetItem[];
    },
    enabled: !!user?.id,
  });

  const addItem = useMutation({
    mutationFn: async (newItem: Omit<NewBudgetItem, 'user_id' | 'organization_id'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Get user's organization_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('employee_budget_items')
        .insert({
          ...newItem,
          user_id: user.id,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-budget-items'] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BudgetItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_budget_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-budget-items'] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_budget_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-budget-items'] });
    },
  });

  // Calculate totals
  const commitments = items?.filter(i => i.item_type === 'commitment') || [];
  const savingsGoal = items?.find(i => i.item_type === 'savings_goal');
  const otherIncome = items?.filter(i => i.item_type === 'other_income') || [];

  const totalCommitments = commitments.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalOtherIncome = otherIncome.reduce((sum, i) => sum + Number(i.amount), 0);
  const savingsAmount = savingsGoal ? Number(savingsGoal.amount) : 0;

  return {
    items: items || [],
    commitments,
    savingsGoal,
    otherIncome,
    totalCommitments,
    totalOtherIncome,
    savingsAmount,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    currentMonth,
  };
}
