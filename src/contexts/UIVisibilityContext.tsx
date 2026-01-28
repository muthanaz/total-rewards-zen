import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define all configurable UI elements per role
export const UI_ELEMENTS_CONFIG = {
  employee: {
    dashboard: [
      { key: 'compensation_summary', label: 'Compensation Summary', labelAr: 'ملخص التعويضات' },
      { key: 'your_benefits', label: 'Your Benefits', labelAr: 'مزاياك' },
      { key: 'benefit_highlights', label: 'Benefit Highlights', labelAr: 'أبرز المزايا' },
      { key: 'request_widget', label: 'Request & Claims Widget', labelAr: 'أداة الطلبات والمطالبات' },
      { key: 'per_diem_widget', label: 'Per Diem Claims', labelAr: 'مطالبات البدل اليومي' },
      { key: 'satisfaction_survey', label: 'Satisfaction Survey', labelAr: 'استطلاع الرضا' },
    ],
    benefits_analysis: [
      { key: 'utilization_chart', label: 'Utilization by Category Chart', labelAr: 'مخطط الاستخدام حسب الفئة' },
      { key: 'comparison_radar', label: 'Benefit Comparison Radar', labelAr: 'رادار مقارنة المزايا' },
      { key: 'distribution_donut', label: 'Benefits Distribution Chart', labelAr: 'مخطط توزيع المزايا' },
      { key: 'monthly_trend', label: 'Monthly Utilization Trend', labelAr: 'اتجاه الاستخدام الشهري' },
      { key: 'utilization_opportunities', label: 'Utilization Opportunities', labelAr: 'فرص الاستخدام' },
    ],
  },
  employer: {
    dashboard: [
      { key: 'kpi_cards', label: 'KPI Summary Cards', labelAr: 'بطاقات مؤشرات الأداء' },
      { key: 'secondary_kpi', label: 'Secondary KPI Cards', labelAr: 'بطاقات مؤشرات الأداء الثانوية' },
      { key: 'executive_insights', label: 'Executive Insights', labelAr: 'رؤى تنفيذية' },
      { key: 'utilization_trend', label: 'Utilization Trend Chart', labelAr: 'مخطط اتجاه الاستخدام' },
      { key: 'spend_by_type', label: 'Spend by Benefit Type', labelAr: 'الإنفاق حسب نوع المزايا' },
      { key: 'segment_comparison', label: 'Segment Comparison Radar', labelAr: 'رادار مقارنة القطاعات' },
      { key: 'cumulative_spend', label: 'Cumulative Spend Chart', labelAr: 'مخطط الإنفاق التراكمي' },
      { key: 'top_benefits', label: 'Top & Least Used Benefits', labelAr: 'أكثر وأقل المزايا استخداماً' },
      { key: 'zombie_spend', label: 'Budget Leakage Alert', labelAr: 'تنبيه تسرب الميزانية' },
      { key: 'recommendations', label: 'Recommendations Section', labelAr: 'قسم التوصيات' },
    ],
  },
  vendor: {
    dashboard: [
      { key: 'metrics_cards', label: 'Metrics Summary Cards', labelAr: 'بطاقات ملخص المقاييس' },
      { key: 'offers_tab', label: 'My Offers Tab', labelAr: 'تبويب عروضي' },
      { key: 'analytics_tab', label: 'Analytics Tab', labelAr: 'تبويب التحليلات' },
      { key: 'transactions_tab', label: 'Transactions Tab', labelAr: 'تبويب المعاملات' },
      { key: 'earnings_tab', label: 'Earnings Tab', labelAr: 'تبويب الأرباح' },
    ],
  },
  admin: {
    dashboard: [
      { key: 'platform_stats', label: 'Platform Statistics', labelAr: 'إحصائيات المنصة' },
      { key: 'org_overview', label: 'Organizations Overview', labelAr: 'نظرة عامة على المنظمات' },
      { key: 'activity_log', label: 'Recent Activity Log', labelAr: 'سجل النشاط الأخير' },
    ],
  },
} as const;

export type UserRole = 'admin' | 'employee' | 'employer' | 'vendor';
export type PageKey = string;
export type ElementKey = string;

interface VisibilitySettings {
  [role: string]: {
    [pageKey: string]: {
      [elementKey: string]: boolean;
    };
  };
}

interface UIVisibilityContextType {
  isElementVisible: (role: UserRole, pageKey: PageKey, elementKey: ElementKey) => boolean;
  setElementVisibility: (role: UserRole, pageKey: PageKey, elementKey: ElementKey, isVisible: boolean) => Promise<void>;
  getVisibilitySettings: () => VisibilitySettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const UIVisibilityContext = createContext<UIVisibilityContextType | undefined>(undefined);

export function UIVisibilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<VisibilitySettings>({});
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Fetch organization ID
  useEffect(() => {
    async function fetchOrgId() {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (data?.organization_id) {
        setOrganizationId(data.organization_id);
      }
    }
    fetchOrgId();
  }, [user]);

  // Fetch visibility settings
  const fetchSettings = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ui_visibility_settings')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;

      // Build settings object
      const newSettings: VisibilitySettings = {};
      
      if (data) {
        data.forEach((row: any) => {
          if (!newSettings[row.role]) {
            newSettings[row.role] = {};
          }
          if (!newSettings[row.role][row.page_key]) {
            newSettings[row.role][row.page_key] = {};
          }
          newSettings[row.role][row.page_key][row.element_key] = row.is_visible;
        });
      }

      setSettings(newSettings);
    } catch (error) {
      console.error('Error fetching visibility settings:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const isElementVisible = useCallback((role: UserRole, pageKey: PageKey, elementKey: ElementKey): boolean => {
    // Default to visible if no setting exists
    return settings[role]?.[pageKey]?.[elementKey] ?? true;
  }, [settings]);

  const setElementVisibility = useCallback(async (
    role: UserRole, 
    pageKey: PageKey, 
    elementKey: ElementKey, 
    isVisible: boolean
  ) => {
    if (!organizationId || !user) return;

    try {
      const { error } = await supabase
        .from('ui_visibility_settings')
        .upsert({
          organization_id: organizationId,
          role,
          page_key: pageKey,
          element_key: elementKey,
          is_visible: isVisible,
          updated_by: user.id,
        }, {
          onConflict: 'organization_id,role,page_key,element_key'
        });

      if (error) throw error;

      // Update local state
      setSettings(prev => ({
        ...prev,
        [role]: {
          ...prev[role],
          [pageKey]: {
            ...prev[role]?.[pageKey],
            [elementKey]: isVisible,
          },
        },
      }));
    } catch (error) {
      console.error('Error updating visibility setting:', error);
      throw error;
    }
  }, [organizationId, user]);

  const getVisibilitySettings = useCallback(() => settings, [settings]);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    await fetchSettings();
  }, [fetchSettings]);

  return (
    <UIVisibilityContext.Provider value={{
      isElementVisible,
      setElementVisibility,
      getVisibilitySettings,
      loading,
      refreshSettings,
    }}>
      {children}
    </UIVisibilityContext.Provider>
  );
}

export function useUIVisibility() {
  const context = useContext(UIVisibilityContext);
  if (!context) {
    throw new Error('useUIVisibility must be used within a UIVisibilityProvider');
  }
  return context;
}

// Helper hook for components to check their visibility
export function useElementVisibility(role: UserRole, pageKey: PageKey, elementKey: ElementKey) {
  const { isElementVisible, loading } = useUIVisibility();
  return { isVisible: isElementVisible(role, pageKey, elementKey), loading };
}
